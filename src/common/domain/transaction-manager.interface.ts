// src/common/domain/transaction-manager.interface.ts
import { TransactionContext } from './transaction-context';

export interface ITransactionManager {
  execute<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}