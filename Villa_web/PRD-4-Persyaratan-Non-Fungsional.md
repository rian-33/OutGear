# PRD-4: Persyaratan Non-Fungsional (Kriteria Teknis Website)

**Project:** KostManager — Sistem Manajemen Pembayaran Kost
**Versi:** 1.0 — MVP
**Tanggal:** 28 September 2026

---

## 1. Ringkasan Stack Teknis (Final)

| Layer         | Teknologi                                | Versi Target |
| ------------- | ---------------------------------------- | ------------ |
| Bahasa        | TypeScript (strict mode)                 | 5.x          |
| Frontend      | Next.js (App Router) + React             | 14+          |
| Styling       | TailwindCSS + font Inter & Space Grotesk | 3.x          |
| Backend       | NestJS                                   | 10+          |
| ORM           | Prisma                                   | 5+           |
| Database      | PostgreSQL (Neon)                        | 15+          |
| Cache         | Redis / Upstash                          | 7+           |
| Storage file  | Cloudflare R2 (S3-compatible)            | —            |
| Auth          | JWT (access + refresh) + bcrypt/argon2   | —            |
| API Style     | REST / JSON                              | —            |
| Monorepo tool | Turborepo / npm workspaces               | —            |

---

## 2. Performa

| Kriteria                            | Target                            |
| ----------------------------------- | --------------------------------- |
| First Contentful Paint (dashboard)  | < 1.5 detik                       |
| Time to Interactive                 | < 3 detik                         |
| Response time API (p95)             | < 300 ms                          |
| Response API list dengan pagination | < 500 ms untuk 1.000 records      |
| Upload bukti bayar (5MB)            | < 10 detik                        |
| Concurrent users (MVP)              | 50 user bersamaan tanpa degradasi |

Catatan: gunakan **React Query** untuk caching di frontend dan **index PostgreSQL** pada kolom yang sering di-filter (periode, status, id_user).

## 3. Keamanan

| Area          | Requirement                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Password      | Hash bcrypt/argon2 (min cost 10); tidak pernah plaintext/log                                                                       |
| Token         | Access token 15 menit; refresh token 30 hari, rotasi setiap refresh, blacklist di Redis saat logout                                |
| Otorisasi     | Guard per-role (`ADMIN`/`PENGHUNI`); penghuni hanya bisa akses data sendiri (cek ownership di service layer, bukan hanya di route) |
| Input         | Validasi semua input dengan `class-validator` DTO; Prisma query (anti SQL injection)                                               |
| File upload   | Whitelist MIME (jpg/png/pdf), max 5MB, nama file di-randomize, disimpan private — akses via endpoint terotorisasi                  |
| Rate limiting | Login endpoint: max 5 percobaan/menit/IP (nestjs rate-limit / Redis)                                                               |
| Header        | Helmet.js (CSP, X-Frame-Options, dll)                                                                                              |
| HTTPS         | Wajib TLS di semua environment (Vercel/Railway menyediakan)                                                                        |
| Env secret    | Semua credential via environment variable; `.env` tidak masuk Git                                                                  |

## 4. Reliabilitas & Data

| Kriteria      | Requirement                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Soft delete   | Semua tabel punya `deleted_at`; data kritikal tidak pernah hard delete                                |
| Audit         | `created_at`, `updated_at` di semua tabel; `confirmed_by` di pembayaran; `catatan_admin` di pengajuan |
| Backup DB     | Neon: PITR / daily backup aktif                                                                       |
| Transaksi DB  | Operasi multi-step (assign kamar, konfirmasi bayar, approve pindah) wajib dalam DB transaction        |
| Idempotency   | Cron generate tagihan aman di-retry tanpa tagihan dobel (cek unik periode + user)                     |
| Uptime target | 99% (sesuai SLA gratis tier hosting)                                                                  |

## 5. Maintainability (Sebagai Solo Dev)

