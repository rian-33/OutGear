# OutGear

E-commerce peralatan outdoor dengan dua mode transaksi: **sewa** dan **beli putus**.

## Teknologi

- **Frontend**: React 18 + Vite + React Router (folder `frontend/`)
- **Backend**: Express + Mongoose/MongoDB + Zod (folder `backend/`)
- **Auth**: JWT (`bcryptjs` untuk hash password), role `customer` & `admin`

## Prasyarat

- Node.js (v18+)
- MongoDB berjalan di `127.0.0.1:27017` (atau sesuaikan `MONGO_URI` di `backend/.env`)

## Setup

```bash
# 1. Install semua dependency
npm run install:all

# 2. Siapkan environment
cp backend/.env.example backend/.env
# lalu isi JWT_SECRET (wajib). Contoh: generator.baby-cat-7d9f...
# opsional: ADMIN_EMAIL / ADMIN_PASSWORD untuk akun admin default

# 3. Seed data awal (produk + akun admin). WAJIB MongoDB aktif.
#    Bisa dijalankan dari root, folder backend, maupun folder frontend:
npm run seed

# 4. Jalankan backend + frontend sekaligus
npm run dev
```

Akses: frontend `http://localhost:5173` · backend `http://localhost:5000`

## Akun default

Setelah `npm run seed`, akun admin yang dibuat:

| Role     | Email             | Password    |
|----------|-------------------|-------------|
| Admin    | `admin@outgear.com` | `admin12345` |

> Kredensial mengikuti `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `backend/.env`.
> Ubah segera untuk produksi!

Akun customer dibuat lewat halaman **Daftar** (`/register`). Login admin dan user
memakai form yang sama (`/login`); role dibedakan otomatis dari akun.

## Script yang tersedia (dari root)

| Perintah            | Keterangan                                         |
|---------------------|----------------------------------------------------|
| `npm run install:all` | Install dependency backend & frontend            |
| `npm run dev`       | Jalankan backend + frontend sekaligus              |
| `npm run seed`      | Seeding produk + admin (butuh MongoDB aktif)       |
| `npm run build:frontend` | Build produksi frontend                     |
| `npm run lint`      | Lint backend & frontend                            |
| `npm run test`      | Test backend & frontend                            |

Script serupa juga tersedia per package (`backend/`, `frontend/`).

## Troubleshooting

| Gejala                                              | Penyebab                        | Solusi                                                         |
|-----------------------------------------------------|---------------------------------|----------------------------------------------------------------|
| `ECONNREFUSED 127.0.0.1:27017` / `MongooseServerSelectionError` di terminal backend | MongoDB tidak berjalan | `mongod`, atau Docker: `docker run -d -p 27017:27017 --name mongo mongo` |
| `[vite] http proxy error: ECONNREFUSED`             | Backend tidak aktif             | Jalankan backend (`npm run dev` dari root)                     |
| `npm run seed → Missing script: "seed"`             | Berada di folder tanpa script seed | Jalankan dari root, atau pakai `npm run seed --prefix backend`. Di `frontend/`, kepanggil otomatis ke backend |
| Banner kuning "Backend tidak terhubung" di katalog  | API gagal dihubungi             | Lihat dua baris di atas                                         |

Banner kuning muncul di halaman katalog/detail produk saat API tidak dapat
dijangkau; data contoh tetap ditampilkan agar UI tidak kosong.