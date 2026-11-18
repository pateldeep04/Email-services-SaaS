/**
 * MailBridge AI Module - TypeScript Type Definitions
 */

export interface IAiGenerateSubjectDTO {
  topic: string;
  targetAudience?: string;
  tone?: "professional" | "curious" | "urgent" | "friendly";
}

export interface IAiOptimizeCopyDTO {
  rawCopy: string;
  companyName?: string;
  prospectName?: string;
}

export interface ISpamAuditReport {
  score: number;
  grade: "A" | "B" | "C" | "F";
  flaggedWords: Array<{
    word: string;
    severity: "high" | "medium" | "low";
    reason: string;
  }>;
  suggestions: string[];
}
