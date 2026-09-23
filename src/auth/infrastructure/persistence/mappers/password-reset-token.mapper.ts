// src/auth/infrastructure/persistence/mappers/password-reset-token.mapper.ts
import { PasswordResetToken as PrismaToken } from '../../../../generated/prisma/client';
import { PasswordResetTokenEntity } from 'src/auth/domain/entities/password-reset-token.entity';

export class PasswordResetTokenMapper {
  static toDomain(raw: PrismaToken): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity(raw.id, raw.userId, raw.tokenHash, raw.expiresAt, raw.usedAt, raw.createdAt);
  }
}