# PRD-3: Alur Pengguna & Persyaratan Fungsional

**Project:** KostManager — Sistem Manajemen Pembayaran Kost
**Versi:** 1.0 — MVP
**Tanggal:** 28 September 2026

---

## 1. User Flow Utama

### 1.1 Onboarding Penghuni Baru (End-to-End)

```
Admin tambah kamar ──> Admin tambah penghuni + assign kamar
        │
        ▼
Penghuni registrasi akun ──> Login
        │
        ▼
Sistem: detail_kos dibuat (tanggal_masuk, jatuh_tempo)
        │
        ▼
Cron tagihan bulanan ──> Tagihan terbit otomatis
        │
        ▼
Penghuni bayar + upload bukti ──> Admin konfirmasi ──> Lunas
```

### 1.2 Alur Pembayaran (Happy Path)

```
Penghuni: buka Dashboard → lihat tagihan aktif
   │
   ▼ klik "Bayar"
Form: nominal + metode pembayaran + upload bukti
   │
   ▼ submit
Pembayaran dibuat (status: MENUNGGU_KONFIRMASI)
   │
   ▼
Admin: Dashboard → notifikasi pembayaran baru → lihat bukti
   │
   ▼ klik "Konfirmasi"
Tagihan: LUNAS │ Pembayaran: DIKONFIRMASI
   │
   ▼
Penghuni: riwayat terupdate, status tagihan lunas
```

### 1.3 Alur Pembayaran (Reject)

```
Admin menolak pembayaran → wajib isi alasan penolakan
   │
   ▼
Pembayaran: DITOLAK │ Tagihan: kembali BELUM_BAYAR
   │
   ▼
Penghuni dapat notifikasi + alasan → ajukan ulang
```

### 1.4 Alur Pengajuan Pindah Kamar

```
Penghuni: Dashboard → "Ajukan Pindah Kamar" → pilih kamar tujuan (hanya yg kosong)
   │
   ▼
Pengajuan dibuat (status: PENDING)
   │
   ▼
Admin: review pengajuan → Setuju / Tolak (wajib catatan)
   │
   ├── Setuju: detail_kos diupdate ke kamar baru,
   │            status kamar lama → kosong, baru → terisi,
   │            pengajuan → DISETUJUI
   │
   └── Tolak: pengajuan → DITOLAK, kamar tidak berubah
   │
   ▼
Penghuni: notifikasi hasil
```

### 1.5 Alur Generate Tagihan Otomatis

```
Cron tiap tanggal 1, jam 00:00 (timezone Asia/Makassar)
   │
   ▼
Sistem cari semua penghuni aktif (detail_kos aktif)
   │
   ▼
Untuk setiap penghuni: cek tagihan periode ini sudah ada?
   ├── Belum → buat tagihan (nominal = harga kamar, jatuh_tempo = tanggal X)
   └── Sudah → skip (idempotent, aman di-retry)
```

---

## 2. ERD Final (Skema Data)

```
┌────────────┐         ┌────────────┐
│  pengguna  │         │   kamar    │
├────────────┤         ├────────────┤
│ id_user PK │────┐    │ id_kamar PK│
│ username   │    │    │ no_kamar   │
│ password   │    │    │ harga      │
│ nama_lengkap   │    │ fasilitas  │
│ email      │    │    │ status     │
│ no_hp      │    │    └─────┬──────┘
│ role ENUM  │    │          │
│ created_at │    │          │
│ updated_at │    │          │
│ deleted_at │    │          │
└─────┬──────┘    │          │
      │           │          │
      │    ┌──────┴────┐     │
      │    │detail_kos │     │
      │    ├───────────┤     │
      ├───>│ id_user FK│     │
      │    │ id_kamar FK─────┘
      │    │ tgl_masuk │
      │    │ jatuh_tempo│
      │    │ aktif     │
      │    └───────────┘
      │
      │    ┌────────────┐         ┌──────────────┐
      ├───>│  tagihan   │────────<│  pembayaran  │
      │    ├────────────┤ 1:N     ├──────────────┤
      │    │ id_tagihan PK│       │ id_pembayaran PK
      │    │ id_user FK │        │ id_tagihan FK│
      │    │ id_kamar FK│        │ id_user FK   │
      │    │ periode    │        │ jumlah_bayar │
      │    │ jumlah     │        │ metode ENUM  │
      │    │ jatuh_tempo│        │ bukti_bayar  │
      │    │ status ENUM│        │ status ENUM  │
      │    │ created_at │        │ alasan_tolak │
      │    └────────────┘        │ confirmed_by │
      │                          │ created_at   │
      │    ┌────────────────┐    └──────────────┘
      └───>│pengajuan_pindah │
           ├────────────────┤
           │ id_pengajuan PK│
           │ id_user FK     │
           │ kamar_lama FK  │──> kamar
           │ kamar_baru FK  │──> kamar
           │ status ENUM    │
           │ catatan_admin  │
           │ tgl_respons    │
           │ created_at     │
           └────────────────┘
```

