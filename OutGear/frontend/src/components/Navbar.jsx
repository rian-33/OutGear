import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import logoImg from "../assets/logo.png";
import cartImg from "../assets/cart_545525.png"; // Mengimpor gambar keranjang lokal

export default function Navbar() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="navbar">
      <Link className="brand-logo" to="/">
        <img
          src={logoImg}
          alt="OutGear Logo"
          style={{ height: "45px", objectFit: "contain" }}
        />
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Katalog</Link>
        <button
          onClick={() => scrollToSection("kategori")}
          className="nav-btn-link"
        >
          Kategori
        </button>
        <button
          onClick={() => scrollToSection("tentang")}
          className="nav-btn-link"
        >
          Tentang
        </button>

        <Link to="/checkout" className="cart-badge-btn">
          {/* Menampilkan ikon gambar keranjang yang difilter menjadi warna putih */}
          <img
            src={cartImg}
            alt="Keranjang"
            style={{
              width: "20px",
              height: "20px",
              filter: "brightness(0) invert(1)",
            }}
          />
          Keranjang <span className="badge">{cart.length}</span>
        </Link>
      </nav>
    </header>
  );
}
