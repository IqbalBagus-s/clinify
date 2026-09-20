// src/common/filters/all-exceptions.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // PERBAIKAN: pakai Logger biasa dari nestjs-pino (sama seperti yang
  // dipasang di main.ts), bukan PinoLogger dengan context per-kelas —
  // Logger ini singleton biasa, tidak pakai mekanisme token kontekstual
  // yang bermasalah saat class-nya didaftarkan lewat APP_FILTER.
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();
    const correlationId = request.id;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';

    if (exception instanceof DomainException) {
      statusCode = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as any;
      errorCode = res?.errorCode ?? 'VALIDATION_ERROR';
      message = res?.message?.toString?.() ?? exception.message;
    } else {
      this.logger.error(
        `unhandled_exception path=${request.url} correlationId=${correlationId}`,
        exception instanceof Error ? exception.stack : String(exception),
        'AllExceptionsFilter',
      );
    }

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}