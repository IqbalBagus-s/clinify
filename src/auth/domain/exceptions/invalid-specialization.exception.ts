// src/auth/domain/exceptions/invalid-specialization.exception.ts
import { DomainException } from 'src/common/exceptions/domain.exception';

export class InvalidSpecializationException extends DomainException {
  readonly statusCode = 400;
  readonly errorCode = 'INVALID_SPECIALIZATION';

  constructor() {
    super('Spesialisasi tidak ditemukan atau sudah tidak aktif.');
  }
}