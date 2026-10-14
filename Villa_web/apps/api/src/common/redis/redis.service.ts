import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Klien Redis untuk blacklist token logout & cache dashboard (PRD-1 §5, PRD-4 §3).
 *
 * Redis bersifat opsional pada lingkungan lokal: bila `REDIS_URL` kosong atau
 * koneksi gagal, service tetap berfungsi dan blacklist token turun ke in-memory
 * (`Map`) sehingga aplikasi tidak gagal start.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly memory = new Map<string, number>();

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('REDIS_URL belum diisi — blacklist token memakai penyimpanan in-memory.');
      return;
    }

    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });

    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis bermasalah: ${error.message}`);
    });

    void this.client
      .connect()
      .then(() => this.logger.log('Redis terhubung.'))
      .catch((error: Error) => {
        this.logger.warn(
          `Redis tidak dapat diakses (${error.message}) — blacklist token memakai in-memory.`
        );
        this.client = null;
      });
  }

  get tersedia(): boolean {
    return this.client !== null;
  }

  async setNxWithTtl(key: string, ttlSeconds: number): Promise<boolean> {
    if (this.client) {
      const hasil = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
      return hasil === 'OK';
    }
    const now = Date.now();
    const kedaluwarsa = this.memory.get(key);
    if (kedaluwarsa !== undefined && kedaluwarsa > now) return false;
    this.memory.set(key, now + ttlSeconds * 1000);
    return true;
  }

  async exists(key: string): Promise<boolean> {
    if (this.client) return (await this.client.exists(key)) === 1;
    const kedaluwarsa = this.memory.get(key);
    return kedaluwarsa !== undefined && kedaluwarsa > Date.now();
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      await this.client.del(key);
      return;
    }
    this.memory.delete(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit().catch(() => undefined);
  }
}
