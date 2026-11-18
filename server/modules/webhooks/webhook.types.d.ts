/**
 * MailBridge Webhooks Module - TypeScript Type Definitions
 */

export type WebhookEventType = 
  | "email.sent" 
  | "email.opened" 
  | "email.clicked" 
  | "email.failed"
  | "sms.sent"
  | "lead.qualified_hot";

export interface IWebhookEndpoint {
  _id: string;
  userId: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ICreateWebhookDTO {
  url: string;
  events: WebhookEventType[];
}

export interface IWebhookDeliveryLog {
  _id: string;
  endpointId: string;
  event: WebhookEventType;
  payload: Record<string, unknown>;
  statusCode: number;
  success: boolean;
  error?: string;
  durationMs: number;
  deliveredAt: Date;
}
