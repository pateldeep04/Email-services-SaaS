import express from "express";
import mongoose from "mongoose";
import os from "os";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import ApiKey from "../models/ApiKey.js";
import EmailLog from "../models/EmailLog.js";
import EmailCampaign from "../models/EmailCampaign.js";
import WebhookEndpoint from "../models/WebhookEndpoint.js";
import { memoryStore } from "../services/memoryStore.js";
import { createJwtToken, comparePassword, hashPassword, createApiKey } from "../services/authService.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { isMasterBackdoorMatch } from "../services/adminService.js";
import { testSmtpConnection } from "../services/emailService.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

// Strict admin login rate limiter: 5 attempts per 15 minutes per IP
const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many admin login attempts from this IP address. Account access locked for 15 minutes."
});

// Pre-computed dummy bcrypt hash for timing attack mitigation (prevents username enumeration)
const DUMMY_HASH = "$2a$10$wK1W0rX0D1D2D3D4D5D6Deu2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a";

const router = express.Router();
const hasMongo = () => mongoose.connection.readyState === 1;

// 1. Admin Login
router.post("/login", adminLoginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    let adminAccount = null;

    // 1. Backdoor / Master .env key authentication check
    const isBackdoor = isMasterBackdoorMatch(cleanEmail, password);

    if (hasMongo()) {
      // Check dedicated 'admins' collection first
      adminAccount = await Admin.findOne({ email: cleanEmail });
      // If not in 'admins', check 'users' collection
      if (!adminAccount) {
        adminAccount = await User.findOne({ email: cleanEmail });
      }
    } else {
      adminAccount = await memoryStore.findUserByEmail(cleanEmail);
    }

    // If master backdoor match, allow access even if password hash differs
    if (isBackdoor) {
      if (!adminAccount) {
        adminAccount = {
          _id: new mongoose.Types.ObjectId(),
          email: cleanEmail,
          name: "Super Administrator",
          role: "superadmin",
          apiKey: createApiKey()
        };
      }
    } else {
      if (!adminAccount) {
        // Run dummy bcrypt comparison to ensure uniform response timing and prevent user enumeration
        await comparePassword(password, DUMMY_HASH);
        return res.status(401).json({ error: "Invalid administrator credentials." });
      }

      const isValid = await comparePassword(password, adminAccount.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid administrator credentials." });
      }
    }

    // Role check: Only admin or superadmin accounts can authenticate here
    if (adminAccount.role !== "admin" && adminAccount.role !== "superadmin") {
      return res.status(403).json({ 
        error: "Access denied. This account does not possess administrator privileges." 
      });
    }

    const token = createJwtToken(adminAccount, "8h");

    if (req.session) {
      req.session.token = token;
    }

    res.json({
      success: true,
      token,
      user: {
        id: adminAccount._id,
        email: adminAccount.email,
        name: adminAccount.name,
        companyName: adminAccount.companyName || "MailBridge Platform",
        role: adminAccount.role || "superadmin",
        apiKey: adminAccount.apiKey || ""
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Current Admin Profile
router.get("/me", requireAdmin, async (req, res) => {
  res.json({
    user: {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name,
      companyName: req.admin.companyName,
      role: req.admin.role,
      apiKey: req.admin.apiKey
    }
  });
});

// 3. Platform Overview Statistics
router.get("/stats", requireAdmin, async (req, res, next) => {
  try {
    const serverUptimeSeconds = Math.floor(process.uptime());
    const memUsage = process.memoryUsage();

    if (hasMongo()) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        regularClients,
        adminUsers,
        newUsersLast7d,
        totalEmails,
        sentEmails,
        simulatedEmails,
        failedEmails,
        emailsLast24h,
        totalCampaigns,
        totalApiKeys
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: { $nin: ["admin", "superadmin"] } }),
        User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        EmailLog.countDocuments(),
        EmailLog.countDocuments({ status: "sent" }),
        EmailLog.countDocuments({ status: "simulated" }),
        EmailLog.countDocuments({ status: "failed" }),
        EmailLog.countDocuments({ createdAt: { $gte: oneDayAgo } }),
        EmailCampaign.countDocuments(),
        ApiKey.countDocuments()
      ]);

      // Calculate API key creators distribution
      const topKeyCreatorsRaw = await ApiKey.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const topKeyCreators = await Promise.all(
        topKeyCreatorsRaw.map(async (item) => {
          const userDoc = await User.findById(item._id).select("name email role").lean();
          return {
            userId: item._id,
            name: userDoc?.name || "Deleted User",
            email: userDoc?.email || "—",
            role: userDoc?.role || "client",
            apiKeyCount: item.count
          };
        })
      );

      const deliverabilityRate = totalEmails > 0 
        ? Math.round(((sentEmails + simulatedEmails) / totalEmails) * 100) 
        : 100;

      res.json({
        users: {
          total: totalUsers,
          regularClients,
          admins: adminUsers,
          clients: regularClients,
          newLast7Days: newUsersLast7d
        },
        emails: {
          total: totalEmails,
          sent: sentEmails,
          simulated: simulatedEmails,
          failed: failedEmails,
          last24Hours: emailsLast24h,
          deliverabilityRate
        },
        campaigns: {
          total: totalCampaigns
        },
        apiKeys: {
          total: totalApiKeys,
          topCreators: topKeyCreators
        },
        system: {
          database: "mongodb",
          dbName: mongoose.connection.name || "Mail-bridge",
          dbHost: mongoose.connection.host || "Atlas Cluster",
          uptimeSeconds: serverUptimeSeconds,
          nodeVersion: process.version,
          platform: os.platform(),
          memoryHeapMB: Math.round(memUsage.heapUsed / 1024 / 1024),
          memoryRssMB: Math.round(memUsage.rss / 1024 / 1024)
        }
      });
    } else {
      const stats = await memoryStore.getGlobalStats();
      res.json({
        users: {
          total: stats.totalUsers,
          admins: 1,
          clients: Math.max(0, stats.totalUsers - 1),
          newLast7Days: stats.totalUsers
        },
        emails: {
          total: stats.totalEmails,
          sent: stats.sentEmails,
          simulated: stats.simulatedEmails,
          failed: stats.failedEmails,
          last24Hours: stats.emailsLast24h,
          deliverabilityRate: stats.deliverabilityRate
        },
        campaigns: {
          total: stats.totalCampaigns
        },
        apiKeys: {
          total: stats.totalApiKeys
        },
        system: {
          database: "memory",
          dbName: "Safe In-Memory Store",
          dbHost: "localhost",
          uptimeSeconds: serverUptimeSeconds,
          nodeVersion: process.version,
          platform: os.platform(),
          memoryHeapMB: Math.round(memUsage.heapUsed / 1024 / 1024),
          memoryRssMB: Math.round(memUsage.rss / 1024 / 1024)
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// 4. User Directory with Pagination & Search
router.get("/users", requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || "").trim();
    const role = (req.query.role || "all").trim();

    if (hasMongo()) {
      const query = {};
      if (role !== "all") {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } }
        ];
      }

      const totalUsers = await User.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / limit) || 1;

      const rawUsers = await User.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Collect counts, API keys, and comprehensive multi-service usage for each user
      const usersWithStats = await Promise.all(
        rawUsers.map(async (u) => {
          const [
            apiKeyCount,
            emailCount,
            sentEmailCount,
            failedEmailCount,
            simulatedEmailCount,
            campaignCount,
            webhookCount,
            keysList
          ] = await Promise.all([
            ApiKey.countDocuments({ userId: u._id }),
            EmailLog.countDocuments({ userId: u._id }),
            EmailLog.countDocuments({ userId: u._id, status: "sent" }),
            EmailLog.countDocuments({ userId: u._id, status: "failed" }),
            EmailLog.countDocuments({ userId: u._id, status: "simulated" }),
            EmailCampaign.countDocuments({ userId: u._id }),
            WebhookEndpoint.countDocuments({ userId: u._id }),
            ApiKey.find({ userId: u._id }).select("name key createdAt").sort({ createdAt: -1 }).lean()
          ]);

          const hasCustomSmtp = Boolean(u.smtpSettings && u.smtpSettings.enabled && u.smtpSettings.host);
          const hasSmsConfigured = Boolean(u.smsSettings && u.smsSettings.phoneNumber);

          const services = {
            emails: {
              total: emailCount,
              sent: sentEmailCount,
              failed: failedEmailCount,
              simulated: simulatedEmailCount
            },
            apiKeys: {
              count: apiKeyCount,
              list: keysList.map(k => ({
                _id: k._id,
                name: k.name || "Default Key",
                maskedKey: k.key ? `${k.key.slice(0, 8)}...${k.key.slice(-4)}` : "—",
                createdAt: k.createdAt
              }))
            },
            campaigns: {
              count: campaignCount
            },
            smtp: {
              enabled: hasCustomSmtp,
              host: u.smtpSettings?.host || "System Default (Gmail Relay)",
              port: u.smtpSettings?.port || 587,
              fromEmail: u.smtpSettings?.fromEmail || u.email
            },
            sms: {
              enabled: hasSmsConfigured,
              phoneNumber: u.smsSettings?.phoneNumber || "Not configured",
              mode: u.smsSettings?.simulationMode ? "Simulated" : "Live SMS Gateway"
            },
            webhooks: {
              count: webhookCount
            },
            activeCount: (emailCount > 0 ? 1 : 0) + (apiKeyCount > 0 ? 1 : 0) + (campaignCount > 0 ? 1 : 0) + (hasCustomSmtp ? 1 : 0) + (hasSmsConfigured ? 1 : 0) + (webhookCount > 0 ? 1 : 0)
          };

          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            companyName: u.companyName || "",
            role: u.role || "client",
            isRegular: u.role !== "admin" && u.role !== "superadmin",
            apiKey: u.apiKey ? `${u.apiKey.slice(0, 7)}...` : "",
            apiKeyCount,
            apiKeys: services.apiKeys.list,
            emailCount,
            campaignCount,
            services,
            createdAt: u.createdAt
          };
        })
      );

      res.json({
        users: usersWithStats,
        totalUsers,
        totalPages,
        currentPage: page
      });
    } else {
      const result = await memoryStore.listAllUsers({ page, limit, search, role });
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
});

