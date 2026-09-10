import { useState, useEffect } from "react";
import tasImg from "../assets/tas.png";
import sepatuImg from "../assets/sepatu.png";
import tendaImg from "../assets/tenda.png";
import gearImg from "../assets/gear.png";
import garansiIcon from "../assets/garansi.png";
import bayarIcon from "../assets/kemudahan pembayaran.png";
import tukarIcon from "../assets/kemudahan penukaran.png";
import responIcon from "../assets/fast respon.png";

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

const categories = [
  { img: tasImg, label: "Bags", count: 145 },
  { img: sepatuImg, label: "Shoes", count: 267 },
  { img: tendaImg, label: "Tents", count: 89 },
  { img: gearImg, label: "Gear", count: 312 },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

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

        <button className="slider-btn prev" onClick={prevSlide} aria-label="Slide sebelumnya">
          &#10094;
        </button>
        <button className="slider-btn next" onClick={nextSlide} aria-label="Slide berikutnya">
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
          <img src={garansiIcon} alt="Garansi" className="feature-icon" />
          <h4>
            GARANSI TAS
            <br />
            SEUMUR HIDUP
          </h4>
        </div>

        <div className="feature-item">
          <img src={bayarIcon} alt="Pembayaran" className="feature-icon" />
          <h4>
            PEMBAYARAN
            <br />
            MUDAH
          </h4>
        </div>

        <div className="feature-item">
          <img src={tukarIcon} alt="Penukaran" className="feature-icon" />
          <h4>
            KEMUDAHAN
            <br />
            PENUKARAN
          </h4>
        </div>

        <div className="feature-item">
          <img src={responIcon} alt="Fast Respon" className="feature-icon" />
          <h4>FAST RESPON</h4>
        </div>
      </section>

      {/* 3. KATEGORI PRODUK */}
      <section id="kategori" className="section">
        <h2 className="section-title">JELAJAHI KATEGORI</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <article key={cat.label} className="category-card">
              <div className="category-img-wrapper">
                <img src={cat.img} alt={cat.label} className="category-img" />
              </div>
              <h3>{cat.label}</h3>
              <p>{cat.count} Produk</p>
            </article>
          ))}
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