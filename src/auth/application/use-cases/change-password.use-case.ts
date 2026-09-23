// src/auth/application/use-cases/change-password.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PASSWORD_HASHER, REFRESH_TOKEN_REPOSITORY, TOKEN_BLACKLIST } from '../../domain/interfaces/tokens';
import type { IPasswordHasher } from '../../domain/interfaces/password-hasher.interface';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import type { ITokenBlacklist } from '../../domain/interfaces/token-blacklist.interface';
import { InvalidOldPasswordException } from '../../domain/exceptions/invalid-old-password.exception';
import { NewPasswordSameAsOldException } from '../../domain/exceptions/new-password-same-as-old.exception';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @InjectPinoLogger(ChangePasswordUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_BLACKLIST) private readonly tokenBlacklist: ITokenBlacklist,
  ) {}

  async execute(userId: string, currentSessionId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidOldPasswordException();
    }

    const oldPasswordMatches = await this.passwordHasher.compare(oldPassword, user.passwordHash);
    if (!oldPasswordMatches) {
      throw new InvalidOldPasswordException();
    }

    // BARU: cegah "ganti password" yang sebenarnya tidak mengganti apa-apa.
    const newPasswordSameAsOld = await this.passwordHasher.compare(newPassword, user.passwordHash);
    if (newPasswordSameAsOld) {
      throw new NewPasswordSameAsOldException();
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePasswordHash(userId, newPasswordHash);

    const revokedIds = await this.refreshTokenRepository.revokeAllForUser(userId, currentSessionId);

    const ttlSeconds = this.configService.get<number>('jwt.accessTokenTtlSeconds', 900);
    await Promise.all(revokedIds.map((id) => this.tokenBlacklist.add(id, ttlSeconds)));

    this.logger.info({ userId, revokedCount: revokedIds.length }, 'password_changed');
  }
}