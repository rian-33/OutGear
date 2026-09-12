import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { formatRupiah } from "../utils/productImages.js";

const statusClass = (status) => {
  switch (status) {
    case "Menunggu Pembayaran":
      return "order-badge waiting";
    case "Diproses":
      return "order-badge processed";
    case "Dikirim":
      return "order-badge shipped";
    case "Selesai":
      return "order-badge done";
    case "Dibatalkan":
      return "order-badge cancelled";
    default:
      return "order-badge";
  }
};

export default function Account() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  const { data, loading } = useApi(
    (signal) => api.getMyOrders({ limit: 20 }, { signal }),
    [],
  );
  const orders = data?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      await updateProfile(payload);
      showToast("Profil berhasil diperbarui", "success");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      showToast(`Gagal menyimpan: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="account-page">
      <div className="account-grid">
        <div className="checkout-card">
          <h2>Profil Saya</h2>
          <form onSubmit={handleSave} className="checkout-form">
            <div className="form-field">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
              />
            </div>
            <div className="form-field">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                placeholder="Email"
              />
              <small className="error-text" style={{ opacity: 0.6 }}>
                Email tidak dapat diubah
              </small>
            </div>
            <div className="form-field">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="No Telepon"
              />
            </div>
            <div className="form-field">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat"
                rows="2"
              />
            </div>
            <div className="form-field">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password baru (kosongkan bila tidak diubah)"
              />
            </div>
            <button type="submit" disabled={saving} className="checkout-submit">
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>

        <div className="checkout-card">
          <h2>Riwayat Pesanan</h2>
          {loading ? (
            <div className="page-state">
              <div className="spinner"></div>
              <p>Memuat pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <p className="empty-note">
              Belum ada pesanan.{" "}
              <Link to="/products" className="auth-link">
                Mulai belanja
              </Link>
            </p>
          ) : (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.orderNumber} className="order-row">
                  <div className="order-row-main">
                    <span className="order-no">{order.orderNumber}</span>
                    <span className={statusClass(order.status)}>{order.status}</span>
                  </div>
                  <div className="order-row-sub">
                    <span>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("id-ID")
                        : ""}
                    </span>
                    <span>Rp {formatRupiah(order.totalAmount)}</span>
                  </div>
                  <Link
                    to={`/order/${order.orderNumber}`}
                    className="order-detail-link"
                  >
                    Lihat Detail →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}