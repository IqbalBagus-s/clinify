// src/patients/domain/interfaces/patient.repository.interface.ts
import { TransactionContext } from 'src/common/domain/transaction-context';
import { PatientEntity } from '../entities/patient.entity';

export interface IPatientRepository {
  createWithinTransaction(tx: TransactionContext, userId: string): Promise<PatientEntity>;
  findStatusByUserId(userId: string): Promise<'ACTIVE' | 'INACTIVE' | null>;
}