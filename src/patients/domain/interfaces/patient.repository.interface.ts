// src/patients/domain/interfaces/patient.repository.interface.ts
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { PatientEntity } from '../entities/patient.entity';

export interface IPatientRepository {
  createWithinTransaction(tx: PrismaTransactionClient, userId: string): Promise<PatientEntity>;
}