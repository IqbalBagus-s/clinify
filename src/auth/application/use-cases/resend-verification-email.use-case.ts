// src/auth/application/use-cases/resend-verification-email.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EMAIL_SERVICE, EMAIL_VERIFICATION_TOKEN_REPOSITORY } from '../../domain/interfaces/tokens';
import type { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import type { IEmailService } from '../../domain/interfaces/email.service.interface';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY) private readonly tokenRepository: IEmailVerificationTokenRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerifiedAt !== null) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const ttlHours = this.configService.get<number>('auth.emailVerificationTokenTtlHours', 24);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.tokenRepository.create(user.id, tokenHash, expiresAt);
    await this.emailService.sendVerificationEmail(user.email, rawToken);
  }
}