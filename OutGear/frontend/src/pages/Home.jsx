import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
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

const testimonials = [
  {
    name: "Rizky Pratama",
    org: "Komunitas Pendaki Bandung",
    quote: "Kualitas tenda dan carrier dari OutGear sangat memuaskan. Proses sewa mudah dan alat dalam kondisi prima!",
  },
  {
    name: "Sari Dewi",
    org: "Travel Blogger",
    quote: "Sewa jaket dan sepatu hiking di OutGear sangat praktis. Harga terjangkau dan pelayanannya ramah sekali.",
  },
  {
    name: "Ahmad Fauzi",
    org: "Mapala Universitas Indonesia",
    quote: "Kami rutin menyewa peralatan ekspedisi untuk kegiatan kampus. OutGear selalu menjadi andalan kami.",
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
      <Reveal>
        <section className="features-bar">
          <div className="feature-item">
            <img src={garansiIcon} alt="Garansi" className="feature-icon" loading="lazy" />
            <h4>
              GARANSI TAS
              <br />
              SEUMUR HIDUP
            </h4>
          </div>

          <div className="feature-item">
            <img src={bayarIcon} alt="Pembayaran" className="feature-icon" loading="lazy" />
            <h4>
              PEMBAYARAN
              <br />
              MUDAH
            </h4>
          </div>

          <div className="feature-item">
            <img src={tukarIcon} alt="Penukaran" className="feature-icon" loading="lazy" />
            <h4>
              KEMUDAHAN
              <br />
              PENUKARAN
            </h4>
          </div>

          <div className="feature-item">
            <img src={responIcon} alt="Fast Respon" className="feature-icon" loading="lazy" />
            <h4>FAST RESPON</h4>
          </div>
        </section>
      </Reveal>

      {/* 3. TEASER KATEGORI & TENTANG */}
      <section className="home-teaser">
        <Reveal delay={0} direction="left">
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
        </Reveal>
        <Reveal delay={120} direction="right">
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
        </Reveal>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="testimonial-section">
        <Reveal>
          <h2 className="section-title">Mereka Yang Mempercayai Kami</h2>
        </Reveal>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 120} direction="up">
              <article className="testimonial-card">
                <div className="testimonial-quote">&ldquo;</div>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="testimonial-name">{t.name}</strong>
                    <span className="testimonial-org">{t.org}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
