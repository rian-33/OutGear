import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import { formatRupiah } from "../utils/productImages.js";

const STORE_COORDS = { lat: -5.1477, lng: 119.4327 };
const FLAT_SHIPPING = 50000;

function estimateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function Checkout() {
  const { cart, clearCart, total, totalDeposit } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "credit-card",
    destination: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Nama lengkap wajib diisi";
    if (!formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Email tidak valid";
    if (!formData.phone?.trim()) newErrors.phone = "Nomor telepon wajib diisi";
    if (!formData.address?.trim())
      newErrors.address = "Alamat pengiriman wajib diisi";
    if (cart.length === 0) newErrors.cart = "Keranjang belanja kosong";
    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  const hasRent = cart.some((i) => i.mode === "rent");
  const hasBuy = cart.some((i) => i.mode === "buy");
  const deliveryType = hasRent && !hasBuy ? "pickup" : "delivery";

  const estimatedShipping =
    formData.destination &&
    Number.isFinite(formData.destination.lat) &&
    Number.isFinite(formData.destination.lng)
      ? Math.round(
          10000 +
            Math.max(0, estimateDistanceKm(
              STORE_COORDS.lat,
              STORE_COORDS.lng,
              formData.destination.lat,
              formData.destination.lng,
            )) * 3000,
        )
      : FLAT_SHIPPING;

  const tax = total * 0.1;
  const shipping =
    deliveryType === "pickup" || estimatedShipping === 0
      ? 0
      : estimatedShipping;
  const grandTotal = total + tax + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Browser tidak mendukung geolokasi. Ongkir menggunakan tarif flat.");
      return;
    }

    setLocating(true);
    setLocationNote("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          destination: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: "Lokasi saya",
          },
        }));
        setLocationNote("Lokasi terdeteksi. Ongkir dihitung dari jarak ke toko.");
        setLocating(false);
      },
      () => {
        setLocationNote("Lokasi tidak diberikan. Ongkir menggunakan tarif flat Rp 50.000.");
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors) return setErrors(validationErrors);

    try {
      setLoading(true);
      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          mode: item.mode,
          quantity: item.quantity,
          price: item.basePrice,
          basePrice: item.basePrice,
          deposit: item.deposit,
          startDate: item.startDate,
          endDate: item.endDate,
          duration: item.duration,
        })),
        destination: formData.destination || undefined,
        deliveryType,
        paymentMethod: formData.paymentMethod,
      };

      const response = await api.createOrder(orderData);
      const serverTotal = response.serverPricing?.totalAmount;
      const orderNumber = response.data?.orderNumber || "";
      showToast(
        `Pesanan ${orderNumber} berhasil dibuat! Total: Rp ${formatRupiah(serverTotal || grandTotal)}`,
        "success",
      );
      clearCart();
      setTimeout(() => navigate(`/order/${orderNumber}`), 1500);
    } catch (error) {
      showToast(`Gagal membuat pesanan: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Keranjang Anda Kosong</h2>
        <button onClick={() => navigate("/products")} className="btn-buy btn-lg">
          Lanjutkan Belanja
        </button>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-grid">
        <div className="checkout-card">
          <h2>Ringkasan Pesanan</h2>
          {cart.map((item) => (
            <div className="checkout-item" key={item.cartId}>
              <span>
                {item.name} (x{item.quantity})
                {item.mode === "rent" ? " · Sewa" : " · Beli"}
              </span>
              <strong>
                Rp {formatRupiah((item.basePrice + item.deposit) * item.quantity)}
              </strong>
            </div>
          ))}
          <hr className="divider" />
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>Rp {formatRupiah(total)}</span>
          </div>
          {totalDeposit > 0 && (
            <div className="checkout-summary-row">
              <span>Deposit ({deliveryType === "pickup" ? "dikembalikan saat pengembalian" : "terkandung dalam subtotal"})</span>
              <span>Rp {formatRupiah(totalDeposit)}</span>
            </div>
          )}
          <div className="checkout-summary-row">
            <span>Pajak (10%)</span>
            <span>Rp {formatRupiah(tax)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Ongkir</span>
            <span>
              {deliveryType === "pickup"
                ? "PICKUP"
                : shipping === 0
                  ? "GRATIS"
                  : `Rp ${formatRupiah(shipping)} (estimasi)`}
            </span>
          </div>
          <div className="checkout-total">
            <span>TOTAL</span>
            <span>Rp {formatRupiah(grandTotal)}</span>
          </div>
        </div>

        <div className="checkout-card">
          <h2>Data Penerima</h2>
          <form onSubmit={handleCheckout} className="checkout-form">
            <div className="form-field">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <small className="error-text">{errors.name}</small>}
            </div>
            <div className="form-field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <small className="error-text">{errors.email}</small>}
            </div>
            <div className="form-field">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="No Telepon"
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && <small className="error-text">{errors.phone}</small>}
            </div>
            <div className="form-field">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat Pengiriman"
                rows="4"
                className={errors.address ? "input-error" : ""}
              />
              {errors.address && <small className="error-text">{errors.address}</small>}
            </div>

            <button
              type="button"
              className="checkout-geo"
              onClick={handleUseMyLocation}
              disabled={locating}
            >
              {locating ? "Mendeteksi lokasi..." : "📍 Gunakan Lokasi Saya"}
            </button>
            {locationNote && <small className="geo-note">{locationNote}</small>}

            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="checkout-select"
            >
              <option value="credit-card">💳 Kartu Kredit / QRIS</option>
              <option value="bank-transfer">🏦 Transfer Bank</option>
              <option value="cod">🚚 Bayar di Tempat</option>
            </select>

            <button type="submit" disabled={loading} className="checkout-submit">
              {loading ? "Memproses..." : "Buat Pesanan"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}