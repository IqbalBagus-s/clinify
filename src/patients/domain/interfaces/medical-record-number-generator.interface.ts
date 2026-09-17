// src/patients/domain/interfaces/medical-record-number-generator.interface.ts
export abstract class IMedicalRecordNumberGenerator {
  abstract generate(): string;
}