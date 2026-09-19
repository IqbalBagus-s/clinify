// src/auth/infrastructure/email/email-queue.constants.ts
export const EMAIL_QUEUE_NAME = 'email';

export enum EmailJobName {
  SEND_VERIFICATION = 'send-verification',
}

export interface SendVerificationJobData {
  to: string;
  rawToken: string;
  correlationId?: string;
}