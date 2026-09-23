// src/auth/application/use-cases/logout.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { REFRESH_TOKEN_REPOSITORY, TOKEN_BLACKLIST } from '../../domain/interfaces/tokens';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import type { ITokenBlacklist } from '../../domain/interfaces/token-blacklist.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @InjectPinoLogger(LogoutUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_BLACKLIST) private readonly tokenBlacklist: ITokenBlacklist,
  ) {}

  async execute(sessionId: string): Promise<void> {
    const existingToken = await this.refreshTokenRepository.findById(sessionId);
    if (!existingToken || existingToken.isRevoked()) {
      this.logger.info({ sessionId }, 'logout_no_op_session_already_revoked');
      return;
    }

    await this.refreshTokenRepository.revoke(sessionId);

    const ttlSeconds = this.configService.get<number>('jwt.accessTokenTtlSeconds', 900);
    await this.tokenBlacklist.add(sessionId, ttlSeconds);

    this.logger.info({ sessionId, userId: existingToken.userId }, 'user_logged_out');
  }
}