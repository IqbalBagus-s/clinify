// src/doctors/domain/entities/doctor.entity.ts
export class DoctorEntity {
  constructor(
    public readonly userId: string,
    public readonly sip: string,
    public readonly specializationId: string,
    public readonly status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE',
  ) {}
}