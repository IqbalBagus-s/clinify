// src/doctors/doctors.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DOCTOR_REPOSITORY } from './domain/interfaces/tokens';
import { DoctorRepositoryImpl } from './infrastructure/persistence/repositories/doctor.repository.impl';

@Module({
  imports: [PrismaModule],
  providers: [{ provide: DOCTOR_REPOSITORY, useClass: DoctorRepositoryImpl }],
  exports: [DOCTOR_REPOSITORY],
})
export class DoctorsModule {}