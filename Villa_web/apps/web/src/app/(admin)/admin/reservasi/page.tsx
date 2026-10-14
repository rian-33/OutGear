'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Reservation = {
  id_reservasi: string; nama_tamu: string; email: string; no_hp: string;
  check_in: string; check_out: string; jumlah_tamu: number; total_harga: string;
  status: 'MENUNGGU' | 'DIKONFIRMASI' | 'DIBATALKAN' | 'SELESAI'; created_at: string;
  kamar: { no_kamar: string; fasilitas: string | null };
};
const labels = { MENUNGGU: 'Menunggu', DIKONFIRMASI: 'Dikonfirmasi', DIBATALKAN: 'Dibatalkan', SELESAI: 'Selesai' };
const money = (amount: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount));
const date = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));

export default function AdminReservasiPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const reload = useCallback(async () => {
    try { setError(''); setReservations(await apiFetch<Reservation[]>('/reservasi')); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Reservasi gagal dimuat.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  async function setStatus(item: Reservation, status: Reservation['status']) {
    setBusy(item.id_reservasi);
    try {
      await apiFetch(`/reservasi/${item.id_reservasi}/status`, { method: 'PATCH', body: { status } });
      await reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Status reservasi gagal diubah.'); }
    finally { setBusy(''); }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[.22em] text-[var(--color-muted)]">Operasional Villa</p><h2 className="mt-2 font-display text-2xl font-semibold">Reservasi</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Lihat booking, cek detail masa inap, dan perbarui status konfirmasi.</p></div><button onClick={() => void reload()} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm">Muat ulang</button></div>
    <div className="grid gap-3 sm:grid-cols-3"><Stat label="Total reservasi" value={reservations.length}/><Stat label="Menunggu konfirmasi" value={reservations.filter(r => r.status === 'MENUNGGU').length}/><Stat label="Terkonfirmasi" value={reservations.filter(r => r.status === 'DIKONFIRMASI').length}/></div>
    {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]"><tr>{['Tamu','Kamar & fasilitas','Masa inap','Tamu','Total','Status','Tindakan'].map(label => <th className="px-4 py-3 font-medium" key={label}>{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--color-border)]">{loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-muted)]">Memuat reservasi…</td></tr> : reservations.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-muted)]">Belum ada permintaan booking.</td></tr> : reservations.map(item => <tr key={item.id_reservasi}><td className="px-4 py-4"><strong>{item.nama_tamu}</strong><span className="mt-1 block text-xs text-[var(--color-muted)]">{item.email} · {item.no_hp}</span></td><td className="px-4 py-4"><strong>{item.kamar.no_kamar}</strong><span className="mt-1 block max-w-48 text-xs text-[var(--color-muted)]">{item.kamar.fasilitas}</span></td><td className="px-4 py-4 whitespace-nowrap">{date(item.check_in)}<span className="px-1 text-[var(--color-muted)]">→</span>{date(item.check_out)}</td><td className="px-4 py-4">{item.jumlah_tamu}</td><td className="px-4 py-4 whitespace-nowrap">{money(item.total_harga)}</td><td className="px-4 py-4"><span className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-xs">{labels[item.status]}</span></td><td className="px-4 py-4"><div className="flex gap-2">{item.status === 'MENUNGGU' && <><Action disabled={busy === item.id_reservasi} onClick={() => void setStatus(item, 'DIKONFIRMASI')}>Konfirmasi</Action><Action disabled={busy === item.id_reservasi} onClick={() => void setStatus(item, 'DIBATALKAN')}>Batalkan</Action></>}{item.status === 'DIKONFIRMASI' && <Action disabled={busy === item.id_reservasi} onClick={() => void setStatus(item, 'SELESAI')}>Selesaikan</Action>}</div></td></tr>)}</tbody></table></div>
  </div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><p className="text-xs text-[var(--color-muted)]">{label}</p><strong className="mt-2 block font-display text-2xl">{value}</strong></div>; }
function Action({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) { return <button disabled={disabled} onClick={onClick} className="rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs hover:bg-[var(--color-surface-2)] disabled:opacity-50">{children}</button>; }
