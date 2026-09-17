// src/apothecaries/domain/interfaces/apothecary.repository.interface.ts
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { ApothecaryEntity } from '../entities/apothecary.entity';

export interface CreateApothecaryInput {
  userId: string;
  licenseNumber: string;
}

export interface IApothecaryRepository {
  createWithinTransaction(tx: PrismaTransactionClient, input: CreateApothecaryInput): Promise<ApothecaryEntity>;
}