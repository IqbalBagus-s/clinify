// src/auth/presentation/guards/rate-limit.guard.ts
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly limit = 5;
  private readonly windowSeconds = 60;

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const routeKey = `rate-limit:${request.route?.path}:${request.ip}`;
    const client = this.redisService.getClient();

    let currentCount: number;
    try {
      currentCount = await client.incr(routeKey);
      if (currentCount === 1) {
        await client.expire(routeKey, this.windowSeconds);
      }
    } catch (error) {
      // FAIL-OPEN, konsisten dengan TokenBlacklistImpl: kalau Redis tidak
      // terjangkau, rate limiting dilewati sementara — endpoint tetap
      // berfungsi, hanya kehilangan proteksi brute-force selama Redis down.
      this.logger.error('Redis tidak terjangkau saat cek rate limit — fail-open, request diloloskan', error);
      return true;
    }

    if (currentCount > this.limit) {
      this.logger.warn({ message: 'rate_limit_exceeded', route: request.route?.path, ip: request.ip, currentCount });
      throw new HttpException(
        { statusCode: HttpStatus.TOO_MANY_REQUESTS, errorCode: 'RATE_LIMIT_EXCEEDED', message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}