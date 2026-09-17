// src/doctors/infrastructure/persistence/repositories/doctor.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorInput, IDoctorRepository } from 'src/doctors/domain/interfaces/doctor.repository.interface';
import { DoctorEntity } from 'src/doctors/domain/entities/doctor.entity';
import { DoctorMapper } from '../mappers/doctor.mapper';

@Injectable()
export class DoctorRepositoryImpl implements IDoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithinTransaction(tx: PrismaTransactionClient, input: CreateDoctorInput): Promise<DoctorEntity> {
    const doctor = await tx.doctor.create({
      data: {
        userId: input.userId,
        sip: input.sip,
        specializationId: input.specializationId,
        status: 'PENDING_VERIFICATION',
      },
    });
    return DoctorMapper.toDomain(doctor);
  }

  async isSpecializationActive(specializationId: string): Promise<boolean> {
    const specialization = await this.prisma.specialization.findUnique({ where: { id: specializationId } });
    return specialization !== null && specialization.status === 'ACTIVE';
  }
}