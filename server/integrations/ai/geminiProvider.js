/**
 * MailBridge Third-Party Integration - Google Gemini AI Provider Adapter
 * Generates high-converting cold email copy, subject lines, and spam word audits.
 */

import { logger } from "../../bootstrap/logger.js";

class GeminiProvider {
  constructor() {
    this.name = "gemini";
  }

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  }

  async generateText({ prompt, context, tone = "professional" }) {
    if (!this.isConfigured()) {
      logger.info("[AI SIMULATION] Returning heuristic mock response");
      return {
        success: true,
        content: `Subject: Quick question regarding your outbound deliverability\n\nHi {{firstname}},\n\nNoticed {{company}} is scaling rapidly. MailBridge can help route transactional and outreach emails with zero vendor markup.\n\nBest,\nDeep`,
        provider: "local",
        model: "heuristics-v1"
      };
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `System Context: You are MailBridge AI, an email copywriter and spam auditor specializing in high-converting cold email and deliverability.\nTone: ${tone}\nContext: ${context || "None"}\n\nUser Task: ${prompt}`
                }
              ]
            }
          ]
        })
      });

      const data = await res.json();
      const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return {
        success: Boolean(outputText),
        content: outputText,
        provider: "gemini",
        model: "gemini-1.5-flash"
      };
    } catch (err) {
      logger.error(`Gemini AI provider error: ${err.message}`);
      throw err;
    }
  }
}

export const geminiProvider = new GeminiProvider();
export default geminiProvider;
