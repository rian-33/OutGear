# 🏗️ ARCHITECTURE & DESIGN PATTERNS - OutGear

## 📊 SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           OUTGEAR E-COMMERCE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐          ┌──────────────────────────────┐
│      FRONTEND (React + Vite)     │          │   BACKEND (Express.js)       │
├──────────────────────────────────┤          ├──────────────────────────────┤
│                                  │          │                              │
│  App.jsx (Root)                  │◄────────►│  server.js                   │
│   ├─ Navbar.jsx                  │   HTTP   │   ├─ Express Setup           │
│   │  └─ CartContext Provider     │   /API   │   ├─ Middleware              │
│   ├─ Routes                      │          │   └─ DB Connection           │
│   │  ├─ Home.jsx                 │          │                              │
│   │  ├─ Products.jsx ◄───────────┼──────────┼─► productRoutes.js           │
│   │  ├─ ProductDetail.jsx ◄──────┼──────────┼─► GET /api/products          │
│   │  │   └─ ProductCard.jsx      │   JSON   │   GET /api/products/:id      │
│   │  └─ Checkout.jsx ◄───────────┼──────────┼─► checkoutRoutes.js          │
│   │                              │          │   POST /api/checkout         │
│   ├─ Context API                 │          │                              │
│   │  └─ CartContext.jsx          │          │  Controllers:                │
│   │     └─ useCart()             │          │   ├─ productController.js    │
│   │                              │          │   └─ checkoutController.js   │
│   ├─ Services                    │          │                              │
│   │  └─ api.js (fetch calls)     │          │  Models (Mongoose):          │
│   │     ├─ getProducts()         │          │   ├─ Product.js              │
│   │     ├─ getProductById()      │          │   └─ Order.js                │
│   │     └─ createOrder()         │          │                              │
│   │                              │          │  Utils:                      │
│   └─ styles.css (Global CSS)     │          │   ├─ distance.js             │
│      └─ Component CSS            │          │   └─ lateFee.js              │
│                                  │          │                              │
└──────────────────────────────────┘          └──────────────────────────────┘
         │                                                     │
         │                                                     ▼
         │                                         ┌──────────────────────┐
         │                                         │   MongoDB Database   │
         │                                         ├──────────────────────┤
         │                                         │                      │
         │                                         │ Collections:         │
         └────────────────────────────────────────►│  - products          │
                  (Static Files)                   │  - orders            │
                                                   │  - users (future)    │
                                                   │  - reviews (future)  │
                                                   └──────────────────────┘
```

---

## 🔄 DATA FLOW - HOME PAGE

```
User Opens https://outgear.com/
    │
    ▼
┌────────────────────────────────┐
│      App.jsx Mounts            │
├────────────────────────────────┤
│ - Render SplashScreen          │
│ - Render Navbar                │
│ - Render Routes                │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│       Home.jsx Mounts          │
├────────────────────────────────┤
│ - useEffect(() => {            │
│     fetch /api/products        │
│   }, [])                       │
└────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Backend: productController.js   │
├─────────────────────────────────┤
│ getProducts()                   │
│  - Parse query params           │
│  - Build MongoDB filter         │
│  - Execute: Product.find()      │
│  - Return JSON array            │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│   MongoDB Database              │
├─────────────────────────────────┤
│ Find matching products          │
│ Return: [{id, name, ...}, ...]  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Frontend: Products Response    │
├─────────────────────────────────┤
│ setProducts(data)               │
│  - setState triggers re-render  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Render Product Grid            │
├─────────────────────────────────┤
│ products.map(product => (       │
│   <ProductCard product={} />    │
│ ))                              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│   User Sees Featured Products   │
│   - Tenda, Sepatu, Tas, Gear   │
│   - Click card → Detail page    │
└─────────────────────────────────┘
```

---

## 🛒 DATA FLOW - ADD TO CART

```
User Clicks "Add to Cart" Button
    │
    ▼
┌──────────────────────────────┐
│  ProductCard.jsx onClick     │
├──────────────────────────────┤
│ Call: cartContext.addItem({  │
│   id: product.id,            │
│   name: product.name,        │
│   price: product.rentPrice,  │
│   quantity: 1,               │
│   type: "rental"             │
│ })                           │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│  CartContext.jsx             │
├──────────────────────────────┤
│ const addItem = (item) => {  │
│   setCart([...cart, item])   │
│   // Update global state     │
│ }                            │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│  Navbar.jsx Re-renders       │
├──────────────────────────────┤
│ <span className="badge">     │
│   {cart.length}              │
│ </span>                      │
│                              │
│ Badge updates: "1", "2", etc │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│  ProductCard Button State    │
├──────────────────────────────┤
│ Shows: "✅ Added to Cart"    │
│ Button becomes disabled      │
└──────────────────────────────┘
```

---

## 💳 DATA FLOW - CHECKOUT TO DATABASE

```
User Fills Checkout Form & Clicks "Buat Pesanan"
    │
    ▼
