/**
 * MailBridge Third-Party Integration - Resend / SendGrid Provider Adapter
 * Plug-and-play adapter for modern developer transactional email APIs.
 */

import { logger } from "../../bootstrap/logger.js";

class ResendProvider {
  constructor() {
    this.name = "resend";
  }

  isConfigured() {
    return Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
  }

  async verifyConnection() {
    return this.isConfigured();
  }

  async sendMail(options) {
    if (!this.isConfigured()) {
      return {
        success: true,
        messageId: `resend_sim_${Date.now()}`,
        simulated: true,
        provider: "simulation",
        timestamp: new Date().toISOString()
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: options.from || "noreply@mail-bridge.email",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    });

    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.id || `resend_${Date.now()}`,
      simulated: false,
      provider: "resend",
      timestamp: new Date().toISOString()
    };
  }
}

export const resendProvider = new ResendProvider();
export default resendProvider;
