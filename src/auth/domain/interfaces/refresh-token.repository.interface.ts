// src/auth/domain/interfaces/refresh-token.repository.interface.ts
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<RefreshTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  findById(id: string): Promise<RefreshTokenEntity | null>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string, exceptId?: string): Promise<string[]>;
}