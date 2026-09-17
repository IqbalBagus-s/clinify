// src/auth/domain/interfaces/email-verification-token.repository.interface.ts
import { EmailVerificationTokenEntity } from '../entities/email-verification-token.entity';

export interface IEmailVerificationTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<EmailVerificationTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<EmailVerificationTokenEntity | null>;
  markAsUsed(id: string): Promise<void>;
}