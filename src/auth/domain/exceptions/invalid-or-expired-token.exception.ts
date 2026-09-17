// src/auth/domain/exceptions/invalid-or-expired-token.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class InvalidOrExpiredTokenException extends DomainException {
  readonly statusCode = 410;
  readonly errorCode = 'TOKEN_INVALID_OR_EXPIRED';

  constructor() {
    super('Token tidak valid, sudah digunakan, atau sudah kedaluwarsa.');
  }
}