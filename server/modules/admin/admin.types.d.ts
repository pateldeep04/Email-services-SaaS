/**
 * MailBridge Admin Module - TypeScript Type Definitions
 */

export interface IAdminUser {
  _id: string;
  email: string;
  role: "admin" | "superadmin";
  createdAt: Date;
}

export interface IAdminStats {
  totalUsers: number;
  totalEmailsSent: number;
  totalSmsSent: number;
  totalActiveApiKeys: number;
  openRatePercent: number;
  clickRatePercent: number;
}

export interface IAdminLoginDTO {
  email: string;
  password?: string;
}
