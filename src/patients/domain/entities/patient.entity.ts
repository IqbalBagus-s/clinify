// src/patients/domain/entities/patient.entity.ts
export class PatientEntity {
  constructor(
    public readonly userId: string,
    public readonly medicalRecordNumber: string,
    public readonly status: 'ACTIVE' | 'INACTIVE',
    public readonly registeredAt: Date,
  ) {}
}