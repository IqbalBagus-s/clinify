// src/config/auth.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  emailVerificationTokenTtlHours: parseInt(
    process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS ?? '24',
    10,
  ),
  maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS ?? '5', 10),
  lockDurationMinutes: parseInt(process.env.LOCK_DURATION_MINUTES ?? '15', 10),
}));