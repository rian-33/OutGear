'use client';

import { FormEvent, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Room = { id_kamar: string; nama: string; kapasitas: number; harga_per_malam: number; fasilitas: string[] };
type Booking = { id_reservasi: string; total_harga: string | number; kamar: { no_kamar: string } };

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export function ReservationForm() {
  const [checkIn, setCheckIn] = useState(dateOffset(1));
  const [checkOut, setCheckOut] = useState(dateOffset(2));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<Booking | null>(null);
  const minDate = useMemo(() => dateOffset(0), []);

  async function search(event: FormEvent) {
    event.preventDefault();
    setMessage(''); setSuccess(null); setSelectedRoom(null); setLoading(true);
    try {
      const query = new URLSearchParams({ check_in: checkIn, check_out: checkOut, jumlah_tamu: String(guests) });
      const available = await apiFetch<Room[]>(`/reservasi/tersedia?${query}`);
      setRooms(available);
      if (!available.length) setMessage('Belum ada kamar tersedia pada tanggal tersebut. Coba tanggal lain.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ketersediaan kamar belum dapat dimuat.');
    } finally { setLoading(false); }
  }

  async function book(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRoom) return;
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage('');
    try {
      const booking = await apiFetch<Booking>('/reservasi', {
        method: 'POST',
        body: {
          id_kamar: selectedRoom.id_kamar, check_in: checkIn, check_out: checkOut,
          jumlah_tamu: guests, nama_tamu: form.get('nama_tamu'), email: form.get('email'),
          no_hp: form.get('no_hp'), catatan: form.get('catatan') || undefined,
        },
      });
      setSuccess(booking); setSelectedRoom(null); setRooms([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Booking belum berhasil disimpan. Silakan coba lagi.');
      setRooms([]); setSelectedRoom(null);
    } finally { setLoading(false); }
  }

  return <section id="booking" className="booking-bar">
    <div className="booking-intro"><span>RENCANAKAN MASA INAP</span><strong>Mulai dari sini</strong></div>
    <form className="booking-form" onSubmit={search}>
      <label>Check-in<input aria-label="Check-in" type="date" min={minDate} value={checkIn} onChange={e => setCheckIn(e.target.value)} required/></label>
      <label>Check-out<input aria-label="Check-out" type="date" min={checkIn || minDate} value={checkOut} onChange={e => setCheckOut(e.target.value)} required/></label>
      <label>Tamu<select aria-label="Jumlah tamu" value={guests} onChange={e => setGuests(Number(e.target.value))}><option value={1}>1 tamu</option><option value={2}>2 tamu</option><option value={3}>3 tamu</option><option value={4}>4 tamu</option><option value={6}>5–6 tamu</option></select></label>
      <button type="submit" disabled={loading}>{loading ? 'Memeriksa…' : 'Cek kamar'} <span>→</span></button>
    </form>
    {message && <p className="booking-message" role="status">{message}</p>}
    {success && <div className="booking-success" role="status"><strong>Permintaan booking tersimpan.</strong><span>Kode {success.id_reservasi} · {success.kamar.no_kamar} · Total {rupiah(Number(success.total_harga))}. Tim villa akan menghubungi Anda untuk konfirmasi.</span></div>}
    {!!rooms.length && <div className="booking-results"><p>{rooms.length} kamar tersedia untuk {guests} tamu pada tanggal pilihan Anda</p><div>{rooms.map(room => <article key={room.id_kamar} className={selectedRoom?.id_kamar === room.id_kamar ? 'selected' : ''}><div><strong>{room.nama}</strong><span>{rupiah(room.harga_per_malam)} / malam · Maks. {room.kapasitas} tamu</span><small>{room.fasilitas.join(' · ') || 'Fasilitas villa'}</small></div><button type="button" onClick={() => setSelectedRoom(room)}>{selectedRoom?.id_kamar === room.id_kamar ? 'Dipilih' : 'Pilih kamar'}</button></article>)}</div></div>}
    {selectedRoom && <form className="guest-booking" onSubmit={book}><h3>Data pemesan · {selectedRoom.nama}</h3><div><label>Nama lengkap<input name="nama_tamu" autoComplete="name" required/></label><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Nomor WhatsApp<input name="no_hp" type="tel" autoComplete="tel" required/></label><label>Catatan (opsional)<input name="catatan"/></label></div><button disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan permintaan booking'} <span>↗</span></button></form>}
  </section>;
}
