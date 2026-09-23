// src/auth/presentation/guards/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TOKEN_BLACKLIST, TOKEN_SERVICE } from 'src/auth/domain/interfaces/tokens';
import type { AccessTokenPayload, ITokenService } from 'src/auth/domain/interfaces/token.service.interface';
import type { ITokenBlacklist } from 'src/auth/domain/interfaces/token-blacklist.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(TOKEN_BLACKLIST) private readonly tokenBlacklist: ITokenBlacklist,
  ) {}

  // Guard sekarang async karena isBlacklisted() melibatkan I/O ke Redis.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AccessTokenPayload }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ errorCode: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length);

    let payload: AccessTokenPayload;
    try {
      payload = this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException({ errorCode: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    // Ini yang menutup celah sebelumnya: walau signature & exp masih valid,
    // kalau sid-nya sudah masuk blacklist (karena sesi di-revoke lewat
    // logout/reset-password/change-password), request tetap ditolak.
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(payload.sid);
    if (isBlacklisted) {
      throw new UnauthorizedException({ errorCode: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    request.user = payload;
    return true;
  }
}