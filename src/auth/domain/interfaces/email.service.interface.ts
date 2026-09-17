// src/auth/domain/interfaces/email.service.interface.ts
export interface IEmailService {
  sendVerificationEmail(to: string, rawToken: string): Promise<void>;
}