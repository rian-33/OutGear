import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">OUTDOOR EQUIPMENT PLATFORM</p>
          <h1>Siapkan perjalananmu ke gunung dengan lebih mudah.</h1>
          <p>
            Cari perlengkapan berdasarkan kategori dan budget, pilih sewa atau
            beli, lalu lanjutkan ke satu keranjang yang sama.
          </p>
          <Link className="button" to="/products">
            Lihat Produk
          </Link>
        </div>
        <div className="hero-card">
          ⛰️
          <br />
          <strong>Rent • Buy • Hike</strong>
        </div>
      </section>

      <section id="about" className="section">
        <h2>About Us</h2>
        <p>
          Platform untuk membantu pendaki mendapatkan alat outdoor dengan proses
          sewa dan pembelian yang sederhana.
        </p>
      </section>

      <section id="services" className="section grid">
        <article>
          <h3>Hybrid Cart</h3>
          <p>Sewa dan beli dapat berada dalam satu keranjang.</p>
        </article>
        <article>
          <h3>Smart Delivery</h3>
          <p>Jarak dihitung otomatis untuk memperkirakan biaya antar.</p>
        </article>
        <article>
          <h3>Late Fee</h3>
          <p>Denda keterlambatan dihitung berdasarkan waktu pengembalian.</p>
        </article>
      </section>
    </main>
  );
}
