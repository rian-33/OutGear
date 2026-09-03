# 📊 ANALISIS PROJECT OUTGEAR

## 🎯 RINGKASAN PROJECT
**OutGear** adalah aplikasi e-commerce untuk penjualan dan penyewaan peralatan outdoor. Project ini menggunakan **React + Vite** untuk frontend dan **Express.js + MongoDB** untuk backend.

---

## 📁 STRUKTUR FOLDER & PENJELASAN FILE

### **FRONTEND (`/frontend`)**

```
frontend/
├── src/
│   ├── components/          # Komponen UI reusable
│   │   ├── Navbar.jsx       # Header navigasi (logo, menu, cart)
│   │   ├── ProductCard.jsx  # Kartu produk individual
│   │   └── SplashScreen.jsx # Splash screen loading
│   ├── pages/               # Halaman utama aplikasi
│   │   ├── Home.jsx         # Halaman utama (hero, kategori, promo)
│   │   ├── Products.jsx     # Halaman katalog semua produk
│   │   ├── ProductDetail.jsx # Halaman detail produk individual
│   │   └── Checkout.jsx     # Halaman keranjang & checkout
│   ├── context/             # State management global
│   │   └── CartContext.jsx  # Context untuk mengelola keranjang belanja
│   ├── services/            # API calls & data fetching
│   │   └── api.js           # Fungsi untuk komunikasi dengan backend
│   ├── assets/              # Gambar & media
│   │   ├── logo.png, gear.png, sepatu.png, tas.png, tenda.png
│   │   └── Icon-icon fitur lainnya
│   ├── styles.css           # CSS global untuk seluruh aplikasi
│   ├── main.jsx             # Entry point React
│   └── App.jsx              # Root component dengan routing & footer
├── vite.config.js           # Konfigurasi Vite bundler
├── index.html               # HTML template utama
├── package.json             # Dependencies & scripts
└── node_modules/            # Dependency packages
```

### **BACKEND (`/backend`)**

```
backend/
├── src/
│   ├── server.js            # Setup koneksi MongoDB & Express app
│   ├── routes/              # API endpoints
│   │   ├── productRoutes.js # Routes untuk produk (GET, POST)
│   │   └── checkoutRoutes.js # Routes untuk checkout/order
│   ├── controllers/         # Business logic handler
│   │   └── productController.js # Logic untuk produk queries
│   ├── models/              # Database schemas (Mongoose)
│   │   ├── Product.js       # Schema untuk produk (nama, harga, dll)
│   │   └── Order.js         # Schema untuk order/checkout
│   ├── data/                # Data statis atau seed data
│   │   └── products.js      # Data produk hardcoded (untuk testing)
│   ├── utils/               # Utility functions
│   │   ├── distance.js      # Hitung jarak antara koordinat
│   │   └── lateFee.js       # Hitung denda keterlambatan rental
│   └── seed.js              # Script untuk populate database
├── package.json             # Dependencies (Express, Mongoose, Cors, Dotenv)
└── node_modules/            # Dependency packages
```

---

## 🔄 HUBUNGAN ANTAR FILE & FLOW DATA

### **1. USER FLOW HALAMAN HOME**
```
User klik link "/"
    ↓
Home.jsx (render halaman)
    ↓
├─ Hero Banner (gambar, CTA "Belanja Sekarang")
├─ Kategori Section (Tenda, Sepatu, Tas, Gear)
├─ Featured Products (ProductCard.jsx × N)
│   └─ ProductCard.jsx (tampilkan 1 produk)
│       └─ useState untuk hover effects
│       └─ onClick → navigate ke /product/:id
└─ Tentang Kami Section (fitur, testimonial)

Navbar.jsx (sticky header)
    ├─ Logo (link ke home)
    ├─ Nav Links (Home, Katalog, Kategori, Tentang)
    └─ Cart Badge (dari CartContext)
```

