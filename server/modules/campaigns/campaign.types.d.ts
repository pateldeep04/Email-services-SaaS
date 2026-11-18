/**
 * MailBridge Campaign Module - TypeScript Type Definitions
 */

export type LeadQualification = "hot" | "warm" | "cold";

export interface IRecipientRecord {
  email: string;
  name?: string;
  company?: string;
  role?: string;
  customFields?: Record<string, string>;
  status: "pending" | "sent" | "failed" | "opened" | "clicked";
  leadCategory?: LeadQualification;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface ICreateCampaignDTO {
  name: string;
  subject: string;
  body: string;
  recipients: IRecipientRecord[];
  emailColumnKey: string;
}

export interface ICampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}
