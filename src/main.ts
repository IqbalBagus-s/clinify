// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // PERBAIKAN: baris useGlobalFilters() dihapus dari sini — kedua filter
  // sekarang didaftarkan lewat APP_FILTER di app.module.ts, sehingga
  // NestJS DI yang membuat instance-nya (bukan `new` manual).

  await app.listen(3000);
}
bootstrap();