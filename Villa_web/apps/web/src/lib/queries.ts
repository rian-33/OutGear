'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Paginated } from '@kost/types';
import { useToast } from '@kost/ui';
import {
  apiBlob,
  apiFetch,
  ApiError,
  buildQuery,
  type AssignKamarPayload,
  type CreateKamarPayload,
  type CreatePembayaranPayload,
  type CreatePenghuniPayload,
  type CreatePengajuanPayload,
  type CreateTagihanPayload,
  type DashboardAdmin,
  type DashboardPenghuni,
  type KamarPage,
  type KamarView,
  type KonfirmasiPembayaranPayload,
  type LaporanRekap,
  type PenghuniPage,
  type PenghuniView,
  type PengajuanPage,
  type PengajuanView,
  type PembayaranPage,
  type PembayaranView,
  type TagihanView,
  type TolakPembayaranPayload,
  type UpdateKamarPayload,
  type UpdatePenghuniPayload,
} from './api';

/**
 * Mutation dengan toast otomatis: gagal → pesan error backend (Indonesia),
 * berhasil → pesan sukses + invalidasi cache agar daftar/dashboard ikut terbarui.
 */
function useApiMutation<TData, TVars>(
  fn: (vars: TVars) => Promise<TData>,
  opts: { success?: string; invalidates?: (string | number)[][] } = {}
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (opts.success) {
        toast({ title: 'Berhasil', description: opts.success, variant: 'success' });
      }
      opts.invalidates?.forEach((keys) => {
        void queryClient.invalidateQueries({ queryKey: keys });
      });
      void queryClient.invalidateQueries({ queryKey: ['dash'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof ApiError ? error.message : 'Terjadi kesalahan tak diketahui.',
        variant: 'danger',
      });
    },
  });
}

/** Penyebab toast otomatis untuk pemanggilan `.mutateAsync` oleh form. */
export function describeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Terjadi kesalahan tak diketahui.';
}

export const PER_PAGE = 20;

/* ------------------------------- Dashboard ------------------------------ */

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dash', 'admin'],
    queryFn: () => apiFetch<DashboardAdmin>('/dashboard/admin'),
  });
}

export function usePenghuniDashboard() {
  return useQuery({
    queryKey: ['dash', 'penghuni'],
    queryFn: () => apiFetch<DashboardPenghuni>('/dashboard/penghuni'),
  });
}

/* --------------------------------- Users -------------------------------- */

export interface UsersFilter {
  page?: number;
  perPage?: number;
  search?: string;
  role?: string;
  tanpa_kamar?: boolean;
}

export function useUsers(filter: UsersFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: [
      'users',
      page,
      perPage,
      filter.search ?? '',
      filter.role || '',
      filter.tanpa_kamar ?? false,
    ],
    queryFn: () =>
      apiFetch<PenghuniPage>(
        `/users${buildQuery({
          page,
          perPage,
          search: filter.search || undefined,
          role: filter.role || undefined,
          tanpa_kamar: filter.tanpa_kamar ? true : undefined,
        })}`
      ),
    placeholderData: keepPreviousData,
  });
}

/** Profil milik pengguna yang login (`GET /users/me`). */
export function useProfil() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => apiFetch<PenghuniView>('/users/me'),
  });
}

