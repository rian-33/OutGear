import { SetMetadata } from '@nestjs/common';
import type { Role } from '@kost/types';

export const ROLES_KEY = 'roles';

/** Batasi endpoint hanya untuk role tertentu (ADMIN / PENGHUNI). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
