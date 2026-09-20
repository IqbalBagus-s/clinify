// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BullMqModule } from './queue/bullmq.module';
import authConfig from './config/auth.config';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './common/logger/logger.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
    LoggerModule,
    BullMqModule,
    AuthModule,
    RedisModule,
    HealthModule,
  ],
  providers: [
    // PERBAIKAN: filter didaftarkan lewat DI container (APP_FILTER),
    // bukan lewat `new` manual di main.ts. Dengan cara ini, NestJS yang
    // membuat instance-nya, sehingga @InjectPinoLogger bisa bekerja normal.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}