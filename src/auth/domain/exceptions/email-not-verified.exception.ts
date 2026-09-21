// src/auth/domain/exceptions/email-not-verified.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class EmailNotVerifiedException extends DomainException {
  readonly statusCode = 403;
  readonly errorCode = 'EMAIL_NOT_VERIFIED';

  constructor() {
    super('Email belum diverifikasi. Silakan cek email Anda.');
  }
}