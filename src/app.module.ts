// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BullMqModule } from './queue/bullmq.module';
import authConfig from './config/auth.config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
    BullMqModule,
    AuthModule,
    RedisModule,
  ],
})
export class AppModule {}