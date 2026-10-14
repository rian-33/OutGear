import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/decorators/public.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — dipakai load balancer & monitoring deploy' })
  async check() {
    const database = await this.probe(() => this.prisma.$queryRaw`SELECT 1`);
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      uptime_detik: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      layanan: {
        database,
        // Redis bersifat opsional; statusnya informatif, tidak menentukan `status`.
        redis: this.redis.tersedia ? 'up' : 'fallback-in-memory',
      },
    };
  }

  private async probe(check: () => Promise<unknown>): Promise<'up' | 'down'> {
    try {
      await check();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
