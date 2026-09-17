// src/patients/infrastructure/persistence/mappers/patient.mapper.ts
import { Patient as PrismaPatient } from '../../../../generated/prisma/client';
import { PatientEntity } from 'src/patients/domain/entities/patient.entity';

export class PatientMapper {
  static toDomain(raw: PrismaPatient): PatientEntity {
    return new PatientEntity(raw.userId, raw.medicalRecordNumber, raw.status, raw.registeredAt);
  }
}