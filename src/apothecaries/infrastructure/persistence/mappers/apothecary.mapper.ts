// src/apothecaries/infrastructure/persistence/mappers/apothecary.mapper.ts
import { Apothecary as PrismaApothecary } from '../../../../generated/prisma/client';
import { ApothecaryEntity } from 'src/apothecaries/domain/entities/apothecary.entity';

export class ApothecaryMapper {
  static toDomain(raw: PrismaApothecary): ApothecaryEntity {
    return new ApothecaryEntity(raw.userId, raw.licenseNumber, raw.status);
  }
}