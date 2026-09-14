import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { categoryList, fallbackProducts } from "../utils/fallbackData.js";
import Reveal from "../components/Reveal.jsx";

function countByCategory(products) {
  return products.reduce((acc, p) => {
    const key = p.category;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export default function Kategori() {
  const navigate = useNavigate();
  const { data, error } = useApi(
    (signal) => api.getProducts({ limit: 100 }, { signal }),
    [],
  );

  const raw = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
  const hasApi = Array.isArray(raw) && raw.length > 0;
  const source = hasApi ? raw : fallbackProducts;
  const counts = countByCategory(source);
  const activeCategories = categoryList.filter((c) => c.value);

  const goCategory = (value) => navigate(`/products?category=${value}`);

  return (
    <main>
      <section className="page-hero">
        <h1>Jelajahi Kategori</h1>
        <p>
          Pilih jenis peralatan outdoor yang Anda butuhkan — sewa atau beli
          putus.
        </p>
      </section>

      {error && (
        <div className="api-warning">
          <strong>⚠️ Backend tidak terhubung.</strong> Jumlah produk yang
          ditampilkan hanyalah data contoh.
        </div>
      )}

      <section className="kategori-section">
        <div className="kategori-grid">
          {activeCategories.map((cat, index) => (
            <Reveal key={cat.value} delay={index * 60}>
              <article
                className="kategori-card"
                role="button"
                tabIndex={0}
                onClick={() => goCategory(cat.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goCategory(cat.value);
                  }
                }}
              >
                <div className="kategori-card-img">
                  {cat.icon ? (
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      className="kategori-card-img-src"
                    />
                  ) : (
                    <span className="kategori-card-fallback">{cat.label[0]}</span>
                  )}
                </div>
                <h3>{cat.label}</h3>
                <p>{counts[cat.value] || 0} Produk</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}