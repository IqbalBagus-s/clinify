// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      (): Promise<HealthIndicatorResult> => this.checkDatabase(),
      (): Promise<HealthIndicatorResult> => this.checkRedis(),
    ]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      return { database: { status: 'down', message: (error as Error).message } };
    }
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redisService.getClient().ping();
      return { redis: { status: pong === 'PONG' ? 'up' : 'down' } };
    } catch (error) {
      return { redis: { status: 'down', message: (error as Error).message } };
    }
  }
}