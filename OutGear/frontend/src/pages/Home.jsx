import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

      {/* 3. TEASER KATEGORI & TENTANG */}
      <section className="home-teaser">
        <article className="teaser-card">
          <h3>Jelajahi Berbagai Kategori</h3>
          <p>
            Tenda, carrier, sepatu, kompor, jaket, hingga headlamp — semua
            tersedia untuk disewa atau dibeli.
          </p>
          <Link to="/kategori" className="btn-primary">
            Lihat Semua Kategori
          </Link>
        </article>
        <article className="teaser-card alt">
          <h3>Kenali OutGear Lebih Dekat</h3>
          <p>
            Cerita, visi, dan misi kami untuk menjadi kekuatan industri outdoor
            Indonesia.
          </p>
          <Link to="/tentang" className="btn-primary">
            Tentang Kami
          </Link>
        </article>
      </section>
    </main>
  );
}