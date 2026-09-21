// src/auth/domain/exceptions/refresh-token-invalid.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class RefreshTokenInvalidException extends DomainException {
  readonly statusCode = 401;
  readonly errorCode = 'REFRESH_TOKEN_INVALID';

  constructor() {
    super('Sesi tidak valid atau telah berakhir. Silakan login kembali.');
  }
}