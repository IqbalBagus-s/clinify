// src/patients/infrastructure/persistence/repositories/patient.repository.impl.ts
import { Inject, Injectable } from '@nestjs/common';
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { IPatientRepository } from 'src/patients/domain/interfaces/patient.repository.interface';
import type { IMedicalRecordNumberGenerator } from 'src/patients/domain/interfaces/medical-record-number-generator.interface';
import { MEDICAL_RECORD_NUMBER_GENERATOR } from 'src/patients/domain/interfaces/tokens';
import { PatientEntity } from 'src/patients/domain/entities/patient.entity';
import { PatientMapper } from '../mappers/patient.mapper';

@Injectable()
export class PatientRepositoryImpl implements IPatientRepository {
  constructor(
    @Inject(MEDICAL_RECORD_NUMBER_GENERATOR)
    private readonly mrnGenerator: IMedicalRecordNumberGenerator,
  ) {}

  async createWithinTransaction(tx: PrismaTransactionClient, userId: string): Promise<PatientEntity> {
    const patient = await tx.patient.create({
      data: {
        userId: userId,
        medicalRecordNumber: this.mrnGenerator.generate(),
        status: 'ACTIVE',
        registeredAt: new Date(),
      },
    });
    return PatientMapper.toDomain(patient);
  }
}