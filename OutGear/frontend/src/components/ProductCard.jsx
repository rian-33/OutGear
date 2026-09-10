import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getProductImage, formatRupiah } from "../utils/productImages.js";
import { getCategoryLabel } from "../utils/fallbackData.js";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const detailTo = `/product/${product.id || product._id}`;

  const handleQuickBuy = (e) => {
    e.preventDefault();
    addToCart(product, "buy");
  };

  return (
    <article className="product-card">
      <Link to={detailTo} className="card-img">
        <span className="category-tag">{getCategoryLabel(product.category)}</span>
        <img
          src={getProductImage(product.category)}
          alt={product.name}
          className="card-product-img"
        />
      </Link>

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