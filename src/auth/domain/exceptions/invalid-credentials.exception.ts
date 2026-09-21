// src/auth/domain/exceptions/invalid-credentials.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class InvalidCredentialsException extends DomainException {
  readonly statusCode = 401;
  readonly errorCode = 'INVALID_CREDENTIALS';

  constructor() {
    super('Username/email atau password salah.');
  }
}