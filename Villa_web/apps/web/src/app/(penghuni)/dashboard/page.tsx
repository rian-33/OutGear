'use client';

import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Grid,
  ProgressBar,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@kost/ui';
import { formatPeriode, formatRupiah, formatTanggal } from '@kost/ui';
import { QueryState, StatusBadge } from '@/components/data';
import { IconCard, IconDoor, IconReceipt, IconSwap } from '@/components/icons';
import { usePenghuniDashboard } from '@/lib/queries';

export default function PenghuniDashboardPage() {
  const dashboard = usePenghuniDashboard();

  return (
    <div className="space-y-6">
      <QueryState query={dashboard} skeletonRows={5}>
        {(d) => {
          const dapatDibayar =
            d.tagihan_aktif &&
            (d.tagihan_aktif.status === 'BELUM_BAYAR' || d.tagihan_aktif.status === 'OVERDUE');
          const lamaSewa = d.masa_sewa && d.kamar ? sisaHari(d.masa_sewa.jatuh_tempo) : 0;
          return (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Halo, {d.profil.nama_lengkap}!</CardTitle>
                  <CardDescription>
                    @{d.profil.username} · {d.profil.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusBadge kind="kamar" value={d.kamar?.status ?? 'KOSONG'} />
                  {d.kamar && (
                    <span className="ml-2 font-medium">
                      Kamar {d.kamar.no_kamar} · {formatRupiah(d.kamar.harga)}/bln
                    </span>
                  )}
                </CardContent>
              </Card>

              <Grid cols={4}>
                <StatCard label="Total tagihan" value={d.ringkasan.total_tagihan} />
                <StatCard label="Lunas" value={d.ringkasan.lunas} tone="success" />
                <StatCard label="Belum bayar" value={d.ringkasan.belum_bayar} tone="warning" />
                <StatCard
                  label="Total dibayar"
                  value={formatRupiah(d.ringkasan.total_pembayaran)}
                  icon={<IconCard />}
                />
              </Grid>

              <Grid cols={3}>
                <Card>
                  <CardHeader>
                    <CardTitle>Tagihan aktif</CardTitle>
                    <CardDescription>Prioritas pembayaran</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {d.tagihan_aktif ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-2xl font-semibold">
                            {formatRupiah(d.tagihan_aktif.jumlah)}
                          </span>
                          <StatusBadge kind="tagihan" value={d.tagihan_aktif.status} />
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">
                          Periode {formatPeriode(d.tagihan_aktif.periode)} · Jatuh tempo{' '}
                          {formatTanggal(d.tagihan_aktif.jatuh_tempo)}
                        </p>
                        {d.tagihan_aktif.catatan && (
                          <p className="text-xs text-[var(--color-muted)]">
                            {d.tagihan_aktif.catatan}
                          </p>
                        )}
                        {dapatDibayar ? (
                          <Link href={`/bayar/${d.tagihan_aktif.id_tagihan}`}>
                            <Button leftIcon={<IconReceipt />} className="w-full">
                              Bayar Sekarang
                            </Button>
                          </Link>
                        ) : (
                          <Alert title="Tagihan sedang diproses" variant="info">
                            Tunggu konfirmasi admin untuk tagihan ini.
                          </Alert>
                        )}
                      </>
                    ) : (
                      <EmptyState
                        icon={<IconReceipt />}
                        title="Tidak ada tagihan aktif"
                        description="Semua tagihan sudah beres. Mantap!"
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Kamar & masa sewa</CardTitle>
                    <CardDescription>
                      {d.masa_sewa?.aktif ? 'Sewa aktif' : 'Masa sewa berakhir'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {d.kamar && d.masa_sewa ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-display text-xl font-semibold">
                            <IconDoor className="h-5 w-5" /> {d.kamar.no_kamar}
                          </span>
                          <Badge variant={d.masa_sewa.aktif ? 'success' : 'danger'}>
                            {d.masa_sewa.aktif ? 'Aktif' : 'Berakhir'}
                          </Badge>
                        </div>
                        <div className="text-sm text-[var(--color-muted)]">
                          <p>Masuk: {formatTanggal(d.masa_sewa.tgl_masuk)}</p>
                          <p>Jatuh tempo: {formatTanggal(d.masa_sewa.jatuh_tempo)}</p>
                        </div>
                        <ProgressBar
                          value={Math.max(0, Math.min(100, (lamaSewa / 365) * 100))}
                          variant={lamaSewa > 30 ? 'success' : 'danger'}
                          showLabel={false}
                        />
                        <p className="text-xs text-[var(--color-muted)]">
                          {lamaSewa > 0 ? `Sisa ${lamaSewa} hari` : 'Masa sewa telah berakhir'}
                        </p>
                      </>
                    ) : (
                      <EmptyState
                        icon={<IconDoor />}
                        title="Belum ada kamar"
                        description="Hubungi admin untuk penempatan kamar."
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pengajuan terakhir</CardTitle>
                    <CardDescription>Status pindah kamar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {d.pengajuan_terakhir ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <StatusBadge kind="pengajuan" value={d.pengajuan_terakhir.status} />
                          <span className="text-sm text-[var(--color-muted)]">
                            {formatTanggal(d.pengajuan_terakhir.created_at)}
                          </span>
                        </div>
                        <p className="flex items-center gap-1 text-sm">
                          <IconSwap className="h-4 w-4" />
                          Target:{' '}
                          <span className="font-medium">
                            {d.pengajuan_terakhir.kamar_baru ?? '—'}
                          </span>
                        </p>
                        {d.pengajuan_terakhir.catatan_admin && (
                          <p className="text-xs text-[var(--color-muted)]">
                            {d.pengajuan_terakhir.catatan_admin}
                          </p>
                        )}
                        <Link href="/pengajuan">
                          <Button variant="outline" size="sm" className="w-full">
                            Riwayat pengajuan
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<IconSwap />}
                        title="Belum ada pengajuan"
                        description="Butuh pindah kamar? Ajukan di menu Pindah Kamar."
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Card>
                <CardHeader>
                  <CardTitle>Riwayat terbaru</CardTitle>
                  <CardDescription>5 pembayaran terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  {d.riwayat_terbaru.length === 0 ? (
                    <EmptyState icon={<IconCard />} title="Belum ada pembayaran" />
                  ) : (
                    <Table>
                      <THead>
                        <TR>
                          <TH>Periode</TH>
                          <TH align="right">Jumlah</TH>
                          <TH>Metode</TH>
                          <TH>Status</TH>
                          <TH>Waktu</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {d.riwayat_terbaru.map((r) => (
                          <TR key={r.id_pembayaran}>
                            <TD>{formatPeriode(r.periode)}</TD>
                            <TD align="right" numeric>
                              {formatRupiah(r.jumlah_bayar)}
                            </TD>
                            <TD>
                              <StatusBadge kind="metode" value={r.metode} />
                            </TD>
                            <TD>
                              <StatusBadge kind="pembayaran" value={r.status} />
                            </TD>
                            <TD>{formatTanggal(r.created_at)}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          );
        }}
      </QueryState>
    </div>
  );
}

function sisaHari(tanggal: string): number {
  const target = new Date(tanggal);
  const sekarang = new Date();
  const selisih = Math.ceil((target.getTime() - sekarang.getTime()) / (1000 * 60 * 60 * 24));
  return Number.isFinite(selisih) ? selisih : 0;
}
