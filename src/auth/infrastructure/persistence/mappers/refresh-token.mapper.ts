// src/auth/infrastructure/persistence/mappers/refresh-token.mapper.ts
import { RefreshToken as PrismaRefreshToken } from '../../../../generated/prisma/client';
import { RefreshTokenEntity } from 'src/auth/domain/entities/refresh-token.entity';

export class RefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshTokenEntity {
    return new RefreshTokenEntity(
      raw.id,
      raw.userId,
      raw.tokenHash,
      raw.deviceInfo,
      raw.ipAddress,
      raw.expiresAt,
      raw.revokedAt,
      raw.createdAt,
    );
  }
}