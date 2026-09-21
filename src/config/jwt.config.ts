// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  accessTokenTtlSeconds: parseInt(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? '900', 10),
  refreshTokenTtlDays: parseInt(process.env.JWT_REFRESH_TOKEN_TTL_DAYS ?? '7', 10),
  refreshTokenTtlDaysRememberMe: parseInt(process.env.JWT_REFRESH_TOKEN_TTL_DAYS_REMEMBER_ME ?? '30', 10),
}));