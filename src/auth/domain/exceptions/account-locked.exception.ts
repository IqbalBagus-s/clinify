// src/auth/domain/exceptions/account-locked.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class AccountLockedException extends DomainException {
  readonly statusCode = 423;
  readonly errorCode = 'ACCOUNT_LOCKED';

  constructor() {
    super('Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
  }
}