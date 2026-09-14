import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import ProductCard from "../components/ProductCard.jsx";
import QuickView from "../components/QuickView.jsx";
import SkeletonGrid from "../components/Skeleton.jsx";
import Reveal from "../components/Reveal.jsx";
import { fallbackProducts, categoryList, filterProducts } from "../utils/fallbackData.js";

const SORT_OPTIONS = [
  { value: "", label: "Urutan Populer" },
  { value: "price-low", label: "Harga Sewa Terendah" },
  { value: "price-high", label: "Harga Sewa Tertinggi" },
  { value: "name-az", label: "Nama A-Z" },
  { value: "name-za", label: "Nama Z-A" },
];

function sortProducts(products, sort) {
  const list = [...products];
  switch (sort) {
    case "price-low":
      list.sort((a, b) => (a.rentPrice ?? a.buyPrice) - (b.rentPrice ?? b.buyPrice));
      break;
    case "price-high":
      list.sort((a, b) => (b.rentPrice ?? b.buyPrice) - (a.rentPrice ?? a.buyPrice));
      break;
    case "name-az":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-za":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }
  return list;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "";

  const { data, loading, error } = useApi(
    (signal) => api.getProducts({ limit: 50 }, { signal }),
    [],
  );

  const apiProducts = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
  const hasApiProducts = Array.isArray(apiProducts) && apiProducts.length > 0;
  const baseProducts = hasApiProducts ? apiProducts : fallbackProducts;

  const filters = { q, category, maxPrice };
  const products = useMemo(
    () => sortProducts(filterProducts(baseProducts, filters), sort),
    [baseProducts, q, category, maxPrice, sort],
  );

  const setFilter = (key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: false },
    );
  };

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
              onChange={(e) => setFilter("q", e.target.value)}
              placeholder="Cari tenda, carrier..."
            />
          </div>

          <div className="filter-group">
            <h3>Kategori Alat</h3>
            <div className="category-list">
              {categoryList.map((cat) => (
                <button
                  key={cat.value || "all"}
                  onClick={() => setFilter("category", cat.value)}
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
              onChange={(e) => setFilter("maxPrice", e.target.value)}
              placeholder="Contoh: 1000000"
            />
          </div>

          {(q || category || maxPrice) && (
            <button
              className="btn-clear-filters"
              onClick={() => setSearchParams({})}
            >
              Reset Filter
            </button>
          )}
        </aside>

        <div className="catalog-content">
          <div className="catalog-topbar">
            <span>
              Menampilkan <strong>{products.length}</strong> produk pilihan
            </span>
            <div className="sort-box">
              <label htmlFor="sort-select">Urutkan:</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setFilter("sort", e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : products.length === 0 ? (
            <div className="empty-products">
              <p>Tidak ada produk yang cocok dengan pencarian Anda.</p>
              <button className="btn-primary" onClick={() => setSearchParams({})}>
                Tampilkan Semua Produk
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {products.map((p, index) => (
                <Reveal key={p.id || p._id} delay={index * 50}>
                  <ProductCard product={p} onQuickView={setQuickViewProduct} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </main>
  );
}