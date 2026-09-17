// src/auth/application/use-cases/verify-email.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { EMAIL_VERIFICATION_TOKEN_REPOSITORY } from '../../domain/interfaces/tokens';
import type { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY) private readonly tokenRepository: IEmailVerificationTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(rawToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const token = await this.tokenRepository.findByTokenHash(tokenHash);

    if (!token || !token.isValid()) {
      throw new InvalidOrExpiredTokenException();
    }

    await this.tokenRepository.markAsUsed(token.id);
    await this.userRepository.markEmailVerified(token.userId);
  }
}