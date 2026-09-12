import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import EmailCampaign from "../models/EmailCampaign.js";
import User from "../models/User.js";
import { memoryStore } from "../services/memoryStore.js";
import { requireAuth } from "../middleware/auth.js";
import { sendEmail } from "../services/emailService.js";

const router = express.Router();
const hasMongo = () => mongoose.connection.readyState === 1;

// 1x1 Transparent PNG buffer
const TRANSPARENT_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to replace {{variables}} in text/html
function interpolateTemplate(text, data = {}) {
  if (!text) return "";
  return text.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/gi, (_, key) => {
    const cleanKey = key.trim();
    // Case-insensitive match against data keys
    const match = Object.keys(data).find(k => k.toLowerCase() === cleanKey.toLowerCase());
    return match !== undefined && data[match] !== undefined && data[match] !== null
      ? String(data[match])
      : "";
  });
}

function formatEmailHtml(bodyContent, senderName = "MailBridge", trackingPixelHtml = "", ctaUrl = "", ctaButtonText = "") {
  let ctaBlock = "";
  if (ctaUrl && ctaButtonText) {
    ctaBlock = `
      <div style="margin-top: 30px; margin-bottom: 24px; text-align: center;">
        <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 13px 32px; border-radius: 8px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(15,118,110,0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
          ${ctaButtonText} →
        </a>
      </div>
    `;
  } else if (ctaUrl) {
    ctaBlock = `
      <div style="margin-top: 24px; padding: 16px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #15803d; line-height: 1.4; font-weight: 600;">
          👉 Ready to get started with ${senderName}?
        </p>
        <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: #0f766e; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 9px 22px; border-radius: 6px; letter-spacing: 0.2px;">
          Learn More & Connect →
        </a>
      </div>
    `;
  }

  if (bodyContent.includes("<html") || bodyContent.includes("<body") || bodyContent.includes("<!DOCTYPE")) {
    if (bodyContent.includes("</body>")) {
      return bodyContent.replace("</body>", `  ${ctaBlock}\n  ${trackingPixelHtml}\n</body>`);
    }
    return `${bodyContent}\n${ctaBlock}\n${trackingPixelHtml}`;
  }
  const paragraphs = bodyContent
    .split(/\n\n+/)
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #374151; font-size: 15px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; padding: 32px 16px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: #0f766e; padding: 22px 28px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff !important; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${senderName}</h2>
        </div>
        <div style="padding: 32px 28px;">
          ${paragraphs}
          ${ctaBlock}
        </div>
        <div style="padding: 18px 28px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
          Sent via ${senderName} • Powered by MailBridge
        </div>
      </div>
      ${trackingPixelHtml}
    </div>
  `;
}

// ==========================================
// 1. PUBLIC TRACKING PIXEL ENDPOINT
// ==========================================
router.get(["/track/:trackingId", "/track/:trackingId.png", "/track/:trackingId.gif"], async (req, res) => {
  const rawId = req.params.trackingId || "";
  const trackingId = rawId.replace(/\.(png|gif|jpg|jpeg)$/i, "").trim();
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  console.log(`[LEAD OPEN TRACKING] Pixel requested for ID: ${trackingId}, IP: ${ip}`);

  // Always respond with the 1x1 image immediately and prevent caching
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    if (hasMongo()) {
      const campaign = await EmailCampaign.findOne({ "recipients.trackingId": trackingId });
      if (campaign) {
        const recipient = campaign.recipients.find((r) => r.trackingId === trackingId);
        if (recipient) {
          const now = new Date();
          if (!recipient.opened) {
            recipient.opened = true;
            recipient.openedAt = now;
          }
          recipient.openCount = (recipient.openCount || 0) + 1;
          recipient.lastOpenedAt = now;
          if (ip) recipient.ip = String(ip);
          if (userAgent) recipient.userAgent = String(userAgent).slice(0, 300);

          campaign.openedCount = campaign.recipients.filter((r) => r.opened).length;
          await campaign.save();
          console.log(`[WARM LEAD] Lead ${recipient.email} opened email! (Total opens: ${recipient.openCount})`);
        }
      }
    } else {
      const result = await memoryStore.trackCampaignOpen(trackingId, { ip, userAgent });
      if (result) {
        console.log(`[WARM LEAD] MemoryStore lead ${result.recipient.email} opened email! (Total opens: ${result.recipient.openCount})`);
      }
    }
  } catch (err) {
    console.error("Error logging lead open tracking:", err.message);
  }

  return res.end(TRANSPARENT_PIXEL);
});

// ==========================================
// 1b. LEAD CTA CLICK & QUALIFICATION ENDPOINT (HOT LEADS)
// Logs click, qualifies lead as HOT, and seamlessly redirects to landing page
// ==========================================
router.get(["/track/cta/:trackingId", "/track/click/:trackingId", "/track/ack/:trackingId"], async (req, res) => {
  const trackingId = (req.params.trackingId || "").trim();
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  let redirectTarget = "";
  let recipientEmail = "";

  try {
    if (hasMongo()) {
      const campaign = await EmailCampaign.findOne({ "recipients.trackingId": trackingId });
      if (campaign) {
        redirectTarget = campaign.ctaTargetUrl || "";
        const recipient = campaign.recipients.find((r) => r.trackingId === trackingId);
        if (recipient) {
          recipientEmail = recipient.email;
          const now = new Date();
          if (!recipient.opened) {
            recipient.opened = true;
            recipient.openedAt = now;
          }
          recipient.openCount = Math.max(1, (recipient.openCount || 0) + 1);
          recipient.lastOpenedAt = now;

          if (!recipient.clicked) {
            recipient.clicked = true;
            recipient.clickedAt = now;
          }
          recipient.clickCount = (recipient.clickCount || 0) + 1;
          if (ip) recipient.ip = String(ip);
          if (userAgent) recipient.userAgent = String(userAgent).slice(0, 300);

          campaign.openedCount = campaign.recipients.filter((r) => r.opened).length;
          campaign.clickedCount = campaign.recipients.filter((r) => r.clicked).length;
          await campaign.save();
          console.log(`[🔥 HOT LEAD CAPTURED] Lead ${recipient.email} clicked CTA for campaign "${campaign.name}"!`);
        }
      }
    } else {
      const result = await memoryStore.trackCampaignClick(trackingId, { ip, userAgent });
      if (result) {
        recipientEmail = result.recipient.email;
        redirectTarget = result.campaign.ctaTargetUrl || "";
      }
    }
  } catch (err) {
    console.error("Error tracking CTA click / hot lead:", err.message);
  }

  // If company configured a destination URL (landing page, Calendly, product link), redirect seamlessly!
  if (redirectTarget && /^https?:\/\//i.test(redirectTarget)) {
    return res.redirect(redirectTarget);
  }

  // Otherwise, display a branded high-converting Lead Offer Confirmation screen
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You • Interest Confirmed</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #1e293b; max-width: 500px; width: 100%; border-radius: 20px; padding: 40px 32px; text-align: center; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }
        .icon-flame { font-size: 48px; margin-bottom: 12px; display: inline-block; }
        h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px; }
        p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px; }
        .lead-badge { display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; word-break: break-all; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon-flame">🔥</div>
        <h1>Your Interest Has Been Received!</h1>
        <p>Thank you for engaging with our proposal. Our team has received your confirmation and will follow up with you shortly.</p>
        ${recipientEmail ? `<div class="lead-badge">✓ Verified Lead: ${recipientEmail}</div><br/>` : ""}
        <div>
          <a href="/bulk-mail" class="btn">Return to MailBridge Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ==========================================
// 1c. SIMULATE / MANUAL TRIGGER OPEN ENDPOINT
// ==========================================
router.post("/:id/recipients/:trackingId/simulate-open", requireAuth, async (req, res, next) => {
  try {
    const { id, trackingId } = req.params;
    const userId = req.user._id || req.user.id;

    if (hasMongo()) {
      const campaign = await EmailCampaign.findOne({ _id: id, userId });
      if (!campaign) return res.status(404).json({ error: "Campaign not found." });
      const recipient = campaign.recipients.find(r => r.trackingId === trackingId);
      if (!recipient) return res.status(404).json({ error: "Recipient not found." });

      const now = new Date();
      if (!recipient.opened) {
        recipient.opened = true;
        recipient.openedAt = now;
      }
      recipient.openCount = (recipient.openCount || 0) + 1;
      recipient.lastOpenedAt = now;
      campaign.openedCount = campaign.recipients.filter(r => r.opened).length;
      await campaign.save();
      return res.json({ success: true, recipient });
    } else {
      const result = await memoryStore.trackCampaignOpen(trackingId, { ip: "127.0.0.1", userAgent: "MailBridge Dashboard Simulator" });
      if (!result) return res.status(404).json({ error: "Recipient not found in memory store." });
      return res.json({ success: true, recipient: result.recipient });
    }
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 1d. SIMULATE / MANUAL TRIGGER HOT LEAD CTA CLICK
// ==========================================
router.post("/:id/recipients/:trackingId/simulate-click", requireAuth, async (req, res, next) => {
  try {
    const { id, trackingId } = req.params;
    const userId = req.user._id || req.user.id;

    if (hasMongo()) {
      const campaign = await EmailCampaign.findOne({ _id: id, userId });
      if (!campaign) return res.status(404).json({ error: "Campaign not found." });
      const recipient = campaign.recipients.find(r => r.trackingId === trackingId);
      if (!recipient) return res.status(404).json({ error: "Recipient not found." });

      const now = new Date();
      if (!recipient.opened) {
        recipient.opened = true;
        recipient.openedAt = now;
      }
      recipient.openCount = Math.max(1, (recipient.openCount || 0) + 1);
      recipient.lastOpenedAt = now;

      if (!recipient.clicked) {
        recipient.clicked = true;
        recipient.clickedAt = now;
      }
      recipient.clickCount = (recipient.clickCount || 0) + 1;

      campaign.openedCount = campaign.recipients.filter(r => r.opened).length;
      campaign.clickedCount = campaign.recipients.filter(r => r.clicked).length;
      await campaign.save();
      return res.json({ success: true, recipient });
    } else {
      const result = await memoryStore.trackCampaignClick(trackingId, { ip: "127.0.0.1", userAgent: "MailBridge Simulator" });
      if (!result) return res.status(404).json({ error: "Recipient not found in memory store." });
      return res.json({ success: true, recipient: result.recipient });
    }
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. SEND BULK CAMPAIGN
// ==========================================
router.post("/send", requireAuth, async (req, res, next) => {
  try {
    const { name, subject, body, recipients, senderName, senderEmail, ctaButtonText, ctaTargetUrl } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: "Campaign name, subject, and email body are required." });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "At least one recipient is required." });
    }

    const userId = req.user._id || req.user.id;
    let user = null;
    let customSmtp = null;

    if (hasMongo()) {
      user = await User.findById(userId);
    } else {
      user = await memoryStore.findUserById(userId);
    }

    if (user && user.smtpSettings && user.smtpSettings.enabled) {
      customSmtp = user.smtpSettings;
    }

    const finalSenderName = senderName || user?.senderName || user?.companyName || "MailBridge";
    const finalSenderEmail = senderEmail || user?.senderEmail || "";

    // Base URL for open tracking
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host");
    const rawBaseUrl = req.body.trackingBaseUrl || process.env.TRACKING_BASE_URL || process.env.PUBLIC_URL || `${protocol}://${host}`;
    const baseUrl = String(rawBaseUrl).replace(/\/+$/, "");

    // Prepare recipients with unique tracking IDs
    const preparedRecipients = recipients.map((row) => {
      const email = String(row.email || row.Email || "").trim().toLowerCase();
      const trackingId = crypto.randomUUID();
      return {
        email,
        recipientData: row,
        trackingId,
        status: "pending",
        opened: false,
        openCount: 0,
        openedAt: null,
        clicked: false,
        clickCount: 0,
        clickedAt: null,
        error: ""
      };
    }).filter(r => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

    if (preparedRecipients.length === 0) {
      return res.status(400).json({ error: "No valid email addresses found in the provided recipients list." });
    }

    // Create Campaign record
    const campaignData = {
      userId,
      name: name.trim(),
      subject,
      body,
      senderName: finalSenderName,
      senderEmail: finalSenderEmail,
      ctaButtonText: ctaButtonText ? String(ctaButtonText).trim() : "",
      ctaTargetUrl: ctaTargetUrl ? String(ctaTargetUrl).trim() : "",
      totalRecipients: preparedRecipients.length,
      sentCount: 0,
      failedCount: 0,
      openedCount: 0,
      clickedCount: 0,
      recipients: preparedRecipients
    };

    let campaign;
    if (hasMongo()) {
      campaign = await EmailCampaign.create(campaignData);
    } else {
      campaign = await memoryStore.createCampaign(campaignData);
    }

    // Process dispatch in background/stream or sequentially with polite throttle
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < preparedRecipients.length; i++) {
      const recipient = preparedRecipients[i];
      const trackingUrl = `${baseUrl}/api/v1/campaigns/track/${recipient.trackingId}.png`;
      const ctaUrl = `${baseUrl}/api/v1/campaigns/track/cta/${recipient.trackingId}`;
      const trackingPixelHtml = `<img src="${trackingUrl}" width="1" height="1" alt="" style="width:1px;height:1px;border:0;display:block;opacity:0.01;margin:0;padding:0;" />`;

      // Interpolate template fields
      const personalizedSubject = interpolateTemplate(subject, recipient.recipientData);
      const rawBody = interpolateTemplate(body, recipient.recipientData);
      const personalizedHtml = formatEmailHtml(rawBody, finalSenderName, trackingPixelHtml, ctaUrl, campaignData.ctaButtonText);

      try {
        await sendEmail(
          {
            to: recipient.email,
            subject: personalizedSubject,
            html: personalizedHtml,
            text: rawBody
          },
          customSmtp,
          { fromName: finalSenderName, fromEmail: finalSenderEmail }
        );

        recipient.status = "sent";
        recipient.sentAt = new Date();
        sentCount++;
      } catch (sendErr) {
        recipient.status = "failed";
        recipient.error = sendErr.message || "Failed to send";
        failedCount++;
      }

      // Small throttle between emails (150ms) to protect SMTP limits
      if (i < preparedRecipients.length - 1) {
        await sleep(150);
      }
    }

    // Save final status
    if (hasMongo()) {
      campaign.sentCount = sentCount;
      campaign.failedCount = failedCount;
      campaign.recipients = preparedRecipients;
      await campaign.save();
    } else {
      campaign.sentCount = sentCount;
      campaign.failedCount = failedCount;
      campaign.recipients = preparedRecipients;
    }

    res.status(201).json({
      success: true,
      message: `Campaign "${name}" processed: ${sentCount} sent, ${failedCount} failed.`,
      campaign: {
        _id: campaign._id,
        name: campaign.name,
        totalRecipients: campaign.totalRecipients,
        sentCount,
        failedCount,
        openedCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. LIST ALL CAMPAIGNS (Overview stats)
// ==========================================
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let campaigns;

    if (hasMongo()) {
      campaigns = await EmailCampaign.find({ userId })
        .sort({ createdAt: -1 })
        .select("name subject totalRecipients sentCount failedCount openedCount clickedCount ctaButtonText ctaTargetUrl createdAt updatedAt");
    } else {
      campaigns = await memoryStore.listCampaigns(userId);
    }

    res.json({ campaigns: campaigns || [] });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. GET CAMPAIGN BY ID (With all recipients & open status)
// ==========================================
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    let campaign;

    if (hasMongo()) {
      campaign = await EmailCampaign.findOne({ _id: id, userId });
    } else {
      campaign = await memoryStore.getCampaignById(id, userId);
    }

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    res.json({ campaign });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. DELETE CAMPAIGN
// ==========================================
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (hasMongo()) {
      const deleted = await EmailCampaign.findOneAndDelete({ _id: id, userId });
      if (!deleted) return res.status(404).json({ error: "Campaign not found." });
    } else {
      const ok = await memoryStore.deleteCampaign(id, userId);
      if (!ok) return res.status(404).json({ error: "Campaign not found." });
    }

    res.json({ success: true, message: "Campaign deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 6. GENERATE SAMPLE DEMO CAMPAIGN FOR IMMEDIATE TESTING
// ==========================================
router.post("/demo", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const now = new Date();

    const sampleRecipients = [
      {
        email: "sarah.jenkins@acmecorp.com",
        recipientData: { firstname: "Sarah", lastname: "Jenkins", company: "Acme Corp" },
        trackingId: crypto.randomUUID(),
        status: "sent",
        opened: true,
        openCount: 4,
        openedAt: new Date(now.getTime() - 25 * 60 * 1000),
        lastOpenedAt: new Date(now.getTime() - 5 * 60 * 1000),
        clicked: true,
        clickedAt: new Date(now.getTime() - 5 * 60 * 1000),
        clickCount: 2,
        sentAt: new Date(now.getTime() - 60 * 60 * 1000),
        error: ""
      },
      {
        email: "m.chang@techstart.io",
        recipientData: { firstname: "Michael", lastname: "Chang", company: "TechStart IO" },
        trackingId: crypto.randomUUID(),
        status: "sent",
        opened: true,
        openCount: 2,
        openedAt: new Date(now.getTime() - 40 * 60 * 1000),
        lastOpenedAt: new Date(now.getTime() - 15 * 60 * 1000),
        clicked: false,
        clickedAt: null,
        clickCount: 0,
        sentAt: new Date(now.getTime() - 60 * 60 * 1000),
        error: ""
      },
      {
        email: "emily@globalventures.com",
        recipientData: { firstname: "Emily", lastname: "Rodriguez", company: "Global Ventures" },
        trackingId: crypto.randomUUID(),
        status: "sent",
        opened: true,
        openCount: 1,
        openedAt: new Date(now.getTime() - 10 * 60 * 1000),
        lastOpenedAt: new Date(now.getTime() - 10 * 60 * 1000),
        clicked: false,
        clickedAt: null,
        clickCount: 0,
        sentAt: new Date(now.getTime() - 60 * 60 * 1000),
        error: ""
      },
      {
        email: "david.k@innovatecloud.com",
        recipientData: { firstname: "David", lastname: "Kim", company: "Innovate Cloud" },
        trackingId: crypto.randomUUID(),
        status: "sent",
        opened: false,
        openCount: 0,
        openedAt: null,
        lastOpenedAt: null,
        clicked: false,
        clickedAt: null,
        clickCount: 0,
        sentAt: new Date(now.getTime() - 60 * 60 * 1000),
        error: ""
      },
      {
        email: "alex.morgan@nextgensolutions.net",
        recipientData: { firstname: "Alex", lastname: "Morgan", company: "NextGen Solutions" },
        trackingId: crypto.randomUUID(),
        status: "sent",
        opened: false,
        openCount: 0,
        openedAt: null,
        lastOpenedAt: null,
        clicked: false,
        clickedAt: null,
        clickCount: 0,
        sentAt: new Date(now.getTime() - 60 * 60 * 1000),
        error: ""
      }
    ];

    const campaignData = {
      userId,
      name: `Q3 Enterprise Outreach (Sample Demo ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      subject: "Exclusive Preview: Scaling your pipeline with MailBridge",
      body: "Hi {{firstname}},\n\nWe saw your recent growth at {{company}} and wanted to share how similar high-growth teams are increasing their qualified pipeline.\n\nBest regards,\nThe Growth Team",
      senderName: "MailBridge Demo",
      senderEmail: "demo@mail-bridge.email",
      ctaButtonText: "Book a Free 15-Min Demo",
      ctaTargetUrl: "https://mail-bridge.email",
      totalRecipients: sampleRecipients.length,
      sentCount: sampleRecipients.length,
      failedCount: 0,
      openedCount: sampleRecipients.filter(r => r.opened).length,
      clickedCount: sampleRecipients.filter(r => r.clicked).length,
      recipients: sampleRecipients
    };

    let campaign;
    if (hasMongo()) {
      campaign = await EmailCampaign.create(campaignData);
    } else {
      campaign = await memoryStore.createCampaign(campaignData);
    }

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    next(error);
  }
});

export default router;
