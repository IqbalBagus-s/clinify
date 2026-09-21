// src/auth/domain/exceptions/account-deactivated.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class AccountDeactivatedException extends DomainException {
  readonly statusCode = 403;
  readonly errorCode = 'ACCOUNT_DEACTIVATED';

  constructor() {
    super('Akun Anda telah dinonaktifkan. Hubungi admin.');
  }
}