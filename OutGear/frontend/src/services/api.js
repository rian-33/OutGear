// Mengambil URL dari environment variable Vite, atau gunakan localhost sebagai fallback
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Kelas khusus untuk menangani error dari API
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Fungsi utama (generic) untuk melakukan fetch dengan penanganan error otomatis
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) throw error;

    throw new APIError(error.message || "Network error", null, error);
  }
}

// Mengekspor objek 'api' yang berisi kumpulan fungsi untuk dipanggil oleh komponen React
export const api = {
  // Produk
  getProducts: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/products?${params}`);
  },

  getProductById: (id) => {
    return apiCall(`/products/${id}`);
  },

  createProduct: (data) => {
    return apiCall("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProduct: (id, data) => {
    return apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteProduct: (id) => {
    return apiCall(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Checkout & Order
  createOrder: (orderData) => {
    return apiCall("/checkout", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  getOrder: (orderNo) => {
    return apiCall(`/checkout/${orderNo}`);
  },
};
