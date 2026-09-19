// src/common/logger/app-logger.service.ts
import { LoggerService, LogLevel } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';

export class AppLogger implements LoggerService {
  private write(level: LogLevel, message: unknown, context?: string, meta?: Record<string, unknown>) {
    const base = typeof message === 'object' && message !== null ? message : { message };
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      correlationId: RequestContextService.getCorrelationId(),
      ...base,
      ...meta,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }

  log(message: unknown, context?: string) {
    this.write('log', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context, { trace });
  }

  warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write('verbose', message, context);
  }
}