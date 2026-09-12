// Mengambil URL dari environment variable Vite, atau gunakan localhost sebagai fallback
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "outgear_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

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
  const token = getToken();
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (text) data = { message: text };
    }

    if (!response.ok) {
      throw new APIError(
        data?.message || `HTTP ${response.status}`,
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
  getProducts: (filters = {}, options = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/products?${params}`, options);
  },

  getProductById: (id, options = {}) => {
    return apiCall(`/products/${id}`, options);
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
  createOrder: (orderData, options = {}) => {
    return apiCall("/checkout", {
      method: "POST",
      body: JSON.stringify(orderData),
      ...options,
    });
  },

  getOrder: (orderNo, options = {}) => {
    return apiCall(`/checkout/${orderNo}`, options);
  },

  getMyOrders: (params = {}, options = {}) => {
    const query = new URLSearchParams(params);
    return apiCall(`/checkout/orders/me?${query}`, options);
  },

  payOrder: (orderNo) => {
    return apiCall(`/checkout/${orderNo}/pay`, { method: "POST" });
  },

  cancelOrder: (orderNo) => {
    return apiCall(`/checkout/${orderNo}/cancel`, { method: "POST" });
  },

  // Admin: orders
  getAllOrders: (params = {}) => {
    const query = new URLSearchParams(params);
    return apiCall(`/checkout/orders?${query}`);
  },

  updateOrderStatus: (orderNo, status) => {
    return apiCall(`/checkout/orders/${orderNo}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Auth
  register: (data) => {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: (data) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe: () => {
    return apiCall("/auth/me");
  },

  updateMe: (data) => {
    return apiCall("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};