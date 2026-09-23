// src/auth/domain/exceptions/invalid-old-password.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class InvalidOldPasswordException extends DomainException {
  readonly statusCode = 400;
  readonly errorCode = 'INVALID_OLD_PASSWORD';

  constructor() {
    super('Password lama tidak sesuai.');
  }
}