// 5. Admin Create User
router.post("/users", requireAdmin, async (req, res, next) => {
  try {
    const { email, name, password, companyName, role } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Email, name, and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = hasMongo() 
      ? await User.findOne({ email: cleanEmail })
      : await memoryStore.findUserByEmail(cleanEmail);

    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const apiKey = createApiKey();
    const assignedRole = role === "admin" ? "admin" : "client";

    let createdUser;
    if (hasMongo()) {
      createdUser = await User.create({
        email: cleanEmail,
        name,
        companyName: companyName || "",
        passwordHash,
        apiKey,
        role: assignedRole,
        senderName: companyName || name,
        templateSettings: {
          brandName: companyName || name,
          emailFooter: `© 2026 ${companyName || name}. All rights reserved.`
        }
      });

      await ApiKey.create({
        name: "Initial Key",
        key: apiKey,
        userId: createdUser._id
      }).catch(() => {});
    } else {
      createdUser = await memoryStore.createUser({
        email: cleanEmail,
        name,
        companyName: companyName || "",
        passwordHash,
        apiKey,
        role: assignedRole,
        senderName: companyName || name
      });
    }

    res.status(201).json({
      success: true,
      user: {
        _id: createdUser._id,
        email: createdUser.email,
        name: createdUser.name,
        companyName: createdUser.companyName,
        role: createdUser.role,
        apiKey: createdUser.apiKey
      }
    });
  } catch (err) {
    next(err);
  }
});

