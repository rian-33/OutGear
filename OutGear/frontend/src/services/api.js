const API = "http://localhost:5000/api";

export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API}/products${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error("Gagal mengambil produk");
  return response.json();
}

export async function calculateDeliveryFee(payload) {
  const response = await fetch(`${API}/checkout/delivery-fee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Gagal menghitung pengiriman");
  return response.json();
}

export async function createOrder(payload) {
  const response = await fetch(`${API}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Gagal membuat pesanan");
  return response.json();
}
