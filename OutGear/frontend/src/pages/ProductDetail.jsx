import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { getProductImage, formatRupiah } from "../utils/productImages.js";
import { fallbackProducts, getCategoryLabel } from "../utils/fallbackData.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentalError, setRentalError] = useState("");

  const { data, loading, error } = useApi((signal) => api.getProductById(id, { signal }), [id]);

  const apiProduct = data?.data || data;
  const product = apiProduct || fallbackProducts.find((p) => p.id === id) || null;

  const calculateDuration = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  };

  const validateRentalDates = () => {
    if (!startDate) return "Pilih tanggal mulai sewa";
    if (!endDate) return "Pilih tanggal selesai sewa";
    if (new Date(`${endDate}T00:00:00Z`) < new Date(`${startDate}T00:00:00Z`))
      return "Tanggal selesai tidak boleh sebelum tanggal mulai";
    return "";
  };

  const handleAddToCart = (type) => {
    if (type === "rent") {
      const message = validateRentalDates();
      if (message) {
        setRentalError(message);
        return;
      }
    }
    setRentalError("");

    const duration = type === "rent" ? calculateDuration() : 1;

    addToCart(
      product,
      type,
      quantity,
      type === "rent"
        ? { duration, startDate: startDate || null, endDate: endDate || null }
        : null,
    );

    showToast(
      `Berhasil menambahkan ${product.name} (${type === "rent" ? "Sewa" : "Beli"}) ke keranjang!`,
      "success",
    );
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="skeleton skeleton-line w-40" />
        <div className="skeleton skeleton-block h-320" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-state">
        <p>Produk tidak ditemukan.</p>
      </div>
    );
  }

  const duration = calculateDuration();

  return (
    <main className="pdp-container">
      {error && (
        <div className="api-warning">
          <strong>⚠️ Backend tidak terhubung.</strong> Pastikan MongoDB dan
          server backend sudah berjalan, kemudian muat ulang halaman. Detail di
          bawah hanyalah data contoh.
        </div>
      )}
      <div className="pdp-grid">
        <div className="pdp-gallery">
          <div className="main-image">
            <img
              src={getProductImage(product.category)}
              alt={product.name}
            />
          </div>
        </div>

        <div className="pdp-info">
          <span className="pdp-category">{getCategoryLabel(product.category)}</span>
          <h1>{product.name}</h1>

          <div className="pdp-pricing">
            <div className="price-tag">
              <span>Tarif Sewa</span>
              <h2>
                Rp {formatRupiah(product.rentPrice)}{" "}
                <small style={{ fontSize: "14px", fontWeight: "normal" }}>
                  / hari
                </small>
              </h2>
            </div>
            <div className="price-tag outline">
              <span>Harga Beli Putus</span>
              <h2>Rp {formatRupiah(product.buyPrice)}</h2>
            </div>
          </div>

          <p className="pdp-description">
            {product.description ||
              "Peralatan berkualitas tinggi untuk mendukung ekspedisi dan kenyamanan luar ruang Anda."}
          </p>

          <hr className="divider" />

          <div className="rental-engine">
            <h3>Simulasi Sewa & Jadwal</h3>
            <div className="date-picker-group">
              <div>
                <label>Tanggal Mulai Sewa</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setRentalError("");
                  }}
                />
              </div>
              <div>
                <label>Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setRentalError("");
                  }}
                />
              </div>
            </div>
            {rentalError && <p className="rental-error">{rentalError}</p>}
            {duration > 1 ? (
              <p className="rental-duration">
                Durasi sewa: <strong>{duration} hari</strong>
              </p>
            ) : null}
            <div className="rental-summary">
              <p>
                📦 Jaminan Stok Tersedia: <strong>{product.stock || 5} Unit</strong>
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
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              >
                +
              </button>
            </div>
            <span className="stock-info">Sisa Stok: {product.stock || 5}</span>
          </div>

          <div className="pdp-buttons">
            <button className="btn-rent-large" onClick={() => handleAddToCart("rent")}>
              Sewa Sekarang
            </button>
            <button className="btn-buy-large" onClick={() => handleAddToCart("buy")}>
              Beli Putus
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}