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
        {/* Menggunakan SVG WhatsApp resmi agar jernih dan ringan */}
        <svg viewBox="0 0 32 32">
          <path d="M16.002 0C7.178 0 0 7.178 0 16.002c0 2.802.735 5.513 2.128 7.925L.5 31.5l7.74-2.033A15.938 15.938 15.938 0 0 0 16.002 32c8.824 0 16.002-7.178 16.002-16.002C32.004 7.178 24.826 0 16.002 0zm0 29.308c-2.39 0-4.73-.61-6.79-1.765l-.487-.29-5.045 1.325 1.346-4.92-.317-.506A13.255 13.255 13.255 0 0 1 2.692 16.002c0-7.348 5.976-13.324 13.324-13.324 7.348 0 13.324 5.976 13.324 13.324S23.35 29.308 16.002 29.308zm7.323-9.972c-.402-.202-2.378-1.173-2.746-1.308-.367-.135-.635-.202-.903.202-.268.403-1.038 1.308-1.272 1.577-.234.269-.469.303-.871.101-2.062-1.034-3.568-2.148-4.945-4.526-.234-.403.23-.375.698-1.312.083-.168.042-.315-.025-.45-.067-.135-.903-2.178-1.238-2.983-.326-.782-.656-.677-.903-.69-.234-.012-.502-.016-.77-.016s-.703.101-1.071.504c-.368.403-1.405 1.374-1.405 3.348 0 1.974 1.439 3.882 1.639 4.151.201.269 2.83 4.316 6.852 6.05 1.642.709 2.923 1.134 3.923 1.453 1.649.525 3.15.45 4.339.273 1.332-.198 4.082-1.668 4.651-3.28.569-1.611.569-2.991.398-3.28-.17-.289-.638-.457-1.04-.658z" />
        </svg>
      </a>
    </>
  );
}
