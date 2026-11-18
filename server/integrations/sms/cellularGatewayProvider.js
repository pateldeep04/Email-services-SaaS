/**
 * MailBridge Third-Party Integration - Cellular SMS Gateway Provider
 * Dispatches carrier SMS OTP via connected Android phone or carrier relay.
 */

import { logger } from "../../bootstrap/logger.js";

class CellularGatewayProvider {
  constructor() {
    this.name = "cellular";
  }

  isConfigured() {
    return Boolean(process.env.CELLULAR_GATEWAY_URL || process.env.SMS_GATEWAY_TOKEN);
  }

  async sendSms({ to, message }) {
    if (!this.isConfigured()) {
      logger.info(`[SMS SIMULATION] To: ${to} | Message: ${message}`);
      return {
        success: true,
        messageId: `cell_sim_${Date.now()}`,
        simulated: true,
        provider: "simulation",
        timestamp: new Date().toISOString()
      };
    }

    try {
      const gatewayUrl = process.env.CELLULAR_GATEWAY_URL;
      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SMS_GATEWAY_TOKEN}`
        },
        body: JSON.stringify({ to, message })
      });

      const data = await res.json();
      return {
        success: res.ok,
        messageId: data.messageId || `cell_${Date.now()}`,
        simulated: false,
        provider: "cellular",
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.error(`Cellular gateway error: ${err.message}`);
      throw err;
    }
  }
}

export const cellularGatewayProvider = new CellularGatewayProvider();
export default cellularGatewayProvider;
