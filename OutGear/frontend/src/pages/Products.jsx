import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

import bootsImg from "../assets/boots.png";
import tentImg from "../assets/tent.png";
import backpackImg from "../assets/backpack.png";
import gearImg from "../assets/gear2.png";
import komporImg from "../assets/portable.png";
import jaketImg from "../assets/jaket.png";
import headlampImg from "../assets/headlamp.png";

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
    category: "kompor",
    buyPrice: 450000,
    rentPrice: 35000,
    stock: 10,
  },
  {
    id: "jaket-shell",
    name: "Jaket Mountain Shell Windbreaker",
    category: "jaket",
    buyPrice: 750000,
    rentPrice: 50000,
    stock: 7,
  },
  {
    id: "headlamp-LED",
    name: "Headlamp LED Ultra Bright",
    category: "lampu",
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
    api
      .getProducts({ q, category, maxPrice })
      .then((data) => {
        const productsData = data.data || data;

        if (!productsData || productsData.length === 0) {
          let filtered = fallbackProducts;
          if (category)
            filtered = filtered.filter((p) => p.category === category);
          if (q)
            filtered = filtered.filter((p) =>
              p.name.toLowerCase().includes(q.toLowerCase()),
            );
          setProducts(filtered);
        } else {
          setProducts(productsData);
        }
      })
      .catch(() => {
        setProducts(fallbackProducts);
      })
      .finally(() => setLoading(false));
  }, [q, category, maxPrice]);

  // Fungsi untuk memilih gambar berdasarkan kategori produk
  const getProductImage = (cat) => {
    switch (cat?.toLowerCase()) {
      case "tas":
      case "carrier":
        return backpackImg;
      case "sepatu":
        return bootsImg;
      case "tenda":
        return tentImg;
      case "kompor":
        return komporImg;
      case "jaket":
        return jaketImg;
      case "lampu":
        return headlampImg;
      default:
        return gearImg;
    }
  };

  // Daftar kategori dengan ikon untuk sidebar
  const categoryList = [
    { value: "", label: "Semua Kategori", icon: null },
    { value: "Tenda", label: "Tenda & Shelter", icon: tentImg },
    { value: "Tas", label: "Carrier & Tas", icon: backpackImg },
    { value: "Sepatu", label: "Sepatu & Boots", icon: bootsImg },
    { value: "kompor", label: "Kompor & Masak", icon: komporImg },
    { value: "jaket", label: "Jaket & Pakaian", icon: jaketImg },
    { value: "lampu", label: "Senter & Headlamp", icon: headlampImg },
    { value: "Peralatan", label: "Peralatan & Gear", icon: gearImg },
  ];

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
            {/* Mengganti <select> dengan daftar tombol kategori kustom */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {categoryList.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "10px 15px",
                    background:
                      category === cat.value
                        ? "var(--badge-success)"
                        : "transparent",
                    border:
                      category === cat.value
                        ? "1px solid var(--primary)"
                        : "1px solid transparent",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat.icon && (
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      style={{
                        width: "24px",
                        height: "24px",
                        objectFit: "contain",
                        marginRight: "12px",
                        // Efek abu-abu jika kategori tidak sedang dipilih
                        filter:
                          category === cat.value
                            ? "none"
                            : "grayscale(100%) opacity(60%)",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontWeight: category === cat.value ? "700" : "500",
                      color:
                        category === cat.value
                          ? "var(--primary)"
                          : "var(--text-dark)",
                      marginLeft: cat.icon ? "0" : "36px",
                    }}
                  >
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group" style={{ marginTop: "30px" }}>
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
                    to={`/product/${p.id || p._id}`}
                    className="card-img"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="category-tag">{p.category}</span>
                    <img
                      src={getProductImage(p.category)}
                      alt={p.name}
                      style={{
                        width: "50%",
                        height: "50%",
                        objectFit: "contain",
                      }}
                    />
                  </Link>

                  <div className="card-info">
                    <Link
                      to={`/product/${p.id || p._id}`}
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
                        to={`/product/${p.id || p._id}`}
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
