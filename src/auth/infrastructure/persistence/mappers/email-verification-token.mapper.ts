// src/auth/infrastructure/persistence/mappers/email-verification-token.mapper.ts
import { EmailVerificationToken as PrismaToken } from '../../../../generated/prisma/client';
import { EmailVerificationTokenEntity } from 'src/auth/domain/entities/email-verification-token.entity';

export class EmailVerificationTokenMapper {
  static toDomain(raw: PrismaToken): EmailVerificationTokenEntity {
    return new EmailVerificationTokenEntity(raw.id, raw.userId, raw.tokenHash, raw.expiresAt, raw.usedAt, raw.createdAt);
  }
}