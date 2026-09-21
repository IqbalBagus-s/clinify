// src/auth/domain/exceptions/account-pending-verification.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class AccountPendingVerificationException extends DomainException {
  readonly statusCode = 403;
  readonly errorCode = 'PENDING_ADMIN_VERIFICATION';

  constructor() {
    super('Akun Anda sedang menunggu verifikasi admin.');
  }
}