1. **Struktur modular per fitur** — controller, service, repository, DTO dalam satu folder module
2. **Linter/formatter wajib** — ESLint + Prettier, pre-commit hook (husky + lint-staged)
3. **Type safety end-to-end** — Prisma generate type → dipakai di NestJS; shared types package untuk frontend
4. **Migrasi DB** — semua perubahan skema via Prisma migration, tidak edit DB manual
5. **Dokumentasi API** — Swagger (`@nestjs/swagger`) auto-generate di `/api/docs`
6. **Testing minimum** — unit test untuk service layer (tagihan, pembayaran); e2e test untuk auth + alur bayar

## 6. Design System (Konsisten dengan Mockup)

### 6.1 Tema & Warna

**Dashboard Admin — Dark Elegan:**

| Token           | Warna      | Kode      |
| --------------- | ---------- | --------- |
| background      | Deep Navy  | `#0F172A` |
| surface         | Dark Slate | `#1E293B` |
| accent utama    | Emerald    | `#10B981` |
| accent sekunder | Soft Blue  | `#3B82F6` |
| text utama      | Off White  | `#F8FAFC` |
| text muted      | Gray       | `#94A3B8` |
| sukses          | Green      | `#22C55E` |
| warning         | Amber      | `#F59E0B` |
| danger          | Red        | `#EF4444` |

**Dashboard Penghuni — Light Minimal:** background `#FAFAFA`, surface `#FFFFFF`, accent indigo `#4F46E5`.

### 6.2 Tipografi

| Peran                   | Font              | Catatan                                                         |
| ----------------------- | ----------------- | --------------------------------------------------------------- |
| Body/UI                 | **Inter**         | 13–14px, line-height 1.5                                        |
| Heading & angka/nominal | **Space Grotesk** | Wajib `font-variant-numeric: tabular-nums` untuk rupiah & tabel |

### 6.3 Komponen Standar

- Border radius: **8px** (kartu 12px) — kesan teknis, bukan playful
- Badge status: pill rounded-full dengan warna status konsisten di seluruh app
- Tabel: hover row, angka right-aligned/tabular
- Spacing konsisten via token Tailwind (4px grid)

## 7. Kompatibilitas & Aksesibilitas

| Kriteria            | Requirement                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Browser             | Chrome, Firefox, Safari, Edge (2 versi terakhir)                                              |
| Responsive          | Breakpoint mobile (≥360px), tablet (≥768px), desktop (≥1280px); sidebar → hamburger di mobile |
| Aksesibilitas dasar | Kontras teks memenuhi WCAG AA; semua form punya label; navigasi keyboard untuk aksi utama     |

## 8. Deployment & Environment

| Environment        | Platform                                                  | Kegunaan           |
| ------------------ | --------------------------------------------------------- | ------------------ |
| Development        | Local (Docker: PostgreSQL + Redis lokal)                  | Development harian |
| Staging/Production | Frontend: Vercel; Backend: Railway; DB: Neon; Storage: R2 | Produksi           |

**Pipeline sederhana:**

```
git push main → Vercel (auto-deploy frontend) + Railway (auto-deploy backend)
→ prisma migrate deploy (saat startup backend)
```

## 9. Batasan & Asumsi MVP

1. Satu kos/cabang saja — tidak ada konsep multi-gedung
2. Bahasa: Indonesia
3. Timezone: `Asia/Makassar` (UTC+8) untuk tagihan & jatuh tempo
4. Satu mata uang: IDR (Rupiah)
5. Tidak ada integrasi payment gateway — pembayaran dicatat manual via upload bukti
6. File bukti bayar retensi minimum 1 tahun

## 10. Definisi "Selesai" (MVP Ready)

- [ ] Semua fitur ✅ di PRD-2 berfungsi sesuai FR di PRD-3
- [ ] API terdokumentasi di Swagger
- [ ] Migration DB final ter-apply di production
- [ ] Auth aman (rate limit, hash, blacklist token)
- [ ] Tampilan sesuai design system (mockup disetujui)
- [ ] Laporan pemasukan bisa diekspor CSV
- [ ] Backup DB aktif

---

**Kembali ke:** PRD-3
**Dokumen lengkap:** PRD-1 (Ringkasan) | PRD-2 (Fitur MVP) | PRD-3 (User Flows & FR) | PRD-4 (Non-Fungsional)
