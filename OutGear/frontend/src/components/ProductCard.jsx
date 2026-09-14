import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useToast } from "./Toast.jsx";
import { getProductImage, formatRupiah } from "../utils/productImages.js";
import { getCategoryLabel } from "../utils/fallbackData.js";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const id = product.id || product._id;
  const detailTo = `/product/${id}`;
  const wished = isWishlisted(product);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(wished ? "Dihapus dari favorit" : "Ditambahkan ke favorit ♥", "success");
  };

  const handleQuickBuy = (e) => {
    e.preventDefault();
    addToCart(product, "buy");
    showToast("Produk ditambahkan ke keranjang!", "success");
  };

  return (
    <article className="product-card">
      <div className="card-img">
        <Link to={detailTo} className="card-img-link" aria-label={product.name}>
          <img
            src={getProductImage(product.category)}
            alt={product.name}
            className="card-product-img"
          />
        </Link>
        <span className="category-tag">{getCategoryLabel(product.category)}</span>
        <button
          className={`wishlist-btn ${wished ? "active" : ""}`}
          aria-label={wished ? "Hapus dari favorit" : "Tambahkan ke favorit"}
          onClick={handleWishlist}
        >
          ♥
        </button>
        {onQuickView && (
          <button
            className="quickview-btn"
            aria-label="Lihat cepat"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>

      <div className="card-info">
        <Link to={detailTo}>
          <h3>{product.name}</h3>
        </Link>

        <div className="price-box">
          <p>
            Sewa: <strong>Rp {formatRupiah(product.rentPrice)}</strong> / hari
          </p>
          <p>
            Beli: <strong>Rp {formatRupiah(product.buyPrice)}</strong>
          </p>
        </div>

        <div className="card-actions">
          <Link to={detailTo} className="btn-rent">
            Detail / Sewa
          </Link>
          <button className="btn-buy" onClick={handleQuickBuy}>
            + Beli
          </button>
        </div>
      </div>
    </article>
  );
}