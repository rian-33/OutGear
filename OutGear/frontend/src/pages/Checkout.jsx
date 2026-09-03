import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function Checkout() {
  const { cart, clearCart, total } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "credit-card",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  const tax = total * 0.1;
  const shipping = total > 500000 ? 0 : 50000;
  const grandTotal = total + tax + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors) return setErrors(validationErrors);

    try {
      setLoading(true);
      setMessage("");
      const orderData = {
        customer: formData,
        items: cart,
        subtotal: total,
        tax,
        shipping,
        totalAmount: grandTotal,
        paymentMethod: formData.paymentMethod,
        status: "pending",
      };

      const response = await api.createOrder(orderData);

      setMessage("✅ Pesanan berhasil dibuat!");
      clearCart();
      setTimeout(() => navigate(`/`), 1500); // Diarahkan ke home atau halaman resi nanti
    } catch (error) {
      setMessage(`❌ Gagal membuat pesanan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: "100px 7%", textAlign: "center" }}>
        <h2>Keranjang Anda Kosong</h2>
        <button
          onClick={() => navigate("/products")}
          className="btn-buy"
          style={{ padding: "15px 30px", marginTop: "20px" }}
        >
          Lanjutkan Belanja
        </button>
      </div>
    );
  }

  return (
    <main style={{ padding: "60px 7%" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}
      >
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Ringkasan Pesanan</h2>
          {cart.map((item) => (
            <div
              key={item.cartId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <span>
                {item.name} (x{item.quantity})
              </span>
              <strong>
                Rp
                {(
                  (item.basePrice + item.deposit) *
                  item.quantity
                ).toLocaleString()}
              </strong>
            </div>
          ))}
          <hr style={{ margin: "20px 0", borderColor: "#eee" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>Subtotal</span>
            <span>Rp{total.toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>Pajak (10%)</span>
            <span>Rp{tax.toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>Ongkir</span>
            <span>
              {shipping === 0 ? "GRATIS" : `Rp${shipping.toLocaleString()}`}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
              fontSize: "20px",
              color: "var(--primary)",
              fontWeight: "bold",
            }}
          >
            <span>TOTAL</span>
            <span>Rp{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Data Penerima</h2>
          <form
            onSubmit={handleCheckout}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: errors.name ? "1px solid red" : "1px solid #ddd",
                }}
              />
              {errors.name && (
                <small style={{ color: "red" }}>{errors.name}</small>
              )}
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: errors.email ? "1px solid red" : "1px solid #ddd",
                }}
              />
              {errors.email && (
                <small style={{ color: "red" }}>{errors.email}</small>
              )}
            </div>
            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="No Telepon"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: errors.phone ? "1px solid red" : "1px solid #ddd",
                }}
              />
              {errors.phone && (
                <small style={{ color: "red" }}>{errors.phone}</small>
              )}
            </div>
            <div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat Pengiriman"
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: errors.address ? "1px solid red" : "1px solid #ddd",
                }}
              />
              {errors.address && (
                <small style={{ color: "red" }}>{errors.address}</small>
              )}
            </div>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <option value="credit-card">💳 Kartu Kredit / QRIS</option>
              <option value="bank-transfer">🏦 Transfer Bank</option>
              <option value="cod">🚚 Bayar di Tempat</option>
            </select>

            {message && (
              <div
                style={{
                  padding: "15px",
                  background: message.includes("✅") ? "#d4edda" : "#f8d7da",
                  borderRadius: "6px",
                  color: message.includes("✅") ? "green" : "red",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--primary)",
                color: "white",
                padding: "15px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "Memproses..." : "Buat Pesanan"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
