// src/apothecaries/domain/entities/apothecary.entity.ts
export class ApothecaryEntity {
  constructor(
    public readonly userId: string,
    public readonly licenseNumber: string,
    public readonly status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE',
  ) {}
}