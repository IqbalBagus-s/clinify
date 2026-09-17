// src/apothecaries/infrastructure/persistence/repositories/apothecary.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { CreateApothecaryInput, IApothecaryRepository } from 'src/apothecaries/domain/interfaces/apothecary.repository.interface';
import { ApothecaryEntity } from 'src/apothecaries/domain/entities/apothecary.entity';
import { ApothecaryMapper } from '../mappers/apothecary.mapper';

@Injectable()
export class ApothecaryRepositoryImpl implements IApothecaryRepository {
  async createWithinTransaction(tx: PrismaTransactionClient, input: CreateApothecaryInput): Promise<ApothecaryEntity> {
    const apothecary = await tx.apothecary.create({
      data: { userId: input.userId, licenseNumber: input.licenseNumber, status: 'PENDING_VERIFICATION' },
    });
    return ApothecaryMapper.toDomain(apothecary);
  }
}