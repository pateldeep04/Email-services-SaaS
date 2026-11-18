/**
 * MailBridge Third-Party Integrations - TypeScript Type Definitions
 * Contracts and interfaces for external email, SMS, and AI providers.
 */

export interface ISmtpSendOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
  trackingId?: string;
}

export interface ISmtpSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  timestamp: string;
  provider: "gmail" | "ses" | "resend" | "sendgrid" | "simulation";
}

export interface ISmtpProvider {
  name: string;
  isConfigured(): boolean;
  verifyConnection(): Promise<boolean>;
  sendMail(options: ISmtpSendOptions): Promise<ISmtpSendResult>;
}

export interface ISmsSendOptions {
  to: string;
  message: string;
  purpose?: "otp" | "notification" | "marketing";
}

export interface ISmsSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  provider: "cellular" | "twilio" | "msg91" | "simulation";
  timestamp: string;
}

export interface ISmsProvider {
  name: string;
  isConfigured(): boolean;
  sendSms(options: ISmsSendOptions): Promise<ISmsSendResult>;
}

export interface IAiGenerateOptions {
  prompt: string;
  context?: string;
  tone?: "professional" | "casual" | "urgent" | "friendly";
  maxTokens?: number;
}

export interface IAiGenerateResult {
  success: boolean;
  content: string;
  provider: "gemini" | "openai" | "anthropic" | "local";
  model: string;
}

export interface IAiProvider {
  name: string;
  isConfigured(): boolean;
  generateText(options: IAiGenerateOptions): Promise<IAiGenerateResult>;
}
