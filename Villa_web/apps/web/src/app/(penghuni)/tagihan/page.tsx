'use client';

import Link from 'next/link';
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
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@kost/ui';
import { formatPeriode, formatRupiah, formatTanggal } from '@kost/ui';
import { useMyTagihan } from '@/lib/queries';
import { Pagination, QueryState, StatusBadge } from '@/components/data';
import { IconReceipt } from '@/components/icons';

export default function PenghuniTagihanPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const tagihan = useMyTagihan({ status, page });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Tagihan Saya
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Daftar tagihan sewa bulanan Anda (F-16).
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
            <option value="BELUM_BAYAR">Belum Bayar</option>
            <option value="PENDING">Pending</option>
            <option value="LUNAS">Lunas</option>
            <option value="OVERDUE">Overdue</option>
          </Select>
        </Field>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat tagihan</CardTitle>
          <CardDescription>Tagihan otomatis muncul setiap awal bulan.</CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={tagihan}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconReceipt />}
                    title="Tidak ada tagihan"
                    description="Belum ada tagihan untuk Anda."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Periode</TH>
                        <TH align="right">Jumlah</TH>
                        <TH>Jatuh tempo</TH>
                        <TH>Status</TH>
                        <TH>Catatan</TH>
                        <TH align="right">Aksi</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((t) => {
                        const dapatDibayar = t.status === 'BELUM_BAYAR' || t.status === 'OVERDUE';
                        return (
                          <TR key={t.id_tagihan}>
                            <TD className="font-medium">{formatPeriode(t.periode)}</TD>
                            <TD align="right" numeric>
                              {formatRupiah(t.jumlah)}
                            </TD>
                            <TD>{formatTanggal(t.jatuh_tempo)}</TD>
                            <TD>
                              <StatusBadge kind="tagihan" value={t.status} />
                            </TD>
                            <TD className="max-w-[12rem] truncate">{t.catatan ?? '—'}</TD>
                            <TD align="right">
                              {dapatDibayar ? (
                                <Link href={`/bayar/${t.id_tagihan}`}>
                                  <Button size="sm">Bayar</Button>
                                </Link>
                              ) : (
                                <span className="text-xs text-[var(--color-muted)]">—</span>
                              )}
                            </TD>
                          </TR>
                        );
                      })}
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
    </div>
  );
}
