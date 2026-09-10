import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="btn-primary-lg">
        Kembali ke Beranda
      </Link>
    </main>
  );
}
