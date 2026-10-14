'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ReservationForm } from '@/components/ReservationForm';

const rooms = [
  {
    name: 'Garden Suite',
    detail: '2 tamu · King bed · Teras pribadi',
    price: 'Rp1.250.000',
    features: ['Taman pribadi', 'Sarapan untuk dua', 'Bathtub'],
  },
  {
    name: 'Pool Villa',
    detail: '4 tamu · 2 kamar · Kolam pribadi',
    price: 'Rp2.450.000',
    features: ['Kolam renang pribadi', 'Ruang keluarga', 'Sarapan untuk empat'],
  },
  {
    name: 'Family Residence',
    detail: '6 tamu · 3 kamar · Pemandangan lembah',
    price: 'Rp3.800.000',
    features: ['Kolam renang pribadi', 'Dapur lengkap', 'Layanan butler'],
  },
];

const facilities = [
  'Kolam renang infinity',
  'Restoran & bar',
  'Spa dan ruang yoga',
  'Taman tropis',
  'Wi-Fi berkecepatan tinggi',
  'Layanan antar-jemput',
];

const menu = [
  {
    time: '07.00 – 10.30',
    title: 'Sarapan',
    items: 'Nasi goreng kampung · Pancake kelapa · Buah tropis · Kopi Bali',
  },
  {
    time: '12.00 – 15.00',
    title: 'Makan siang',
    items: 'Ikan bakar Jimbaran · Gado-gado · Salad kebun · Es serai',
  },
  {
    time: '18.00 – 22.00',
    title: 'Makan malam',
    items: 'Bebek betutu · Sate lilit · Sayur urap · Klepon',
  },
];

const reviews = [
  {
    quote: 'Tempatnya tenang, pemandangannya cantik, dan stafnya membuat kami merasa seperti di rumah sendiri.',
    name: 'Nadia P.',
    stay: 'Menginap di Pool Villa',
  },
  {
    quote: 'Sarapan lokalnya istimewa. Kami sudah merencanakan untuk kembali bersama keluarga.',
    name: 'Rizky & Maya',
    stay: 'Menginap di Garden Suite',
  },
  {
    quote: 'Villa yang sempurna untuk melepas penat. Kolam pribadi dan taman membuat pengalaman kami lengkap.',
    name: 'Daniel K.',
    stay: 'Menginap di Family Residence',
  },
];

