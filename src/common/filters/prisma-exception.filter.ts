// src/common/filters/prisma-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.code !== 'P2002') {
      throw exception;
    }

    const target = (exception.meta?.target as string[]) ?? [];
    const { statusCode, errorCode, message } = this.mapUniqueViolation(target);

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapUniqueViolation(target: string[]) {
    if (target.includes('username') || target.includes('email')) {
      return {
        statusCode: 409,
        errorCode: 'EMAIL_OR_USERNAME_ALREADY_EXISTS',
        message: 'Username atau email sudah digunakan.',
      };
    }
    if (target.includes('sip')) {
      return {
        statusCode: 409,
        errorCode: 'SIP_ALREADY_EXISTS',
        message: 'Nomor SIP sudah terdaftar.',
      };
    }
    if (target.includes('license_number')) {
      return {
        statusCode: 409,
        errorCode: 'LICENSE_NUMBER_ALREADY_EXISTS',
        message: 'Nomor izin praktik sudah terdaftar.',
      };
    }
    return { statusCode: 409, errorCode: 'DUPLICATE_ENTRY', message: 'Data sudah ada sebelumnya.' };
  }
}