┌────────────────────────────────┐
│   Checkout.jsx Validation      │
├────────────────────────────────┤
│ validateForm()                 │
│  - Check name, email, phone    │
│  - Check address              │
│  - Check cart not empty       │
│                               │
│ If errors: Show error messages │
│ If valid: Continue            │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│   api.js - createOrder()       │
├────────────────────────────────┤
│ POST /api/checkout             │
│ Body: {                        │
│   customer: {...},            │
│   items: [...],               │
│   total: 1500000,             │
│   paymentMethod: "cc"         │
│ }                             │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│   Backend: checkoutRoutes.js   │
├────────────────────────────────┤
│ router.post("/", (req) => {   │
│   // Validate request body    │
│   // Process payment (later)  │
│   // Create Order document    │
│ })                            │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│   checkoutController.js        │
├────────────────────────────────┤
│ createOrder()                  │
│  - Validate data              │
│  - Create Order doc:          │
│    {                          │
│      orderNo: "ORD-xxx",      │
│      customer: {...},         │
│      items: [...],            │
│      status: "pending"        │
│    }                          │
│  - order.save()               │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│   MongoDB: orders collection   │
├────────────────────────────────┤
│ Insert document:              │
│ {                             │
│   _id: ObjectId,              │
│   orderNo: "ORD-20260903-001",│
│   customer: {...},            │
│   items: [{...}],             │
│   totalPrice: 1500000,        │
│   status: "pending",          │
│   createdAt: timestamp        │
│ }                             │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│   Response to Frontend         │
├────────────────────────────────┤
│ {                             │
│   success: true,              │
│   message: "Order created",   │
│   data: {                     │
│     orderNo: "ORD-...",       │
│     totalPrice: 1500000       │
│   }                           │
│ }                             │
└────────────────────────────────┘
    │
    ▼
┌────────────────────────────────┐
│   Frontend Success State       │
├────────────────────────────────┤
│ - Show success message        │
│ - Clear cart                  │
│ - Redirect to confirmation   │
│   page after 1.5s            │
└────────────────────────────────┘
```

---

## 🏛️ DESIGN PATTERNS USED

### **1. COMPONENT COMPOSITION**
```
App (Root)
  │
  ├─ Navbar (Header)
  │  └─ CartBadge (Child Component)
  │
  ├─ Routes (Container)
  │  ├─ Home (Page)
  │  │  ├─ HeroSection
  │  │  ├─ CategoryGrid
  │  │  │  └─ CategoryCard × 4
  │  │  └─ ProductCarousel
  │  │     └─ ProductCard × N
  │  │
  │  ├─ Products (Page)
  │  │  ├─ FilterSidebar
  │  │  └─ ProductGrid
  │  │     └─ ProductCard × N
  │  │
  │  ├─ ProductDetail (Page)
  │  │  └─ ProductDetails
  │  │
  │  └─ Checkout (Page)
  │     ├─ OrderSummary
  │     └─ CheckoutForm
  │
  └─ Footer
     ├─ FooterLinks
     └─ SocialLinks
```

**Benefit**: 
- Reusable components (ProductCard used in multiple pages)
- Easy to test individual components
- Clear hierarchy & maintainability

---

### **2. CONTEXT API PATTERN (Global State)**
```javascript
// Provider Wrapper
<CartProvider>
  <App />
</CartProvider>

// Child Component
function Navbar() {
  const { cart, addItem, removeItem } = useCart();
  return <span className="badge">{cart.length}</span>;
}

// Other Component
function Checkout() {
  const { cart, clearCart } = useCart();
  return <div>{cart.map(item => ...)}</div>;
}
```

**Benefit**: 
- Avoid prop drilling
- Shared state across components
- Easy to manage cart, user auth, themes

---

### **3. CUSTOM HOOKS PATTERN**
```javascript
// Custom hook encapsulates logic
export function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch logic here
  }, [url]);
  
  return { data, loading };
}

// Usage
const { data: products, loading } = useApi("/api/products");
```

**Benefit**: 
- Reusable logic without duplication
- Separation of concerns
- Easy to test

---

### **4. SERVICE LAYER PATTERN**
```javascript
// api.js acts as service layer
export const api = {
  getProducts: (filters) => fetch(...),
  getProductById: (id) => fetch(...),
  createOrder: (data) => fetch(...)
};

// Components don't directly call fetch
// They use api service
const data = await api.getProducts({ category: "tent" });
```

**Benefit**: 
- Centralized API calls
- Easy to change API endpoints
- Consistent error handling
- Testable

---

### **5. CONTROLLER PATTERN (Backend)**
```javascript
// Routes delegate to controllers
router.get("/:id", getProductById);

// Controller has business logic
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.json(product);
};
```

**Benefit**: 
- Separation of routing & logic
- Reusable controller functions
- Clean, testable code

---

### **6. MVC ARCHITECTURE**
```
Model       → MongoDB Schemas (Product, Order)
View        → React Components (ProductCard, Checkout)
Controller  → productController.js, checkoutController.js

