// src/auth/domain/interfaces/password-reset-token.repository.interface.ts
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';

export interface IPasswordResetTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null>;
  markAsUsed(id: string): Promise<void>;
}