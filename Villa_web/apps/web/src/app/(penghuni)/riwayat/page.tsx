'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Modal,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@kost/ui';
import { formatPeriode, formatRupiah, formatTanggal } from '@kost/ui';
import type { PembayaranView } from '@/lib/api';
import { useMyPembayaran, unduhBukti } from '@/lib/queries';
import { Pagination, QueryState, StatusBadge } from '@/components/data';
import { IconCard, IconDownload, IconEye } from '@/components/icons';

export default function RiwayatPage() {
  const [status, setStatus] = useState('');
  const [metode, setMetode] = useState('');
  const [page, setPage] = useState(1);
  const pembayaran = useMyPembayaran({ status, metode, page });
  const [detail, setDetail] = useState<PembayaranView | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Riwayat Pembayaran
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Riwayat pembayaran dan status konfirmasi (F-19).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Field label="Status">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua</option>
              <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
              <option value="DIKONFIRMASI">Dikonfirmasi</option>
              <option value="DITOLAK">Ditolak</option>
            </Select>
          </Field>
          <Field label="Metode">
            <Select
              value={metode}
              onChange={(e) => {
                setMetode(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua</option>
              <option value="TRANSFER_BANK">Transfer Bank</option>
              <option value="CASH">Tunai</option>
              <option value="EWALLET">E-Wallet</option>
            </Select>
          </Field>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar pembayaran</CardTitle>
          <CardDescription>
            Tolak pembayaran disertai alasan yang dapat Anda perbaiki.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={pembayaran}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconCard />}
                    title="Belum ada pembayaran"
                    description="Setelah membayar, riwayatnya muncul di sini."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Periode</TH>
                        <TH align="right">Jumlah</TH>
                        <TH>Metode</TH>
                        <TH>Status</TH>
                        <TH>Waktu</TH>
                        <TH align="right">Aksi</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((p) => (
                        <TR key={p.id_pembayaran}>
                          <TD className="font-medium">
                            {p.tagihan ? formatPeriode(p.tagihan.periode) : '—'}
                          </TD>
                          <TD align="right" numeric>
                            {formatRupiah(p.jumlah_bayar)}
                          </TD>
                          <TD>
                            <StatusBadge kind="metode" value={p.metode} />
                          </TD>
                          <TD>
                            <StatusBadge kind="pembayaran" value={p.status} />
                          </TD>
                          <TD>{formatTanggal(p.created_at)}</TD>
                          <TD align="right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<IconEye />}
                                onClick={() => setDetail(p)}
                              >
                                Detail
                              </Button>
                              {p.bukti_bayar && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<IconDownload />}
                                  onClick={() => void unduhBiaya(p.id_pembayaran)}
                                >
                                  Bukti
                                </Button>
                              )}
                            </div>
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

      {detail && <DetailModal pembayaran={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

async function unduhBiaya(id: string) {
  try {
    await unduhBukti(id);
  } catch {
    // Toast hanya tersedia di komponen; kegagalan di-swallow di sini biar tidak crash.
  }
}

function DetailModal({ pembayaran, onClose }: { pembayaran: PembayaranView; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal
      open
      onClose={onClose}
      title={`Detail pembayaran #${pembayaran.id_pembayaran.slice(0, 8)}`}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          {pembayaran.bukti_bayar && (
            <Button
              leftIcon={<IconDownload />}
              onClick={() =>
                unduhBukti(pembayaran.id_pembayaran).catch(() =>
                  toast({
                    title: 'Gagal',
                    description: 'Bukti tidak dapat diunduh.',
                    variant: 'danger',
                  })
                )
              }
            >
              Unduh Bukti
            </Button>
          )}
        </div>
      }
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-[var(--color-muted)]">Periode</dt>
          <dd className="mt-0.5 font-medium">
            {pembayaran.tagihan ? formatPeriode(pembayaran.tagihan.periode) : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted)]">Jumlah</dt>
          <dd className="mt-0.5 font-medium">{formatRupiah(pembayaran.jumlah_bayar)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted)]">Metode</dt>
          <dd className="mt-0.5">
            <StatusBadge kind="metode" value={pembayaran.metode} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted)]">Status</dt>
          <dd className="mt-0.5">
            <StatusBadge kind="pembayaran" value={pembayaran.status} />
          </dd>
        </div>
        {pembayaran.catatan && (
          <div className="col-span-2">
            <dt className="text-xs text-[var(--color-muted)]">Catatan Anda</dt>
            <dd className="mt-0.5">{pembayaran.catatan}</dd>
          </div>
        )}
        {pembayaran.catatan_admin && (
          <div className="col-span-2">
            <dt className="text-xs text-[var(--color-muted)]">Catatan admin</dt>
            <dd className="mt-0.5">{pembayaran.catatan_admin}</dd>
          </div>
        )}
        {pembayaran.alasan_tolak && (
          <div className="col-span-2 rounded-lg bg-[var(--color-surface-2)] p-3">
            <dt className="text-xs font-medium text-[var(--color-danger)]">Alasan ditolak</dt>
            <dd className="mt-1 text-sm text-[var(--color-text)]">{pembayaran.alasan_tolak}</dd>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Silakan perbaiki dan lakukan pembayaran ulang.
            </p>
          </div>
        )}
      </dl>
    </Modal>
  );
}