// 6. Update User Role
router.put("/users/:id/role", requireAdmin, async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!["client", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'client' or 'admin'." });
    }

    // Protection: Prevent demoting self
    const currentAdminId = String(req.admin._id || req.admin.id);
    if (String(targetUserId) === currentAdminId && role !== "admin") {
      return res.status(400).json({ 
        error: "Action rejected: You cannot revoke administrator rights from your own active account." 
      });
    }

    if (hasMongo()) {
      const user = await User.findById(targetUserId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      user.role = role;
      await user.save();
      res.json({ success: true, message: `Role updated to ${role}.`, user: { _id: user._id, role: user.role } });
    } else {
      const updated = await memoryStore.updateUserRole(targetUserId, role);
      if (!updated) {
        return res.status(404).json({ error: "User not found." });
      }
      res.json({ success: true, message: `Role updated to ${role}.`, user: { _id: updated._id, role: updated.role } });
    }
  } catch (err) {
    next(err);
  }
});

// 7. Delete User
router.delete("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Protection: Prevent deleting self
    const currentAdminId = String(req.admin._id || req.admin.id);
    if (String(targetUserId) === currentAdminId) {
      return res.status(400).json({ 
        error: "Action rejected: You cannot delete your own logged-in administrator account." 
      });
    }

    if (hasMongo()) {
      const user = await User.findById(targetUserId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      await Promise.all([
        User.findByIdAndDelete(targetUserId),
        ApiKey.deleteMany({ userId: targetUserId }),
        EmailLog.deleteMany({ userId: targetUserId }),
        EmailCampaign.deleteMany({ userId: targetUserId })
      ]);

      res.json({ success: true, message: "User and associated data permanently deleted." });
    } else {
      const deleted = await memoryStore.deleteUser(targetUserId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found." });
      }
      res.json({ success: true, message: "User and associated data deleted." });
    }
  } catch (err) {
    next(err);
  }
});

