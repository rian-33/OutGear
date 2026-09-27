import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { categoryList } from "../utils/fallbackData.js";
import { formatRupiah } from "../utils/productImages.js";
import logoImg from "../assets/logo.png";
import cartImg from "../assets/cart_545525.png";

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export default function Navbar() {
  const { itemCount, cart, total } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef(null);
  const megaRef = useRef(null);
  const cartPreviewRef = useRef(null);
  const searchInputRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false));
  useClickOutside(megaRef, () => setMegaOpen(false));
  useClickOutside(cartPreviewRef, () => setCartPreviewOpen(false));

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMegaOpen(false);
        setMenuOpen(false);
        setCartPreviewOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q) {
        navigate(`/products?q=${encodeURIComponent(q)}`);
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery, navigate],
  );

  const activeCategories = categoryList.filter((c) => c.value);

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);
  const isCategoryActive =
    pathname.startsWith("/kategori") || search.includes("category=");

  return (
    <>
      {/* --- Search overlay --- */}
      {searchOpen && (
        <div
          className="search-overlay"
          onClick={() => setSearchOpen(false)}
          role="presentation"
        >
          <form
            className="search-panel"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSearch}
          >
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tenda, carrier, sepatu..."
              className="search-panel-input"
              aria-label="Cari produk"
            />
            <button type="submit" className="search-panel-submit" aria-label="Cari">
              &#x1F50D;
            </button>
            <button
              type="button"
              className="search-panel-close"
              onClick={() => setSearchOpen(false)}
              aria-label="Tutup pencarian"
            >
              &#x2715;
            </button>
          </form>
        </div>
      )}

      <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
        <Link className="brand-logo" to="/">
          <img src={logoImg} alt="OutGear Logo" />
        </Link>

        <nav className="nav-links">
          <Link className={isActive("/") ? "is-active" : undefined} to="/">
            Home
          </Link>
          <Link
            className={isActive("/products") ? "is-active" : undefined}
            to="/products"
          >
            Katalog
          </Link>

          {/* --- Mega menu trigger --- */}
          <div className="mega-menu-wrapper" ref={megaRef}>
            <button
              className={`nav-btn-link mega-trigger${
                isCategoryActive ? " is-active" : ""
              }`}
              onClick={() => setMegaOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={megaOpen}
            >
              Kategori <span className="mega-chevron">{megaOpen ? "▴" : "▾"}</span>
            </button>
            {megaOpen && (
              <div className="mega-menu" role="menu">
                {activeCategories.map((cat) => (
                  <Link
                    key={cat.value}
                    to={`/products?category=${cat.value}`}
                    className="mega-item"
                    role="menuitem"
                    onClick={() => setMegaOpen(false)}
                  >
                    {cat.icon && (
                      <img src={cat.icon} alt="" className="mega-item-icon" />
                    )}
                    <span>{cat.label}</span>
                  </Link>
                ))}
                <Link
                  to="/kategori"
                  className="mega-item mega-all"
                  role="menuitem"
                  onClick={() => setMegaOpen(false)}
                >
                  <span>Lihat Semua Kategori →</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            className={isActive("/tentang") ? "is-active" : undefined}
            to="/tentang"
          >
            Tentang
          </Link>

          <button
            className={`nav-btn-link theme-toggle theme-${theme}`}
            onClick={toggleTheme}
            aria-label="Ganti tema"
            title={theme === "dark" ? "Mode terang" : "Mode gelap"}
          >
            {theme === "dark" ? (
              <svg className="theme-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* --- Search trigger --- */}
          <button
            className="nav-btn-link search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Cari produk"
            title="Cari"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
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

          {/* --- Cart mini-dropdown --- */}
          <div className="cart-preview-wrapper" ref={cartPreviewRef}>
            <button
              className="cart-badge-btn cart-trigger"
              onClick={() => setCartPreviewOpen((o) => !o)}
              aria-label="Keranjang"
            >
              <img
                src={cartImg}
                alt=""
                style={{
                  width: "20px",
                  height: "20px",
                  filter: "brightness(0) invert(1)",
                }}
              />
              Keranjang <span className="badge">{itemCount}</span>
            </button>
            {cartPreviewOpen && (
              <div className="cart-preview-dropdown" role="menu">
                {cart.length === 0 ? (
                  <p className="cart-preview-empty">Keranjang kosong</p>
                ) : (
                  <>
                    {cart.slice(0, 4).map((item) => (
                      <div key={item.cartId} className="cart-preview-item">
                        <span className="cart-preview-name">
                          {item.name}
                          {item.mode === "rent" ? " (Sewa)" : ""}
                        </span>
                        <span className="cart-preview-price">
                          Rp {formatRupiah(item.basePrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {cart.length > 4 && (
                      <p className="cart-preview-more">
                        +{cart.length - 4} item lainnya
                      </p>
                    )}
                    <div className="cart-preview-total">
                      <span>Total</span>
                      <strong>Rp {formatRupiah(total)}</strong>
                    </div>
                    <Link
                      to="/checkout"
                      className="btn-primary cart-preview-checkout"
                      onClick={() => setCartPreviewOpen(false)}
                    >
                      Lihat Keranjang
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
