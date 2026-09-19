// src/auth/application/use-cases/resend-verification-email.use-case.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { EMAIL_SERVICE, EMAIL_VERIFICATION_TOKEN_REPOSITORY } from '../../domain/interfaces/tokens';
import type { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import type { IEmailService } from '../../domain/interfaces/email.service.interface';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';

// PERBAIKAN KUNCI: sebelumnya file ini query this.prisma.user.findUnique()
// langsung, melewati IUserRepository yang sudah didefinisikan. Sekarang
// konsisten memakai abstraksi yang sama dengan use case lain.
@Injectable()
export class ResendVerificationEmailUseCase {
  private readonly logger = new Logger(ResendVerificationEmailUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY) private readonly tokenRepository: IEmailVerificationTokenRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    // Tetap diam-diam sukses meski email tidak terdaftar/sudah terverifikasi,
    // untuk mencegah user enumeration lewat endpoint ini.
    if (!user || user.emailVerifiedAt !== null) {
      this.logger.log({ message: 'resend_verification_skipped', found: !!user });
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const ttlHours = this.configService.get<number>('auth.emailVerificationTokenTtlHours', 24);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.tokenRepository.create(user.id, tokenHash, expiresAt);
    await this.emailService.sendVerificationEmail(user.email, rawToken);

    this.logger.log({ message: 'verification_email_resent', userId: user.id });
  }
}