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
  Grid,
  Input,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useToast,
} from '@kost/ui';
import { formatPeriode, formatRupiah } from '@kost/ui';
import { useLaporanRekap, unduhLaporanCsv } from '@/lib/queries';
import { QueryState } from '@/components/data';
import { IconChart, IconDownload } from '@/components/icons';

function bulanIni(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function AdminLaporanPage() {
  const { toast } = useToast();
  const dariDefault = `${bulanIni()}-01`;
  const sampaiDefault = new Date().toISOString().slice(0, 10);
  const [dari, setDari] = useState(dariDefault);
  const [sampai, setSampai] = useState(sampaiDefault);
  const [terapkan, setTerapkan] = useState({ dari: dariDefault, sampai: sampaiDefault });
  const [exporting, setExporting] = useState(false);

  const laporan = useLaporanRekap(terapkan.dari, terapkan.sampai);

  function submit(e: FormEvent) {
    e.preventDefault();
    setTerapkan({ dari, sampai });
  }

  async function exportCsv() {
    setExporting(true);
    try {
      await unduhLaporanCsv(terapkan.dari, terapkan.sampai);
    } catch {
      toast({ title: 'Gagal', description: 'Export CSV tidak berhasil.', variant: 'danger' });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Laporan Pemasukan
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Rekap pembayaran terkonfirmasi per periode (FR-34, FR-35).
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Dari (tanggal)">
            <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} required />
          </Field>
          <Field label="Sampai (tanggal)">
            <Input
              type="date"
              value={sampai}
              onChange={(e) => setSampai(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" variant="secondary">
            Tampilkan
          </Button>
          <Button
            type="button"
            leftIcon={<IconDownload />}
            isLoading={exporting}
            disabled={!terapkan.dari || !terapkan.sampai}
            onClick={exportCsv}
          >
            Export CSV
          </Button>
        </form>
      </div>

      <QueryState query={laporan} skeletonRows={3}>
        {(data) => (
          <div className="space-y-6">
            <Grid cols={3}>
              <StatCard
                label="Total pemasukan"
                value={formatRupiah(data.total_pemasukan)}
                tone="success"
                icon={<IconChart />}
              />
              <StatCard
                label="Total pembayaran"
                value={data.total_pembayaran}
                hint="pembayaran terkonfirmasi"
              />
              <StatCard
                label="Periode tercakup"
                value={`${data.data.length} bulan`}
                hint={`${data.dari} s/d ${data.sampai}`}
              />
            </Grid>

            <Card>
              <CardHeader>
                <CardTitle>Rekap per periode</CardTitle>
                <CardDescription>
                  Tagihan, pembayaran, dan pemasukan yang berhasil dikonfirmasi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconChart />}
                    title="Tidak ada data"
                    description="Tidak ada pembayaran pada rentang tanggal ini."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Periode</TH>
                        <TH align="right">Total tagihan</TH>
                        <TH align="right">Lunas</TH>
                        <TH align="right">Belum bayar</TH>
                        <TH align="right">Jumlah pembayaran</TH>
                        <TH align="right">Pemasukan</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((r) => (
                        <TR key={r.periode}>
                          <TD className="font-medium">{formatPeriode(r.periode)}</TD>
                          <TD align="right" numeric>
                            {r.total_tagihan}
                          </TD>
                          <TD align="right" numeric>
                            {r.total_lunas}
                          </TD>
                          <TD align="right" numeric>
                            {r.total_belum_bayar}
                          </TD>
                          <TD align="right" numeric>
                            {r.jumlah_pembayaran}
                          </TD>
                          <TD align="right" numeric className="font-semibold">
                            {formatRupiah(r.total_pemasukan)}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </QueryState>
    </div>
  );
}