### **2. USER FLOW KATALOG PRODUK**
```
User klik "Katalog" atau lihat semua produk
    ↓
Products.jsx
    ├─ useEffect → memanggil api.js → GET /api/products
    │   └─ Kirim query: category, maxPrice, search, sort
    ├─ Backend:
    │   productController.js
    │   ├─ Parse query parameters
    │   ├─ Build MongoDB filter
    │   └─ Return filtered products array
    │
    ├─ Map hasil ke ProductCard.jsx
    │   ├─ Tampilkan grid produk
    │   ├─ Filter & sorting UI
    │   └─ onClick → ProductDetail.jsx
    │
└─ CartContext.addItem() → update state
```

### **3. USER FLOW DETAIL PRODUK**
```
User klik ProductCard
    ↓
ProductDetail.jsx (/product/:id)
    ├─ Extract :id dari URL params (useParams)
    ├─ useEffect → api.getProductById(id)
    │   └─ Backend: productController.getProductById()
    │       └─ Find product by id di MongoDB
    ├─ Render:
    │   ├─ Gambar produk (carousel/gallery)
    │   ├─ Nama, deskripsi, rating
    │   ├─ Harga rental & beli
    │   ├─ Durasi rental (pilih tanggal)
    │   └─ Tombol "Sewa" atau "Beli" 
    │
    └─ onClick "Sewa/Beli"
        └─ CartContext.addItem({id, qty, type, dates})
        └─ Redirect ke Checkout.jsx
```

### **4. USER FLOW CHECKOUT**
```
Checkout.jsx (/checkout)
    ├─ Ambil items dari CartContext
    ├─ Render checkout form:
    │   ├─ Ringkasan items (qty × harga)
    │   ├─ Form input (nama, email, alamat, no telp)
    │   ├─ Pilihan pembayaran
    │   └─ Calculate: subtotal, pajak, diskon, total
    │
    └─ onClick "Pesan"
        ├─ Validate form
        ├─ POST ke /api/checkout (api.js)
        │   └─ Backend: checkoutRoutes.js
        │       ├─ Validate data
        │       ├─ Create Order document di MongoDB
        │       ├─ Update Product stock (jika beli)
        │       └─ Return order details
        ├─ CartContext.clearCart()
        └─ Show success message
```

---

## 💻 PENJELASAN KODE REACT & JAVASCRIPT

### **A. REACT HOOKS YANG DIGUNAKAN**

#### **1. useState** - State Management lokal
```jsx
// Contoh: ProductCard.jsx
const [hovered, setHovered] = useState(false);

return (
  <div
    className="product-card"
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
    {hovered && <div className="overlay">Detail</div>}
  </div>
);
```
**Penjelasan**: Menyimpan state lokal untuk UI interaktif (hover effects)

---

#### **2. useEffect** - Side effects & data fetching
```jsx
// Contoh: Products.jsx
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ category, maxPrice, sort });
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };
  
  fetchProducts();
}, [category, maxPrice, sort]); // Dependencies array - jalankan ulang jika berubah
```
**Penjelasan**: Fetch data saat component mount atau dependencies berubah

---

#### **3. useContext** - Global state dari CartContext
```jsx
// Contoh: Navbar.jsx
import { useCart } from "../context/CartContext.jsx";

const { cart, addItem, removeItem } = useCart();

return (
  <span className="badge">{cart.length}</span> // Jumlah item di cart
);
```
**Penjelasan**: Akses global cart state dari parent context

---

#### **4. useParams** - Ambil URL parameters
```jsx
// Contoh: ProductDetail.jsx
import { useParams } from "react-router-dom";

const { id } = useParams(); // Dari URL /product/:id

useEffect(() => {
  api.getProductById(id).then(setProduct);
}, [id]);
```
**Penjelasan**: Extract dynamic route parameters

---

#### **5. useNavigate** - Programmatic routing
```jsx
// Contoh: ProductCard.jsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const handleDetailClick = () => {
  navigate(`/product/${product.id}`);
};
```
**Penjelasan**: Navigate ke halaman lain secara programmatic

---

### **B. CONTEXT API - CartContext.jsx**

```jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addItem = (item) => {
    setCart(prev => [...prev, item]);
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan dalam CartProvider");
  }
  return context;
}
```

