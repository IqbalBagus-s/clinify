// src/auth/domain/interfaces/token.service.interface.ts
export interface AccessTokenPayload {
  sub: string; // userId
  role: string;
  sid: string; // session id — merujuk ke refresh_tokens.id, dipakai untuk melacak sesi mana yang harus dikecualikan saat revoke massal (change-password)
}

export interface ITokenService {
  generateAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
}