// src/auth/domain/exceptions/new-password-same-as-old.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class NewPasswordSameAsOldException extends DomainException {
  readonly statusCode = 400;
  readonly errorCode = 'NEW_PASSWORD_SAME_AS_OLD';

  constructor() {
    super('Password baru tidak boleh sama dengan password lama.');
  }
}