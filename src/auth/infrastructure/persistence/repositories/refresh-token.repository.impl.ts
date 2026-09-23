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

  async revokeAllForUser(userId: string, exceptId?: string): Promise<string[]> {
    // Dua langkah (query dulu, baru updateMany) karena Prisma updateMany
    // tidak mengembalikan baris yang terdampak — padahal kita perlu daftar
    // ID-nya untuk dimasukkan ke blacklist Redis di use case pemanggil.
    const toRevoke = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    const ids = toRevoke.map((t) => t.id);
    if (ids.length === 0) return [];

    await this.prisma.refreshToken.updateMany({
      where: { id: { in: ids } },
      data: { revokedAt: new Date() },
    });

    return ids;
  }
}