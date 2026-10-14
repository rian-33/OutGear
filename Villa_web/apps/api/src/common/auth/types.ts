import type { Role } from '@kost/types';

/** Bentuk user yang disimpan pada `request.user` setelah JWT terverifikasi. */
export interface AuthUser {
  id_user: string;
  username: string;
  role: Role;
}

/** Isi payload JWT yang kita terbitkan sendiri. */
export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
  /** `access` | `refresh` — dipakai guard untuk menolak salah jenis token. */
  typ: 'access' | 'refresh';
  /** Token id unik, dipakai untuk blacklist saat logout. */
  jti: string;
}
