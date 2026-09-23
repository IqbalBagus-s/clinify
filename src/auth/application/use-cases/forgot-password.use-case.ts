// src/auth/application/use-cases/forgot-password.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { randomBytes, createHash } from 'crypto';
import { EMAIL_SERVICE, PASSWORD_RESET_TOKEN_REPOSITORY } from '../../domain/interfaces/tokens';
import type { IEmailService } from '../../domain/interfaces/email.service.interface';
import type { IPasswordResetTokenRepository } from '../../domain/interfaces/password-reset-token.repository.interface';
import { ResendVerificationEmailUseCase } from './resend-verification-email.use-case';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';

// DESAIN PENTING: response API selalu 200 identik di ketiga kondisi
// (lihat auth.controller.ts). Percabangan di bawah ini HANYA menentukan
// efek internal (token & email apa yang dikirim), tidak pernah bocor
// ke response HTTP — sesuai rekomendasi OWASP untuk mencegah user
// enumeration lewat endpoint forgot-password.
@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @InjectPinoLogger(ForgotPasswordUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY) private readonly tokenRepository: IPasswordResetTokenRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());

    if (!user) {
      this.logger.info({ found: false }, 'forgot_password_no_op_email_not_found');
      return;
    }

    if (user.emailVerifiedAt === null) {
      // Reuse mekanisme yang sudah ada — bukan duplikasi logika token
      // verifikasi, sesuai kontrak yang disepakati.
      this.logger.info({ userId: user.id }, 'forgot_password_redirected_to_verification');
      await this.resendVerificationEmailUseCase.execute(user.email);
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const ttlHours = this.configService.get<number>('auth.passwordResetTokenTtlHours', 1);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.tokenRepository.create(user.id, tokenHash, expiresAt);
    await this.emailService.sendPasswordResetEmail(user.email, rawToken);

    this.logger.info({ userId: user.id }, 'password_reset_email_sent');
  }
}