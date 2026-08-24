# Design System - OutGear Hiking Equipment Store

## 🎯 Visi Desain
Website e-commerce profesional untuk penjualan peralatan hiking dengan tampilan modern, intuitif, dan mendorong konversi. Desain mencerminkan petualangan, keandalan, dan kualitas produk hiking berkelas premium.

---

## 📊 Arsitektur Visual

### Palet Warna Utama

```
Primary Colors:
├─ Deep Forest Green: #1B5E3F (Brand Primary)
│  └─ Usage: Header, CTA buttons, active states
├─ Charcoal Gray: #2C3E50 (Text & Dark Elements)
│  └─ Usage: Body text, navigation, product titles
├─ Warm Earth: #D4845C (Accent Color)
│  └─ Usage: Highlights, price tags, hover states
└─ Off-White: #F8F9FA (Background)
   └─ Usage: Main background, cards, sections

Secondary Colors:
├─ Light Sage: #E8F5E9 (Success/New badge)
├─ Burnt Orange: #E8714D (Sale/Discount badge)
├─ Sky Blue: #4A90E2 (Information, Reviews)
└─ Sunset Gold: #F5A623 (Premium tier, stars)
```

### Tipografi

```
Font Stack:
├─ Headers (H1-H3): 'Montserrat Bold', sans-serif
│  ├─ H1: 48px, weight 700, line-height 1.2
│  ├─ H2: 36px, weight 700, line-height 1.3
│  └─ H3: 24px, weight 600, line-height 1.4
│
├─ Subheadings (H4-H6): 'Montserrat SemiBold', sans-serif
│  ├─ H4: 20px, weight 600
│  └─ H5/H6: 16px, weight 600
│
└─ Body Text: 'Inter Regular', sans-serif
   ├─ Regular: 16px, weight 400, line-height 1.6
   ├─ Small: 14px, weight 400, line-height 1.5
   └─ Tiny: 12px, weight 400, line-height 1.4
```

---

## 🏗️ Layout & Grid System

### Base Grid
- **12-column responsive grid**
- Desktop: 1920px / 1366px (max-width)
- Tablet: 768px
- Mobile: 375px
- Gutter: 24px (desktop), 16px (tablet), 12px (mobile)

### Spacing System
```
8px base unit
├─ xs: 4px
├─ sm: 8px
├─ md: 16px
├─ lg: 24px
├─ xl: 32px
├─ 2xl: 48px
└─ 3xl: 64px
```

---

## 📱 Struktur Halaman Utama

### 1. HEADER (Navigasi Tetap)

**Desktop Layout (1920px):**
```
┌─────────────────────────────────────────────────┐
│  LOGO    │  SEARCH BAR    │  CART  │  ACCOUNT  │
│ OutGear  │ [Cari produk]  │  (3)   │  [Profil] │
└─────────────────────────────────────────────────┘
│ HOME │ KATALOG │ KATEGORI │ TENTANG │ KONTAK │
└─────────────────────────────────────────────────┘
```

**Elemen-elemen Header:**
- **Logo**: 40px height, custom brand font dengan ikon gunung
- **Search Bar**: Full-width, placeholder "Cari alat hiking..."
  - Icon pencarian pada kanan
  - Suggestions dropdown dengan recent searches
  - Debounce 300ms untuk real-time search
- **Wishlist Icon**: Badge dengan jumlah items
- **Shopping Cart**: Animated cart icon dengan item counter
- **User Account**: Profile dropdown dengan login/signup options

**Mobile Header:**
- Hamburger menu dengan slide-in navigation
- Logo centered
- Search di bawah logo
- Sticky header saat scroll

### 2. HERO SECTION

**Desktop Visual (Full Width):**
```
┌────────────────────────────────────────────────┐
│                                                │
│  [Hero Background Image]                       │
│  - Stunning mountain landscape / hiking scene   │
│  - Overlay gradient (0,0,0,0.3)                │
│                                                │
│     🏔️ "JELAJAHI ALAM DENGAN PERLENGKAPAN     │
│        TERBAIK"                                │
│                                                │
│     Peralatan hiking premium untuk pendaki    │
│     profesional dan pemula                     │
│                                                │
│     [BELANJA SEKARANG]  [PELAJARI LEBIH]      │
│                                                │
└────────────────────────────────────────────────┘
```

