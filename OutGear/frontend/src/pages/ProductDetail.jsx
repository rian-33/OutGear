import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
// Jika Anda sudah memiliki api.js, pastikan fungsi getProductById tersedia
import { getProductById } from "../services/api.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk Mesin Penyewaan
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    // Memanggil API backend untuk mengambil 1 produk
    getProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Efek Kalkulasi Durasi Otomatis
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Set minimal sewa 1 hari
      if (daysDiff > 0) {
        setDuration(daysDiff);
      } else {
        setDuration(0);
      }
    }
  }, [startDate, endDate]);

  const handleRent = () => {
    if (!startDate || !endDate || duration <= 0) {
      alert("Mohon pilih tanggal penyewaan yang valid!");
      return;
    }
    addToCart(product, "rent", quantity, { startDate, endDate, duration });
    alert("Berhasil ditambahkan ke keranjang sewa!");
    navigate("/checkout");
  };

  const handleBuy = () => {
    addToCart(product, "buy", quantity);
    alert("Berhasil ditambahkan ke keranjang pembelian!");
    navigate("/checkout");
  };

  if (loading)
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        Memuat Detail Produk...
      </div>
    );
  if (!product)
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        Produk Tidak Ditemukan
      </div>
    );

  return (
    <main className="pdp-container">
      <div className="pdp-grid">
        {/* GALERI GAMBAR */}
        <div className="pdp-gallery">
          <div className="main-image">
            {product.category === "Tas"
              ? "🎒"
              : product.category === "Sepatu"
                ? "👟"
                : product.category === "Tenda"
                  ? "⛺"
                  : "🧗"}
          </div>
          {/* Tempat untuk thumbnail di masa depan */}
        </div>

        {/* INFO & MESIN PENYEWAAN */}
        <div className="pdp-info">
          <span className="pdp-category">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="pdp-pricing">
            <div className="price-tag">
              <span>Sewa Per Hari</span>
              <h2>Rp {product.rentPrice.toLocaleString("id-ID")}</h2>
            </div>
            <div className="price-tag outline">
              <span>Beli Baru</span>
              <h2>Rp {product.buyPrice.toLocaleString("id-ID")}</h2>
            </div>
          </div>

          <p className="pdp-description">
            {product.description ||
              "Peralatan premium dengan material tahan lama, cocok untuk menemani pendakian dan petualangan alam terbuka Anda."}
          </p>

          <hr className="divider" />

          {/* RENTAL ENGINE FORM */}
          <div className="rental-engine">
            <h3>Pilih Tanggal Sewa</h3>
            <div className="date-picker-group">
              <div>
                <label>Tanggal Ambil</label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>Tanggal Kembali</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {duration > 0 && (
              <div className="rental-summary">
                <p>
                  Durasi: <strong>{duration} Hari</strong>
                </p>
                <p>
                  Subtotal Sewa:{" "}
                  <strong>
                    Rp {(product.rentPrice * duration).toLocaleString("id-ID")}
                  </strong>
                </p>
                <p className="deposit-note">
                  *Terdapat tambahan uang jaminan (deposit) Rp 50.000 yang akan
                  dikembalikan saat barang diretur.
                </p>
              </div>
            )}
          </div>

          <hr className="divider" />

          <div className="pdp-actions">
            <div className="quantity-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
              >
                +
              </button>
            </div>
            <p className="stock-info">Sisa Stok: {product.stock}</p>
          </div>

          <div className="pdp-buttons">
            <button className="btn-rent-large" onClick={handleRent}>
              SEWA SEKARANG
            </button>
            <button className="btn-buy-large" onClick={handleBuy}>
              BELI BARANG INI
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