export function useCreateUser() {
  return useApiMutation(
    (payload: CreatePenghuniPayload) =>
      apiFetch<PenghuniView>('/users', {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Penghuni berhasil ditambahkan.', invalidates: [['users'], ['dash', 'admin']] }
  );
}

export function useUpdateUser() {
  return useApiMutation(
    (payload: UpdatePenghuniPayload & { id: string }) =>
      apiFetch<PenghuniView>(`/users/${payload.id}`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Data penghuni diperbarui.', invalidates: [['users'], ['users', 'me']] }
  );
}

export function useAssignKamar() {
  return useApiMutation(
    (payload: AssignKamarPayload & { id: string }) =>
      apiFetch<PenghuniView>(`/users/${payload.id}/assign-kamar`, {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      }),
    {
      success: 'Penghuni berhasil ditempatkan di kamar.',
      invalidates: [['users'], ['kamar'], ['dash', 'admin']],
    }
  );
}

export function useDeleteUser() {
  return useApiMutation(
    (id: string) => apiFetch<{ id_user: string }>(`/users/${id}`, { method: 'DELETE' }),
    { success: 'Penghuni dihapus.', invalidates: [['users'], ['kamar'], ['dash', 'admin']] }
  );
}

/* --------------------------------- Kamar -------------------------------- */

export interface KamarFilter {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
}

export function useKamarList(filter: KamarFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: ['kamar', page, perPage, filter.search ?? '', filter.status || ''],
    queryFn: () =>
      apiFetch<KamarPage>(
        `/kamar${buildQuery({
          page,
          perPage,
          search: filter.search || undefined,
          status: filter.status || undefined,
        })}`
      ),
    placeholderData: keepPreviousData,
  });
}

/** Dropdown pilihan kamar (semua status) — untuk form assign/mutasi. */
export function useKamarOptions() {
  return useQuery({
    queryKey: ['kamar', 'options'],
    queryFn: () => apiFetch<KamarPage>(`/kamar${buildQuery({ page: 1, perPage: 100 })}`),
  });
}

/** Kamar kosong — pilihan tujuan pindah bagi penghuni. */
export function useKamarKosong() {
  return useQuery({
    queryKey: ['kamar', 'kosong'],
    queryFn: () =>
      apiFetch<KamarPage>(`/kamar${buildQuery({ page: 1, perPage: 100, status: 'KOSONG' })}`),
  });
}

export function useCreateKamar() {
  return useApiMutation(
    (payload: CreateKamarPayload) =>
      apiFetch<KamarView>('/kamar', {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Kamar berhasil ditambahkan.', invalidates: [['kamar'], ['dash', 'admin']] }
  );
}

export function useUpdateKamar() {
  return useApiMutation(
    (payload: UpdateKamarPayload & { id: string }) =>
      apiFetch<KamarView>(`/kamar/${payload.id}`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Kamar diperbarui.', invalidates: [['kamar']] }
  );
}

export function useSetKamarStatus() {
  return useApiMutation(
    (payload: { id: string; status: string }) =>
      apiFetch<KamarView>(`/kamar/${payload.id}/status`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Status kamar diperbarui.', invalidates: [['kamar'], ['dash', 'admin']] }
  );
}

export function useDeleteKamar() {
  return useApiMutation(
    (id: string) => apiFetch<{ id_kamar: string }>(`/kamar/${id}`, { method: 'DELETE' }),
    { success: 'Kamar dihapus.', invalidates: [['kamar'], ['dash', 'admin']] }
  );
}

/* -------------------------------- Tagihan -------------------------------- */

export interface TagihanFilter {
  page?: number;
  perPage?: number;
  status?: string;
  periode?: string;
  search?: string;
}

export function useAdminTagihan(filter: TagihanFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: [
      'tagihan',
      'admin',
      page,
      perPage,
      filter.status ?? '',
      filter.periode ?? '',
      filter.search ?? '',
    ],
    queryFn: () =>
      apiFetch<Paginated<TagihanView>>(
        `/tagihan${buildQuery({
          page,
          perPage,
          status: filter.status || undefined,
          periode: filter.periode || undefined,
          search: filter.search || undefined,
        })}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useTagihanDetail(id: string) {
  return useQuery({
    queryKey: ['tagihan', 'detail', id],
    queryFn: () => apiFetch<TagihanView>(`/tagihan/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
  });
}

export function useMyTagihan(filter: TagihanFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: ['tagihan', 'saya', page, perPage, filter.status ?? '', filter.periode ?? ''],
    queryFn: () =>
      apiFetch<Paginated<TagihanView>>(
        `/tagihan/saya${buildQuery({
          page,
          perPage,
          status: filter.status || undefined,
          periode: filter.periode || undefined,
        })}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTagihan() {
  return useApiMutation(
    (payload: CreateTagihanPayload) =>
      apiFetch<TagihanView>('/tagihan/manual', {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Tagihan dibuat.', invalidates: [['tagihan'], ['dash', 'admin']] }
  );
}

export function useDeleteTagihan() {
  return useApiMutation(
    (id: string) => apiFetch<{ id_tagihan: string }>(`/tagihan/${id}`, { method: 'DELETE' }),
    { success: 'Tagihan dihapus.', invalidates: [['tagihan'], ['dash', 'admin']] }
  );
}

/* ------------------------------- Pembayaran ------------------------------ */

export interface PembayaranFilter {
  page?: number;
  perPage?: number;
  status?: string;
  metode?: string;
}

export function useAdminPembayaran(filter: PembayaranFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: ['pembayaran', 'admin', page, perPage, filter.status ?? '', filter.metode ?? ''],
    queryFn: () =>
      apiFetch<PembayaranPage>(
        `/pembayaran${buildQuery({
          page,
          perPage,
          status: filter.status || undefined,
          metode: filter.metode || undefined,
        })}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useMyPembayaran(filter: PembayaranFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: ['pembayaran', 'saya', page, perPage, filter.status ?? '', filter.metode ?? ''],
    queryFn: () =>
      apiFetch<PembayaranPage>(
        `/pembayaran/saya${buildQuery({
          page,
          perPage,
          status: filter.status || undefined,
          metode: filter.metode || undefined,
        })}`
      ),
    placeholderData: keepPreviousData,
  });
}

/** Kirim pembayaran baru — memakai multipart/form-data (field file `bukti`). */
export function useCreatePembayaran() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePembayaranPayload & { bukti: File }) => {
      const fd = new FormData();
      fd.append('id_tagihan', payload.id_tagihan);
      fd.append('jumlah_bayar', String(payload.jumlah_bayar));
      fd.append('metode', payload.metode);
      fd.append('bukti', payload.bukti);
      if (payload.catatan) fd.append('catatan', payload.catatan);
      return apiFetch<PembayaranView>('/pembayaran', { method: 'POST', body: fd });
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Pembayaran terkirim dan menunggu konfirmasi admin.',
        variant: 'success',
      });
      void queryClient.invalidateQueries({ queryKey: ['pembayaran'] });
      void queryClient.invalidateQueries({ queryKey: ['tagihan'] });
      void queryClient.invalidateQueries({ queryKey: ['dash'] });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error instanceof ApiError ? error.message : 'Terjadi kesalahan.',
        variant: 'danger',
      });
    },
  });
}

