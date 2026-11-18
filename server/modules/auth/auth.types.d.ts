/**
 * MailBridge Auth Module - TypeScript Type Definitions
 */

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegisterDTO {
  name: string;
  email: string;
  password?: string;
}

export interface ILoginDTO {
  email: string;
  password?: string;
}

export interface IVerifyOtpDTO {
  email: string;
  otp: string;
}

export interface IApiKey {
  _id: string;
  userId: string;
  name: string;
  key: string;
  scope: string[];
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface ICreateApiKeyDTO {
  name: string;
  scope?: string[];
}

export interface IAuthSession {
  userId: string;
  email: string;
  name: string;
}
