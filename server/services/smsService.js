import { sendEmail } from "./emailService.js";
import User from "../models/User.js";
import EmailLog from "../models/EmailLog.js";
import { memoryStore } from "./memoryStore.js";
import mongoose from "mongoose";
import { exec } from "child_process";

const hasMongo = () => mongoose.connection.readyState === 1;

/**
 * Sends an SMS OTP to a phone number.
 * If user has simulationMode enabled or is missing settings, it simulates delivery.
 * Otherwise, it sends an email via SMTP to the carrier's gateway (e.g. phone@vtext.com).
 */
export async function sendSms({ userId, to, code, purpose, apiKey, keyStyle }) {
  // Format phone number to E.164 (ensure '+' prefix)
  let cleanPhone = to.trim();
  if (!cleanPhone.startsWith("+")) {
    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      cleanPhone = `+91${digitsOnly}`;
    } else {
      cleanPhone = `+${digitsOnly}`;
    }
  }

  // 1. Fetch user to check settings
  let user = null;
  if (userId) {
    user = hasMongo()
      ? await User.findById(userId)
      : await memoryStore.findUserById(userId);
  }

  const hasUserSmsConfig = user?.smsSettings && user.smsSettings.phoneNumber;

  const smsSettings = {
    enabled: hasUserSmsConfig
      ? user.smsSettings.enabled
      : (process.env.SMS_SIMULATION_MODE === "false" || Boolean(process.env.SMS_OTP_NUMBER)),
    phoneNumber: hasUserSmsConfig
      ? user.smsSettings.phoneNumber
      : (process.env.SMS_OTP_NUMBER || ""),
    carrierGateway: hasUserSmsConfig
      ? user.smsSettings.carrierGateway
      : (process.env.SMS_CARRIER_GATEWAY || ""),
    simulationMode: hasUserSmsConfig
      ? user.smsSettings.simulationMode
      : (process.env.SMS_SIMULATION_MODE !== "false"),
    gatewayUrl: hasUserSmsConfig && user.smsSettings.gatewayUrl
      ? user.smsSettings.gatewayUrl
      : (process.env.SMS_GATEWAY_URL || ""),
    gatewayUser: hasUserSmsConfig && user.smsSettings.gatewayUser
      ? user.smsSettings.gatewayUser
      : (process.env.SMS_GATEWAY_USER || ""),
    gatewayPass: hasUserSmsConfig && user.smsSettings.gatewayPass
      ? user.smsSettings.gatewayPass
      : (process.env.SMS_GATEWAY_PASS || "")
  };
  const brandName = user?.templateSettings?.brandName || "MailBridge";

  const messageText = `Your ${brandName} OTP is: ${code}. It expires in 10 minutes.`;

  // Determine simulation status: force simulated if not configured, or if explicitly enabled
  const isSimulated = smsSettings.simulationMode !== false || !smsSettings.phoneNumber || (!smsSettings.carrierGateway && !smsSettings.gatewayUrl && process.env.SMS_USE_ADB !== "true");

  let resultStatus = "simulated";
  let messageId = `simulated-sms-${Date.now()}`;
  let note = "SMS sent in Simulation Mode.";
  let errorMsg = null;

  if (!isSimulated && smsSettings.enabled) {
    try {
      if (process.env.SMS_USE_ADB === "true") {
        // Mode 1: ADB via USB debugging
        // Clean phone number format for ADB
        const digitsOnly = to.replace(/\D/g, "");
        let cleanPhone;
        if (digitsOnly.length === 10) {
          cleanPhone = `+91${digitsOnly}`;
        } else if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
          cleanPhone = `+${digitsOnly}`;
        } else {
          cleanPhone = `+${digitsOnly}`;
        }
        const adbPath = process.env.ADB_PATH || "adb";
        const adbCommand = `"${adbPath}" shell cmd phone sms send-text ${cleanPhone} "${messageText.replace(/"/g, '\\"')}"`;
        
        await new Promise((resolve, reject) => {
          exec(adbCommand, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`ADB execution failed. Make sure your phone is connected and USB Debugging is authorized. Details: ${stderr || error.message}`));
            } else {
              resolve(stdout);
            }
          });
        });

        resultStatus = "sent";
        messageId = `adb-sent-${Date.now()}`;
        note = `SMS sent via USB-connected Android phone using ADB: ${cleanPhone}`;
      } else if (smsSettings.gatewayUrl) {
        // Mode 2: Local Android SMS Gateway over HTTP
        let payload;
        const headers = {
          "Content-Type": "application/json"
        };

        if (smsSettings.gatewayUser && smsSettings.gatewayPass) {
          // SMS Gateway for Android Basic Auth format
          const authStr = `${smsSettings.gatewayUser}:${smsSettings.gatewayPass}`;
          const base64Auth = Buffer.from(authStr).toString("base64");
          headers["Authorization"] = `Basic ${base64Auth}`;
          payload = {
            phoneNumbers: [cleanPhone],
            textMessage: {
              text: messageText
            }
          };
        } else {
          // Standard key-based gateway
          payload = {
            number: cleanPhone,
            phone: cleanPhone,
            to: cleanPhone,
            phoneNumber: cleanPhone,
            message: messageText,
            msg: messageText,
            text: messageText
          };
        }
        if (process.env.SMS_GATEWAY_KEY) {
          headers["Authorization"] = `Bearer ${process.env.SMS_GATEWAY_KEY}`;
          headers["X-API-Key"] = process.env.SMS_GATEWAY_KEY;
          headers["x-api-key"] = process.env.SMS_GATEWAY_KEY;
          headers["key"] = process.env.SMS_GATEWAY_KEY;
        }

        const response = await fetch(smsSettings.gatewayUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gateway returned status ${response.status}: ${errText}`);
        }

        resultStatus = "sent";
        messageId = `android-gateway-${Date.now()}`;
        note = `SMS sent via Android Local Gateway at ${smsSettings.gatewayUrl}`;
      } else {
        // Mode 3: Carrier Email-to-SMS Gateway
        // Clean phone number (leave only digits)
        const cleanPhone = to.replace(/\D/g, "");
        const carrierDomain = smsSettings.carrierGateway.trim().replace(/^@/, "");
        const gatewayEmail = `${cleanPhone}@${carrierDomain}`;

        // Custom SMTP Settings (if user enabled custom SMTP settings)
        let customSmtp = null;
        if (user && user.smtpSettings && user.smtpSettings.enabled) {
          customSmtp = user.smtpSettings;
        }

        let senderProfile = null;
        if (user && (user.senderName || user.senderEmail)) {
          senderProfile = { fromName: user.senderName, fromEmail: user.senderEmail };
        }

        // Deliver to gateway email via SMTP
        const mailResult = await sendEmail({
          to: gatewayEmail,
          subject: "", // Carrier SMS Gateways convert the subject, we leave it empty/minimal
          text: messageText,
          html: ""
        }, customSmtp, senderProfile);

        resultStatus = mailResult.status;
        messageId = mailResult.messageId;
        note = `SMS sent via Carrier Email-to-SMS Gateway: ${gatewayEmail}`;
      }
    } catch (err) {
      resultStatus = "failed";
      errorMsg = err.message;
      note = `Failed to deliver SMS: ${err.message}`;
    }
  }

  // 2. Log delivery transaction to EmailLog (using the extended type enum "sms-otp")
  const logData = {
    type: "sms-otp",
    to: cleanPhone,
    subject: "SMS OTP Verification",
    status: resultStatus,
    providerMessageId: messageId,
    error: errorMsg,
    metadata: {
      message: messageText,
      purpose,
      phone: cleanPhone,
      carrierGateway: smsSettings.carrierGateway || "none",
      simulation: isSimulated,
      note
    },
    userId,
    apiKey,
    keyStyle
  };

  if (hasMongo()) {
    await EmailLog.create(logData);
  } else {
    await memoryStore.createLog(logData);
  }

  // Print to terminal console for debugging/local simulation
  console.log(`\n========================================\n[SMS ${resultStatus.toUpperCase()}] To: ${cleanPhone}\nMessage: ${messageText}\n========================================\n`);

  if (isSimulated && process.env.GMAIL_USER) {
    try {
      let customSmtp = null;
      if (user && user.smtpSettings && user.smtpSettings.enabled) {
        customSmtp = user.smtpSettings;
      }
      let senderProfile = null;
      if (user && (user.senderName || user.senderEmail)) {
        senderProfile = { fromName: user.senderName, fromEmail: user.senderEmail };
      }
      await sendEmail({
        to: process.env.GMAIL_USER,
        subject: `[SMS Simulated] OTP for ${to}`,
        text: `This is a simulated SMS OTP notification.\n\nRecipient Phone: ${to}\nMessage: ${messageText}`,
        html: `<p>This is a simulated SMS OTP notification.</p><p><strong>Recipient Phone:</strong> ${to}</p><p><strong>Message:</strong> ${messageText}</p>`
      }, customSmtp, senderProfile);
      note += ` Copy sent to your configured email: ${process.env.GMAIL_USER}`;
    } catch (err) {
      console.error("Failed to send simulated SMS email copy:", err.message);
    }
  }

  return {
    status: resultStatus,
    messageId,
    note
  };
}
