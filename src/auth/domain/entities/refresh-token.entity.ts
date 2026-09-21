// src/auth/domain/entities/refresh-token.entity.ts
export class RefreshTokenEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly deviceInfo: string | null,
    public readonly ipAddress: string | null,
    public readonly expiresAt: Date | null,
    public readonly revokedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt.getTime() < Date.now();
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }
}