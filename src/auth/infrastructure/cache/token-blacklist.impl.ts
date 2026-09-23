// src/auth/infrastructure/cache/token-blacklist.impl.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { ITokenBlacklist } from 'src/auth/domain/interfaces/token-blacklist.interface';

@Injectable()
export class TokenBlacklistImpl implements ITokenBlacklist {
  private readonly logger = new Logger(TokenBlacklistImpl.name);

  constructor(private readonly redisService: RedisService) {}

  private key(sessionId: string): string {
    return `blacklist:sid:${sessionId}`;
  }

  async add(sessionId: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisService.getClient().set(this.key(sessionId), '1', 'EX', ttlSeconds);
    } catch (error) {
      // Fail-open juga di sisi penulisan: kalau Redis tidak bisa diakses saat
      // logout/revoke, proses utama (revoke di database) TETAP berhasil —
      // kegagalan menulis ke blacklist cuma dicatat log, tidak menggagalkan
      // logout itu sendiri. Konsekuensi: window kerentanan (access token
      // lama masih sah) tetap terbuka sampai Redis pulih — trade-off sadar
      // sesuai keputusan fail-open.
      this.logger.error(`Gagal menambahkan session ${sessionId} ke blacklist (Redis error)`, error);
    }
  }

  async isBlacklisted(sessionId: string): Promise<boolean> {
    try {
      const exists = await this.redisService.getClient().exists(this.key(sessionId));
      return exists === 1;
    } catch (error) {
      // FAIL-OPEN: kalau Redis tidak terjangkau, anggap TIDAK diblacklist —
      // request tetap diloloskan. Prioritas: ketersediaan autentikasi lebih
      // penting daripada menutup celah ini secara mutlak. Kalau Redis down
      // persis di jendela waktu sesi seharusnya sudah diblacklist, sistem
      // kembali ke kondisi SEBELUM fitur ini ada — bukan lebih buruk dari itu.
      this.logger.error(
        `Gagal memeriksa blacklist untuk session ${sessionId} (Redis error) — fail-open, request diloloskan`,
        error,
      );
      return false;
    }
  }
}