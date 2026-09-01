import { Route, Routes } from "react-router-dom";
import SplashScreen from "./components/SplashScreen.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx"; // Import ditambahkan
import Checkout from "./pages/Checkout.jsx";

export default function App() {
  return (
    <>
      <SplashScreen />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        {/* Rute halaman detail produk yang sebelumnya hilang telah ditambahkan */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>

      {/* FOOTER BARU (PREMIUM) */}
      <footer className="footer-complex">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo-text">
              Out<strong>Gear</strong>
            </span>
            <p>
              <strong>Jam Operasional</strong>
            </p>
            <p>Senin - Jumat: 08.00 - 16.00 WIB</p>
            <p>Sabtu: 08.00 - 13.00 WIB</p>
          </div>

          <div className="footer-links">
            <h4>INFORMASI</h4>
            <a href="#">Syarat & Ketentuan Garansi</a>
            <a href="#">FAQ Point</a>
            <a href="#">Kebijakan Privasi</a>
          </div>

          <div className="footer-contact">
            <h4>HUBUNGI KAMI</h4>
            <a href="#">📞 WhatsApp Kami</a>
            <a href="#">✉️ support@outgear.com</a>
          </div>

          <div className="footer-social">
            <h4>IKUTI KAMI</h4>
            <a href="#">▶ Youtube</a>
            <a href="#">📸 Instagram</a>
            <a href="#">📘 Facebook</a>
            <a href="#">🎵 Tiktok</a>
          </div>
        </div>

        <div className="footer-bottom-text">
          Copyright 2026 © OutGear Outdoor. All Rights Reserved.
        </div>
      </footer>

      {/* TOMBOL WHATSAPP MELAYANG (KODE SVG DIPERBAIKI) */}
      <a
        href="https://wa.me/628123456789"
        className="float-wa"
        target="_blank"
        rel="noreferrer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="35"
          height="35"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
        </svg>
      </a>
    </>
  );
}
