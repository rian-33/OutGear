import { useState } from "react";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import ProductCard from "../components/ProductCard.jsx";
import { fallbackProducts, categoryList, filterProducts } from "../utils/fallbackData.js";

export default function Products() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filters = { q, category, maxPrice };
  const { data, loading, error } = useApi(
    (signal) => api.getProducts(filters, { signal }),
    [q, category, maxPrice],
  );

  const apiProducts = data?.data || data || null;
  const hasApiProducts = Array.isArray(apiProducts) && apiProducts.length > 0;
  const products = hasApiProducts ? apiProducts : filterProducts(fallbackProducts, filters);

  return (
    <main>
      <section className="catalog-header">
        <h1>Katalog Peralatan Pendakian</h1>
        <p>
          Sewa atau beli alat outdoor berkualitas tinggi untuk keamanan
          petualangan Anda
        </p>
      </section>

      {error && (
        <div className="api-warning">
          <strong>⚠️ Backend tidak terhubung.</strong> Pastikan MongoDB dan
          server backend sudah berjalan (<code>npm run seed</code> lalu{" "}
          <code>npm run dev</code> dari folder akar), kemudian muat ulang
          halaman. Data di bawah hanyalah contoh.
        </div>
      )}

      <section className="catalog-container">
        <aside className="sidebar">
          <div className="filter-group">
            <h3>Pencarian Cepat</h3>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari tenda, carrier..."
            />
          </div>

          <div className="filter-group">
            <h3>Kategori Alat</h3>
            <div className="category-list">
              {categoryList.map((cat) => (
                <button
                  key={cat.value || "all"}
                  onClick={() => setCategory(cat.value)}
                  className={`category-btn ${category === cat.value ? "active" : ""}`}
                >
                  {cat.icon && (
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      className={`category-btn-icon ${category === cat.value ? "" : "muted"}`}
                    />
                  )}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group price-filter">
            <h3>Batas Harga Maksimal</h3>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Contoh: 1000000"
            />
          </div>
        </aside>

        <div className="catalog-content">
          <div className="catalog-topbar">
            <span>
              Menampilkan <strong>{products.length}</strong> produk pilihan
            </span>
            {!hasApiProducts && (
              <span className="fallback-note">(mode offline - data contoh)</span>
            )}
          </div>

          {loading ? (
            <div className="page-state">
              <div className="spinner"></div>
              <p>Memuat katalog produk...</p>
            </div>
          ) : (
            <div className="catalog-grid">
              {products.map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}