// src/prisma/prisma-transaction-manager.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ITransactionManager } from 'src/common/domain/transaction-manager.interface';
import { TransactionContext } from 'src/common/domain/transaction-context';

@Injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(
      async (rawTx) => {
        return work(rawTx as unknown as TransactionContext);
      },
      {
        maxWait: 10000, // sebelumnya default 2000ms — naikkan waktu tunggu antrean
        timeout: 10000, // sebelumnya default 5000ms — naikkan batas eksekusi transaksi
      },
    );
  }
}