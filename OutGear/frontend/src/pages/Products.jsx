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
    <main className="section">
      <div className="page-title">
        <p className="eyebrow">KATALOG</p>
        <h1>Produk Outdoor</h1>
      </div>

      <div className="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari produk..."
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua kategori</option>
          <option>Tenda</option>
          <option>Tas</option>
          <option>Sepatu</option>
          <option>Peralatan</option>
        </select>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Budget maksimal"
        />
      </div>

      {loading ? (
        <p>Memuat produk...</p>
      ) : (
        <div className="products">
          {products.map((p) => (
            <article className="product" key={p.id}>
              <div className="product-image">🏕️</div>
              <span>{p.category}</span>
              <h3>{p.name}</h3>
              <p>
                Sewa: <b>Rp {p.rentPrice.toLocaleString("id-ID")}/hari</b>
              </p>
              <p>
                Beli: <b>Rp {p.buyPrice.toLocaleString("id-ID")}</b>
              </p>
              <div className="actions">
                <button onClick={() => addToCart(p, "rent")}>
                  Tambah Sewa
                </button>
                <button onClick={() => addToCart(p, "buy")}>Tambah Beli</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
