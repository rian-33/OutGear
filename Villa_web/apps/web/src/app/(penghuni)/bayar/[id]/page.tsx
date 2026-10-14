'use client';

import { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  Select,
} from '@kost/ui';
import { formatPeriode, formatRupiah, formatTanggal } from '@kost/ui';
import { useCreatePembayaran, useTagihanDetail } from '@/lib/queries';
import { QueryState, StatusBadge } from '@/components/data';
import { IconReceipt, IconUpload } from '@/components/icons';

const MIME_BUKTI = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_BUKTI = 5 * 1024 * 1024;

export default function BayarPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';
  const tagihan = useTagihanDetail(id);
  const bayar = useCreatePembayaran();

  const [metode, setMetode] = useState('TRANSFER_BANK');
  const [berkas, setBerkas] = useState<File | null>(null);
  const [catatan, setCatatan] = useState('');
  const [errorFile, setErrorFile] = useState<string | null>(null);

  function pilihBerkas(file: File | null) {
    if (!file) {
      setBerkas(null);
      setErrorFile(null);
      return;
    }
    if (!MIME_BUKTI.includes(file.type)) {
      setErrorFile('Hanya JPG, PNG, atau PDF yang diizinkan.');
      setBerkas(null);
      return;
    }
    if (file.size > MAX_BUKTI) {
      setErrorFile('Ukuran berkas maksimal 5 MB.');
      setBerkas(null);
      return;
    }
    setBerkas(file);
    setErrorFile(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!berkas) {
      setErrorFile('Bukti bayar wajib dilampirkan.');
      return;
    }
    await bayar.mutateAsync(
      {
        id_tagihan: id,
        jumlah_bayar: tagihan.data?.jumlah ?? 0,
        metode: metode as 'TRANSFER_BANK' | 'CASH' | 'EWALLET',
        catatan: catatan.trim() || undefined,
        bukti: berkas,
      },
      { onSuccess: () => router.push('/riwayat') }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Bayar Tagihan
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Kirim bukti bayar untuk diverifikasi admin (FR-22).
        </p>
      </div>

      <QueryState query={tagihan} skeletonRows={3}>
        {(t) => {
          const dapatDibayar = t.status === 'BELUM_BAYAR' || t.status === 'OVERDUE';
          return (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan tagihan</CardTitle>
                  <CardDescription>Periode {formatPeriode(t.periode)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-semibold">
                      {formatRupiah(t.jumlah)}
                    </span>
                    <StatusBadge kind="tagihan" value={t.status} />
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    Jatuh tempo: {formatTanggal(t.jatuh_tempo)}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <IconReceipt className="h-4 w-4" />
                    Kamar {t.kamar?.no_kamar ?? '—'}
                    {t.catatan && <span className="text-[var(--color-muted)]">· {t.catatan}</span>}
                  </p>
                </CardContent>
              </Card>

              {!dapatDibayar ? (
                <Card>
                  <CardContent className="pt-5">
                    <EmptyState
                      icon={<IconReceipt />}
                      title="Tagihan sudah diproses"
                      description="Tagihan berstatus PENDING menunggu konfirmasi, atau sudah lunas."
                    />
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Kirim bukti bayar</CardTitle>
                      <CardDescription>
                        Jumlah harus sesuai tagihan; total dibayarkan sebesar{' '}
                        {formatRupiah(t.jumlah)}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Field label="Metode pembayaran" required>
                        <Select value={metode} onChange={(e) => setMetode(e.target.value)}>
                          <option value="TRANSFER_BANK">Transfer Bank</option>
                          <option value="EWALLET">E-Wallet</option>
                          <option value="CASH">Tunai</option>
                        </Select>
                      </Field>
                      <Field
                        label="Bukti bayar"
                        required
                        error={errorFile ?? undefined}
                        hint="JPG, PNG, atau PDF · maks 5 MB"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept={MIME_BUKTI.join(',')}
                            onChange={(e) => pilihBerkas(e.target.files?.[0] ?? null)}
                            className="file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-surface-2)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-text)]"
                          />
                          <IconUpload className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                        </div>
                        {berkas && (
                          <p className="truncate text-xs text-[var(--color-accent)]">
                            ✓ {berkas.name} ({(berkas.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </Field>
                      <Field label="Catatan" hint="Opsional, mis. nomor referensi transfer.">
                        <Input
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="REF-2310-xxxx"
                        />
                      </Field>
                      <Button
                        type="submit"
                        size="lg"
                        leftIcon={<IconUpload />}
                        isLoading={bayar.isPending}
                        className="w-full"
                      >
                        Kirim Bukti Bayar
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              )}
            </div>
          );
        }}
      </QueryState>
    </div>
  );
}
