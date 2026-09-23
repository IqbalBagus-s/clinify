// src/auth/application/use-cases/logout-all-devices.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { REFRESH_TOKEN_REPOSITORY, TOKEN_BLACKLIST } from '../../domain/interfaces/tokens';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import type { ITokenBlacklist } from '../../domain/interfaces/token-blacklist.interface';

@Injectable()
export class LogoutAllDevicesUseCase {
  constructor(
    @InjectPinoLogger(LogoutAllDevicesUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_BLACKLIST) private readonly tokenBlacklist: ITokenBlacklist,
  ) {}

  async execute(userId: string): Promise<number> {
    const revokedIds = await this.refreshTokenRepository.revokeAllForUser(userId);

    const ttlSeconds = this.configService.get<number>('jwt.accessTokenTtlSeconds', 900);
    await Promise.all(revokedIds.map((id) => this.tokenBlacklist.add(id, ttlSeconds)));

    this.logger.info({ userId, revokedCount: revokedIds.length }, 'user_logged_out_all_devices');
    return revokedIds.length;
  }
}