import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import logoImg from "../assets/logo.png";

export default function Navbar() {
  const { cart } = useCart();

  return (
    <header className="navbar">
      <Link className="brand-logo" to="/">
        {/* 2. Gunakan tag img untuk menampilkan logo */}
        <img
          src={logoImg}
          alt="OutGear Logo"
          style={{ height: "45px", objectFit: "contain" }}
        />
      </Link>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Katalog</Link>
        <a href="#kategori">Kategori</a>
        <a href="#tentang">Tentang</a>

        <Link to="/checkout" className="cart-badge-btn">
          🛒 Keranjang <span className="badge">{cart.length}</span>
        </Link>
      </nav>
    </header>
  );
}