const mapPlaces = [
  { id: 'lobby', label: 'Lobi', detail: 'Mulai perjalanan Anda di lobi utama, tempat tim kami siap menyambut.' },
  { id: 'restaurant', label: 'Restoran', detail: 'Nikmati hidangan lokal dan hasil kebun segar sepanjang hari.' },
  { id: 'suite', label: 'Garden Suite', detail: 'Suite tenang dengan taman pribadi, ideal untuk dua tamu.' },
  { id: 'pool', label: 'Kolam', detail: 'Kolam renang dikelilingi taman tropis, terbuka dari pagi hingga senja.' },
  { id: 'family', label: 'Family Residence', detail: 'Ruang yang lapang untuk keluarga dengan dapur dan kolam pribadi.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedRooms, setSavedRooms] = useState<string[]>([]);
  const [activePlace, setActivePlace] = useState(mapPlaces[0]);

  function toggleSavedRoom(roomName: string) {
    setSavedRooms(current => current.includes(roomName)
      ? current.filter(name => name !== roomName)
      : [...current, roomName]);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="villa-site">
      <header className="villa-nav">
        <Link className="villa-brand" href="/" aria-label="Savana Villa, beranda">
          Savana<span>Villa</span>
        </Link>
        <nav id="site-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Navigasi utama">
          <a href="#kamar" onClick={closeMenu}>Kamar</a>
          <a href="#fasilitas" onClick={closeMenu}>Fasilitas</a>
          <a href="#pengalaman" onClick={closeMenu}>Pengalaman</a>
          <a href="#ulasan" onClick={closeMenu}>Ulasan</a>
        </nav>
        <a className="villa-nav-book" href="#booking">Pesan kamar <span>↗</span></a>
        <button
          className="villa-menu-toggle"
          type="button"
          aria-controls="site-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? '×' : '☰'}
        </button>
      </header>

      <section className="villa-hero">
        <div className="villa-hero-image" aria-hidden="true" />
        <div className="villa-hero-shade" aria-hidden="true" />
        <div className="villa-hero-content">
          <p className="villa-eyebrow">SEBUAH TEMPAT UNTUK KEMBALI</p>
          <h1>Ruang untuk<br /><em>menikmati hidup.</em></h1>
          <p className="villa-hero-copy">
            Temukan ketenangan di antara taman tropis, pelayanan hangat,
            dan pemandangan yang tinggal lebih lama di ingatan.
          </p>
          <a className="villa-primary" href="#kamar">Jelajahi villa <span>↘</span></a>
        </div>
        <div className="villa-hero-note"><span>UBUD · BALI</span><span>8°30&apos;S 115°15&apos;E</span></div>
      </section>

      <ReservationForm />

      <section className="villa-intro">
        <p className="villa-eyebrow">SELAMAT DATANG DI SAVANA</p>
        <div>
          <h2>Alam yang menenangkan.<br /><em>Keramahan yang terasa.</em></h2>
          <p>
            Tempat beristirahat yang dirancang dekat dengan alam dan dekat
            dengan hal-hal sederhana yang berarti. Setiap sudut Savana
            mengundang Anda untuk melambat.
          </p>
        </div>
      </section>

      <section id="kamar" className="villa-section">
        <div className="villa-section-heading">
          <div>
            <p className="villa-eyebrow">PILIH RUANG ANDA</p>
            <h2>Kamar &amp; villa</h2>
          </div>
          <p>Temukan ruang yang paling pas untuk cara Anda menikmati Bali.</p>
        </div>
        <div className="room-grid">
          {rooms.map((room, index) => {
            const isSaved = savedRooms.includes(room.name);
            return (
              <article className="room-card" key={room.name}>
                <div className={`room-image room-image-${index + 1}`}>
                  <span>0{index + 1}</span>
                  <button
                    type="button"
                    aria-label={`${isSaved ? 'Hapus' : 'Simpan'} ${room.name} ${isSaved ? 'dari' : 'ke'} favorit`}
                    aria-pressed={isSaved}
                    onClick={() => toggleSavedRoom(room.name)}
                  >
                    {isSaved ? '♥' : '♡'}
                  </button>
                </div>
                <div className="room-body">
                  <div className="room-title">
                    <h3>{room.name}</h3>
                    <span>★ 4.9</span>
                  </div>
                  <p>{room.detail}</p>
                  <div className="room-features">
                    {room.features.map(feature => <span key={feature}>{feature}</span>)}
                  </div>
                  <div className="room-bottom">
                    <div><strong>{room.price}</strong><span> / malam</span></div>
                    <a href="#booking">Pilih kamar ↗</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {savedRooms.length > 0 && (
          <p className="saved-rooms" role="status">
            {savedRooms.length} pilihan tersimpan: {savedRooms.join(', ')}
          </p>
        )}
      </section>

      <section id="fasilitas" className="villa-facility">
        <div className="facility-image">
          <span className="facility-caption">Sebuah jeda yang terasa sepenuhnya.</span>
        </div>
        <div className="facility-copy">
          <p className="villa-eyebrow">SEMUA YANG ANDA BUTUHKAN</p>
          <h2>Hari yang mengalir<br /><em>tanpa terburu-buru.</em></h2>
          <p>Mulai pagi dengan berenang, nikmati sore di taman, lalu biarkan kami mengurus sisanya.</p>
          <div className="facility-list">
            {facilities.map((item, index) => (
              <div key={item}><span>0{index + 1}</span>{item}<b>↗</b></div>
            ))}
          </div>
          <a className="text-link" href="#denah">Jelajahi denah villa ↘</a>
        </div>
      </section>

      <section id="denah" className="villa-plan">
        <div>
          <p className="villa-eyebrow">KENALI AREA KAMI</p>
          <h2>Semua terasa<br /><em>dekat di sini.</em></h2>
          <p>Susuri jalur taman yang teduh dari lobi menuju villa, restoran, dan kolam renang.</p>
        </div>
        <div className="plan-map" aria-label="Denah interaktif area Savana Villa">
          <svg viewBox="0 0 600 370" role="img" aria-label="Jalur taman yang menghubungkan area villa">
            <path d="M30 300 C120 300 120 230 210 230 S300 300 380 240 S450 100 570 90" fill="none" stroke="#c4a477" strokeWidth="4" strokeDasharray="8 8" />
            <path d="M60 50h130v78H60zM245 38h150v95H245zM75 195h112v83H75zM405 185h128v102H405z" fill="#e9e3d7" stroke="#b7a88e" strokeWidth="2" />
            <rect x="245" y="195" width="110" height="82" rx="38" fill="#b7d0c7" stroke="#5c8576" strokeWidth="2" />
            <circle cx="310" cy="176" r="9" fill="#273c32" />
            <circle cx="405" cy="104" r="9" fill="#273c32" />
            <circle cx="131" cy="155" r="9" fill="#273c32" />
            <circle cx="130" cy="315" r="9" fill="#273c32" />
          </svg>
          {mapPlaces.map(place => (
            <button
              key={place.id}
              type="button"
              className={`map-label label-${place.id}`}
              aria-pressed={activePlace.id === place.id}
              onClick={() => setActivePlace(place)}
            >
              {place.label}
            </button>
          ))}
          <div className="map-detail" role="status">
            <strong>{activePlace.label}.</strong> {activePlace.detail}
          </div>
        </div>
      </section>

      <section id="pengalaman" className="villa-dining">
        <div className="dining-head">
          <p className="villa-eyebrow">DARI DAPUR SAVANA</p>
          <h2>Rasa lokal, disajikan<br /><em>sepanjang hari.</em></h2>
          <p>Bahan segar dari kebun dan petani sekitar, diolah dengan sepenuh hati.</p>
        </div>
        <div className="dining-menu">
          {menu.map((meal, index) => (
            <article key={meal.title}>
              <span className="meal-number">0{index + 1}</span>
              <div>
                <p>{meal.time}</p>
                <h3>{meal.title}</h3>
                <span>{meal.items}</span>
              </div>
              <b aria-hidden="true">↗</b>
            </article>
          ))}
        </div>
      </section>

      <section id="ulasan" className="villa-reviews">
        <div className="review-heading">
          <p className="villa-eyebrow">CERITA DARI PARA TAMU</p>
          <h2>Kenangan baik<br /><em>dibagikan.</em></h2>
          <a href="#booking">Rencanakan kunjungan Anda ↗</a>
        </div>
        <div className="review-grid">
          {reviews.map(review => (
            <article key={review.name}>
              <div className="review-stars">★★★★★ <span>5.0</span></div>
              <blockquote>“{review.quote}”</blockquote>
              <strong>{review.name}</strong>
              <span>{review.stay}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="villa-cta">
        <div>
          <p className="villa-eyebrow">WAKTU ANDA DI SAVANA</p>
          <h2>Sudah saatnya<br /><em>beristirahat.</em></h2>
        </div>
        <a className="villa-primary" href="#booking">Temukan kamar <span>↗</span></a>
      </section>

      <footer className="villa-footer">
        <Link className="villa-brand" href="/">Savana<span>Villa</span></Link>
        <p>Ubud, Bali · Indonesia</p>
        <span>© 2026 Savana Villa</span>
      </footer>
    </main>
  );
}
