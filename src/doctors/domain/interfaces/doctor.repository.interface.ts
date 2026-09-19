// src/doctors/domain/interfaces/doctor.repository.interface.ts
import { TransactionContext } from 'src/common/domain/transaction-context';
import { DoctorEntity } from '../entities/doctor.entity';

export interface CreateDoctorInput {
  userId: string;
  sip: string;
  specializationId: string;
}

export interface IDoctorRepository {
  createWithinTransaction(tx: TransactionContext, input: CreateDoctorInput): Promise<DoctorEntity>;
  isSpecializationActive(specializationId: string): Promise<boolean>;
}