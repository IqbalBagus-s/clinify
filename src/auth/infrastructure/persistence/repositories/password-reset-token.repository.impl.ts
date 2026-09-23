// src/auth/infrastructure/persistence/repositories/password-reset-token.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPasswordResetTokenRepository } from 'src/auth/domain/interfaces/password-reset-token.repository.interface';
import { PasswordResetTokenEntity } from 'src/auth/domain/entities/password-reset-token.entity';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper';

@Injectable()
export class PasswordResetTokenRepositoryImpl implements IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenEntity> {
    const token = await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    return PasswordResetTokenMapper.toDomain(token);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
    const token = await this.prisma.passwordResetToken.findFirst({ where: { tokenHash } });
    return token ? PasswordResetTokenMapper.toDomain(token) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}