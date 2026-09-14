import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext.jsx";
import { getProductImage, formatRupiah } from "../utils/productImages.js";
import { getCategoryLabel } from "../utils/fallbackData.js";
import Reveal from "../components/Reveal.jsx";

export default function Favorit() {
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <main>
      <section className="page-hero">
        <h1>Favorit Saya</h1>
        <p>Kumpulan peralatan favorit yang Anda simpan untuk disewa atau dibeli.</p>
      </section>

      {wishlist.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">♥</div>
          <h3>Belum ada favorit</h3>
          <p>
            Klik ikon hati pada kartu produk untuk menyimpan peralatan favorit
            Anda di sini.
          </p>
          <Link to="/products" className="btn-primary">
            Jelajahi Katalog
          </Link>
        </section>
      ) : (
        <section className="wishlist-section">
          <div className="catalog-grid">
            {wishlist.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <article className="product-card">
                  <div className="card-img">
                    <Link
                      to={`/product/${product.id}`}
                      className="card-img-link"
                      aria-label={product.name}
                    >
                      <img
                        src={getProductImage(product.category)}
                        alt={product.name}
                        className="card-product-img"
                      />
                    </Link>
                    <span className="category-tag">
                      {getCategoryLabel(product.category)}
                    </span>
                    <button
                      className="wishlist-btn active"
                      aria-label="Hapus dari favorit"
                      onClick={() => toggleWishlist(product)}
                    >
                      ♥
                    </button>
                  </div>

                  <div className="card-info">
                    <Link to={`/product/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    <div className="price-box">
                      <p>
                        Sewa:{" "}
                        <strong>Rp {formatRupiah(product.rentPrice)}</strong> / hari
                      </p>
                      <p>
                        Beli: <strong>Rp {formatRupiah(product.buyPrice)}</strong>
                      </p>
                    </div>
                    <div className="card-actions">
                      <Link to={`/product/${product.id}`} className="btn-rent">
                        Detail / Sewa
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}