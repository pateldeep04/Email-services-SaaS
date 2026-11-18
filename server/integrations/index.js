/**
 * MailBridge Third-Party Integrations - Unified Registry & Factory
 * Allows seamless plugging, swapping, and scaling of external APIs.
 */

import { gmailSmtpProvider } from "./smtp/gmailSmtpProvider.js";
import { sesProvider } from "./smtp/sesProvider.js";
import { resendProvider } from "./smtp/resendProvider.js";
import { cellularGatewayProvider } from "./sms/cellularGatewayProvider.js";
import { twilioProvider } from "./sms/twilioProvider.js";
import { geminiProvider } from "./ai/geminiProvider.js";

const smtpProviders = {
  gmail: gmailSmtpProvider,
  ses: sesProvider,
  resend: resendProvider
};

const smsProviders = {
  cellular: cellularGatewayProvider,
  twilio: twilioProvider
};

const aiProviders = {
  gemini: geminiProvider
};

/**
 * Returns configured SMTP provider by name, defaulting to Gmail SMTP relay
 */
export function getSmtpProvider(providerName = process.env.SMTP_PROVIDER || "gmail") {
  const provider = smtpProviders[providerName.toLowerCase()];
  if (!provider) {
    return gmailSmtpProvider;
  }
  return provider;
}

/**
 * Returns configured SMS provider by name, defaulting to Cellular Gateway
 */
export function getSmsProvider(providerName = process.env.SMS_PROVIDER || "cellular") {
  const provider = smsProviders[providerName.toLowerCase()];
  if (!provider) {
    return cellularGatewayProvider;
  }
  return provider;
}

/**
 * Returns configured AI provider by name, defaulting to Google Gemini
 */
export function getAiProvider(providerName = process.env.AI_PROVIDER || "gemini") {
  const provider = aiProviders[providerName.toLowerCase()];
  if (!provider) {
    return geminiProvider;
  }
  return provider;
}

export default {
  getSmtpProvider,
  getSmsProvider,
  getAiProvider,
  smtpProviders,
  smsProviders,
  aiProviders
};
