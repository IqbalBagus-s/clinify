// src/auth/application/use-cases/reset-password.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { createHash } from 'crypto';
import {
  PASSWORD_HASHER,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_BLACKLIST,
} from '../../domain/interfaces/tokens';
import type { IPasswordHasher } from '../../domain/interfaces/password-hasher.interface';
import type { IPasswordResetTokenRepository } from '../../domain/interfaces/password-reset-token.repository.interface';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import type { ITokenBlacklist } from '../../domain/interfaces/token-blacklist.interface';
import { InvalidOrExpiredTokenException } from '../../domain/exceptions/invalid-or-expired-token.exception';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @InjectPinoLogger(ResetPasswordUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY) private readonly tokenRepository: IPasswordResetTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_BLACKLIST) private readonly tokenBlacklist: ITokenBlacklist,
  ) {}

  async execute(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const token = await this.tokenRepository.findByTokenHash(tokenHash);

    if (!token || !token.isValid()) {
      throw new InvalidOrExpiredTokenException();
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword);

    await this.tokenRepository.markAsUsed(token.id);
    await this.userRepository.updatePasswordHash(token.userId, newPasswordHash);

    const revokedIds = await this.refreshTokenRepository.revokeAllForUser(token.userId);

    const ttlSeconds = this.configService.get<number>('jwt.accessTokenTtlSeconds', 900);
    await Promise.all(revokedIds.map((id) => this.tokenBlacklist.add(id, ttlSeconds)));

    this.logger.info({ userId: token.userId, revokedCount: revokedIds.length }, 'password_reset_completed');
  }
}