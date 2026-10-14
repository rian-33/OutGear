'use client';

import { FormEvent, useState } from 'react';
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
  Textarea,
} from '@kost/ui';
import { formatRupiah, formatTanggal } from '@kost/ui';
import { useCreatePengajuan, useKamarKosong, useMyPengajuan } from '@/lib/queries';
import { Pagination, QueryState, StatusBadge } from '@/components/data';
import { IconSwap } from '@/components/icons';

export default function PengajuanPage() {
  const [page, setPage] = useState(1);
  const riwayat = useMyPengajuan({ page });
  const kamarKosong = useKamarKosong();
  const create = useCreatePengajuan();

  const [idKamar, setIdKamar] = useState('');
  const [alasan, setAlasan] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    await create.mutateAsync(
      { id_kamar_baru: idKamar, ...(alasan.trim() ? { alasan: alasan.trim() } : {}) },
      {
        onSuccess: () => {
          setIdKamar('');
          setAlasan('');
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Pindah Kamar
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Ajukan pindah ke kamar kosong; disetujui oleh admin (F-22 – F-24).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengajuan baru</CardTitle>
          <CardDescription>
            Maksimal satu pengajuan pending; kamar tujuan wajib kosong.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Kamar tujuan" required>
              <Select value={idKamar} onChange={(e) => setIdKamar(e.target.value)} required>
                <option value="">— Pilih kamar kosong —</option>
                {(kamarKosong.data?.data ?? []).map((k) => (
                  <option key={k.id_kamar} value={k.id_kamar}>
                    {k.no_kamar} · {formatRupiah(k.harga)}/bln
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Alasan" hint="Opsional, maks 500 karakter.">
              <Textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="mis. ingin lebih dekat dengan fasilitas / ruangan lebih luas"
                maxLength={500}
                rows={1}
              />
            </Field>
            <div className="md:col-span-2">
              <Button
                type="submit"
                leftIcon={<IconSwap />}
                isLoading={create.isPending}
                disabled={!idKamar}
              >
                Ajukan Pindah
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat pengajuan</CardTitle>
          <CardDescription>Status dan catatan admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={riwayat}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconSwap />}
                    title="Belum ada pengajuan"
                    description="Pengajuan Anda akan tampil di sini."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Tanggal</TH>
                        <TH>Kamar</TH>
                        <TH>Alasan</TH>
                        <TH>Status</TH>
                        <TH>Catatan admin</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((p) => (
                        <TR key={p.id_pengajuan}>
                          <TD>{formatTanggal(p.created_at)}</TD>
                          <TD>
                            <span className="text-[var(--color-muted)]">
                              {p.kamar_lama?.no_kamar ?? '—'}
                            </span>
                            <span className="mx-1 text-[var(--color-muted)]">→</span>
                            <span className="font-medium">{p.kamar_baru?.no_kamar ?? '—'}</span>
                          </TD>
                          <TD className="max-w-[14rem] truncate">{p.alasan ?? '—'}</TD>
                          <TD>
                            <StatusBadge kind="pengajuan" value={p.status} />
                          </TD>
                          <TD
                            className="max-w-[12rem] truncate"
                            title={p.catatan_admin ?? undefined}
                          >
                            {p.catatan_admin ?? '—'}
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
    </div>
  );
}
