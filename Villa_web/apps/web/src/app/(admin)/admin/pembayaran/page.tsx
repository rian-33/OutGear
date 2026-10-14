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
import {
  useAdminPembayaran,
  useKonfirmasiPembayaran,
  useTolakPembayaran,
  unduhBukti,
} from '@/lib/queries';
import { Pagination, QueryState, ReasonModal, StatusBadge } from '@/components/data';
import { IconCard, IconDownload, IconEye, IconX, IconCheck } from '@/components/icons';

export default function AdminPembayaranPage() {
  const [status, setStatus] = useState('');
  const [metode, setMetode] = useState('');
  const [page, setPage] = useState(1);
  const pembayaran = useAdminPembayaran({ status, metode, page });
  const tolakAction = useTolakPembayaran();

  const [detail, setDetail] = useState<PembayaranView | null>(null);
  const [tolak, setTolak] = useState<PembayaranView | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Pembayaran
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Konfirmasi bukti bayar dan tindak lanjut pembayaran (FR-25, FR-26).
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
            Bukti bayar disimpan privat dan dibuka dengan sesi terautentikasi.
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
                    description="Pembayaran penghuni akan muncul di sini."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Penghuni</TH>
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
                          <TD>
                            <span className="font-medium">{p.penghuni?.nama_lengkap ?? '—'}</span>
                            {p.penghuni && (
                              <span className="block text-xs text-[var(--color-muted)]">
                                @{p.penghuni.username}
                              </span>
                            )}
                          </TD>
                          <TD>{p.tagihan ? formatPeriode(p.tagihan.periode) : '—'}</TD>
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
                                Lihat
                              </Button>
                              {p.status === 'MENUNGGU_KONFIRMASI' && (
                                <>
                                  <Button
                                    size="sm"
                                    leftIcon={<IconCheck />}
                                    onClick={() => setDetail(p)}
                                  >
                                    Konfirmasi
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<IconX />}
                                    onClick={() => setTolak(p)}
                                  >
                                    Tolak
                                  </Button>
                                </>
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

      {detail && <PaymentDetailModal pembayaran={detail} onClose={() => setDetail(null)} />}
      {tolak && (
        <ReasonModal
          open
          title="Tolak pembayaran"
          description={`Alasan terlihat oleh penghuni untuk perbaikan pengiriman.`}
          label="Alasan penolakan"
          placeholder="mis. bukti tidak terbaca / jumlah tidak sesuai"
          confirmLabel="Tolak Pembayaran"
          onClose={() => setTolak(null)}
          onSubmit={async (alasan) => {
            await tolakAction.mutateAsync({ id: tolak.id_pembayaran, alasan_tolak: alasan });
            setTolak(null);
          }}
        />
      )}
    </div>
  );
}

function PaymentDetailModal({
  pembayaran,
  onClose,
}: {
  pembayaran: PembayaranView;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const konfirmasi = useKonfirmasiPembayaran();
  const dapatDikonfirmasi = pembayaran.status === 'MENUNGGU_KONFIRMASI';

  async function unduh() {
    try {
      await unduhBukti(pembayaran.id_pembayaran);
    } catch {
      toast({ title: 'Gagal', description: 'Bukti tidak dapat diunduh.', variant: 'danger' });
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Pembayaran #${pembayaran.id_pembayaran.slice(0, 8)}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          {pembayaran.bukti_bayar && (
            <Button variant="outline" leftIcon={<IconDownload />} onClick={unduh}>
              Unduh Bukti
            </Button>
          )}
          {dapatDikonfirmasi && (
            <Button
              leftIcon={<IconCheck />}
              isLoading={konfirmasi.isPending}
              onClick={() =>
                konfirmasi.mutate({ id: pembayaran.id_pembayaran }, { onSuccess: onClose })
              }
            >
              Konfirmasi
            </Button>
          )}
        </div>
      }
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Detail label="Penghuni" value={pembayaran.penghuni?.nama_lengkap ?? '—'} />
        <Detail
          label="Periode tagihan"
          value={pembayaran.tagihan ? formatPeriode(pembayaran.tagihan.periode) : '—'}
        />
        <Detail label="Jumlah bayar" value={formatRupiah(pembayaran.jumlah_bayar)} />
        <Detail
          label="Jumlah tagihan"
          value={pembayaran.tagihan ? formatRupiah(pembayaran.tagihan.jumlah) : '—'}
        />
        <Detail label="Metode" value={pembayaran.metode} />
        <Detail label="Status" value={pembayaran.status} />
        <Detail label="Waktu pengiriman" value={formatTanggal(pembayaran.created_at)} />
        <Detail label="Dikonfirmasi oleh" value={pembayaran.pengkonfirmasi?.nama_lengkap ?? '—'} />
        {pembayaran.catatan && <Detail label="Catatan penghuni" value={pembayaran.catatan} full />}
        {pembayaran.catatan_admin && (
          <Detail label="Catatan admin" value={pembayaran.catatan_admin} full />
        )}
        {pembayaran.alasan_tolak && (
          <Detail label="Alasan ditolak" value={pembayaran.alasan_tolak} full />
        )}
      </dl>
    </Modal>
  );
}

function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}
