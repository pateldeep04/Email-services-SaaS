/**
 * MailBridge Third-Party Integration - Twilio SMS Provider Adapter
 * Enterprise telecom fallback for SMS OTP & verification messages.
 */

import { logger } from "../../bootstrap/logger.js";

class TwilioProvider {
  constructor() {
    this.name = "twilio";
  }

  isConfigured() {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );
  }

  async sendSms({ to, message }) {
    if (!this.isConfigured()) {
      logger.info(`[TWILIO SIMULATION] To: ${to} | ${message}`);
      return {
        success: true,
        messageId: `tw_sim_${Date.now()}`,
        simulated: true,
        provider: "simulation",
        timestamp: new Date().toISOString()
      };
    }

    // Twilio REST API dispatch
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const params = new URLSearchParams({ To: to, From: from, Body: message });

    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.sid || `tw_${Date.now()}`,
      simulated: false,
      provider: "twilio",
      timestamp: new Date().toISOString()
    };
  }
}

export const twilioProvider = new TwilioProvider();
export default twilioProvider;