### 2.1 Enum & Status

| Tabel              | Kolom  | Nilai                                            |
| ------------------ | ------ | ------------------------------------------------ |
| `pengguna`         | role   | `ADMIN`, `PENGHUNI`                              |
| `kamar`            | status | `KOSONG`, `TERISI`, `MAINTENANCE`                |
| `tagihan`          | status | `BELUM_BAYAR`, `PENDING`, `LUNAS`, `OVERDUE`     |
| `pembayaran`       | status | `MENUNGGU_KONFIRMASI`, `DIKONFIRMASI`, `DITOLAK` |
| `pembayaran`       | metode | `TRANSFER_BANK`, `CASH`, `EWALLET`               |
| `pengajuan_pindah` | status | `PENDING`, `DISETUJUI`, `DITOLAK`                |

### 2.2 Aturan Integritas Penting

1. **Satukan `transaksi` + `pembayaran`** → hanya tabel `pembayaran` (menghindari redundansi)
2. `detail_kos` tidak menyimpan `no_kamar`/`harga` — hanya FK ke `kamar` (normalisasi)
3. `pembayaran.id_tagihan` FK wajib → setiap pembayaran melekat ke tagihan tertentu
4. Satu penghuni hanya punya **satu** `detail_kos` aktif (one-to-one aktif, riwayat via audit log)
5. Semua tabel wajib: `created_at`, `updated_at`, `deleted_at` (soft delete)
6. `password` wajib di-hash (bcrypt/argon2) — tidak pernah plaintext

---

## 3. Persyaratan Fungsional Detail (per Modul Backend)

### 3.1 Modul Auth (`/auth`)

| ID    | Requirement                                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Endpoint `POST /auth/register` — input: username, password, nama_lengkap, email, no_hp; password di-hash; role default `PENGHUNI` |
| FR-02 | Endpoint `POST /auth/login` — validasi kredensial; return access token (15 menit) + refresh token (30 hari)                       |
| FR-03 | Endpoint `POST /auth/refresh` — tukar refresh token → token baru; refresh token lama di-blacklist (Redis)                         |
| FR-04 | Endpoint `POST /auth/logout` — blacklist access + refresh token                                                                   |
| FR-05 | Endpoint `PATCH /auth/password` — ganti password wajib verifikasi password lama                                                   |

### 3.2 Modul Kamar (`/kamar`)

| ID    | Requirement                                                                               |
| ----- | ----------------------------------------------------------------------------------------- |
| FR-06 | `POST /kamar` — buat kamar (no_kamar unik, harga, fasilitas)                              |
| FR-07 | `GET /kamar` — list + filter status + search no_kamar                                     |
| FR-08 | `PATCH /kamar/:id` — ubah data/harga; harga lama tidak mengubah tagihan yang sudah terbit |
| FR-09 | `DELETE /kamar/:id` — soft delete; ditolak jika kamar sedang terisi                       |
| FR-10 | `PATCH /kamar/:id/status` — ubah KOSONG/MAINTENANCE; TERISI hanya via assign penghuni     |

### 3.3 Modul Penghuni (`/users`)

| ID    | Requirement                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------------- |
| FR-11 | `POST /users` — admin buat penghuni + assign kamar sekaligus (transaksi DB: buat user + detail_kos + kamar jadi TERISI) |
| FR-12 | `GET /users` — list penghuni aktif + search nama/username                                                               |
| FR-13 | `PATCH /users/:id` — ubah profil penghuni                                                                               |
| FR-14 | `DELETE /users/:id` — nonaktifkan (soft delete) + lepas kamar (kamar → KOSONG, detail_kos.aktif = false)                |
| FR-15 | `POST /users/:id/assign-kamar` — pindahkan penghuni ke kamar kosong lain (admin, tanpa pengajuan)                       |

### 3.4 Modul Tagihan (`/tagihan`)

