import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

// Data cadangan interaktif jika backend belum aktif
const fallbackProducts = [
  {
    id: "tenda-2p",
    name: "Tenda 2 Person Premium",
    category: "Tenda",
    buyPrice: 850000,
    rentPrice: 60000,
    stock: 8,
  },
  {
    id: "carrier-60l",
    name: "Carrier Gunung 60L Explorer",
    category: "Tas",
    buyPrice: 1250000,
    rentPrice: 75000,
    stock: 5,
  },
  {
    id: "sepatu-hiking",
    name: "Sepatu Hiking Waterproof",
    category: "Sepatu",
    buyPrice: 950000,
    rentPrice: 70000,
    stock: 6,
  },
  {
    id: "kompor-outdoor",
    name: "Kompor Portable Windproof",
    category: "Peralatan",
    buyPrice: 450000,
    rentPrice: 35000,
    stock: 10,
  },
  {
    id: "jaket-shell",
    name: "Jaket Mountain Shell Windbreaker",
    category: "Peralatan",
    buyPrice: 750000,
    rentPrice: 50000,
    stock: 7,
  },
  {
    id: "headlamp-LED",
    name: "Headlamp LED Ultra Bright",
    category: "Peralatan",
    buyPrice: 250000,
    rentPrice: 20000,
    stock: 15,
  },
];

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
      .then((data) => {
        if (!data || data.length === 0) {
          // Gunakan fallback jika data kosong
          let filtered = fallbackProducts;
          if (category)
            filtered = filtered.filter((p) => p.category === category);
          if (q)
            filtered = filtered.filter((p) =>
              p.name.toLowerCase().includes(q.toLowerCase()),
            );
          setProducts(filtered);
        } else {
          setProducts(data);
        }
      })
      .catch(() => {
        setProducts(fallbackProducts);
      })
      .finally(() => setLoading(false));
  }, [q, category, maxPrice]);

  return (
    <main>
      <section className="catalog-header">
        <h1>Katalog Peralatan Pendakian</h1>
        <p>
          Sewa atau beli alat outdoor berkualitas tinggi untuk keamanan
          petualangan Anda
        </p>
      </section>

      <section className="catalog-container">
        {/* SIDEBAR FILTER */}
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
            <h3>Batas Harga Maksimal</h3>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Contoh: 1000000"
            />
          </div>
        </aside>

        {/* PRODUK GRID */}
        <div className="catalog-content">
          <div className="catalog-topbar">
            <span>
              Menampilkan <strong>{products.length}</strong> produk pilihan
            </span>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "50px" }}>
              Memuat katalog produk...
            </p>
          ) : (
            <div className="catalog-grid">
              {products.map((p) => (
                <article className="product-card" key={p.id || p._id}>
                  <Link
                    to={`/product/${p.id}`}
                    className="card-img"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="category-tag">{p.category}</span>
                    {p.category === "Tas"
                      ? "🎒"
                      : p.category === "Sepatu"
                        ? "👟"
                        : p.category === "Tenda"
                          ? "⛺"
                          : "🧗"}
                  </Link>

                  <div className="card-info">
                    <Link
                      to={`/product/${p.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3>{p.name}</h3>
                    </Link>

                    <div className="price-box">
                      <p>
                        Sewa:{" "}
                        <strong>
                          Rp {p.rentPrice?.toLocaleString("id-ID")}
                        </strong>{" "}
                        / hari
                      </p>
                      <p>
                        Beli:{" "}
                        <strong>
                          Rp {p.buyPrice?.toLocaleString("id-ID")}
                        </strong>
                      </p>
                    </div>

                    <div className="card-actions">
                      <Link
                        to={`/product/${p.id}`}
                        className="btn-rent"
                        style={{
                          textAlign: "center",
                          textDecoration: "none",
                          lineHeight: "38px",
                        }}
                      >
                        Detail / Sewa
                      </Link>
                      <button
                        className="btn-buy"
                        onClick={() => {
                          addToCart(p, "buy");
                          alert(
                            `Berhasil menambahkan ${p.name} ke keranjang beli!`,
                          );
                        }}
                      >
                        + Beli
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
