import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@kost/types';
import type { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthUser } from '../types';

/**
 * Guard role yang dikombinasikan dengan `@Roles(...)` (PRD-4 §3 Otorisasi).
 *
 * Catatan penting: guard ini hanya membatasi *endpoint*. Pembatasan data
 * (penghuni hanya melihat miliknya) tetap wajib dicek di service layer.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user) throw new ForbiddenException('Akses ditolak.');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Anda tidak memiliki akses ke sumber daya ini.');
    }
    return true;
  }
}