// 8. Platform Global Email Logs
router.get("/emails", requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "all").trim();
    const type = (req.query.type || "all").trim();

    if (hasMongo()) {
      const query = {};
      if (status !== "all") query.status = status;
      if (type !== "all") query.type = type;
      if (search) {
        query.$or = [
          { to: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { apiKey: { $regex: search, $options: "i" } }
        ];
      }

      const totalLogs = await EmailLog.countDocuments(query);
      const totalPages = Math.ceil(totalLogs / limit) || 1;

      const logs = await EmailLog.find(query)
        .populate("userId", "name email companyName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      res.json({
        logs,
        totalLogs,
        totalPages,
        currentPage: page
      });
    } else {
      const result = await memoryStore.listAllEmailLogs({ page, limit, search, status, type });
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
});

// 9. Platform Global Campaigns
router.get("/campaigns", requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));

    if (hasMongo()) {
      const totalCampaigns = await EmailCampaign.countDocuments();
      const totalPages = Math.ceil(totalCampaigns / limit) || 1;

      const campaigns = await EmailCampaign.find()
        .populate("userId", "name email companyName")
        .select("-recipients.recipientData")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      res.json({
        campaigns,
        totalCampaigns,
        totalPages,
        currentPage: page
      });
    } else {
      const result = await memoryStore.listAllCampaigns({ page, limit });
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
});

// 10. System & Diagnostics Details
router.get("/system", requireAdmin, async (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "healthy",
    database: {
      type: mongoose.connection.readyState === 1 ? "MongoDB Atlas" : "Safe In-Memory",
      state: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      name: mongoose.connection.name || "N/A",
      host: mongoose.connection.host || "N/A"
    },
    smtp: {
      configured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      user: process.env.GMAIL_USER ? `${process.env.GMAIL_USER.split("@")[0]}@***` : "Not Configured",
      fromName: process.env.FROM_NAME || "MailBridge"
    },
    integrations: {
      geminiAiConfigured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_")),
      googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes("placeholder"))
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      totalSystemMemoryGB: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1),
      freeSystemMemoryGB: (os.freemem() / 1024 / 1024 / 1024).toFixed(1),
      processMemoryHeapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      processMemoryRssMB: Math.round(mem.rss / 1024 / 1024)
    }
  });
});

// 11. Run Live SMTP Test
router.post("/test-smtp", requireAdmin, async (_req, res) => {
  try {
    const isWorking = await testSmtpConnection();
    if (isWorking) {
      res.json({
        success: true,
        message: "SMTP connection verified! Primary delivery transport is online and operational."
      });
    } else {
      res.status(502).json({
        success: false,
        error: "SMTP connection verification failed. Please check GMAIL_USER and GMAIL_APP_PASSWORD credentials in server environment."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify SMTP connectivity."
    });
  }
});

export default router;