**Penjelasan**:
- **createContext()**: Buat context object untuk global state
- **Provider**: Wrap aplikasi dengan context provider di main.jsx
- **useContext()**: Hook untuk akses context value
- **Custom hook useCart()**: Convenience wrapper dengan error handling

---

### **C. ASYNC/AWAIT & FETCH API**

```javascript
// api.js - Service layer untuk API calls
export const api = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/products?${params}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  },

  getProductById: async (id) => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) throw new Error("Product not found");
    return response.json();
  },

  createOrder: async (orderData) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error("Order failed");
    return response.json();
  }
};
```

**Penjelasan**:
- **async/await**: Syntax cleaner untuk promises
- **fetch()**: Buat HTTP request
- **URLSearchParams**: Build query string dari object
- **Error handling**: Check response.ok sebelum parse JSON

---

### **D. ARRAY METHODS PENTING**

```javascript
// map() - Transform array
products.map(product => <ProductCard key={product.id} product={product} />)

// filter() - Filter items (remove dari cart)
cart.filter(item => item.id !== idToRemove)

// reduce() - Hitung total harga
cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

// find() - Cari satu item
cart.find(item => item.id === targetId)

// some() / every() - Check conditions
cart.some(item => item.type === "rental") // Ada item rental?
```

---

### **E. DESTRUCTURING & SPREAD OPERATOR**

```jsx
// Destructuring (extract properties)
const { category, maxPrice, sort } = req.query;
const { cart, addItem } = useCart();
const { id } = useParams();

// Spread operator (...) - Copy & extend arrays/objects
setCart(prev => [...prev, newItem]); // Add item
const filters = { ...defaultFilters, category: "tent" }; // Override
```

---

## 🛠 BACKEND ARCHITECTURE

### **A. ROUTING FLOW**

```
Client request: GET /api/products?category=tent&maxPrice=100
    ↓
Express app (server.js)
    ├─ app.use("/api/products", productRoutes)
    └─ Match route "/" di productRoutes.js
        ↓
productRoutes.js
    ├─ router.get("/", getProducts)
    └─ Call controller function
        ↓
productController.js - getProducts()
    ├─ Parse req.query
    ├─ Build MongoDB filter
    ├─ Execute Product.find(filter)
    ├─ Return JSON response
    └─ res.json(products)
        ↓
Response: 200 OK + JSON array
    ↓
Client (Products.jsx)
    └─ setProducts(data)
```

---

### **B. MONGODB SCHEMAS**

#### **Product Schema**
```javascript
{
  _id: ObjectId,
  id: String (custom ID),
  name: String,
  description: String,
  category: "tenda" | "sepatu" | "tas" | "gear",
  images: [String],      // URLs
  rentPrice: Number,     // Harga sewa per hari
  buyPrice: Number,      // Harga beli
  stock: Number,
  rating: Number,
  reviews: [{ user, comment, rating }],
  createdAt: Date
}
```

#### **Order Schema**
```javascript
{
  _id: ObjectId,
  orderNo: String,
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    type: "rental" | "buy",
    rentalDates: { start: Date, end: Date },
    price: Number
  }],
  totalPrice: Number,
  paymentMethod: String,
  status: "pending" | "confirmed" | "shipped" | "delivered",
  createdAt: Date
}
```

---

## 🚀 OPTIMASI KODE - BISA DIKURANGI

### **ISSUE 1: Code Duplication - Fetch Logic**
**Current** (di setiap component):
```jsx
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch(url);
    const data = await response.json();
    setData(data);
  };
  fetchData();
}, [...]);
```

**Better** (Custom hook):
```jsx
// useApi.js - Reusable hook
export function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);
  
  return { data, loading };
}

// Usage di component:
const { data: products, loading } = useApi("/api/products");
```

**Benefit**: DRY principle, reusable logic

---

### **ISSUE 2: No Error Handling**
**Add try-catch & error states**:
```jsx
const [error, setError] = useState(null);

useEffect(() => {
  try {
    const data = await fetch(...).then(r => r.json());
    setProducts(data);
  } catch (err) {
    setError(err.message);
    console.error(err);
  }
}, []);

return error ? <div className="error">{error}</div> : <ProductList />;
```

