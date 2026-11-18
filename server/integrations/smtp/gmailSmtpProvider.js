/**
 * MailBridge Third-Party Integration - Gmail SMTP Relay Provider
 * Authenticates via Google Workspace / Gmail App Passwords and dispatches DKIM-signed mail.
 */

import nodemailer from "nodemailer";
import { logger } from "../../bootstrap/logger.js";

class GmailSmtpProvider {
  constructor() {
    this.name = "gmail";
    this.transporter = null;
    this._initTransporter();
  }

  _initTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });
    } else {
      this.transporter = null;
    }
  }

  isConfigured() {
    return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  }

  async verifyConnection() {
    if (!this.isConfigured() || !this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      logger.warn(`Gmail SMTP connection verification failed: ${err.message}`);
      return false;
    }
  }

  async sendMail(options) {
    const { to, subject, html, text, from, attachments } = options;
    const sender = from || process.env.GMAIL_USER || "noreply@mail-bridge.email";

    if (!this.isConfigured() || !this.transporter) {
      logger.info(`[SMTP SIMULATION] Sent to: ${to} | Subject: "${subject}"`);
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        simulated: true,
        provider: "simulation",
        timestamp: new Date().toISOString()
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: sender,
        to,
        subject,
        text,
        html,
        attachments
      });

      return {
        success: true,
        messageId: info.messageId,
        simulated: false,
        provider: "gmail",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Gmail SMTP relay error: ${error.message}`);
      throw error;
    }
  }
}

export const gmailSmtpProvider = new GmailSmtpProvider();
export default gmailSmtpProvider;
