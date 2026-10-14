import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonAuthModule } from './common/auth/common-auth.module';
import { JwtAuthGuard } from './common/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/auth/guards/roles.guard';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ExpiryModule } from './modules/expiry/expiry.module';
import { KamarModule } from './modules/kamar/kamar.module';
import { ReservasiModule } from './modules/reservasi/reservasi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        // Batas default — endpoint sensitif menimpanya dengan decorator @Throttle.
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    RedisModule,
    CommonAuthModule,
    AuthModule,
    ExpiryModule,
    KamarModule,
    ReservasiModule,
    HealthModule,
  ],
  providers: [
    // Urutan guard: throttle → autentikasi → otorisasi role.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
