// src/auth/domain/policies/account-lockout.policy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountLockoutPolicy {
  constructor(private readonly configService: ConfigService) {}

  shouldLock(failedAttempts: number): boolean {
    const maxFailedAttempts = this.configService.get<number>('auth.maxFailedAttempts', 5);
    return failedAttempts >= maxFailedAttempts;
  }

  computeLockedUntil(): Date {
    const lockDurationMinutes = this.configService.get<number>('auth.lockDurationMinutes', 15);
    return new Date(Date.now() + lockDurationMinutes * 60 * 1000);
  }

  isCurrentlyLocked(lockedUntil: Date | null): boolean {
    return lockedUntil !== null && lockedUntil.getTime() > Date.now();
  }
}