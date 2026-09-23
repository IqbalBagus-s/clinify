// src/auth/domain/interfaces/token-blacklist.interface.ts
export interface ITokenBlacklist {
  add(sessionId: string, ttlSeconds: number): Promise<void>;
  isBlacklisted(sessionId: string): Promise<boolean>;
}