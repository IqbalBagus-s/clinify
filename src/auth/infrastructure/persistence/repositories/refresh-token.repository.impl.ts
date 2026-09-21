// src/auth/infrastructure/persistence/repositories/refresh-token.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateRefreshTokenInput,
  IRefreshTokenRepository,
} from 'src/auth/domain/interfaces/refresh-token.repository.interface';
import { RefreshTokenEntity } from 'src/auth/domain/entities/refresh-token.entity';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';

@Injectable()
export class RefreshTokenRepositoryImpl implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshTokenEntity> {
    const token = await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        deviceInfo: input.deviceInfo,
        ipAddress: input.ipAddress,
        expiresAt: input.expiresAt,
      },
    });
    return RefreshTokenMapper.toDomain(token);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const token = await this.prisma.refreshToken.findFirst({ where: { tokenHash } });
    return token ? RefreshTokenMapper.toDomain(token) : null;
  }

  async findById(id: string): Promise<RefreshTokenEntity | null> {
    const token = await this.prisma.refreshToken.findUnique({ where: { id } });
    return token ? RefreshTokenMapper.toDomain(token) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string, exceptId?: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }
}