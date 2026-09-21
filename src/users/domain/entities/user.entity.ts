// src/users/domain/entities/user.entity.ts
export type UserRoleValue = 'PATIENT' | 'DOCTOR' | 'APOTHECARY' | 'ADMIN';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRoleValue,
    public emailVerifiedAt: Date | null,
    public readonly failedLoginAttempts: number,
    public readonly lockedUntil: Date | null,
    public readonly createdAt: Date,
  ) {}
}