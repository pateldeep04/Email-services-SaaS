/**
 * MailBridge Email Module - TypeScript Type Definitions
 */

export type EmailTemplateType = "otp" | "welcome" | "forgot-password" | "notification" | "custom";

export interface ISendEmailDTO {
  to: string;
  template?: EmailTemplateType;
  subject?: string;
  body?: string;
  name?: string;
  company?: string;
  otp?: string;
  resetUrl?: string;
  title?: string;
  message?: string;
}

export interface IEmailLog {
  _id: string;
  userId?: string;
  to: string;
  subject: string;
  template: EmailTemplateType;
  status: "sent" | "failed" | "opened" | "clicked";
  opensCount: number;
  clicksCount: number;
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface IEmailVerificationResult {
  valid: boolean;
  message: string;
}
