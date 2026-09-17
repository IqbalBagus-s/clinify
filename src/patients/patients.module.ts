// src/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PATIENT_REPOSITORY, MEDICAL_RECORD_NUMBER_GENERATOR } from './domain/interfaces/tokens';
import { PatientRepositoryImpl } from './infrastructure/persistence/repositories/patient.repository.impl';
import { MedicalRecordNumberGeneratorImpl } from './infrastructure/services/medical-record-number-generator.impl';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: PATIENT_REPOSITORY, useClass: PatientRepositoryImpl },
    { provide: MEDICAL_RECORD_NUMBER_GENERATOR, useClass: MedicalRecordNumberGeneratorImpl },
  ],
  exports: [PATIENT_REPOSITORY],
})
export class PatientsModule {}