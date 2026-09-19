// src/apothecaries/domain/interfaces/apothecary.repository.interface.ts
import { TransactionContext } from 'src/common/domain/transaction-context';
import { ApothecaryEntity } from '../entities/apothecary.entity';

export interface CreateApothecaryInput {
  userId: string;
  licenseNumber: string;
}

export interface IApothecaryRepository {
  createWithinTransaction(tx: TransactionContext, input: CreateApothecaryInput): Promise<ApothecaryEntity>;
}