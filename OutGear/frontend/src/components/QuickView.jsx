import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getProductImage, formatRupiah } from "../utils/productImages.js";
import { getCategoryLabel } from "../utils/fallbackData.js";

export default function QuickView({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!product) return null;

  const detailTo = `/product/${product.id || product._id}`;
  const maxStock = product.stock && product.stock > 0 ? product.stock : 1;

  const handleAdd = (mode) => {
    addToCart(product, mode, quantity);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="quickview-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detail cepat: ${product.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          ✕
        </button>

        <div className="quickview-grid">
          <div className="quickview-img">
            <span className="category-tag">
              {getCategoryLabel(product.category)}
            </span>
            <img
              src={getProductImage(product.category)}
              alt={product.name}
            />
          </div>

          <div className="quickview-info">
            <h2>{product.name}</h2>
            <p className="quickview-desc">
              {product.description ||
                "Peralatan berkualitas tinggi untuk mendukung ekspedisi dan kenyamanan luar ruang Anda."}
            </p>

            <div className="price-box">
              <p>
                Sewa: <strong>Rp {formatRupiah(product.rentPrice)}</strong> / hari
              </p>
              <p>
                Beli: <strong>Rp {formatRupiah(product.buyPrice)}</strong>
              </p>
            </div>

            <span className="stock-info">Sisa Stok: {product.stock ?? 5}</span>

            <div className="quickview-actions">
              <div className="quantity-control">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                >
                  +
                </button>
              </div>
              <button className="btn-rent" onClick={() => handleAdd("rent")}>
                Sewa
              </button>
              <button className="btn-buy" onClick={() => handleAdd("buy")}>
                + Beli
              </button>
            </div>

            <Link to={detailTo} className="quickview-detail-link" onClick={onClose}>
              Lihat detail lengkap →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}