Data Flow:
View (ProductCard) 
  → Call API (api.js)
    → Route (productRoutes.js) 
      → Controller (productController.js) 
        → Model (Product.findById)
          → Database (MongoDB)
```

**Benefit**: 
- Organized code structure
- Clear separation of concerns
- Easy to maintain & scale

---

## 📦 MODULE DEPENDENCIES

```
cartContext.jsx                  
  ├─ Uses: React (useState, createContext)
  
Navbar.jsx
  ├─ Imports: CartContext, useCart hook
  ├─ Uses: Router (useNavigate, Link)
  └─ Displays: cart.length

ProductCard.jsx
  ├─ Props: product object
  ├─ Uses: React hooks (useState)
  └─ Calls: navigate to detail

Home.jsx
  ├─ Imports: ProductCard
  ├─ Imports: api service
  ├─ Uses: useApi hook
  └─ Renders: Featured products

Products.jsx
  ├─ Imports: ProductCard
  ├─ Imports: api service
  ├─ Uses: useApi hook
  └─ Features: Filter, sorting, search

ProductDetail.jsx
  ├─ Imports: api service
  ├─ Uses: useParams, useCart
  ├─ Uses: useApi hook
  └─ Calls: addItem to cart

Checkout.jsx
  ├─ Imports: api service
  ├─ Uses: useCart, useNavigate
  ├─ Validates: form data
  └─ Calls: api.createOrder()

api.js (Service Layer)
  ├─ Exports: api object with methods
  ├─ Uses: Fetch API
  └─ Error handling

Backend Server.js
  ├─ Sets up: Express app
  ├─ Connects: MongoDB
  └─ Loads: Routes & middleware

productRoutes.js
  ├─ Imports: Controllers
  └─ Defines: GET, POST, PUT, DELETE

productController.js
  ├─ Imports: Product model
  ├─ Implements: Business logic
  └─ Exports: Handler functions

Product.js (Model)
  ├─ Imports: Mongoose
  ├─ Defines: Schema
  └─ Exports: Model
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
┌──────────────────┐         ┌──────────────────┐
│   Development    │         │    Production    │
├──────────────────┤         ├──────────────────┤
│                  │         │                  │
│ Frontend:        │         │ Frontend:        │
│ npm run dev      │         │ Vite build       │
│ localhost:5173   │         │ CDN (Vercel, etc)│
│                  │         │                  │
│ Backend:         │         │ Backend:         │
│ npm run dev      │         │ Node.js server   │
│ localhost:5000   │         │ (Heroku, Railway)│
│                  │         │                  │
│ Database:        │         │ Database:        │
│ Local MongoDB    │         │ MongoDB Atlas    │
└──────────────────┘         └──────────────────┘

Frontend Build Process:
  npm run build
    ↓
  Vite bundles + minifies
    ↓
  dist/ folder
    ↓
  Deploy to Vercel/Netlify
    ↓
  https://outgear.com

Backend Deployment:
  Push to GitHub
    ↓
  Heroku/Railway detects push
    ↓
  npm install & npm start
    ↓
  Server runs on https://api.outgear.com

Database:
  MongoDB Atlas cloud
    ↓
  https://mongodb.com/cloud
```

---

## 🔐 ENVIRONMENT VARIABLES

### **Frontend (.env)**
```bash
VITE_API_URL=http://localhost:5000/api  # Development
VITE_API_URL=https://api.outgear.com/api # Production
```

### **Backend (.env)**
```bash
MONGO_URI=mongodb://localhost:27017/outgear  # Development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/outgear # Production

PORT=5000
NODE_ENV=development

# Payment gateway (future)
STRIPE_SECRET_KEY=sk_test_xxx

# Email service (future)
SENDGRID_API_KEY=sg_xxx
```

---

## 📚 QUICK REFERENCE - FILE PURPOSES

| File | Purpose | Key Function |
|------|---------|--------------|
| **App.jsx** | Root component, routing setup | Render Routes, Footer, WhatsApp button |
| **Navbar.jsx** | Header navigation | Display nav links, cart badge |
| **Home.jsx** | Landing page | Show hero, categories, featured products |
| **Products.jsx** | Product catalog | List all products with filters |
| **ProductDetail.jsx** | Individual product | Show details, add to cart |
| **Checkout.jsx** | Order confirmation | Collect customer data, create order |
| **CartContext.jsx** | Global cart state | Manage cart items globally |
| **api.js** | API service layer | Centralize fetch calls |
| **server.js** | Express setup | Initialize app, DB connection |
| **productRoutes.js** | Product API endpoints | Define GET, POST, etc |
| **productController.js** | Business logic | Query database, return data |
| **Product.js** | MongoDB schema | Define product structure |
| **Order.js** | MongoDB schema | Define order structure |
| **styles.css** | Global styling | CSS variables, responsive design |

---

**Architecture Version**: 1.0 | **Updated**: 2026
