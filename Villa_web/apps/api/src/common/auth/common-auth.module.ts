import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Modul auth global — menyediakan `JwtService` serta kedua guard.
 *
 * Guard didaftarkan sebagai `APP_GUARD` di `app.module.ts` sehingga berlaku
 * otomatis pada seluruh endpoint. Endpoint yang boleh diakses tanpa token
 * ditandai dengan `@Public()`.
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class CommonAuthModule {}
