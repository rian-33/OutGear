// Ganti URL ini jika backend Anda berjalan di port yang berbeda
const API_URL = "http://localhost:5000/api";

// 1. Fungsi untuk mengambil SEMUA produk (Katalog)
export async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(
      `${API_URL}/products${query ? `?${query}` : ""}`,
    );

    if (!response.ok) throw new Error("Gagal mengambil data produk");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// 2. Fungsi untuk mengambil SATU produk (Halaman Detail)
export async function getProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);

    if (!response.ok) throw new Error("Produk tidak ditemukan");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// 3. FUNGSI BARU: Menghitung Ongkos Kirim (Halaman Checkout)
export async function calculateDeliveryFee(data) {
  try {
    // Pada aplikasi nyata, ini bisa menembak API kurir.
    // Untuk saat ini kita asumsikan backend akan mengembalikan tarif statis atau berbasis jarak.
    const response = await fetch(`${API_URL}/checkout/delivery-fee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Gagal menghitung ongkos kirim");
    return await response.json();
  } catch (error) {
    console.error("Error calculating delivery fee:", error);
    return { fee: 0 }; // Fallback jika gagal
  }
}

// 4. FUNGSI BARU: Membuat Pesanan Baru (Halaman Checkout)
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Gagal membuat pesanan");
    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
