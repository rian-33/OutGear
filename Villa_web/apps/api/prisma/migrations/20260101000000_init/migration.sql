-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PENGHUNI');

-- CreateEnum
CREATE TYPE "StatusKamar" AS ENUM ('KOSONG', 'TERISI', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "StatusTagihan" AS ENUM ('BELUM_BAYAR', 'PENDING', 'LUNAS', 'OVERDUE');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('MENUNGGU_KONFIRMASI', 'DIKONFIRMASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('TRANSFER_BANK', 'CASH', 'EWALLET');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "pengguna" (
    "id_user" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "no_hp" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PENGHUNI',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "kamar" (
    "id_kamar" TEXT NOT NULL,
    "no_kamar" TEXT NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL,
    "fasilitas" TEXT,
    "status" "StatusKamar" NOT NULL DEFAULT 'KOSONG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "kamar_pkey" PRIMARY KEY ("id_kamar")
);

-- CreateTable
CREATE TABLE "detail_kos" (
    "id_detail" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_kamar" TEXT NOT NULL,
    "tgl_masuk" TIMESTAMP(3) NOT NULL,
    "jatuh_tempo" TIMESTAMP(3) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "detail_kos_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "tagihan" (
    "id_tagihan" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_kamar" TEXT NOT NULL,
    "periode" VARCHAR(7) NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "jatuh_tempo" TIMESTAMP(3) NOT NULL,
    "status" "StatusTagihan" NOT NULL DEFAULT 'BELUM_BAYAR',
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tagihan_pkey" PRIMARY KEY ("id_tagihan")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id_pembayaran" TEXT NOT NULL,
    "id_tagihan" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "jumlah_bayar" DECIMAL(12,2) NOT NULL,
    "metode" "MetodeBayar" NOT NULL,
    "bukti_bayar" TEXT,
    "catatan" TEXT,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'MENUNGGU_KONFIRMASI',
    "alasan_tolak" TEXT,
    "catatan_admin" TEXT,
    "confirmed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id_pembayaran")
);

-- CreateTable
CREATE TABLE "pengajuan_pindah" (
    "id_pengajuan" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "kamar_lama" TEXT NOT NULL,
    "kamar_baru" TEXT NOT NULL,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'PENDING',
    "alasan" TEXT,
    "catatan_admin" TEXT,
    "tgl_respons" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pengajuan_pindah_pkey" PRIMARY KEY ("id_pengajuan")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "pengguna"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kamar_no_kamar_key" ON "kamar"("no_kamar");

-- CreateIndex
CREATE INDEX "kamar_status_idx" ON "kamar"("status");

-- CreateIndex
CREATE UNIQUE INDEX "detail_kos_id_user_key" ON "detail_kos"("id_user");

-- CreateIndex
CREATE INDEX "detail_kos_id_kamar_idx" ON "detail_kos"("id_kamar");

-- CreateIndex
CREATE INDEX "tagihan_status_idx" ON "tagihan"("status");

-- CreateIndex
CREATE INDEX "tagihan_periode_idx" ON "tagihan"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "tagihan_id_user_periode_key" ON "tagihan"("id_user", "periode");

-- CreateIndex
CREATE INDEX "pembayaran_id_tagihan_idx" ON "pembayaran"("id_tagihan");

-- CreateIndex
CREATE INDEX "pembayaran_id_user_idx" ON "pembayaran"("id_user");

-- CreateIndex
CREATE INDEX "pembayaran_status_idx" ON "pembayaran"("status");

-- CreateIndex
CREATE INDEX "pengajuan_pindah_status_idx" ON "pengajuan_pindah"("status");

-- CreateIndex
CREATE INDEX "pengajuan_pindah_id_user_idx" ON "pengajuan_pindah"("id_user");

-- AddForeignKey
ALTER TABLE "detail_kos" ADD CONSTRAINT "detail_kos_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "pengguna"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_kos" ADD CONSTRAINT "detail_kos_id_kamar_fkey" FOREIGN KEY ("id_kamar") REFERENCES "kamar"("id_kamar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "pengguna"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_id_kamar_fkey" FOREIGN KEY ("id_kamar") REFERENCES "kamar"("id_kamar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_id_tagihan_fkey" FOREIGN KEY ("id_tagihan") REFERENCES "tagihan"("id_tagihan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "pengguna"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "pengguna"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_pindah" ADD CONSTRAINT "pengajuan_pindah_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "pengguna"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_pindah" ADD CONSTRAINT "pengajuan_pindah_kamar_lama_fkey" FOREIGN KEY ("kamar_lama") REFERENCES "kamar"("id_kamar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_pindah" ADD CONSTRAINT "pengajuan_pindah_kamar_baru_fkey" FOREIGN KEY ("kamar_baru") REFERENCES "kamar"("id_kamar") ON DELETE RESTRICT ON UPDATE CASCADE;

