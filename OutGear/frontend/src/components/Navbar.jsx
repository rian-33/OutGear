import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
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
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);

  const menuRef = useRef(null);
  const megaRef = useRef(null);
  const searchRef = useRef(null);
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

          {/* --- Mega menu trigger --- */}
          <div className="mega-menu-wrapper" ref={megaRef}>
            <button
              className="nav-btn-link mega-trigger"
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

          <Link to="/tentang">Tentang</Link>

          <button
            className="nav-btn-link theme-toggle"
            onClick={toggleTheme}
            aria-label="Ganti tema"
            title={theme === "dark" ? "Mode terang" : "Mode gelap"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
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

          <Link to="/favorit" className="cart-badge-btn" aria-label="Favorit">
            ♥ <span className="badge">{wishlistCount}</span>
          </Link>

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
