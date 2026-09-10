import igicon from "../assets/ig.png";
import yticon from "../assets/youtube.png";
import fbicon from "../assets/facebook.png";
import tiktokicon from "../assets/tiktok.png";
import waicon from "../assets/wa.png";

export default function Footer() {
  return (
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
          <a
            href="#"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <img
              src={waicon}
              alt="WhatsApp"
              style={{ width: "20px", height: "20px", objectFit: "contain" }}
            />{" "}
            WhatsApp Kami
          </a>
          <a href="#">✉️ support@outgear.com</a>
        </div>

        <div className="footer-social">
          <h4>IKUTI KAMI</h4>
          <a href="#" className="footer-link-item">
            <div className="footer-icon-wrapper">
              <img
                src={yticon}
                alt="Youtube"
                className="footer-icon footer-icon-yt"
              />
            </div>
            Youtube
          </a>
          <a href="#" className="footer-link-item">
            <div className="footer-icon-wrapper">
              <img
                src={igicon}
                alt="Instagram"
                className="footer-icon footer-icon-ig"
              />
            </div>
            Instagram
          </a>
          <a href="#" className="footer-link-item">
            <div className="footer-icon-wrapper">
              <img
                src={fbicon}
                alt="Facebook"
                className="footer-icon footer-icon-fb"
              />
            </div>
            Facebook
          </a>
          <a href="#" className="footer-link-item">
            <div className="footer-icon-wrapper">
              <img
                src={tiktokicon}
                alt="Tiktok"
                className="footer-icon footer-icon-tiktok"
              />
            </div>
            Tiktok
          </a>
        </div>
      </div>

      <div className="footer-bottom-text">
        Copyright 2026 © OutGear Outdoor. All Rights Reserved.
      </div>
    </footer>
  );
}
