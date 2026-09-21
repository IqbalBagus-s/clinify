// src/auth/application/use-cases/refresh-token.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { randomBytes, createHash } from 'crypto';
import { RefreshTokenInvalidException } from '../../domain/exceptions/refresh-token-invalid.exception';
import { TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/tokens';
import type { ITokenService } from '../../domain/interfaces/token.service.interface';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';

export interface RefreshTokenMetadata {
  deviceInfo?: string;
  ipAddress?: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @InjectPinoLogger(RefreshTokenUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(rawRefreshToken: string, metadata: RefreshTokenMetadata): Promise<RefreshTokenResult> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const existingToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!existingToken || !existingToken.isValid()) {
      throw new RefreshTokenInvalidException();
    }

    const user = await this.userRepository.findById(existingToken.userId);
    if (!user) {
      throw new RefreshTokenInvalidException();
    }

    // Rotasi: token lama di-revoke SEBELUM token baru dibuat.
    await this.refreshTokenRepository.revoke(existingToken.id);

    const rawNewRefreshToken = randomBytes(40).toString('hex');
    const newTokenHash = createHash('sha256').update(rawNewRefreshToken).digest('hex');

    // PENTING: expiresAt token baru MEWARISI sisa masa berlaku sesi asal
    // (bukan direset ke default 7/30 hari). Ini mencegah sesi diperpanjang
    // tanpa batas hanya dengan terus memanggil refresh berulang kali —
    // sesi tetap akan berakhir sesuai waktu login awal.
    const inheritedExpiresAt = existingToken.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newRefreshTokenEntity = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      deviceInfo: metadata.deviceInfo?.slice(0, 255),
      ipAddress: metadata.ipAddress?.slice(0, 45),
      expiresAt: inheritedExpiresAt,
    });

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      role: user.role,
      sid: newRefreshTokenEntity.id,
    });

    this.logger.info(
      { userId: user.id, oldSessionId: existingToken.id, newSessionId: newRefreshTokenEntity.id },
      'refresh_token_rotated',
    );

    return {
      accessToken,
      expiresIn: this.configService.get<number>('jwt.accessTokenTtlSeconds', 900),
      refreshToken: rawNewRefreshToken,
      refreshTokenExpiresAt: inheritedExpiresAt,
    };
  }
}