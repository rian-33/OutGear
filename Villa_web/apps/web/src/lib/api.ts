import type {
  MetodeBayar,
  Paginated,
  Role,
  StatusKamar,
  StatusPembayaran,
  StatusPengajuan,
  StatusTagihan,
} from '@kost/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Semua response backend memakai bentuk ini pada pesan error (AllExceptionsFilter). */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  details?: unknown;
  path: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/* -------------------------------------------------------------------------
 * Tipe response & payload — mencerminkan persis bentuk JSON dari NestJS.
 * Semua tanggal dikirim sebagai string ISO-8601.
 * ---------------------------------------------------------------------- */

export interface AuthPengguna {
  id_user: string;
  username: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  role: Role;
}

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
  pengguna: AuthPengguna;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  nama_lengkap: string;
  email: string;
  no_hp?: string;
  password: string;
}

export interface PenghuniView {
  id_user: string;
  username: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  role: Role;
  kamar: { id_kamar: string; no_kamar: string; harga: number; status: StatusKamar } | null;
  detail: { tgl_masuk: string; jatuh_tempo: string; aktif: boolean } | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePenghuniPayload {
  username: string;
  nama_lengkap: string;
  email: string;
  password: string;
  no_hp?: string;
  id_kamar?: string;
  tgl_masuk?: string;
}

export interface UpdatePenghuniPayload {
  nama_lengkap?: string;
  email?: string;
  no_hp?: string;
  jatuh_tempo?: string;
  password?: string;
}

export interface AssignKamarPayload {
  id_kamar: string;
  tgl_masuk?: string;
}

export interface KamarView {
  id_kamar: string;
  no_kamar: string;
  kapasitas: number;
  harga: number;
  fasilitas: string | null;
  status: StatusKamar;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKamarPayload {
  no_kamar: string;
  kapasitas: number;
  harga: number;
  fasilitas?: string;
}

export interface UpdateKamarPayload {
  harga?: number;
  kapasitas?: number;
  fasilitas?: string;
}

export interface TagihanView {
  id_tagihan: string;
  id_user: string;
  periode: string;
  jumlah: number;
  jatuh_tempo: string;
  status: StatusTagihan;
  catatan: string | null;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  kamar: { id_kamar: string; no_kamar: string } | null;
  pembayaran: {
    id_pembayaran: string;
    jumlah_bayar: number;
    status: string;
    bukti_bayar: string | null;
  }[];
  created_at: string;
}

export interface CreateTagihanPayload {
  id_user: string;
  jumlah?: number;
  periode?: string;
  jatuh_tempo?: string;
  catatan?: string;
}

export interface PembayaranView {
  id_pembayaran: string;
  id_tagihan: string;
  id_user: string;
  jumlah_bayar: number;
  metode: MetodeBayar;
  bukti_bayar: string | null;
  catatan: string | null;
  status: StatusPembayaran;
  alasan_tolak: string | null;
  catatan_admin: string | null;
  confirmed_by: string | null;
  pengkonfirmasi: { id_user: string; nama_lengkap: string } | null;
  tagihan: { periode: string; jumlah: number; status: StatusTagihan } | null;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  created_at: string;
  updated_at: string;
}

export interface KonfirmasiPembayaranPayload {
  catatan_admin?: string;
}

export interface CreatePembayaranPayload {
  id_tagihan: string;
  jumlah_bayar: number;
  metode: MetodeBayar;
  catatan?: string;
}

export interface TolakPembayaranPayload {
  alasan_tolak: string;
}

export interface PengajuanView {
  id_pengajuan: string;
  id_user: string;
  kamar_lama: { id_kamar: string; no_kamar: string } | null;
  kamar_baru: { id_kamar: string; no_kamar: string } | null;
  status: StatusPengajuan;
  alasan: string | null;
  catatan_admin: string | null;
  tgl_respons: string | null;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  created_at: string;
}

export interface CreatePengajuanPayload {
  id_kamar_baru: string;
  alasan?: string;
}

export interface DashboardAdmin {
  total_penghuni: number;
  total_kamar: number;
  kamar_kosong: number;
  kamar_terisi: number;
  kamar_maintenance: number;
  kamar_tersedia: number;
  tagihan_bulan_ini: {
    total: number;
    lunas: number;
    belum_bayar: number;
    pending: number;
    overdue: number;
  };
  pemasukan_bulan_ini: number;
  menunggu_konfirmasi: number;
  pengajuan_pending: number;
  kurva_tagihan: { periode: string; total: number; lunas: number }[];
}

export interface DashboardPenghuni {
  profil: { nama_lengkap: string; username: string; email: string };
  kamar: { id_kamar: string; no_kamar: string; harga: number; status: StatusKamar } | null;
  masa_sewa: { tgl_masuk: string; jatuh_tempo: string; aktif: boolean } | null;
  tagihan_aktif: {
    id_tagihan: string;
    periode: string;
    jumlah: number;
    jatuh_tempo: string;
    status: StatusTagihan;
    catatan: string | null;
  } | null;
  ringkasan: {
    total_tagihan: number;
    lunas: number;
    belum_bayar: number;
    overdue: number;
    total_pembayaran: number;
  };
  riwayat_terbaru: {
    id_pembayaran: string;
    jumlah_bayar: number;
    metode: MetodeBayar;
    status: StatusPembayaran;
    periode: string;
    created_at: string;
  }[];
  pengajuan_terakhir: {
    id_pengajuan: string;
    kamar_baru: string | null;
    status: StatusPengajuan;
    catatan_admin: string | null;
    created_at: string;
  } | null;
}

export interface RekapPeriode {
  periode: string;
  total_tagihan: number;
  total_lunas: number;
  total_belum_bayar: number;
  jumlah_pembayaran: number;
  total_pemasukan: number;
}

export interface LaporanRekap {
  dari: string;
  sampai: string;
  data: RekapPeriode[];
  total_pemasukan: number;
  total_pembayaran: number;
}

/* -------------------------------------------------------------------------
 * Client HTTP.
 * ---------------------------------------------------------------------- */

type BodyContent = object | undefined;

interface ApiFetchInit extends Omit<RequestInit, 'body'> {
  body?: BodyContent;
}

/** Single-flight refresh token (cookie httpOnly); dipanggil sekali pada 401. */
let refreshPromise: Promise<boolean> | null = null;
function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isFormData(body: BodyContent): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

/** Baca respons JSON dengan toleransi body kosong (mis. 204 Tidak Ada Konten). */
async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text } as ApiErrorBody;
  }
}