**Technical Specs:**
- Height: 600px (desktop), 400px (tablet), 300px (mobile)
- Background image: 2000x1200px optimized, lazy-loaded
- Hero text centered dengan text-shadow untuk readability
- CTA buttons dengan hover animation (scale 1.05)
- Parallax scroll effect pada background image

### 3. KATEGORI PRODUK (Browse Section)

**Grid Layout:**
```
┌─────────────────────────────────────────┐
│  JELAJAHI KATEGORI                      │
│                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │ Bags │ │Shoes │ │Tents │ │Gear  │  │
│ │ 🎒   │ │👟    │ │⛺    │ │🧗    │  │
│ │(145) │ │(267) │ │(89)  │ │(312) │  │
│ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │ Water│ │Climb │ │Jacket│ │Access│  │
│ │ Gear │ │ Gear │ │      │ │      │  │
│ │ 💧   │ │🪢    │ │🧥    │ │📦    │  │
│ │(178) │ │(234) │ │(401) │ │(567) │  │
│ └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

**Kategori Card Features:**
- Image 300x300px dengan overlay
- Category name bold 18px
- Product count small gray text
- Hover effect: image zoom 1.1, overlay darkens
- Click navigates to category page

### 4. FEATURED PRODUCTS CAROUSEL

**Desktop (4 kolom visible):**
```
┌──────────────────────────────────────────────┐
│ PRODUK UNGGULAN                       [< >]  │
│                                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────── │
│ │ Image   │ │ Image   │ │ Image   │ │ Image  │
│ │ 280x350 │ │ 280x350 │ │ 280x350 │ │ 280x350│
│ │         │ │         │ │         │ │        │
│ │Produk 1 │ │Produk 2 │ │Produk 3 │ │Produk 4│
│ │Rating ★ │ │Rating ★ │ │Rating ★ │ │Rating ★│
│ │Rp456.000│ │Rp789.000│ │Rp234.000│ │Rp567.000
│ │[+Keranj]│ │[+Keranj]│ │[+Keranj]│ │[+Keranj│
│ └─────────┘ └─────────┘ └─────────┘ └─────────│
│                                              │
└──────────────────────────────────────────────┘
```

**Carousel Features:**
- Auto-scroll setiap 5 detik (pausable on hover)
- Swipe gesture di mobile
- Infinite loop
- Dots indicator di bawah
- Touch-friendly pada mobile

**Product Card Details:**
```
┌────────────────────────────┐
│      [Product Image]       │
│  (With badge overlay)      │
│      ┌─────────────┐       │
│      │ NEW         │       │
│      └─────────────┘       │
├────────────────────────────┤
│ Nama Produk (max 2 lines)  │
├────────────────────────────┤
│ ⭐⭐⭐⭐⭐ (245 reviews)      │
│                            │
│ Rp 456.000                 │
│ ~~Rp 600.000~~ (24% OFF)   │
├────────────────────────────┤
│    [+ KERANJANG] [❤️]      │
└────────────────────────────┘
```

- Image height: 280px (responsive)
- Badge positioning: top-right, 8px margin
- Price: large bold, discount strikethrough red
- Rating stars: 16px, gold color
- Add to cart button: full width, hover animation
- Wishlist heart: animated toggle

### 5. PRODUCT LISTING PAGE

**Filter Sidebar + Products Grid:**
```
┌─────────────┬──────────────────────────────┐
│  FILTER     │ HASIL (234 Produk)           │
│             │ Sort: [Populer ▼]            │
│ [Category]  │                              │
│ ✓ Bags      │ ┌──────┐ ┌──────┐ ┌──────┐  │
│   Shoes     │ │Prod1 │ │Prod2 │ │Prod3 │  │
│   Tents     │ │      │ │      │ │      │  │
│             │ └──────┘ └──────┘ └──────┘  │
│ [Price]     │                              │
│ [0-500K]    │ ┌──────┐ ┌──────┐ ┌──────┐  │
│ [500K-1M]   │ │Prod4 │ │Prod5 │ │Prod6 │  │
│ [1M-2M]     │ │      │ │      │ │      │  │
│ [2M+]       │ └──────┘ └──────┘ └──────┘  │
│             │                              │
│ [Rating]    │ [< 1 2 3 4 5 ... >]          │
│ ✓ 5 Star    │                              │
│   4+ Star   │                              │
│   3+ Star   │                              │
│             │                              │
│ [Reset All] │                              │
└─────────────┴──────────────────────────────┘
```

**Filter Features:**
- Sticky sidebar di desktop
- Collapsible di mobile
- Real-time filtering dengan URL params
- Selected filters shown as chips
- Clear all filters button
- Filter count badge

**Product Grid:**
- Desktop: 3 kolom
- Tablet: 2 kolom
- Mobile: 1 kolom (scroll horizontal alternative)
- Lazy loading images
- Infinite scroll atau pagination

### 6. PRODUCT DETAIL PAGE

**Image Gallery + Details:**
```
┌─────────────────┬──────────────────────┐
│                 │ Nama Produk          │
│ [Main Image]    │ SKU: HK-2024-001     │
│ 600x800px       │                      │
│                 │ ⭐⭐⭐⭐⭐ (348 reviews) │
│ [Thumb1]        │                      │
│ [Thumb2]        │ Rp 456.000           │
│ [Thumb3]        │ ~~Rp 600.000~~ -24%  │
│ [Thumb4]        │                      │
│                 │ ✓ Stok: 45 pcs       │
│                 │                      │
│                 │ [Size/Variant]       │
│                 │ [- Qty +] [Quantity]│
│                 │                      │
│                 │ [BELI SEKARANG]      │
│                 │ [+ WISHLIST]         │
│                 │ [BAGIKAN]            │
└─────────────────┴──────────────────────┘

┌────────────────────────────────────────┐
│ DESKRIPSI | SPESIFIKASI | REVIEW       │
├────────────────────────────────────────┤
│ Deskripsi produk detail...             │
│                                        │
│ Material: Nylon 600D                   │
│ Berat: 1.2 kg                          │
│ Garansi: 2 Tahun                       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ REVIEW PELANGGAN                       │
│                                        │
│ ⭐⭐⭐⭐⭐ "Kualitas luar biasa!"        │
│ Oleh: Ahmad Hermawan - 2 hari lalu    │
│ Produk sesuai ekspektasi...            │
│                                        │
│ ⭐⭐⭐⭐ "Bagus tapi pengiriman lambat"  │
│ Oleh: Siti Nurhaliza - 1 minggu lalu  │
│ ...                                    │
└────────────────────────────────────────┘
```

**Gallery Features:**
- Main image: 600x800px, high-res
- Thumbnails: 80x100px, clickable
- Zoom on hover (desktop) atau pinch-zoom (mobile)
- Image carousel/swipe (mobile)

**Product Info:**
- Breadcrumb: Home > Kategori > Produk
- Stock indicator dengan color: green (available), orange (low), red (out)
- Size/variant selector dengan visual preview
- Quantity selector min 1, max stock
- Dynamic price update on variant select

**Reviews Section:**
- Star average large display
- Filter by rating
- Sort: helpful, newest, highest rated
- Pagination
- Add review button (login required)
- Review verification badge

### 7. SHOPPING CART

**Desktop Cart View:**
```
┌────────────────────────────────────────┐
│ KERANJANG BELANJA (3 Produk)            │
├────────────────────────────────────────┤
│ Product      │ Qty │ Harga   │ Subtotal│
│              │     │         │         │
│ [IMG]        │ [1] │ 456.000 │ 456.000 │
│ Produk 1     │ [-]+│         │         │
│ Update │Remove│     │         │         │
│              │     │         │         │
│ [IMG]        │ [2] │ 789.000 │1.578.000│
│ Produk 2     │ [-]+│         │         │
│ Update │Remove│     │         │         │
│              │     │         │         │
│ [IMG]        │ [1] │ 234.000 │ 234.000 │
│ Produk 3     │ [-]+│         │         │
│ Update │Remove│     │         │         │
│              │     │         │         │
├────────────────────────────────────────┤
│                    Subtotal: Rp 2.268.000│
│              Biaya Pengiriman: Rp 50.000 │
│              (Gratis untuk order > 500K)  │
│                     TOTAL: Rp 2.318.000   │
│                                          │
│      [LANJUT KE CHECKOUT]  [LANJUT      │
│                             BELANJA]    │
└────────────────────────────────────────┘
```

**Cart Features:**
- Persistent cart (localStorage + backend)
- Inline quantity editing
- Quick remove button
- Save for later toggle
- Applied coupon display
- Free shipping badge when eligible
- Estimated delivery time

**Mobile Cart:**
- Single column layout
- Fullscreen cart drawer (slide from right)
- Touch-friendly +/- buttons
- Swipe to remove
- Same subtotal display

### 8. CHECKOUT FLOW

**Step Indicator:**
```
┌────────────────────────────────────────┐
│ Step 1: Shipping  →  Step 2: Payment   │
│ [ACTIVE]              [INACTIVE]       │
└────────────────────────────────────────┘
```

**Checkout Page 1 - Shipping:**
```
┌────────────────────────────────────────┐
│ 1. ALAMAT PENGIRIMAN                   │
│                                        │
│ ○ Gunakan alamat tersimpan             │
│ ○ Alamat baru                          │
│                                        │
│   Nama: [____________]                 │
│   No. Telepon: [____________]          │
│   Alamat: [____________]               │
│   Kota: [____________]                 │
│   Kode Pos: [____________]             │
│                                        │
│ 2. METODE PENGIRIMAN                   │
│                                        │
│ ○ Standar (3-5 hari) - Rp 50.000      │
│ ○ Express (1-2 hari) - Rp 100.000     │
│ ○ Same-day (Jabodetabek) - Rp 150.000│
│                                        │
│                  [LANJUT KE PEMBAYARAN]│
└────────────────────────────────────────┘
```

**Checkout Page 2 - Payment:**
```
┌────────────────────────────────────────┐
│ RINGKASAN PESANAN                      │
│ Subtotal        : Rp 2.268.000         │
│ Pengiriman      : Rp 50.000            │
│ Diskon Kode     : -Rp 100.000          │
│ ─────────────────────────────────────  │
│ TOTAL           : Rp 2.218.000         │
│                                        │
│ METODE PEMBAYARAN                      │
│                                        │
│ ○ Transfer Bank (BCA, Mandiri, BNI)   │
│ ○ E-Wallet (GoPay, OVO, Dana)         │
│ ○ Kartu Kredit (VISA, Mastercard)     │
│ ○ Cicilan (0% untuk 3-12 bulan)       │
│ ○ COD (Bayar di tempat)                │
│                                        │
│     [PROSES PEMBAYARAN]                │
│     [KEMBALI KE KERANJANG]             │
└────────────────────────────────────────┘
```

**Payment Integration:**
- Multiple payment gateways (Midtrans, Xendit)
- Secure SSL connection
- Order confirmation email
- Order tracking dashboard
- Invoice PDF download

### 9. FOOTER

```
┌────────────────────────────────────────────────────┐
│                                                    │
│ TENTANG OUTGEAR    │  LAYANAN              │ IKUTI │
│ ────────────────   │  ────────             │ ───── │
│ Tentang Kami       │  Pengiriman           │ ♦ FB  │
│ Karir              │  Pengembalian         │ ♦ IG  │
│ Blog               │  FAQ                  │ ♦ TW  │
│ Kebijakan Privacy  │  Hubungi Kami         │ ♦ YT  │
│ T&C                │  Garansi              │       │
│                    │  Track Pesanan        │       │
│                                                    │
├────────────────────────────────────────────────────┤
│ Newsletter Signup:                                 │
│ [Email input]  [Subscribe]                         │
│ Dapatkan penawaran eksklusif & tips hiking        │
│                                                    │
├────────────────────────────────────────────────────┤
│ Payment Methods:  ♦ Visa  ♦ MC  ♦ Bank  ♦ E-Wallet│
│                                                    │
│ © 2024 OutGear Indonesia. All Rights Reserved.     │
│ Toko Online Terpercaya | Lisensi: [NOMOR]        │
└────────────────────────────────────────────────────┘
```

**Footer Elements:**
- 3-4 columns di desktop
- Collapsible sections di mobile
- Newsletter subscription
- Social media links
- Trust badges & certifications
- Payment method icons
- Copyright info

---

## 🎨 KOMPONEN INTERAKTIF

### Buttons

**Primary CTA Button:**
```
┌──────────────────┐
│ BELANJA SEKARANG │
└──────────────────┘

Styling:
- Background: #1B5E3F
- Text: White
- Padding: 12px 32px
- Border-radius: 6px
- Font: Montserrat Bold 16px
- Transition: 0.3s ease

States:
- Normal: #1B5E3F
- Hover: #14473F (darker)
- Active: scale 0.98
- Disabled: opacity 0.5
```

**Secondary Button:**
```
┌──────────────────┐
│ PELAJARI LEBIH   │
└──────────────────┘

- Border: 2px solid #1B5E3F
- Background: transparent
- Text: #1B5E3F
- Hover: Background fills
```

### Form Elements

**Input Text:**
```
Placeholder: "Cari produk..."
Height: 48px
Padding: 12px 16px
Border: 1px solid #E0E0E0
Border-radius: 6px
Focus: Border color #1B5E3F, shadow 0 0 0 3px rgba(27,94,63,0.1)
```

**Dropdown:**
```
┌──────────────────────┐
│ Pilih Ukuran       ▼ │
└──────────────────────┘
- Arrow icon on right
- Smooth open animation
- Option highlight on hover
```

### Cards & Containers

**Product Card Shadow:**
```
box-shadow: 0 4px 12px rgba(0,0,0,0.08)
Hover: 0 8px 24px rgba(0,0,0,0.12)
Transition: 0.3s ease
```

**Alert/Badge Styling:**
```
New Badge:      Background #E8F5E9, Text #1B5E3F
Sale Badge:     Background #E8714D, Text White
Premium Badge:  Background #F5A623, Text White
Info Message:   Background #E3F2FD, Text #1976D2
```

### Loading & Animations

**Loading Spinner:**
- Subtle CSS animation (rotate 360deg, 2s infinite)
- Centered, semi-transparent background
- Color: #1B5E3F

**Transitions:**
- Standard: 0.3s ease
- Button hover: 0.2s ease-out
- Modal/drawer: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Image fade-in: 0.5s ease-in

---

## 📊 RESPONSIVE BEHAVIOR

### Breakpoints

```
Desktop:  1200px+  (3-column grid)
Tablet:   768px    (2-column grid)
Mobile:   375px    (1-column stack)

Media Query Examples:
@media (max-width: 768px) { 
  .container { width: 100%; }
}

@media (max-width: 475px) {
  font-size: 14px;
}
```

### Responsive Typography

```
H1: 48px (desktop) → 36px (tablet) → 28px (mobile)
H2: 36px (desktop) → 28px (tablet) → 20px (mobile)
Body: 16px (all) → 14px (mobile)
```

### Mobile Navigation

```
Top sticky header (56px height)
Hamburger menu icon (3 lines)

Slide-in navigation (fullscreen width):
├─ Search bar
├─ Navigation links
├─ Categories
├─ Account/Login
└─ Logout
```

---

## 🎯 INTERACTIVE FEATURES

### Animations & Micro-interactions

**Product Image Hover:**
- Main image: zoom 1.1, subtle 0.4s ease
- On mobile: tap to expand lightbox

**Button Hover Effects:**
- CTA: slight scale up (1.02)
- Add to cart: ripple animation on click
- Wishlist: heart jump animation on toggle

**Scroll Animations:**
- Hero section: parallax background (20% slower than scroll)
- Product cards: fade-in on scroll (Intersection Observer)
- Stats counter: number animate from 0 to final value

**Loading States:**
- Skeleton screens for product cards
- Image placeholder before load (LQIP - Low Quality Image Placeholder)
- Gradual content reveal

**Form Interactions:**
- Input focus: border glow effect
- Error messages: shake animation, red border
- Success: green checkmark animation
- Field validation: real-time feedback below field

**Cart Animations:**
- Add to cart: item flies to cart icon
- Cart update: cart icon shakes
- Remove: slide-out animation
- Cart badge: pulse animation on update

---

## ♿ ACCESSIBILITY

### Color Contrast
- Text vs background: minimum 4.5:1 ratio (WCAG AA)
- Interactive elements: minimum 3:1 ratio

### Keyboard Navigation
- Tab order logical: top-to-bottom, left-to-right
- Focus indicator: 3px solid outline
- Skip to main content link
- Escape key closes modals/drawers

### Screen Reader Support
- Alt text on all images (product name + brief description)
- ARIA labels on icon-only buttons
- Form labels associated with inputs
- Heading hierarchy (H1 > H2 > H3)
- Landmarks: `<header>`, `<main>`, `<nav>`, `<footer>`

### Mobile Accessibility
- Minimum touch target: 44x44px
- Easy-to-read font sizes (minimum 16px)
- Sufficient color contrast
- No auto-playing videos with sound

---

## 📈 PERFORMANCE OPTIMIZATION

### Image Optimization
```
Product Images:
- Format: WebP (primary), JPG fallback
- Srcset: @1x, @2x for retina displays
- Lazy loading: native loading="lazy"
- Format: 
  - Main product: 600x800px
  - Thumbnail: 150x180px
  - Hero: 2000x1200px
```

### CSS & JavaScript
- Critical CSS inlined
- Non-critical CSS deferred
- JavaScript split into chunks (route-based)
- Service worker for offline support
- Preload key fonts

### Performance Targets
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Total bundle size: < 200KB (gzipped)

---

## 🔐 SECURITY & TRUST

### Trust Indicators
- Secure badge (HTTPS SSL)
- Trust seals (e-commerce certifications)
- Money-back guarantee badge
- Customer testimonials
- Star ratings with review count

### Payment Security
- PCI DSS compliance
- SSL/TLS encryption
- Tokenized payment processing
- No sensitive data in URLs
- CSRF protection on forms

---

## 📱 SPECIAL PAGES

### 404 Not Found
```
┌─────────────────────────────┐
│  404 - HALAMAN TIDAK DITEMUKAN│
│                              │
│  [Ilustrasi: Lost Hiker]    │
│                              │
│  Sepertinya Anda tersesat... │
│                              │
│  [KEMBALI KE BERANDA]        │
│  [LIHAT PRODUK UNGGULAN]     │
└─────────────────────────────┘
```

### Empty States
- Empty cart: illustration + "mulai belanja" CTA
- No search results: suggestions + "explore categories"
- Order history empty: "belum ada pesanan"

### Success Pages
- Order confirmation: order number + tracking info
- Newsletter confirmation: success message

---

## 🎬 KEY USER FLOWS

### Flow 1: Browse & Purchase
1. Land on homepage → Scroll → Browse categories → Click product → Review details → Add to cart → Proceed to checkout → Payment → Order confirmation

### Flow 2: Search Product
1. Click search bar → Type query → See suggestions → Select product → Detail page → Add to cart

### Flow 3: Filter & Compare
1. Go to catalog → Select filters → See results → Compare products → Add best option to cart

---

## 📊 COLOR APPLICATION EXAMPLES

### Header
- Background: #2C3E50
- Logo text: White
- Nav links: White / #D4845C on hover
- Search input: #F8F9FA background, #2C3E50 text

### Product Card
- Background: White
- Title: #2C3E50
- Price: #1B5E3F bold
- Sale price: #E8714D
- Badge: Varies by type
- Button: #1B5E3F with white text

### Footer
- Background: #2C3E50
- Text: #F8F9FA
- Links: #D4845C on hover
- Divider: rgba(255,255,255,0.1)

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (MVP)
- [x] Homepage with hero + categories
- [x] Product listing with basic filter
- [x] Product detail page
- [x] Shopping cart
- [x] Basic checkout

### Phase 2 (Enhancement)
- [ ] Advanced filters (price slider, size matrix)
- [ ] User accounts & wishlist
- [ ] Product reviews & ratings
- [ ] Related products
- [ ] Live chat support

### Phase 3 (Optimization)
- [ ] Personalization engine
- [ ] AI product recommendations
- [ ] Social proof elements (live purchases)
- [ ] Augmented reality try-on
- [ ] Performance optimization

---

## 📞 DESIGN NOTES

**Target Audience:**
- Age: 18-50
- Interest: Outdoor activities, hiking, adventure
- Income: Middle to upper-middle class
- Tech-savvy: Comfortable with online shopping

**Key Messages:**
- "Kualitas Premium, Harga Terjangkau"
- "Dipercaya oleh Ribuan Pendaki"
- "Peralatan Terbaik untuk Petualangan Anda"

**Design Philosophy:**
- Minimalist dengan accents of nature
- Trust through clarity and organization
- Performance and speed
- Mobile-first approach
- Accessible to all users

---

**Last Updated:** August 24, 2024
**Version:** 1.0 - Design System Foundation
**Status:** Ready for Development
