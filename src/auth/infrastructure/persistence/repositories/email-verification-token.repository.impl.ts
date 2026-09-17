// src/auth/infrastructure/persistence/repositories/email-verification-token.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IEmailVerificationTokenRepository } from 'src/auth/domain/interfaces/email-verification-token.repository.interface';
import { EmailVerificationTokenEntity } from 'src/auth/domain/entities/email-verification-token.entity';
import { EmailVerificationTokenMapper } from '../mappers/email-verification-token.mapper';

@Injectable()
export class EmailVerificationTokenRepositoryImpl implements IEmailVerificationTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<EmailVerificationTokenEntity> {
    const token = await this.prisma.emailVerificationToken.create({
      data: { userId: userId, tokenHash: tokenHash, expiresAt: expiresAt },
    });
    return EmailVerificationTokenMapper.toDomain(token);
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerificationTokenEntity | null> {
    const token = await this.prisma.emailVerificationToken.findFirst({ where: { tokenHash: tokenHash } });
    return token ? EmailVerificationTokenMapper.toDomain(token) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.emailVerificationToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}