/**
 * MailBridge SMS Module - TypeScript Type Definitions
 */

export interface ISmsOtpRequestDTO {
  phone: string;
  brandName?: string;
  purpose?: string;
}

export interface ISmsOtpVerifyDTO {
  phone: string;
  code: string;
}

export interface ISmsOtpRecord {
  _id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}
