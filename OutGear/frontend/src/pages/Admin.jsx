import { useState } from "react";
import { api } from "../services/api.js";
import { useApi } from "../hooks/useApi.js";
import { useToast } from "../components/Toast.jsx";
import { formatRupiah } from "../utils/productImages.js";

const EMPTY_PRODUCT = {
  name: "",
  category: "tenda",
  buyPrice: "",
  rentPrice: "",
  stock: "",
  description: "",
};

const ORDER_STATUSES = [
  "Menunggu Pembayaran",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
];

export default function Admin() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("products");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const refresh = () => setRefreshKey((k) => k + 1);

  const productsQuery = useApi((signal) => api.getProducts({ limit: 100 }, { signal }), [refreshKey]);
  const ordersQuery = useApi((signal) => api.getAllOrders({ limit: 50 }, { signal }), [refreshKey]);

  const products = productsQuery.data?.data || [];
  const orders = ordersQuery.data?.data || [];

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (product) => {
    setEditingId(product.id || product._id);
    setForm({
      name: product.name || "",
      category: product.category || "tenda",
      buyPrice: product.buyPrice ?? "",
      rentPrice: product.rentPrice ?? "",
      stock: product.stock ?? "",
      description: product.description || "",
    });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      buyPrice: Number(form.buyPrice),
      rentPrice: Number(form.rentPrice),
      stock: Number(form.stock),
    };
    try {
      setSaving(true);
      if (editingId) {
        await api.updateProduct(editingId, payload);
        showToast("Produk diperbarui", "success");
      } else {
        await api.createProduct(payload);
        showToast("Produk ditambahkan", "success");
      }
      resetForm();
      refresh();
    } catch (error) {
      showToast(`Gagal menyimpan: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Hapus produk ini?")) return;
    try {
      await api.deleteProduct(id);
      showToast("Produk dihapus", "success");
      if (editingId === id) resetForm();
      refresh();
    } catch (error) {
      showToast(`Gagal menghapus: ${error.message}`, "error");
    }
  };

  const handleChangeStatus = async (orderNo, status) => {
    try {
      await api.updateOrderStatus(orderNo, status);
      showToast(`Status ${orderNo} diperbarui`, "success");
      refresh();
    } catch (error) {
      showToast(`Gagal ubah status: ${error.message}`, "error");
    }
  };

  return (
    <main className="admin-page">
      <h1 className="admin-title">Panel Admin</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "products" ? "active" : ""}`}
          onClick={() => setTab("products")}
        >
          Kelola Produk
        </button>
        <button
          className={`admin-tab ${tab === "orders" ? "active" : ""}`}
          onClick={() => setTab("orders")}
        >
          Kelola Pesanan
        </button>
      </div>

      {tab === "products" ? (
        <div className="admin-products">
          <section className="checkout-card admin-form-card">
            <h2>{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
            <form onSubmit={handleSubmitProduct} className="checkout-form">
              <div className="form-field">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama Produk"
                  required
                />
              </div>
              <div className="form-field">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="checkout-select"
                >
                  <option value="tenda">Tenda</option>
                  <option value="tas">Tas / Carrier</option>
                  <option value="sepatu">Sepatu</option>
                  <option value="peralatan">Peralatan / Kompor</option>
                  <option value="jaket">Jaket</option>
                  <option value="lampu">Lampu / Headlamp</option>
                </select>
              </div>
              <div className="form-field">
                <input
                  type="number"
                  name="buyPrice"
                  value={form.buyPrice}
                  onChange={handleChange}
                  placeholder="Harga Beli"
                  required
                />
              </div>
              <div className="form-field">
                <input
                  type="number"
                  name="rentPrice"
                  value={form.rentPrice}
                  onChange={handleChange}
                  placeholder="Harga Sewa / hari"
                  required
                />
              </div>
              <div className="form-field">
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Stok"
                  required
                />
              </div>
              <div className="form-field">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Deskripsi (opsional)"
                  rows="3"
                />
              </div>
              <div className="admin-form-actions">
                <button type="submit" disabled={saving} className="checkout-submit">
                  {saving ? "Menyimpan..." : editingId ? "Update Produk" : "Tambah Produk"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={resetForm}
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="checkout-card">
            <h2>Daftar Produk ({products.length})</h2>
            {productsQuery.loading ? (
              <div className="page-state">
                <div className="spinner"></div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Beli</th>
                    <th>Sewa</th>
                    <th>Stok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id || product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>Rp {formatRupiah(product.buyPrice)}</td>
                      <td>Rp {formatRupiah(product.rentPrice)}</td>
                      <td>{product.stock}</td>
                      <td className="table-actions">
                        <button onClick={() => startEdit(product)}>Edit</button>
                        <button onClick={() => handleDeleteProduct(product.id || product._id)}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      ) : (
        <section className="checkout-card">
          <h2>Daftar Pesanan ({orders.length})</h2>
          {ordersQuery.loading ? (
            <div className="page-state">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="empty-note">Belum ada pesanan.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Nama</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customer?.name}</td>
                    <td>Rp {formatRupiah(order.totalAmount)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleChangeStatus(order.orderNumber, e.target.value)}
                        className="checkout-select"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <a
                        href={`/order/${order.orderNumber}`}
                        className="order-detail-link"
                      >
                        Detail →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
}