import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js";
import EmailLog from "../models/EmailLog.js";
import { memoryStore } from "../services/memoryStore.js";
import { createApiKey, createJwtToken, hashPassword, comparePassword } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";
import { testSmtpConnection } from "../services/emailService.js";

const router = express.Router();

const hasMongo = () => mongoose.connection.readyState === 1;

function formatUserResponse(user) {
  return {
    email: user.email,
    name: user.name,
    templateSettings: user.templateSettings,
    useGlobalTemplateSettings: user.useGlobalTemplateSettings,
    senderName: user.senderName || "",
    senderEmail: user.senderEmail || "",
    smtpSettings: user.smtpSettings ? {
      enabled: user.smtpSettings.enabled || false,
      host: user.smtpSettings.host || "",
      port: user.smtpSettings.port || 587,
      secure: user.smtpSettings.secure || false,
      user: user.smtpSettings.user || "",
      fromEmail: user.smtpSettings.fromEmail || "",
      fromName: user.smtpSettings.fromName || "",
      hasPassword: !!user.smtpSettings.pass
    } : {
      enabled: false,
      host: "",
      port: 587,
      secure: false,
      user: "",
      fromEmail: "",
      fromName: "",
      hasPassword: false
    }
  };
}

async function findUserByEmail(email) {
  if (hasMongo()) {
    return User.findOne({ email });
  }
  return memoryStore.findUserByEmail(email);
}

async function findUserById(id) {
  if (hasMongo()) {
    return User.findById(id);
  }
  return memoryStore.findUserById(id);
}

async function createUser(userData) {
  if (hasMongo()) {
    return User.create(userData);
  }
  return memoryStore.createUser(userData);
}

async function updateUserKey(user, apiKey) {
  if (hasMongo()) {
    user.apiKey = apiKey;
    await user.save();
    return user;
  }
  return memoryStore.updateUserApiKey(user, apiKey);
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "email, name, and password are required." });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "A user with that email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const apiKey = createApiKey();
    const user = await createUser({ email, name, passwordHash, apiKey });
    
    // Register the default key in the ApiKey collection for MongoDB users
    if (hasMongo()) {
      await ApiKey.create({
        name: "Default Key",
        key: apiKey,
        userId: user._id,
        templateSettings: user.templateSettings
      }).catch(err => console.error("Error creating default ApiKey on signup:", err));
    }

    const token = createJwtToken(user);

    // Save token in session
    if (req.session) {
      req.session.token = token;
    }

    res.status(201).json({
      user: formatUserResponse(user),
      apiKey: user.apiKey,
      token
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createJwtToken(user);
    
    // Save token in session
    if (req.session) {
      req.session.token = token;
    }
    
    let activeKey = "";
    if (hasMongo()) {
      const count = await ApiKey.countDocuments({ userId: user._id });
      if (count === 0 && user.apiKey) {
        await ApiKey.create({
          name: "Default Key",
          key: user.apiKey,
          userId: user._id,
          templateSettings: user.templateSettings
        }).catch(err => console.error("Error backfilling on login:", err));
        activeKey = user.apiKey;
      } else {
        const firstKeyDoc = await ApiKey.findOne({ userId: user._id }).sort({ createdAt: -1 });
        if (firstKeyDoc) {
          activeKey = firstKeyDoc.key;
        }
      }
    } else {
      const keys = await memoryStore.listApiKeys(user._id);
      if (keys.length > 0) {
        activeKey = keys[0].key;
      } else if (user.apiKey) {
        await memoryStore.createApiKey(user._id, "Default Key", user.apiKey);
        activeKey = user.apiKey;
      }
    }

    if (user.apiKey !== activeKey) {
      await updateUserKey(user, activeKey);
    }

    res.json({ 
      user: formatUserResponse(user), 
      apiKey: activeKey, 
      token 
    });
  } catch (error) {
    next(error);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Google ID token (credential) is required." });
    }

    // Call Google's tokeninfo endpoint to verify token
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const verifyRes = await fetch(tokenInfoUrl);
    
    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      console.error("Google token verification failed:", errorText);
      return res.status(401).json({ error: "Invalid Google ID token." });
    }

    const payload = await verifyRes.json();

    // Verify audience matches process.env.GOOGLE_CLIENT_ID if it is set and not a placeholder
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && expectedClientId !== "google-client-id-placeholder") {
      if (payload.aud !== expectedClientId) {
        return res.status(401).json({ error: "Google client ID mismatch. Unauthorized request." });
      }
    }

    const { email, name } = payload;
    if (!email) {
      return res.status(400).json({ error: "Google account does not expose email." });
    }

    // Find user by email
    let user = await findUserByEmail(email);

    if (!user) {
      // If user does not exist, register them
      // Since passwordHash is a required Mongoose field, we generate a secure random password hash
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await hashPassword(randomPassword);
      const apiKey = createApiKey();
      
      user = await createUser({
        email,
        name: name || email.split("@")[0],
        passwordHash,
        apiKey
      });

      // Register the default key in the ApiKey collection for MongoDB users
      if (hasMongo()) {
        await ApiKey.create({
          name: "Default Key",
          key: apiKey,
          userId: user._id,
          templateSettings: user.templateSettings
        }).catch(err => console.error("Error creating default ApiKey on Google signup:", err));
      }
    }

    // Let's get the active key to return, just like normal login does
    let activeKey = "";
    if (hasMongo()) {
      const count = await ApiKey.countDocuments({ userId: user._id });
      if (count === 0 && user.apiKey) {
        await ApiKey.create({
          name: "Default Key",
          key: user.apiKey,
          userId: user._id,
          templateSettings: user.templateSettings
        }).catch(err => console.error("Error backfilling Google key on login:", err));
        activeKey = user.apiKey;
      } else {
        const firstKeyDoc = await ApiKey.findOne({ userId: user._id }).sort({ createdAt: -1 });
        if (firstKeyDoc) {
          activeKey = firstKeyDoc.key;
        }
      }
    } else {
      const keys = await memoryStore.listApiKeys(user._id);
      if (keys.length > 0) {
        activeKey = keys[0].key;
      } else if (user.apiKey) {
        await memoryStore.createApiKey(user._id, "Default Key", user.apiKey);
        activeKey = user.apiKey;
      }
    }

    if (user.apiKey !== activeKey) {
      await updateUserKey(user, activeKey);
    }

    const token = createJwtToken(user);

    // Save token in session
    if (req.session) {
      req.session.token = token;
    }

    res.json({
      user: formatUserResponse(user),
      apiKey: activeKey,
      token
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out." });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out successfully." });
    });
  } else {
    res.json({ success: true, message: "Logged out successfully." });
  }
});


