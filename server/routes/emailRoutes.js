import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import EmailLog from "../models/EmailLog.js";
import OtpToken from "../models/OtpToken.js";
import { requireApiKey } from "../middleware/apiKey.js";
import { sendEmail, testSmtpConnection } from "../services/emailService.js";
import { memoryStore } from "../services/memoryStore.js";
import {
  forgotPasswordTemplate,
  notificationTemplate,
  otpTemplate,
  welcomeTemplate,
  customTemplate
} from "../services/templates.js";

const router = express.Router();
router.use(requireApiKey);

function getTemplateSettings(req) {
  const user = req.apiClient;
  const keyDoc = req.apiKeyDoc;
  if (!user) return undefined;
  if (user.useGlobalTemplateSettings !== false) {
    return user.templateSettings;
  }
  return (keyDoc && keyDoc.templateSettings) || user.templateSettings;
}

function getStyleNameUsed(req) {
  const user = req.apiClient;
  const keyDoc = req.apiKeyDoc;
  if (!user) return "Global Style";
  if (user.useGlobalTemplateSettings !== false) {
    return "Global Style";
  }
  return (keyDoc && keyDoc.name) ? keyDoc.name : "Global Style";
}

const hasMongo = () => mongoose.connection.readyState === 1;
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

function validateEmail(to) {
  if (!isEmail(to)) {
    const error = new Error("A valid recipient email is required.");
    error.status = 400;
    throw error;
  }
}

async function saveLog(log) {
  if (hasMongo()) return EmailLog.create(log);
  return memoryStore.createLog(log);
}

async function deliver(type, to, template, metadata = {}, userId = null, apiKey = null, keyStyle = "Global Style") {
  try {
    const result = await sendEmail({ to, ...template });
    const log = await saveLog({
      type,
      to,
      subject: template.subject,
      status: result.status,
      providerMessageId: result.messageId,
      metadata: { ...metadata, note: result.note },
      userId,
      apiKey,
      keyStyle
    });

    return {
      success: true,
      status: result.status,
      messageId: result.messageId,
      logId: log._id,
      note: result.note
    };
  } catch (error) {
    await saveLog({
      type,
      to,
      subject: template.subject,
      status: "failed",
      error: error.message,
      metadata,
      userId,
      apiKey,
      keyStyle
    });
    throw error;
  }
}

router.get("/smtp-status", async (req, res, next) => {
  try {
    const status = await testSmtpConnection();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.post("/welcome", async (req, res, next) => {
  try {
    const { to, name = "there", company = "your company" } = req.body;
    validateEmail(to);
    const response = await deliver(
      "welcome",
      to,
      welcomeTemplate({ name, company }, getTemplateSettings(req)),
      req.body,
      req.apiClient?._id,
      req.apiKeyUsed,
      getStyleNameUsed(req)
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/otp", async (req, res, next) => {
  try {
    const { to, purpose = "login" } = req.body;
    validateEmail(to);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (hasMongo()) {
      await OtpToken.create({ email: to, purpose, codeHash, expiresAt });
    } else {
      await memoryStore.createOtp({ email: to, purpose, codeHash, expiresAt });
    }

    const response = await deliver(
      "otp",
      to,
      otpTemplate({ code, purpose }, getTemplateSettings(req)),
      { ...req.body, code, expiresAt },
      req.apiClient?._id,
      req.apiKeyUsed,
      getStyleNameUsed(req)
    );
    res.status(201).json({ ...response, expiresInMinutes: 10 });
  } catch (error) {
    next(error);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { to, code, purpose = "login" } = req.body;
    validateEmail(to);

    const token = hasMongo;
    let foundToken;
    if (hasMongo()) {
      foundToken = await OtpToken.findOne({ email: to, purpose, used: false }).sort({ createdAt: -1 });
    } else {
      foundToken = await memoryStore.findLatestOtp(to, purpose);
    }

    if (!foundToken || new Date(foundToken.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ verified: false, error: "OTP expired or not found." });
    }

    const valid = await bcrypt.compare(String(code), foundToken.codeHash);
    if (!valid) {
      return res.status(400).json({ verified: false, error: "Incorrect OTP." });
    }

    if (hasMongo()) {
      foundToken.used = true;
      await foundToken.save();
    } else {
      await memoryStore.markOtpUsed(foundToken);
    }

    res.json({ verified: true, message: "OTP verified successfully." });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { to, resetUrl } = req.body;
    validateEmail(to);
    if (!resetUrl) return res.status(400).json({ error: "resetUrl is required." });

    const response = await deliver(
      "forgot-password",
      to,
      forgotPasswordTemplate({ resetUrl }, getTemplateSettings(req)),
      req.body,
      req.apiClient?._id,
      req.apiKeyUsed,
      getStyleNameUsed(req)
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/custom", async (req, res, next) => {
  try {
    const { to, subject, message, html } = req.body;
    validateEmail(to);
    if (!subject || (!message && !html)) {
      return res.status(400).json({ error: "subject and either message or html are required." });
    }

    const emailTemplate = html 
      ? { subject, text: message || "HTML email content", html }
      : customTemplate({ subject, message }, getTemplateSettings(req));

    const response = await deliver(
      "custom",
      to,
      emailTemplate,
      req.body,
      req.apiClient?._id,
      req.apiKeyUsed,
      getStyleNameUsed(req)
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/notification", async (req, res, next) => {
  try {
    const { to, title, message } = req.body;
    validateEmail(to);
    if (!title || !message) {
      return res.status(400).json({ error: "title and message are required." });
    }

    const response = await deliver(
      "notification",
      to,
      notificationTemplate({ title, message }, getTemplateSettings(req)),
      req.body,
      req.apiClient?._id,
      req.apiKeyUsed,
      getStyleNameUsed(req)
    );
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.get("/logs", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const filter = req.apiClient ? { userId: req.apiClient._id } : {};
    const logs = hasMongo()
      ? await EmailLog.find(filter).sort({ createdAt: -1 }).limit(limit)
      : await memoryStore.listLogs(limit, req.apiClient?._id);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

export default router;