---

### **ISSUE 3: Missing Form Validation**
**Checkout.jsx harus validate**:
```jsx
const validateForm = (formData) => {
  const errors = {};
  if (!formData.name?.trim()) errors.name = "Nama wajib diisi";
  if (!formData.email?.match(/@/)) errors.email = "Email invalid";
  if (formData.items.length === 0) errors.items = "Cart kosong";
  return Object.keys(errors).length === 0 ? null : errors;
};

const handleCheckout = () => {
  const errors = validateForm(formData);
  if (errors) {
    setErrors(errors);
    return;
  }
  // Submit order...
};
```

---

### **ISSUE 4: Backend Server Incomplete**
**Current server.js hanya punya MongoDB connection**

**Should add Express app setup**:
```javascript
import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

### **ISSUE 5: Route Definition Error**
**productRoutes.js mengimport `createProduct` tapi tidak didefine**:

```javascript
// CURRENT (ERROR)
import { getProducts, getProductById } from "...";
router.post("/", createProduct); // ❌ Not imported

// FIXED
import { getProducts, getProductById, createProduct } from "...";
// OR jika tidak ada:
// router.post("/", (req, res) => res.status(501).json({ message: "Not implemented" }));
```

---

## 🎨 UI/UX IMPROVEMENT - Gaya seperti areioutdoorgear.co.id

### **1. HERO SECTION IMPROVEMENT**
**Current**: Simple banner dengan text overlay

**Better**:
```jsx
// Home.jsx - Enhanced Hero
<section className="hero-modern">
  <div className="hero-bg">
    <video autoPlay muted loop>
      <source src={heroVideo} type="video/mp4" />
    </video>
  </div>
  <div className="hero-content">
    <h1>Petualangan Dimulai Di Sini</h1>
    <p>Sewa atau Beli Peralatan Outdoor Berkualitas Premium</p>
    <button className="btn-hero">Jelajahi Katalog</button>
  </div>
</section>

// CSS
.hero-modern {
  position: relative;
  height: 600px;
  overflow: hidden;
}
.hero-bg video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.5); // Dim video untuk readability
}
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  backdrop-filter: blur(10px);
}
```

---

### **2. PRODUCT CARD - HOVER EFFECTS**
```jsx
// ProductCard.jsx - Interactive hover
<div className="product-card-modern">
  <div className="product-image-wrapper">
    <img src={product.image} />
    <div className="overlay-quick-view">
      <button>Quick View</button>
      <button>Add to Cart</button>
    </div>
  </div>
  <div className="product-info">
    <h3>{product.name}</h3>
    <div className="product-rating">
      {'⭐'.repeat(product.rating)}
      <span>({product.reviews})</span>
    </div>
    <div className="product-prices">
      <span className="rent-price">💰 Sewa: Rp{product.rentPrice}/hari</span>
      <span className="buy-price">🛍️ Beli: Rp{product.buyPrice}</span>
    </div>
  </div>
</div>

// CSS
.product-card-modern {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
  height: 250px;
}

.overlay-quick-view {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card-modern:hover .overlay-quick-view {
  opacity: 1;
}
```

---

### **3. CATEGORY SECTION - VISUAL CARDS**
```jsx
// Home.jsx - Categories dengan icons & images
const categories = [
  { name: "Tenda", icon: "⛺", image: tentaImg, count: 24 },
  { name: "Sepatu", icon: "👟", image: sepatuImg, count: 18 },
  { name: "Tas", icon: "🎒", image: tasImg, count: 32 },
  { name: "Gear", icon: "🧗", image: gearImg, count: 15 }
];

return (
  <section id="kategori" className="categories-grid">
    {categories.map(cat => (
      <div key={cat.name} className="category-card">
        <img src={cat.image} alt={cat.name} />
        <h3>{cat.icon} {cat.name}</h3>
        <p>{cat.count} Produk</p>
        <Link to={`/products?category=${cat.name.toLowerCase()}`}>
          Lihat Semua →
        </Link>
      </div>
    ))}
  </section>
);

// CSS
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 40px 20px;
}

