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

    const currentCount = await client.incr(routeKey);
    if (currentCount === 1) {
      await client.expire(routeKey, this.windowSeconds);
    }

    if (currentCount > this.limit) {
      // Sebelumnya percobaan brute-force tidak meninggalkan jejak log sama
      // sekali — hanya terlihat sebagai counter di Redis yang harus dicek manual.
      this.logger.warn({
        message: 'rate_limit_exceeded',
        route: request.route?.path,
        ip: request.ip,
        currentCount,
      });
      throw new HttpException(
        { statusCode: HttpStatus.TOO_MANY_REQUESTS, errorCode: 'RATE_LIMIT_EXCEEDED', message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}