import { Route, Routes } from "react-router-dom";
import SplashScreen from "./components/SplashScreen.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Checkout from "./pages/Checkout.jsx";

export default function App() {
  return (
    <>
      <SplashScreen />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
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

      {/* TOMBOL WHATSAPP MELAYANG */}
      <a
        href="https://wa.me/628123456789"
        className="float-wa"
        target="_blank"
        rel="noreferrer"
      >
        {/* HAPUS KODE SVG YANG LAMA DI SINI */}
        <svg viewBox="0 0 32 32">...</svg>
      </a>
    </>
  );
}