.category-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  group
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover img {
  transform: scale(1.1);
}

.category-card h3 {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 24px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
```

---

### **4. NAVBAR - STICKY HEADER**
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: var(--primary);
  transition: transform 0.2s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-links a, .nav-btn-link {
  color: var(--text-dark);
  font-weight: 500;
  transition: color 0.2s ease;
  border: none;
  background: none;
  cursor: pointer;
}

.nav-links a:hover, .nav-btn-link:hover {
  color: var(--primary);
}

.cart-badge-btn {
  position: relative;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border-radius: 24px;
  transition: background 0.2s ease;
}

.cart-badge-btn:hover {
  background: var(--accent);
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--accent);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
```

---

### **5. FOOTER - MODERN LAYOUT**
**Your footer structure sudah bagus! Tips untuk improve**:
```css
.footer-complex {
  background: linear-gradient(135deg, #1b5e3f 0%, #0d3829 100%);
  color: white;
  padding: 60px 40px 20px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto 40px;
}

.footer-brand h2,
.footer-links h4,
.footer-contact h4,
.footer-social h4 {
  margin-bottom: 16px;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 8px;
}

.footer-links a,
.footer-contact a,
.footer-social a {
  display: block;
  margin-bottom: 12px;
  color: #ddd;
  transition: color 0.2s ease;
}

.footer-links a:hover,
.footer-contact a:hover,
.footer-social a:hover {
  color: var(--accent);
}

.float-wa {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: #25d366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  animation: float 3s ease-in-out infinite;
  transition: transform 0.2s ease;
}

.float-wa:hover {
  transform: scale(1.1);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## 📈 IMPROVEMENT ROADMAP

### **Priority 1 (CRITICAL)**
- [ ] Fix server.js - Add Express app setup
- [ ] Fix productRoutes.js - Import missing createProduct atau hapus
- [ ] Add form validation di Checkout.jsx
- [ ] Add error handling & loading states

### **Priority 2 (HIGH)**
- [ ] Create useApi custom hook untuk eliminate code duplication
- [ ] Add MongoDB indexes untuk performa
- [ ] Implement pagination untuk Products page
- [ ] Add unit tests (Jest)

### **Priority 3 (MEDIUM - UI/UX)**
- [ ] Add hero video/carousel
- [ ] Improve category cards dengan images
- [ ] Add product quick view modal
- [ ] Add wishlist feature
- [ ] Improve mobile responsive design

### **Priority 4 (LOW)**
- [ ] Add reviews/ratings system
- [ ] Implement real payment gateway
- [ ] Add admin dashboard
- [ ] Setup CI/CD pipeline

---

## 🔑 KEY CONCEPTS SUMMARY

| Concept | Purpose | Example |
|---------|---------|---------|
| **React Hooks** | Manage state & side effects | useState, useEffect, useContext |
| **Context API** | Global state (cart) | CartContext + useCart hook |
| **React Router** | Page navigation | BrowserRouter, Routes, Link, useParams |
| **Fetch API** | HTTP requests | fetch(url), .then(), async/await |
| **Array Methods** | Data transformation | map, filter, reduce, find |
| **ES6 Features** | Modern syntax | const/let, arrow functions, template literals, destructuring |
| **Express Routing** | Backend endpoints | app.use(), router.get(), router.post() |
| **MongoDB Schemas** | Data structure | Mongoose models dengan validation |
| **Async/Await** | Handle promises | async functions, try/catch |

---

## 📞 KESIMPULAN

**OutGear** adalah e-commerce project yang solid dengan struktur baik, tapi masih memiliki ruang improvement dalam:
1. **Code quality** - Eliminate duplication, add error handling
2. **Backend** - Complete Express setup & middleware
3. **UI/UX** - Modern design patterns seperti referensi website
4. **Performance** - Custom hooks, lazy loading, pagination
5. **Testing** - Unit & integration tests

Total lines of code yang bisa dikurangi: **~200-300 lines** dengan abstraksi yang tepat, tanpa mengorbankan functionality.

---

**Generated**: 2026 | **Version**: 1.0
