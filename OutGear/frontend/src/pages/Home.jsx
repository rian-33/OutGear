import { useState, useEffect } from "react";
import tasImg from "../assets/tas.png";
import sepatuImg from "../assets/sepatu.png";
import tendaImg from "../assets/tenda.png";
import gearImg from "../assets/gear.png";
import garansiIcon from "../assets/garansi.png";
import bayarIcon from "../assets/kemudahan pembayaran.png";
import tukarIcon from "../assets/kemudahan penukaran.png";
import responIcon from "../assets/fast respon.png";

export default function Home() {
  // --- LOGIKA SLIDER (CAROUSEL) ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "PERLENGKAPAN OUTDOOR PREMIUM\nUNTUK PECINTA ALAM SEJATI!",
      subtitle: "OUTGEAR OUTDOOR GEAR",
      image:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80",
    },
    {
      title: "SIAPKAN PETUALANGANMU\nDENGAN PERALATAN TERBAIK",
      subtitle: "EKSPLORASI TANPA BATAS",
      image:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80",
    },
  ];

  // Efek geser otomatis setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () =>
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () =>
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);

  return (
    <main>
      {/* 1. HERO SLIDER */}
      <section className="hero-slider">
        <div
          className="slides-container"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="slider-btn prev" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="slider-btn next" onClick={nextSlide}>
          &#10095;
        </button>

        <div className="slider-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${currentSlide === index ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* 2. WELCOME FEATURES (4 IKON) */}
      <section className="features-bar">
        <div className="feature-item">
          {/* 2. Ganti emoji dengan tag img */}
          <img
            src={garansiIcon}
            alt="Garansi"
            className="feature-icon"
            style={{ width: "65px", height: "65px", objectFit: "contain" }}
          />
          <h4>
            GARANSI TAS
            <br />
            SEUMUR HIDUP
          </h4>
        </div>

        <div className="feature-item">
          <img
            src={bayarIcon}
            alt="Pembayaran"
            className="feature-icon"
            style={{ width: "65px", height: "65px", objectFit: "contain" }}
          />
          <h4>
            PEMBAYARAN
            <br />
            MUDAH
          </h4>
        </div>

        <div className="feature-item">
          <img
            src={tukarIcon}
            alt="Penukaran"
            className="feature-icon"
            style={{ width: "65px", height: "65px", objectFit: "contain" }}
          />
          <h4>
            KEMUDAHAN
            <br />
            PENUKARAN
          </h4>
        </div>

        <div className="feature-item">
          <img
            src={responIcon}
            alt="Fast Respon"
            className="feature-icon"
            style={{ width: "65px", height: "65px", objectFit: "contain" }}
          />
          <h4>FAST RESPON</h4>
        </div>
      </section>

      {/* 3. KATEGORI PRODUK (Kode Lama Anda) */}
      <section id="kategori" className="section">
        <h2 className="section-title">JELAJAHI KATEGORI</h2>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}
        >
          <article className="product" style={{ textAlign: "center" }}>
            <div
              className="product-image"
              style={{
                height: "140px",
                padding: "10px",
                background: "#f0f0f0",
              }}
            >
              <img
                src={tasImg}
                alt="Tas Hiking"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h3>Bags</h3>
            <p>145 Produk</p>
          </article>
          <article className="product" style={{ textAlign: "center" }}>
            <div
              className="product-image"
              style={{
                height: "140px",
                padding: "10px",
                background: "#f0f0f0",
              }}
            >
              <img
                src={sepatuImg}
                alt="Sepatu Hiking"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h3>Shoes</h3>
            <p>267 Produk</p>
          </article>
          <article className="product" style={{ textAlign: "center" }}>
            <div
              className="product-image"
              style={{
                height: "140px",
                padding: "10px",
                background: "#f0f0f0",
              }}
            >
              <img
                src={tendaImg}
                alt="Tenda"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h3>Tents</h3>
            <p>89 Produk</p>
          </article>
          <article className="product" style={{ textAlign: "center" }}>
            <div
              className="product-image"
              style={{
                height: "140px",
                padding: "10px",
                background: "#f0f0f0",
              }}
            >
              <img
                src={gearImg}
                alt="Peralatan Gear"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h3>Gear</h3>
            <p>312 Produk</p>
          </article>
        </div>
      </section>

      {/* 4. TENTANG KAMI (THE STORY BEHIND, VISI, MISI) */}
      <section id="tentang" className="about-story">
        <div className="story-grid">
          <div className="story-title">
            <h2>The story behind</h2>
          </div>
          <div className="story-content">
            <p>
              Berawal dari sebuah pemikiran, ide dan mimpi serta keyakinan
              memberikan yang terbaik untuk alam dan negeri, OutGear pun lahir
              menjadi sebuah kekuatan baru dalam industri perlengkapan alam
              terbuka. Hingga saat ini, kami masih berkarya untuk memberikan
              segala kemampuan terbaik agar menjadi salah satu kekuatan industri
              outdoor di Indonesia.
            </p>
          </div>
        </div>

        <div className="story-grid">
          <div className="story-title">
            <h2>VISI</h2>
          </div>
          <div className="story-content">
            <p>
              <em>
                Menjadi sebuah produk mendunia dalam produk petualangan
                khususnya lifestyle outdoor.
              </em>
            </p>
          </div>
        </div>

        <div className="story-grid">
          <div className="story-title">
            <h2>MISI</h2>
          </div>
          <div className="story-content">
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
          </div>
        </div>
      </section>
    </main>
  );
}