async function send(path: string, init: ApiFetchInit, attempt: number): Promise<unknown> {
  const body = init.body;
  const isForm = isFormData(body);
  const headers = new Headers(init.headers);
  if (!isForm && body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    cache: 'no-store',
    headers,
  });

  if (res.status === 401 && attempt === 0 && (await refreshSession())) {
    return send(path, init, 1);
  }

  const data = await parseBody(res);
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : res.statusText;
    throw new ApiError(res.status, message, data);
  }
  return data;
}

/**
 * Klien API default:
 * - selalu mengirim cookie sesi (`credentials: 'include'`),
 * - auto-refresh sekali saat mendapat 401 lalu mengulang permintaan,
 * - formulir `FormData` (upload bukti) tidak di-override Content-Type-nya,
 * - respons 204/Tanpa Konten dikembalikan sebagai `undefined`.
 */
export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  return (await send(path, init, 0)) as T;
}

/** Ambil respons sebagai Blob (download bukti bayar, export CSV). */
export async function apiBlob(path: string, init: ApiFetchInit = {}): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    body: isFormData(init.body)
      ? (init.body as FormData)
      : init.body !== undefined
        ? JSON.stringify(init.body)
        : undefined,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const data = await parseBody(res);
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : res.statusText;
    throw new ApiError(res.status, message, data);
  }
  return res.blob();
}

/** Bangun query string dari parameter; nilai kosong (null/undefined/'') diabaikan. */
export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export type PenghuniPage = Paginated<PenghuniView>;
export type KamarPage = Paginated<KamarView>;
export type TagihanPage = Paginated<TagihanView>;
export type PembayaranPage = Paginated<PembayaranView>;
export type PengajuanPage = Paginated<PengajuanView>;
