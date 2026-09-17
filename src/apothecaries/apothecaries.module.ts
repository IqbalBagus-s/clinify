// src/apothecaries/apothecaries.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APOTHECARY_REPOSITORY } from './domain/interfaces/tokens';
import { ApothecaryRepositoryImpl } from './infrastructure/persistence/repositories/apothecary.repository.impl';

@Module({
  imports: [PrismaModule],
  providers: [{ provide: APOTHECARY_REPOSITORY, useClass: ApothecaryRepositoryImpl }],
  exports: [APOTHECARY_REPOSITORY],
})
export class ApothecariesModule {}