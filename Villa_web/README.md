# Savana Villa

Website villa dengan katalog unit, fasilitas, menu makan, ulasan, formulir booking, pengecekan ketersediaan, dan panel operasional untuk mengelola reservasi.

Project menggunakan monorepo npm workspaces: Next.js untuk website, NestJS untuk API, Prisma untuk PostgreSQL.

## Fitur

- Website publik Savana Villa dengan unit, harga per malam, fasilitas, denah, menu, ulasan, dan testimoni.
- Pengecekan ketersediaan berdasarkan tanggal, kapasitas tamu, reservasi yang menunggu, serta reservasi terkonfirmasi.
- Permintaan booking tersimpan di database dengan status Menunggu.
- Admin dapat melihat reservasi, mengonfirmasi atau membatalkan permintaan, dan menyelesaikan masa inap.
- Admin dapat mengelola nama unit, kapasitas, harga per malam, fasilitas, dan status perawatan.
- Akun admin dipersiapkan melalui seed; tamu melakukan booking tanpa membuat akun.
- Akun penghuni lama yang memiliki tenggat inap akan dinonaktifkan secara terjadwal dan unitnya dilepas.

## Menjalankan

Persyaratan: Node.js 18.18+ dan database PostgreSQL.

```bash
npm install
```

Buat `apps/api/.env` dari `apps/api/.env.example`, lalu isi `DATABASE_URL`, `DIRECT_URL`, dan JWT secrets. Jalankan migrasi dan seed:

```bash
npm --workspace @kost/api run prisma:migrate
npm --workspace @kost/api run prisma:seed
npm run dev
```

Seed menyiapkan unit contoh Savana Villa dan akun pengelola. Kredensial admin dapat diatur lewat `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_EMAIL`, dan `SEED_ADMIN_NAMA`.

- Website: http://localhost:3001
- API: http://localhost:3000/api
- Dokumentasi API: http://localhost:3000/api/docs
- Panel admin: http://localhost:3001/admin/reservasi

## API reservasi

- `GET /api/reservasi/tersedia?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD&jumlah_tamu=2`
- `POST /api/reservasi` untuk menyimpan permintaan booking tamu.
- `GET /api/reservasi` untuk daftar reservasi admin.
- `PATCH /api/reservasi/:id/status` untuk konfirmasi, pembatalan, atau penyelesaian booking.

Permintaan Menunggu dan reservasi Dikonfirmasi sama-sama menahan tanggal supaya tidak dipesan ganda. Ketersediaan dihitung dengan rentang check-in inklusif dan check-out eksklusif.

## Struktur

```
apps/web/       Website publik dan panel admin
apps/api/       API NestJS, model Prisma, dan migrasi
packages/types/ Tipe bersama untuk frontend dan API
packages/ui/    Komponen antarmuka bersama
```

Perintah workspace lain: `npm run build`, `npm run lint`, dan `npm run typecheck`.

