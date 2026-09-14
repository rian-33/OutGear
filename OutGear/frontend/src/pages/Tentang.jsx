import { useState } from "react";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { fallbackProducts, categoryList } from "../utils/fallbackData.js";
import Reveal from "../components/Reveal.jsx";

const milestones = [
  { year: "2023", label: "OutGear didirikan di Bandung, Jawa Barat." },
  { year: "2024", label: "Merilis layanan sewa & beli online untuk 6 kategori alat outdoor." },
  { year: "2025", label: "Mencapai 500+ transaksi sukses dari seluruh Indonesia." },
  { year: "2026", label: "Meluncurkan platform e-commerce baru dengan fitur lebih interaktif." },
];

const faqItems = [
  {
    q: "Bagaimana cara menyewa alat di OutGear?",
    a: "Pilih produk → pilih tanggal sewa → masukkan ke keranjang → lakukan pembayaran simulasi. Stok alat dijamin tersedia sesuai jadwal yang dipilih.",
  },
  {
    q: "Apakah ada deposit?",
    a: "Ya, setiap item sewa dikenakan biaya jaminan (deposit) sebesar Rp 50.000 per item. Deposit akan dikembalikan sepenuhnya saat barang dikembalikan dalam kondisi baik.",
  },
  {
    q: "Berapa lama durasi minimum sewa?",
    a: "Durasi minimum sewa adalah 1 hari. Perhitungan durasi otomatis berdasarkan tanggal mulai dan selesai yang Anda pilih.",
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Saat ini pembayaran dilakukan melalui simulasi online. Untuk pengembangan selanjutnya, sistem akan mendukung berbagai metode pembayaran digital.",
  },
  {
    q: "Bisakah saya membeli putus alat?",
    a: "Tentu! Setiap produk memiliki harga beli putus. Klik tombol 'Beli Putus' pada halaman produk untuk langsung menambahkannya ke keranjang.",
  },
];

const stats = [
  { number: "6", label: "Kategori Alat" },
  { number: "24/7", label: "Layanan Online" },
  { number: "100%", label: "Garansi Kualitas" },
  { number: "1000+", label: "Produk Terjual & Disewa" },
];

export default function Tentang() {
  const [openFaq, setOpenFaq] = useState(null);

  const { data } = useApi((signal) => api.getProducts({ limit: 100 }, { signal }), []);
  const raw = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
  const source = raw && raw.length ? raw : fallbackProducts;
  const liveCount = source.length;
  const kategoriCount = categoryList.filter((c) => c.value).length;

  const toggleFaq = (i) => setOpenFaq((prev) => (prev === i ? null : i));

  return (
    <main>
      <section className="page-hero">
        <h1>Tentang OutGear</h1>
        <p>Kami hadir untuk mendukung petualangan Anda dengan perlengkapan outdoor terbaik.</p>
      </section>

      {/* Story */}
      <Reveal>
        <section className="tentang-block">
          <h2>The Story Behind</h2>
          <p>
            Berawal dari sebuah pemikiran, ide dan mimpi serta keyakinan memberikan
            yang terbaik untuk alam dan negeri, OutGear pun lahir menjadi sebuah
            kekuatan baru dalam industri perlengkapan alam terbuka. Hingga saat ini,
            kami masih berkarya untuk memberikan segala kemampuan terbaik agar menjadi
            salah satu kekuatan industri outdoor di Indonesia.
          </p>
        </section>
      </Reveal>

      {/* Stats */}
      <section className="tentang-stats">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="tentang-stat-item">
            <strong>
              {i === 0 ? kategoriCount : liveCount > 2 ? `${liveCount}+` : s.number}
            </strong>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </section>

      {/* Visi & Misi */}
      <div className="tentang-blocks-two">
        <Reveal delay={100}>
          <section className="tentang-block card-block">
            <h2>Visi</h2>
            <p>
              Menjadi sebuah produk mendunia dalam produk petualangan khususnya
              lifestyle outdoor.
            </p>
          </section>
        </Reveal>
        <Reveal delay={200}>
          <section className="tentang-block card-block">
            <h2>Misi</h2>
            <ul>
              <li>
                Berinvestasi dalam pengembangan produk berkarakter serta
                memperhatikan kriteria untuk menjadi yang terbaik.
              </li>
              <li>
                Mengembangkan sistem e-commerce yang modern dan responsif.
              </li>
              <li>
                Memperluas cakupan kriteria produk tema teknis, lifestyle, dan
                adventure.
              </li>
              <li>
                Menyediakan produk-produk berkualitas dan memuaskan untuk
                kebutuhan pelanggan.
              </li>
            </ul>
          </section>
        </Reveal>
      </div>

      {/* Timeline */}
      <section className="tentang-block">
        <h2>Perjalanan Kami</h2>
        <div className="timeline">
          {milestones.map((m, i) => (
            <Reveal key={m.year} delay={i * 100} className="timeline-item" as="div">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <span className="timeline-year">{m.year}</span>
                <p>{m.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="tentang-block">
        <h2>Pertanyaan Umum</h2>
        <div className="faq-list">
          {faqItems.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="faq-chevron">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="tentang-cta">
        <h3>Ada pertanyaan lebih lanjut?</h3>
        <p>Hubungi kami langsung via WhatsApp untuk bantuan segera.</p>
        <a
          href="https://wa.me/628123456789"
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
        >
          Chat via WhatsApp
        </a>
      </section>
    </main>
  );
}