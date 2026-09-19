// src/common/filters/all-exceptions.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { RequestContextService } from '../context/request-context.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = RequestContextService.getCorrelationId();

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
        { message: 'unhandled_exception', path: request.url, correlationId },
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // correlationId disertakan di response supaya kalau user melapor error,
    // Anda tinggal grep log dengan ID ini — tidak perlu menebak-nebak waktu kejadian.
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