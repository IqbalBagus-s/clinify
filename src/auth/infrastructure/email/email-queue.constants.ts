// src/auth/infrastructure/email/email-queue.constants.ts
export const EMAIL_QUEUE_NAME = 'email';

export enum EmailJobName {
  SEND_VERIFICATION = 'send-verification',
  SEND_PASSWORD_RESET = 'send-password-reset',
}

export interface SendVerificationJobData {
  to: string;
  rawToken: string;
  correlationId?: string;
}

export interface SendPasswordResetJobData {
  to: string;
  rawToken: string;
  correlationId?: string;
}

export type EmailJobData = SendVerificationJobData | SendPasswordResetJobData;