export function useKonfirmasiPembayaran() {
  return useApiMutation(
    (payload: KonfirmasiPembayaranPayload & { id: string }) =>
      apiFetch<PembayaranView>(`/pembayaran/${payload.id}/konfirmasi`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    {
      success: 'Pembayaran dikonfirmasi.',
      invalidates: [['pembayaran'], ['tagihan'], ['dash', 'admin']],
    }
  );
}

export function useTolakPembayaran() {
  return useApiMutation(
    (payload: TolakPembayaranPayload & { id: string }) =>
      apiFetch<PembayaranView>(`/pembayaran/${payload.id}/tolak`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    {
      success: 'Pembayaran ditolak.',
      invalidates: [['pembayaran'], ['tagihan'], ['dash', 'admin']],
    }
  );
}

/** Unduh bukti bayar (binary) dan paksa browser menyimpannya. */
export async function unduhBukti(id: string): Promise<void> {
  const blob = await apiBlob(`/pembayaran/${id}/bukti/unduh`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bukti-${id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* -------------------------------- Pengajuan ------------------------------- */

export interface PengajuanFilter {
  page?: number;
  perPage?: number;
  status?: string;
}

export function useAdminPengajuan(filter: PengajuanFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: ['pengajuan', 'admin', page, perPage, filter.status ?? ''],
    queryFn: () =>
      apiFetch<PengajuanPage>(
        `/pengajuan${buildQuery({ page, perPage, status: filter.status || undefined })}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useMyPengajuan(filter: PengajuanFilter = {}) {
  const page = filter.page ?? 1;
  const perPage = filter.perPage ?? PER_PAGE;
  return useQuery({
    queryKey: ['pengajuan', 'saya', page, perPage, filter.status ?? ''],
    queryFn: () =>
      apiFetch<PengajuanPage>(
        `/pengajuan/saya${buildQuery({ page, perPage, status: filter.status || undefined })}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePengajuan() {
  return useApiMutation(
    (payload: CreatePengajuanPayload) =>
      apiFetch<PengajuanView>('/pengajuan', {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Pengajuan pindah kamar terkirim.', invalidates: [['pengajuan'], ['dash']] }
  );
}

export function useSetujuiPengajuan() {
  return useApiMutation(
    (payload: { id: string; catatan_admin?: string }) =>
      apiFetch<PengajuanView>(`/pengajuan/${payload.id}/setujui`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    {
      success: 'Pengajuan disetujui.',
      invalidates: [['pengajuan'], ['kamar'], ['users'], ['dash', 'admin']],
    }
  );
}

export function useTolakPengajuan() {
  return useApiMutation(
    (payload: { id: string; catatan_admin: string }) =>
      apiFetch<PengajuanView>(`/pengajuan/${payload.id}/tolak`, {
        method: 'PATCH',
        body: payload as unknown as Record<string, unknown>,
      }),
    { success: 'Pengajuan ditolak.', invalidates: [['pengajuan'], ['dash', 'admin']] }
  );
}

/* -------------------------------- Laporan -------------------------------- */

export function useLaporanRekap(dari: string, sampai: string) {
  return useQuery({
    queryKey: ['laporan', 'rekap', dari, sampai],
    queryFn: () => apiFetch<LaporanRekap>(`/laporan/pemasukan${buildQuery({ dari, sampai })}`),
    enabled: Boolean(dari && sampai),
  });
}

/** Export laporan sebagai CSV (bukan JSON) — diunduh langsung oleh browser. */
export async function unduhLaporanCsv(dari: string, sampai: string): Promise<void> {
  const blob = await apiBlob(`/laporan/export${buildQuery({ dari, sampai })}`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-pemasukan-${dari}_sd_${sampai}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