| ID    | Requirement                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| FR-16 | Cron otomatis tanggal 1 tiap bulan: generate tagihan untuk semua penghuni aktif; idempotent (tidak dobel per periode) |
| FR-17 | `POST /tagihan/manual` — admin buat tagihan khusus 1 penghuni (denda, kelebihan listrik, dll)                         |
| FR-18 | `GET /tagihan` — admin list semua + filter status/periode                                                             |
| FR-19 | `GET /tagihan/saya` — penghuni lihat tagihannya sendiri                                                               |
| FR-20 | Cron harian: tagihan lewat `jatuh_tempo` → status `OVERDUE`                                                           |
| FR-21 | Tagihan tidak bisa dihapus jika sudah ada pembayaran                                                                  |

### 3.5 Modul Pembayaran (`/pembayaran`)

| ID    | Requirement                                                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-22 | `POST /pembayaran` — penghuni bayar: `{id_tagihan, jumlah_bayar, metode, bukti_bayar (file)}`; validasi tagihan milik user & status BELUM_BAYAR/OVERDUE; upload ke R2; buat record status `MENUNGGU_KONFIRMASI` |
| FR-23 | `GET /pembayaran/saya` — riwayat pembayaran penghuni                                                                                                                                                            |
| FR-24 | `GET /pembayaran?status=...` — admin list pembayaran menunggu konfirmasi                                                                                                                                        |
| FR-25 | `PATCH /pembayaran/:id/konfirmasi` — admin setuju → pembayaran `DIKONFIRMASI` + tagihan `LUNAS` (transaksi DB)                                                                                                  |
| FR-26 | `PATCH /pembayaran/:id/tolak` — admin tolak **wajib** `alasan_tolak` → pembayaran `DITOLAK` + tagihan kembali `BELUM_BAYAR`                                                                                     |
| FR-27 | File bukti: maks 5MB, format jpg/png/pdf; disimpan private (bukan public URL)                                                                                                                                   |

### 3.6 Modul Pengajuan Pindah (`/pengajuan`)

| ID    | Requirement                                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-28 | `POST /pengajuan` — penghuni pilih kamar tujuan; hanya kamar `KOSONG`; tolak duplikat jika masih ada pengajuan `PENDING`                       |
| FR-29 | `GET /pengajuan` — admin list semua pengajuan                                                                                                  |
| FR-30 | `PATCH /pengajuan/:id/approve` — transaksi DB: update detail_kos → kamar baru, kamar lama → KOSONG, kamar baru → TERISI, pengajuan → DISETUJUI |
| FR-31 | `PATCH /pengajuan/:id/reject` — wajib `catatan_admin`; kamar tidak berubah                                                                     |

### 3.7 Modul Dashboard & Laporan (`/dashboard`, `/laporan`)

| ID    | Requirement                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------ |
| FR-32 | `GET /dashboard/admin` — total penghuni, kamar terisi/kosong, pemasukan bulan berjalan, jumlah overdue |
| FR-33 | `GET /dashboard/penghuni` — tagihan aktif, jatuh tempo, riwayat singkat                                |
| FR-34 | `GET /laporan/pemasukan?dari=&sampai=` — rekap per periode                                             |
| FR-35 | `GET /laporan/export?dari=&sampai=` — export CSV                                                       |

---

## 4. Halaman Frontend (Route Map)

| Route                 | Halaman                      | Aktor    |
| --------------------- | ---------------------------- | -------- |
| `/login`, `/register` | Auth                         | Semua    |
| `/admin/dashboard`    | Statistik & status tagihan   | Admin    |
| `/admin/penghuni`     | CRUD penghuni + assign kamar | Admin    |
| `/admin/kamar`        | CRUD kamar                   | Admin    |
| `/admin/tagihan`      | List + generate manual       | Admin    |
| `/admin/pembayaran`   | Konfirmasi pembayaran        | Admin    |
| `/admin/pengajuan`    | Approval pindah kamar        | Admin    |
| `/admin/laporan`      | Rekap + export               | Admin    |
| `/dashboard`          | Ringkasan tagihan saya       | Penghuni |
| `/tagihan`            | Tagihan saya                 | Penghuni |
| `/bayar/[id]`         | Form bayar + upload bukti    | Penghuni |
| `/riwayat`            | Riwayat pembayaran           | Penghuni |
| `/pengajuan`          | Ajukan pindah kamar          | Penghuni |
| `/profil`             | Profil + ganti password      | Semua    |

---

**Kembali ke:** PRD-2 | **Lanjut ke:** PRD-4 — Persyaratan Non-Fungsional
