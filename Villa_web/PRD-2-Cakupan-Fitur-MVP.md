# PRD-2: Cakupan Fitur MVP (Minimum Viable Product)

**Project:** KostManager — Sistem Manajemen Pembayaran Kost
**Versi:** 1.0 — MVP
**Tanggal:** 28 September 2026

---

## 1. Definisi MVP

MVP berisi fitur **int minimum** agar sistem bisa dipakai menjalankan operasional kos secara end-to-end: dari penghuni masuk → tagihan terbit → pembayaran tercatat → laporan keluar.

Prinsip pemilihan: _tanpa fitur ini, sistem tidak bisa berjalan._ Semua yang bersifat "bagus untuk punya" ditunda ke fase berikutnya.

## 2. Matriks Fitur MVP

Keterangan: ✅ = masuk MVP | ⏳ = fase 2 (tidak MVP)

### A. Autentikasi & Akun

| ID   | Fitur                         | Aktor    | MVP |
| ---- | ----------------------------- | -------- | --- |
| F-01 | Registrasi akun penghuni      | Penghuni | ✅  |
| F-02 | Login (JWT access + refresh)  | Semua    | ✅  |
| F-03 | Logout (blacklist token)      | Semua    | ✅  |
| F-04 | Ganti password                | Semua    | ✅  |
| F-05 | Lupa/reset password via email | Penghuni | ⏳  |

### B. Manajemen Penghuni (Admin)

| ID   | Fitur                                         | MVP |
| ---- | --------------------------------------------- | --- |
| F-06 | Tambah data penghuni baru                     | ✅  |
| F-07 | Lihat daftar semua penghuni (search + filter) | ✅  |
| F-08 | Ubah data penghuni                            | ✅  |
| F-09 | Hapus/nonaktifkan penghuni (soft delete)      | ✅  |
| F-10 | Assign kamar ke penghuni                      | ✅  |

### C. Manajemen Kamar (Admin)

| ID   | Fitur                                       | MVP |
| ---- | ------------------------------------------- | --- |
| F-11 | CRUD kamar (nomor, harga, fasilitas)        | ✅  |
| F-12 | Status kamar: kosong / terisi / maintenance | ✅  |

### D. Tagihan

| ID   | Fitur                                       | Aktor    | MVP |
| ---- | ------------------------------------------- | -------- | --- |
| F-13 | Generate tagihan bulanan otomatis (cron)    | Sistem   | ✅  |
| F-14 | Generate tagihan manual (kepada 1 penghuni) | Admin    | ✅  |
| F-15 | Lihat daftar tagihan + filter status        | Admin    | ✅  |
| F-16 | Lihat tagihan saya (penghuni)               | Penghuni | ✅  |

### E. Pembayaran

| ID   | Fitur                                 | Aktor    | MVP |
| ---- | ------------------------------------- | -------- | --- |
| F-17 | Bayar tagihan + upload bukti transfer | Penghuni | ✅  |
| F-18 | Konfirmasi/validasi pembayaran        | Admin    | ✅  |
| F-19 | Lihat riwayat pembayaran              | Penghuni | ✅  |
| F-20 | Unduh kwitansi (PDF) pembayaran       | Penghuni | ⏳  |
| F-21 | Pembayaran partial (bayar sebagian)   | Penghuni | ⏳  |

### F. Pengajuan Pindah Kamar

| ID   | Fitur                               | Aktor    | MVP |
| ---- | ----------------------------------- | -------- | --- |
| F-22 | Ajukan pindah kamar                 | Penghuni | ✅  |
| F-23 | Approval/reject pengajuan           | Admin    | ✅  |
| F-24 | Notifikasi hasil pengajuan (in-app) | Penghuni | ✅  |

### G. Dashboard & Laporan

| ID   | Fitur                                          | Aktor    | MVP |
| ---- | ---------------------------------------------- | -------- | --- |
| F-25 | Dashboard admin (statistik & status tagihan)   | Admin    | ✅  |
| F-26 | Dashboard penghuni (tagihan aktif & ringkasan) | Penghuni | ✅  |
| F-27 | Laporan pemasukan per periode + export CSV     | Admin    | ✅  |
| F-28 | Reminder jatuh tempo (email/WA)                | Sistem   | ⏳  |

## 3. Prioritas Implementasi (Urutan Build)

Urutan ini disusun agar setiap tahap menghasilkan sistem yang bisa diuji end-to-end:

| Fase         | Fitur                                         | Dependensi      |
| ------------ | --------------------------------------------- | --------------- |
| **Sprint 1** | F-01 s/d F-04 (Auth) + struktur project       | —               |
| **Sprint 2** | F-11, F-12 (Kamar) + F-06 s/d F-10 (Penghuni) | Auth            |
| **Sprint 3** | F-13 s/d F-16 (Tagihan) + cron job            | Kamar, Penghuni |
| **Sprint 4** | F-17 s/d F-19 (Pembayaran + bukti)            | Tagihan         |
| **Sprint 5** | F-22 s/d F-24 (Pengajuan pindah)              | Kamar, Penghuni |
| **Sprint 6** | F-25 s/d F-27 (Dashboard & laporan)           | Semua di atas   |
| **Polish**   | F-20, F-21, F-28 (fase 2)                     | MVP rilis       |

## 4. Yang Sengaja TIDAK Ada di MVP (dan Alasannya)

| Fitur                             | Alasan Ditunda                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Payment gateway (Midtrans/Xendit) | Butuh verifikasi bisnis, kompleksitas konfirmasi otomatis; pencatatan manual cukup untuk validasi awal |
| Multi-cabang                      | Menambah kompleksitas skema data tanpa validasi pasar                                                  |
| Kwitansi PDF                      | Bisa diganti halaman detail transaksi di MVP                                                           |
| Notifikasi email/WA otomatis      | Butuh integrasi provider; pengingat manual via admin cukup dulu                                        |
| Aplikasi mobile                   | Web responsive sudah cukup untuk 90% penggunaan                                                        |

## 5. Acceptance Criteria MVP (Secara Umum)

1. Admin bisa menambahkan penghuni + assign kamar dalam < 2 menit
2. Tagihan bulanan terbit otomatis tanpa aksi admin
3. Penghuni bisa melihat tagihan dan mengunggah bukti bayar
4. Admin bisa memverifikasi pembayaran dalam < 3 klik
5. Laporan pemasukan bulanan bisa diekspor
6. Semua aksi penting tercatat (created_at/updated_at) dan data tidak benar-benar terhapus (soft delete)

---

**Kembali ke:** PRD-1 | **Lanjut ke:** PRD-3 — User Flows & Functional Requirements
