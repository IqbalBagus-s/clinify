// src/doctors/infrastructure/persistence/mappers/doctor.mapper.ts
import { Doctor as PrismaDoctor } from '../../../../generated/prisma/client';
import { DoctorEntity } from 'src/doctors/domain/entities/doctor.entity';

export class DoctorMapper {
  static toDomain(raw: PrismaDoctor): DoctorEntity {
    return new DoctorEntity(raw.userId, raw.sip, raw.specializationId, raw.status);
  }
}