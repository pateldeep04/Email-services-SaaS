import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import OtpToken from "../models/OtpToken.js";
import User from "../models/User.js";
import { requireApiKey } from "../middleware/apiKey.js";
import { memoryStore } from "../services/memoryStore.js";
import { sendSms } from "../services/smsService.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const smsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many SMS requests, please try again after a minute.",
  keyGenerator: (req) => req.apiKeyUsed || req.ip || req.headers?.["x-forwarded-for"] || "anonymous"
});

const router = express.Router();

// Enforce API Key authentication
router.use(requireApiKey);

const hasMongo = () => mongoose.connection.readyState === 1;

/**
 * POST /api/v1/sms/otp
 * Generates and sends a random 6-digit OTP code to the requested phone number.
 */
router.post("/otp", smsRateLimiter, async (req, res, next) => {
  try {
    const { to, purpose = "sms-otp", deviceId } = req.body;
    if (!to) {
      return res.status(400).json({ error: "Recipient phone number (to) is required." });
    }

    // Generate a 6-digit random code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const userId = req.apiClient?._id;
    const apiKey = req.apiKeyUsed;

    // Save the OTP token in the DB (re-use OtpToken model with phone number in the email field)
    if (hasMongo()) {
      await OtpToken.create({ email: to, purpose, codeHash, expiresAt, userId, apiKey });
    } else {
      await memoryStore.createOtp({ email: to, purpose, codeHash, expiresAt, userId, apiKey });
    }

    const keyStyle = (req.apiKeyDoc && req.apiKeyDoc.name) ? req.apiKeyDoc.name : "Global Style";

    // Call the SMS service to dispatch
    const result = await sendSms({
      userId,
      to,
      code,
      purpose,
      apiKey,
      keyStyle,
      deviceId
    });

    const isSuccess = result.status !== "failed";
    res.status(isSuccess ? 201 : 502).json({
      success: isSuccess,
      status: result.status,
      messageId: result.messageId,
      expiresInMinutes: 10,
      note: result.note,
      // For developer convenience in simulated mode, return the code directly
      ...(result.status === "simulated" ? { code } : {})
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/sms/verify-otp
 * Verifies a previously sent SMS OTP code.
 */
router.post("/verify-otp", smsRateLimiter, async (req, res, next) => {
  try {
    const { to, code, purpose = "sms-otp" } = req.body;
    if (!to || !code) {
      return res.status(400).json({ error: "Recipient phone number (to) and verification code are required." });
    }

    let foundToken;
    if (hasMongo()) {
      const query = { email: to, purpose, used: false };
      if (req.apiClient?._id) {
        query.userId = req.apiClient._id;
      } else if (req.apiKeyUsed) {
        query.apiKey = req.apiKeyUsed;
      }
      foundToken = await OtpToken.findOne(query).sort({ createdAt: -1 });
    } else {
      foundToken = await memoryStore.findLatestOtp(to, purpose, req.apiClient?._id, req.apiKeyUsed);
    }

    if (!foundToken || new Date(foundToken.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ verified: false, error: "OTP expired or not found." });
    }

    const valid = await bcrypt.compare(String(code), foundToken.codeHash);
    if (!valid) {
      return res.status(400).json({ verified: false, error: "Incorrect OTP." });
    }

    // Mark the OTP token as used
    if (hasMongo()) {
      foundToken.used = true;
      await foundToken.save();
    } else {
      await memoryStore.markOtpUsed(foundToken);
    }

    res.json({ verified: true, message: "SMS OTP verified successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
