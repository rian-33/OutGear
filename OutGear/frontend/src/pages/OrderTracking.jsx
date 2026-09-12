import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi.js";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
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

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(null);

  const { data, loading, error } = useApi((signal) => api.getOrder(orderNumber, { signal }), [orderNumber]);
  const order = data?.data;

  const canManage = (() => {
    if (!order) return false;
    if (user?.role === "admin") return true;
    if (!order.user) return true;
    return Boolean(user && order.user === user.id);
  })();

  const handlePay = async () => {
    try {
      setBusy("pay");
      await api.payOrder(orderNumber);
      showToast("Pembayaran berhasil diproses", "success");
      window.location.reload();
    } catch (err) {
      showToast(`Gagal bayar: ${err.message}`, "error");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    const ok = window.confirm(
      "Batalkan pesanan ini? Stok barang akan dikembalikan.",
    );
    if (!ok) return;
    try {
      setBusy("cancel");
      await api.cancelOrder(orderNumber);
      showToast("Pesanan dibatalkan", "success");
      window.location.reload();
    } catch (err) {
      showToast(`Gagal membatalkan: ${err.message}`, "error");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner"></div>
        <p>Memuat detail pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-state">
        <p>Pesanan tidak ditemukan.</p>
        <Link to="/" className="btn-primary-lg" style={{ marginTop: "16px" }}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isCancellable = ["Menunggu Pembayaran", "Diproses"].includes(order.status);

  return (
    <main className="tracking-page">
      <div className="tracking-card">
        <div className="tracking-head">
          <h2>Lacak Pesanan</h2>
          <span className="order-no">{orderNumber}</span>
        </div>

        <div className="tracking-status-row">
          <span className={statusClass(order.status)}>{order.status}</span>
          {order.paidAt && (
            <small>
              Dibayar: {new Date(order.paidAt).toLocaleString("id-ID")}
            </small>
          )}
        </div>

        <ul className="order-list">
          {order.items.map((item, idx) => (
            <li key={idx} className="order-row">
              <div className="order-row-main">
                <span>
                  {item.name}{" "}
                  <small>
                    (x{item.quantity}
                    {item.mode === "rent" ? ` · ${item.duration} hari` : " · Beli"})
                  </small>
                </span>
              </div>
              <span>Rp {formatRupiah((item.price + item.deposit) * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <hr className="divider" />
        <div className="tracking-summary">
          <div>
            <span>Subtotal</span>
            <span>Rp {formatRupiah(order.subtotal)}</span>
          </div>
          <div>
            <span>Pajak (10%)</span>
            <span>Rp {formatRupiah(order.tax)}</span>
          </div>
          <div>
            <span>Ongkir</span>
            <span>
              {order.deliveryType === "pickup"
                ? "PICKUP"
                : `Rp ${formatRupiah(order.deliveryFee)}`}
            </span>
          </div>
          <div className="tracking-total">
            <span>TOTAL</span>
            <span>Rp {formatRupiah(order.totalAmount)}</span>
          </div>
        </div>

        <hr className="divider" />
        <div className="tracking-customer">
          <p>
            <strong>Penerima:</strong> {order.customer.name} · {order.customer.phone}
          </p>
          <p>
            <strong>Alamat:</strong> {order.customer.address}
          </p>
          <p>
            <strong>Metode:</strong> {order.paymentMethod}
          </p>
        </div>

        {canManage && (
          <div className="tracking-actions">
            {order.status === "Menunggu Pembayaran" && (
              <button className="btn-pay" onClick={handlePay} disabled={busy === "pay"}>
                {busy === "pay" ? "Memproses..." : "💳 Bayar Sekarang"}
              </button>
            )}
            {isCancellable && (
              <button
                className="btn-cancel"
                onClick={handleCancel}
                disabled={busy === "cancel"}
              >
                {busy === "cancel" ? "Membatalkan..." : "Batalkan Pesanan"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}