router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let activeKey = "";
    if (hasMongo()) {
      const count = await ApiKey.countDocuments({ userId: user._id });
      if (count === 0 && user.apiKey) {
        await ApiKey.create({
          name: "Default Key",
          key: user.apiKey,
          userId: user._id,
          templateSettings: user.templateSettings
        }).catch(err => console.error("Error backfilling on me:", err));
        activeKey = user.apiKey;
      } else {
        const firstKeyDoc = await ApiKey.findOne({ userId: user._id }).sort({ createdAt: -1 });
        if (firstKeyDoc) {
          activeKey = firstKeyDoc.key;
        }
      }
    } else {
      const keys = await memoryStore.listApiKeys(user._id);
      if (keys.length > 0) {
        activeKey = keys[0].key;
      } else if (user.apiKey) {
        await memoryStore.createApiKey(user._id, "Default Key", user.apiKey);
        activeKey = user.apiKey;
      }
    }

    if (user.apiKey !== activeKey) {
      await updateUserKey(user, activeKey);
    }

    res.json({ 
      user: formatUserResponse(user), 
      apiKey: activeKey 
    });
  } catch (error) {
    next(error);
  }
});

router.put("/settings", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const { templateSettings, useGlobalTemplateSettings, senderName, senderEmail, smtpSettings } = req.body;
    if (hasMongo()) {
      if (templateSettings !== undefined) {
        user.templateSettings = { ...user.templateSettings, ...templateSettings };
      }
      if (useGlobalTemplateSettings !== undefined) {
        user.useGlobalTemplateSettings = useGlobalTemplateSettings;
      }
      if (senderName !== undefined) {
        user.senderName = senderName;
      }
      if (senderEmail !== undefined) {
        user.senderEmail = senderEmail;
      }
      if (smtpSettings !== undefined) {
        const existingSmtp = user.smtpSettings || {};
        let newPass = smtpSettings.pass;
        if (newPass === "••••••••" || !newPass) {
          newPass = existingSmtp.pass || "";
        }
        user.smtpSettings = {
          enabled: smtpSettings.enabled !== undefined ? smtpSettings.enabled : existingSmtp.enabled,
          host: smtpSettings.host !== undefined ? smtpSettings.host : existingSmtp.host,
          port: smtpSettings.port !== undefined ? smtpSettings.port : existingSmtp.port,
          secure: smtpSettings.secure !== undefined ? smtpSettings.secure : existingSmtp.secure,
          user: smtpSettings.user !== undefined ? smtpSettings.user : existingSmtp.user,
          pass: newPass,
          fromEmail: smtpSettings.fromEmail !== undefined ? smtpSettings.fromEmail : existingSmtp.fromEmail,
          fromName: smtpSettings.fromName !== undefined ? smtpSettings.fromName : existingSmtp.fromName
        };
      }
      await user.save();
    } else {
      if (templateSettings !== undefined) {
        user.templateSettings = { ...user.templateSettings, ...templateSettings };
      }
      if (useGlobalTemplateSettings !== undefined) {
        user.useGlobalTemplateSettings = useGlobalTemplateSettings;
      }
      if (senderName !== undefined) {
        user.senderName = senderName;
      }
      if (senderEmail !== undefined) {
        user.senderEmail = senderEmail;
      }
      if (smtpSettings !== undefined) {
        const existingSmtp = user.smtpSettings || {};
        let newPass = smtpSettings.pass;
        if (newPass === "••••••••" || !newPass) {
          newPass = existingSmtp.pass || "";
        }
        user.smtpSettings = {
          enabled: smtpSettings.enabled !== undefined ? smtpSettings.enabled : existingSmtp.enabled,
          host: smtpSettings.host !== undefined ? smtpSettings.host : existingSmtp.host,
          port: smtpSettings.port !== undefined ? smtpSettings.port : existingSmtp.port,
          secure: smtpSettings.secure !== undefined ? smtpSettings.secure : existingSmtp.secure,
          user: smtpSettings.user !== undefined ? smtpSettings.user : existingSmtp.user,
          pass: newPass,
          fromEmail: smtpSettings.fromEmail !== undefined ? smtpSettings.fromEmail : existingSmtp.fromEmail,
          fromName: smtpSettings.fromName !== undefined ? smtpSettings.fromName : existingSmtp.fromName
        };
      }
    }
    const formatted = formatUserResponse(user);
    res.json({ 
      success: true, 
      templateSettings: formatted.templateSettings,
      useGlobalTemplateSettings: formatted.useGlobalTemplateSettings,
      senderName: formatted.senderName,
      senderEmail: formatted.senderEmail,
      smtpSettings: formatted.smtpSettings
    });
  } catch (error) {
    next(error);
  }
});

