import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import logoImg from "../assets/logo.png";
import cartImg from "../assets/cart_545525.png";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

        <div className="account-menu-wrapper" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="nav-btn-link account-trigger"
          >
            {user ? user.name.split(" ")[0] : "Akun"} ▾
          </button>
          {menuOpen && (
            <div className="account-dropdown">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    Masuk
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    Daftar
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/account" onClick={() => setMenuOpen(false)}>
                    Akun Saya
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate("/");
                    }}
                  >
                    Keluar
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <Link to="/checkout" className="cart-badge-btn">
          <img
            src={cartImg}
            alt="Keranjang"
            style={{
              width: "20px",
              height: "20px",
              filter: "brightness(0) invert(1)",
            }}
          />
          Keranjang <span className="badge">{itemCount}</span>
        </Link>
      </nav>
    </header>
  );
}