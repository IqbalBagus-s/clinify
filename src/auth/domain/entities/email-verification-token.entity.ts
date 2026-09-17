// src/auth/domain/entities/email-verification-token.entity.ts
export class EmailVerificationTokenEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date | null,
    public readonly usedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt.getTime() < Date.now();
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }
}