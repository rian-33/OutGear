CREATE TYPE "StatusReservasi" AS ENUM ('MENUNGGU', 'DIKONFIRMASI', 'DIBATALKAN', 'SELESAI');
ALTER TABLE "kamar" ADD COLUMN "kapasitas" INTEGER NOT NULL DEFAULT 2;

UPDATE "kamar" SET
    "no_kamar" = CASE "no_kamar"
        WHEN 'A-101' THEN 'Garden Suite 1'
        WHEN 'A-102' THEN 'Garden Suite 2'
        WHEN 'A-201' THEN 'Pool Villa 1'
        WHEN 'A-202' THEN 'Pool Villa 2'
        WHEN 'B-301' THEN 'Family Residence 1'
        WHEN 'B-302' THEN 'Family Residence 2'
    END,
    "harga" = CASE "no_kamar"
        WHEN 'A-101' THEN 1250000
        WHEN 'A-102' THEN 1250000
        WHEN 'A-201' THEN 2450000
        WHEN 'A-202' THEN 2450000
        WHEN 'B-301' THEN 3800000
        WHEN 'B-302' THEN 3800000
    END,
    "kapasitas" = CASE "no_kamar"
        WHEN 'A-101' THEN 2
        WHEN 'A-102' THEN 2
        WHEN 'A-201' THEN 4
        WHEN 'A-202' THEN 4
        WHEN 'B-301' THEN 6
        WHEN 'B-302' THEN 6
    END,
    "fasilitas" = CASE "no_kamar"
        WHEN 'A-101' THEN 'Taman pribadi, King bed, Sarapan untuk dua, Bathtub'
        WHEN 'A-102' THEN 'Taman pribadi, King bed, Sarapan untuk dua, Bathtub'
        WHEN 'A-201' THEN 'Kolam pribadi, Dua kamar, Ruang keluarga, Sarapan untuk empat'
        WHEN 'A-202' THEN 'Kolam pribadi, Dua kamar, Ruang keluarga, Sarapan untuk empat'
        WHEN 'B-301' THEN 'Kolam pribadi, Tiga kamar, Dapur lengkap, Pemandangan lembah, Layanan butler'
        WHEN 'B-302' THEN 'Kolam pribadi, Tiga kamar, Dapur lengkap, Pemandangan lembah, Layanan butler'
    END,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "no_kamar" IN ('A-101', 'A-102', 'A-201', 'A-202', 'B-301', 'B-302');

CREATE TABLE "reservasi" (
    "id_reservasi" TEXT NOT NULL,
    "nama_tamu" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "id_kamar" TEXT NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "jumlah_tamu" INTEGER NOT NULL,
    "total_harga" DECIMAL(12,2) NOT NULL,
    "status" "StatusReservasi" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "reservasi_pkey" PRIMARY KEY ("id_reservasi")
);

CREATE INDEX "reservasi_id_kamar_check_in_check_out_idx" ON "reservasi"("id_kamar", "check_in", "check_out");
CREATE INDEX "reservasi_status_idx" ON "reservasi"("status");
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_id_kamar_fkey" FOREIGN KEY ("id_kamar") REFERENCES "kamar"("id_kamar") ON DELETE RESTRICT ON UPDATE CASCADE;
