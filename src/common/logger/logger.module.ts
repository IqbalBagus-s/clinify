// src/common/logger/logger.module.ts
import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

// PERBAIKAN: tambahkan @Global() supaya PinoLogger yang disediakan
// PinoLoggerModule bisa di-inject di mana pun di seluruh aplikasi
// (termasuk provider APP_FILTER di AppModule) tanpa perlu import ulang.
@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,

        genReqId: (req, res) => {
          const existing = req.headers['x-request-id'] as string;
          const id = existing || randomUUID();
          res.setHeader('x-request-id', id);
          return id;
        },

        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}