router.post("/smtp/test", requireAuth, async (req, res, next) => {
  try {
    const { host, port, secure, user, pass } = req.body;
    let smtpPass = pass;
    if (pass === "••••••••" || !pass) {
      const currentUser = await findUserById(req.user.id);
      if (currentUser && currentUser.smtpSettings && currentUser.smtpSettings.pass) {
        smtpPass = currentUser.smtpSettings.pass;
      }
    }

    if (!host || !port || !user || !smtpPass) {
      return res.status(400).json({ error: "Host, port, username, and password are required to test connection." });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Boolean(secure),
      auth: {
        user,
        pass: smtpPass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000
    });

    await transporter.verify();
    res.json({ success: true, message: "SMTP connection verified successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/rotate", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const apiKey = createApiKey();
    await updateUserKey(user, apiKey);
    
    // Also update/add in the ApiKey collection if mongo is running
    if (hasMongo()) {
      await ApiKey.findOneAndUpdate(
        { userId: user._id, name: "Default Key" },
        { key: apiKey },
        { upsert: true, new: true }
      ).catch(err => console.error("Error rotating default key in collection:", err));
    }
    
    res.json({ apiKey });
  } catch (error) {
    next(error);
  }
});

// API Key Management Routes
router.get("/keys", requireAuth, async (req, res, next) => {
  try {
    if (hasMongo()) {
      const keys = await ApiKey.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json({ keys });
    } else {
      const keys = await memoryStore.listApiKeys(req.user.id);
      res.json({ keys });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/keys", requireAuth, async (req, res, next) => {
  try {
    const { name, inheritStyle } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Key name is required." });
    }

    const key = createApiKey();
    const styleType = inheritStyle !== false ? "global" : "custom";
    if (hasMongo()) {
      const user = await User.findById(req.user.id);
      const templateSettings = inheritStyle !== false ? user?.templateSettings : undefined;
      const keyDoc = await ApiKey.create({
        name,
        key,
        userId: req.user.id,
        styleType,
        templateSettings
      });
      
      // Sync user.apiKey if it's currently empty
      if (user && !user.apiKey) {
        user.apiKey = key;
        await user.save();
      }
      
      res.status(201).json({ key: keyDoc });
    } else {
      const user = await memoryStore.findUserById(req.user.id);
      const templateSettings = inheritStyle !== false ? { ...user?.templateSettings } : {
        brandName: "My Brand",
        colorHeaderBg: "#0f766e",
        colorHeaderText: "#ffffff",
        colorButtonBg: "#0f766e",
        colorBgLight: "#f1f5f9",
        emailFooter: "© 2026 MailBridge. All rights reserved."
      };
      const keyDoc = await memoryStore.createApiKeyWithSettings(req.user.id, name, key, templateSettings, styleType);
      
      if (user && !user.apiKey) {
        user.apiKey = key;
      }
      
      res.status(201).json({ key: keyDoc });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/keys/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (hasMongo()) {
      const result = await ApiKey.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!result) {
        return res.status(404).json({ error: "API key not found." });
      }
      
      // Update user's default active key to another remaining key or clear it
      const remainingKeys = await ApiKey.find({ userId: req.user.id }).sort({ createdAt: -1 });
      const user = await User.findById(req.user.id);
      if (user) {
        user.apiKey = remainingKeys.length > 0 ? remainingKeys[0].key : undefined;
        await user.save();
      }
      
      res.json({ success: true, message: "API key deleted successfully." });
    } else {
      const success = await memoryStore.deleteApiKey(req.user.id, id);
      if (!success) {
        return res.status(404).json({ error: "API key not found." });
      }
      
      // Update in-memory user apiKey
      const remainingKeys = await memoryStore.listApiKeys(req.user.id);
      const user = await memoryStore.findUserById(req.user.id);
      if (user) {
        user.apiKey = remainingKeys.length > 0 ? remainingKeys[0].key : undefined;
      }
      
      res.json({ success: true, message: "API key deleted successfully." });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/keys/:id/settings", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { templateSettings } = req.body;
    if (!templateSettings) {
      return res.status(400).json({ error: "templateSettings is required." });
    }

    if (hasMongo()) {
      const keyDoc = await ApiKey.findOne({ _id: id, userId: req.user.id });
      if (!keyDoc) {
        return res.status(404).json({ error: "API key not found." });
      }
      keyDoc.templateSettings = { ...keyDoc.templateSettings, ...templateSettings };
      keyDoc.styleType = "custom";
      await keyDoc.save();
      res.json({ success: true, key: keyDoc });
    } else {
      const keyDoc = await memoryStore.findApiKeyByIdAndUser(id, req.user.id);
      if (!keyDoc) {
        return res.status(404).json({ error: "API key not found." });
      }
      keyDoc.templateSettings = { ...keyDoc.templateSettings, ...templateSettings };
      keyDoc.styleType = "custom";
      res.json({ success: true, key: keyDoc });
    }
  } catch (error) {
    next(error);
  }
});

// Stats Route for the dashboard
router.get("/stats", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const smtpStatus = await testSmtpConnection();

    if (hasMongo()) {
      const total = await EmailLog.countDocuments({ userId });
      const sent = await EmailLog.countDocuments({ userId, status: "sent" });
      const simulated = await EmailLog.countDocuments({ userId, status: "simulated" });
      const failed = await EmailLog.countDocuments({ userId, status: "failed" });

      const types = ["welcome", "otp", "forgot-password", "notification", "custom"];
      const byType = {};
      for (const t of types) {
        byType[t] = await EmailLog.countDocuments({ userId, type: t });
      }

      res.json({
        stats: {
          total,
          sent,
          simulated,
          failed,
          byType
        },
        smtpStatus,
        recentLogs: []
      });
    } else {
      const stats = await memoryStore.getEmailStats(userId);
      res.json({
        stats,
        smtpStatus,
        recentLogs: []
      });
    }
  } catch (error) {
    next(error);
  }
});

// Paginated Logs Route for the dashboard table
router.get("/logs", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const type = req.query.type || "all";

    if (hasMongo()) {
      const query = { userId };
      if (status !== "all") {
        query.status = status;
      }
      if (type !== "all") {
        query.type = type;
      }
      if (search) {
        query.$or = [
          { to: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } }
        ];
      }

      const totalLogs = await EmailLog.countDocuments(query);
      const totalPages = Math.ceil(totalLogs / limit) || 1;
      const logs = await EmailLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({ logs, totalLogs, totalPages });
    } else {
      const result = await memoryStore.getPaginatedLogs(userId, { page, limit, search, status, type });
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
