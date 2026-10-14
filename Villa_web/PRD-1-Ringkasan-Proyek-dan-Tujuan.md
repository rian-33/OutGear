# PRD-1: Ringkasan Proyek & Tujuan

**Project:** Sistem Manajemen Pembayaran Kost (KostManager)
**Versi:** 1.0 — MVP
**Tanggal:** 28 September 2026
**Status:** Disetujui untuk development

---

## 1. Ringkasan Proyek

KostManager adalah aplikasi web untuk mengelola operasional kos: data penghuni, kamar, tagihan sewa bulanan, pembayaran online dengan upload bukti bayar, serta pengajuan pindah kamar. Sistem ini menggantikan pencatatan manual (buku/excel) yang rawan error dan sulit direkap.

Aplikasi terdiri dari **dua sisi**:

- **Dashboard Admin** (pemilik/pengelola kos) — pengelolaan penuh operasional
- **Dashboard Penghuni** — self-service administrasi sewa

## 2. Masalah yang Dipecahkan

| Masalah Saat Ini                            | Solusi di KostManager                                       |
| ------------------------------------------- | ----------------------------------------------------------- |
| Pencatatan pembayaran manual, sulit direkap | Tagihan & pembayaran tercatat otomatis di database          |
| Pemilik lupa siapa yang belum bayar         | Dashboard status tagihan (lunas/pending/overdue) + reminder |
| Bukti transfer hilang/chat terburam         | Upload bukti bayar tersimpan di storage per transaksi       |
| Pindah kamar dicatat manual                 | Alur pengajuan pindah kamar dengan approval admin           |
| Penghuni harus tanya manual tagihannya      | Penghuni bisa cek tagihan & riwayat sendiri                 |

## 3. Tujuan (Objectives)

**Tujuan Bisnis:**

1. Mengurangi waktu administrasi pemilik kos dari ~X jam/bulan menjadi < 30 menit/bulan
2. Menghilangkan selisih pencatatan pembayaran (uang masuk = catatan)
3. Memberikan transparansi kepada penghuni atas tagihan dan riwayat sewanya

**Tujuan Produk (MVP):**

1. Admin dapat mengelola data penghuni, kamar, dan tagihan dalam satu dashboard
2. Penghuni dapat melihat tagihan dan membayar online dengan bukti bayar
3. Admin dapat memverifikasi pembayaran dan mengelola pengajuan pindah kamar
4. Sistem menghasilkan laporan pemasukan per periode

**Non-Tujuan (Out of Scope MVP):**

- ❌ Integrasi payment gateway otomatis (Midtrans/dll) — pencatatan manual dulu
- ❌ Aplikasi mobile native (hanya web responsive)
- ❌ Multi-cabang/multi-gedung
- ❌ Fitur chat/komunikasi internal

## 4. Aktor & Persona

| Aktor        | Deskripsi                         | Hak Akses                                                                                                  |
| ------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Admin**    | Pemilik/pengelola kos             | Akses penuh: CRUD penghuni, kamar, generate tagihan, konfirmasi pembayaran, approval pindah kamar, laporan |
| **Penghuni** | Penyewa kamar (mahasiswa/pekerja) | Registrasi, lihat dashboard & tagihan, bayar + upload bukti, ajukan pindah, riwayat, kwitansi, profil      |

## 5. Ringkasan Teknologi (Keputusan Final)

| Layer         | Teknologi                             | Alasan                             |
| ------------- | ------------------------------------- | ---------------------------------- |
| Frontend      | Next.js (App Router) + TypeScript     | SSR cepat, 1 bahasa dengan backend |
| UI            | TailwindCSS + Inter & Space Grotesk   | Design system sudah dirancang      |
| Backend       | NestJS + TypeScript                   | MVC built-in, modular, type-safe   |
| ORM           | Prisma                                | Type-safe, migrasi mudah           |
| Database      | PostgreSQL (Neon)                     | Relasional, reliable, gratis tier  |
| Cache/Session | Redis                                 | Cache dashboard, blacklist token   |
| Storage       | Cloudflare R2                         | Bukti bayar, gratis egress         |
| Auth          | JWT Access + Refresh Token            | Stateless, cocok SPA/SSR           |
| Deploy        | Vercel (frontend) + Railway (backend) | Murah, simpel, solo-dev friendly   |

## 6. Struktur Arsitektur

**Modular Monolith** — satu backend NestJS, dipisah per module:

```
modules/
├── auth/          # login, register, refresh token
├── users/         # CRUD penghuni + assign kamar
├── kamar/         # CRUD kamar + status
├── tagihan/       # generate tagihan bulanan (cron)
├── pembayaran/    # bayar + upload bukti + konfirmasi
├── pengajuan/     # pindah kamar + approval
└── laporan/       # rekap pemasukan
```

**Alur request:** `HTTP → JWT Guard → Controller (DTO) → Service → Repository (Prisma) → PostgreSQL`

## 7. Model Data Ringkasan (ERD Final)

```
pengguna (1) ──< (N) tagihan >── (1) kamar
pengguna (1) ──< (N) pembayaran >── (1) tagihan
pengguna (1) ── (1) detail_kos >── (1) kamar
pengguna (1) ──< (N) pengajuan_pindah
kamar    (1) ──< (N) pengajuan_pindah (kamar_baru)
```

Tabel inti: `pengguna`, `kamar`, `detail_kos`, `tagihan`, `pembayaran`, `pengajuan_pindah` (detail lengkap di PRD-3).

## 8. Kesuksesan yang Diukur (MVP)

| Metrik                                  | Target                       |
| --------------------------------------- | ---------------------------- |
| Tagihan tergenerate otomatis tiap bulan | 100% tanpa intervensi manual |
| Pembayaran tercatat dengan bukti        | 100% transaksi punya bukti   |
| Waktu rekap pemasukan                   | < 1 menit (dari laporan)     |
| Penghuni bisa cek tagihan mandiri       | Tanpa kontak admin           |

---

**Lanjut ke:** PRD-2 — Cakupan Fitur MVP
