import { useEffect, useState } from "react";
import { getProducts } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    getProducts({ q, category, maxPrice })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [q, category, maxPrice]);

  return (
    <main>
      {/* Banner Khusus Katalog */}
      <section className="catalog-header">
        <h1>Katalog Peralatan</h1>
        <p>Temukan peralatan terbaik untuk petualangan Anda berikutnya</p>
      </section>

      <section className="catalog-container">
        {/* SIDEBAR FILTER */}
        <aside className="sidebar">
          <div className="filter-group">
            <h3>Pencarian</h3>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama produk..."
            />
          </div>

          <div className="filter-group">
            <h3>Kategori</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              <option value="Tenda">⛺ Tenda & Shelter</option>
              <option value="Tas">🎒 Carrier & Tas</option>
              <option value="Sepatu">👟 Sepatu & Boots</option>
              <option value="Peralatan">🧗 Peralatan & Gear</option>
            </select>
          </div>

          <div className="filter-group">
            <h3>Filter Harga (Maks)</h3>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Contoh: 500000"
            />
          </div>
        </aside>

        {/* AREA GRID PRODUK */}
        <div className="catalog-content">
          <div className="catalog-topbar">
            <span>
              Menampilkan <strong>{products.length}</strong> produk
            </span>
            {/* Ruang untuk Sort By di masa depan */}
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "50px" }}>
              Memuat produk...
            </p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: "center", padding: "50px" }}>
              Produk tidak ditemukan.
            </p>
          ) : (
            <div className="catalog-grid">
              {products.map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="card-img">
                    <span className="category-tag">{p.category}</span>
                    {/* Menggunakan emoji sementara sebagai gambar produk */}
                    {p.category === "Tas"
                      ? "🎒"
                      : p.category === "Sepatu"
                        ? "👟"
                        : p.category === "Tenda"
                          ? "⛺"
                          : "🧗"}
                  </div>

                  <div className="card-info">
                    <h3>{p.name}</h3>

                    <div className="price-box">
                      <p>
                        Sewa:{" "}
                        <strong>
                          Rp {p.rentPrice.toLocaleString("id-ID")}
                        </strong>{" "}
                        / hari
                      </p>
                      <p>
                        Beli:{" "}
                        <strong>Rp {p.buyPrice.toLocaleString("id-ID")}</strong>
                      </p>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-rent"
                        onClick={() => addToCart(p, "rent")}
                      >
                        + SEWA
                      </button>
                      <button
                        className="btn-buy"
                        onClick={() => addToCart(p, "buy")}
                      >
                        + BELI
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
