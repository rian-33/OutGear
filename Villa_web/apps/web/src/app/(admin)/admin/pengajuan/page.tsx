'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  Field,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@kost/ui';
import { formatTanggal } from '@kost/ui';
import type { PengajuanView } from '@/lib/api';
import { useAdminPengajuan, useSetujuiPengajuan, useTolakPengajuan } from '@/lib/queries';
import { Pagination, QueryState, ReasonModal, StatusBadge } from '@/components/data';
import { IconCheck, IconSwap, IconX } from '@/components/icons';

export default function AdminPengajuanPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pengajuan = useAdminPengajuan({ status, page });
  const setujui = useSetujuiPengajuan();
  const tolak = useTolakPengajuan();

  const [approve, setApprove] = useState<PengajuanView | null>(null);
  const [reject, setReject] = useState<PengajuanView | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Pengajuan Pindah
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Setujui atau tolak permintaan pindah kamar (FR-30, FR-31).
          </p>
        </div>
        <Field label="Status">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </Select>
        </Field>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar pengajuan</CardTitle>
          <CardDescription>Penghuni hanya bisa punya satu pengajuan pending.</CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={pengajuan}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconSwap />}
                    title="Tidak ada pengajuan"
                    description="Pengajuan penghuni akan tampil di sini."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Penghuni</TH>
                        <TH>Kamar</TH>
                        <TH>Alasan</TH>
                        <TH>Diajukan</TH>
                        <TH>Status</TH>
                        <TH>Catatan admin</TH>
                        <TH align="right">Aksi</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((p) => (
                        <TR key={p.id_pengajuan}>
                          <TD>
                            <span className="font-medium">{p.penghuni?.nama_lengkap ?? '—'}</span>
                            {p.penghuni && (
                              <span className="block text-xs text-[var(--color-muted)]">
                                @{p.penghuni.username}
                              </span>
                            )}
                          </TD>
                          <TD>
                            <span className="text-[var(--color-muted)]">
                              {p.kamar_lama?.no_kamar ?? '—'}
                            </span>
                            <span className="mx-1 text-[var(--color-muted)]">→</span>
                            <span className="font-medium">{p.kamar_baru?.no_kamar ?? '—'}</span>
                          </TD>
                          <TD className="max-w-[14rem] truncate">{p.alasan ?? '—'}</TD>
                          <TD>{formatTanggal(p.created_at)}</TD>
                          <TD>
                            <StatusBadge kind="pengajuan" value={p.status} />
                          </TD>
                          <TD className="max-w-[12rem] truncate">{p.catatan_admin ?? '—'}</TD>
                          <TD align="right">
                            {p.status === 'PENDING' && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  leftIcon={<IconCheck />}
                                  onClick={() => setApprove(p)}
                                >
                                  Setujui
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  leftIcon={<IconX />}
                                  onClick={() => setReject(p)}
                                >
                                  Tolak
                                </Button>
                              </div>
                            )}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )}
                <Pagination
                  page={data.meta.page}
                  totalPage={data.meta.totalPage}
                  onChange={setPage}
                />
              </div>
            )}
          </QueryState>
        </CardContent>
      </Card>

      {approve && (
        <ConfirmDialog
          open
          title={`Setujui pindah ${approve.penghuni?.nama_lengkap ?? ''}?`}
          description={`${approve.kamar_lama?.no_kamar ?? '?'} → ${approve.kamar_baru?.no_kamar ?? '?'}. Kamar lama otomatis dikosongkan dan kamar baru berstatus terisi.`}
          confirmLabel={setujui.isPending ? 'Memproses…' : 'Setujui'}
          onConfirm={() =>
            setujui.mutate({ id: approve.id_pengajuan }, { onSuccess: () => setApprove(null) })
          }
          onCancel={() => setApprove(null)}
        />
      )}
      {reject && (
        <ReasonModal
          open
          title="Tolak pengajuan"
          label="Catatan admin"
          placeholder="mis. kamar tujuan sedang direnovasi"
          confirmLabel="Tolak Pengajuan"
          onClose={() => setReject(null)}
          onSubmit={async (catatan) => {
            await tolak.mutateAsync({ id: reject.id_pengajuan, catatan_admin: catatan });
            setReject(null);
          }}
        />
      )}
    </div>
  );
}
