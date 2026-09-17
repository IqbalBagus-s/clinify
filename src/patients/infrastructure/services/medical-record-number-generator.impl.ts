// src/patients/infrastructure/services/medical-record-number-generator.impl.ts
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { IMedicalRecordNumberGenerator } from 'src/patients/domain/interfaces/medical-record-number-generator.interface';

@Injectable()
export class MedicalRecordNumberGeneratorImpl implements IMedicalRecordNumberGenerator {
  generate(): string {
    const year = new Date().getFullYear();
    const sequence = randomInt(0, 999999).toString().padStart(6, '0');
    return `MRN-${year}-${sequence}`;
  }
}