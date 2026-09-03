import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import bootsImg from "../assets/boots.png";
import tentImg from "../assets/tent.png";
import backpackImg from "../assets/backpack.png";
import gearImg from "../assets/gear2.png";

// Data cadangan jika produk dari backend belum tersedia
const fallbackProducts = [
  {
    id: "tenda-2p",
    name: "Tenda 2 Person Premium",
    category: "Tenda",
    description:
      "Tenda double layer tahan badai untuk kapasitas 2 orang, sangat ringan dan mudah dipasang.",
    buyPrice: 850000,
    rentPrice: 60000,
    stock: 8,
  },
  {
    id: "carrier-60l",
    name: "Carrier Gunung 60L Explorer",
    category: "Tas",
    description:
      "Tas carrier ergonomis dengan ventilasi punggung optimal untuk pendakian 3-4 hari.",
    buyPrice: 1250000,
    rentPrice: 75000,
    stock: 5,
  },
  {
    id: "sepatu-hiking",
    name: "Sepatu Hiking Waterproof",
    category: "Sepatu",
    description:
      "Sepatu gunung anti air dengan traksi cengkeraman tinggi di segala medan.",
    buyPrice: 950000,
    rentPrice: 70000,
    stock: 6,
  },
  {
    id: "kompor-outdoor",
    name: "Kompor Portable Windproof",
    category: "Peralatan",
    description:
      "Kompor mini lipat tahan angin untuk memasak cepat di alam bebas.",
    buyPrice: 450000,
    rentPrice: 35000,
    stock: 10,
  },
  {
    id: "jaket-shell",
    name: "Jaket Mountain Shell Windbreaker",
    category: "Peralatan",
    description: "Jaket windbreaker tahan air dan angin intensitas tinggi.",
    buyPrice: 750000,
    rentPrice: 50000,
    stock: 7,
  },
  {
    id: "headlamp-LED",
    name: "Headlamp LED Ultra Bright",
    category: "Peralatan",
    description:
      "Lampu kepala LED dengan daya tahan baterai lama dan mode SOS.",
    buyPrice: 250000,
    rentPrice: 20000,
    stock: 15,
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getProductById(id)
      .then((res) => {
        const productData = res.data || res;
        setProduct(productData);
      })
      .catch(() => {
        const found = fallbackProducts.find(
          (p) => p.id === id || p.id === String(id),
        );
        setProduct(found || fallbackProducts[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        Produk tidak ditemukan.
      </div>
    );
  }

  // Fungsi untuk memilih gambar berdasarkan kategori produk
  const getProductImage = (category) => {
    switch (category?.toLowerCase()) {
      case "tas":
      case "carrier":
        return backpackImg;
      case "sepatu":
        return bootsImg;
      case "tenda":
        return tentImg;
      default:
        return gearImg;
    }
  };

  const handleAddToCart = (type) => {
    addToCart({
      ...product,
      cartId: `${product.id || product._id}-${type}-${Date.now()}`,
      quantity,
      type,
      basePrice: type === "rent" ? product.rentPrice : product.buyPrice,
      deposit: type === "rent" ? 50000 : 0,
      rentalDates: type === "rent" ? { startDate, endDate } : null,
    });
    alert(
      `Berhasil memasukkan ${product.name} (${type === "rent" ? "Sewa" : "Beli"}) ke keranjang!`,
    );
    navigate("/checkout");
  };

  return (
    <main className="pdp-container">
      <div className="pdp-grid">
        <div className="pdp-gallery">
          <div className="main-image">
            {/* Menampilkan gambar aset lokal sesuai kategori produk */}
            <img
              src={getProductImage(product.category)}
              alt={product.name}
              style={{ width: "60%", height: "60%", objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="pdp-info">
          <span className="pdp-category">
            {product.category || "Outdoor Gear"}
          </span>
          <h1>{product.name}</h1>

          <div className="pdp-pricing">
            <div className="price-tag">
              <span>Tarif Sewa</span>
              <h2>
                Rp {product.rentPrice?.toLocaleString("id-ID")}{" "}
                <small style={{ fontSize: "14px", fontWeight: "normal" }}>
                  / hari
                </small>
              </h2>
            </div>
            <div className="price-tag outline">
              <span>Harga Beli Putus</span>
              <h2>Rp {product.buyPrice?.toLocaleString("id-ID")}</h2>
            </div>
          </div>

          <p className="pdp-description">
            {product.description ||
              "Peralatan berkualitas tinggi untuk mendukung ekspedisi dan kenyamanan luar ruang Anda."}
          </p>

          <hr className="divider" />

          {/* RENTAL ENGINE SECTION */}
          <div className="rental-engine" style={{ marginBottom: "30px" }}>
            <h3>Simulasi Sewa & Jadwal</h3>
            <div className="date-picker-group">
              <div>
                <label>Tanggal Mulai Sewa</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="rental-summary">
              <p>
                📦 Jaminan Stok Tersedia:{" "}
                <strong>{product.stock || 5} Unit</strong>
              </p>
              <p className="deposit-note">
                *Biaya sewa belum termasuk deposit keamanan alat yang
                dikembalikan saat barang kembali.
              </p>
            </div>
          </div>

          <div className="pdp-actions">
            <div className="quantity-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <span className="stock-info">Sisa Stok: {product.stock || 5}</span>
          </div>

          <div className="pdp-buttons">
            <button
              className="btn-rent-large"
              onClick={() => handleAddToCart("rent")}
            >
              Sewa Sekarang
            </button>
            <button
              className="btn-buy-large"
              onClick={() => handleAddToCart("buy")}
            >
              Beli Putus
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
