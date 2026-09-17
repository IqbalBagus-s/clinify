// src/doctors/domain/interfaces/doctor.repository.interface.ts
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { DoctorEntity } from '../entities/doctor.entity';

export interface CreateDoctorInput {
  userId: string;
  sip: string;
  specializationId: string;
}

export interface IDoctorRepository {
  createWithinTransaction(tx: PrismaTransactionClient, input: CreateDoctorInput): Promise<DoctorEntity>;
  isSpecializationActive(specializationId: string): Promise<boolean>;
}