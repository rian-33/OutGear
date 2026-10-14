/**
 * Seed inventaris Savana Villa dan satu akun pengelola.
 *
 * Dijalankan lewat `npm --workspace @kost/api run prisma:seed`.
 * Idempoten: aman dijalankan berkali-kali (upsert berdasarkan unique key).
 *
 * Kredensial admin diambil dari env `SEED_ADMIN_*` (lihat .env.example).
 */
import { PrismaClient, Role, StatusKamar } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_KAMAR = [
  { no_kamar: 'Garden Suite 1', harga: '1250000.00', kapasitas: 2, fasilitas: 'Taman pribadi, King bed, Sarapan untuk dua, Bathtub' },
  { no_kamar: 'Garden Suite 2', harga: '1250000.00', kapasitas: 2, fasilitas: 'Taman pribadi, King bed, Sarapan untuk dua, Bathtub' },
  { no_kamar: 'Pool Villa 1', harga: '2450000.00', kapasitas: 4, fasilitas: 'Kolam pribadi, Dua kamar, Ruang keluarga, Sarapan untuk empat' },
  { no_kamar: 'Pool Villa 2', harga: '2450000.00', kapasitas: 4, fasilitas: 'Kolam pribadi, Dua kamar, Ruang keluarga, Sarapan untuk empat' },
  {
    no_kamar: 'Family Residence 1',
    harga: '3800000.00',
    kapasitas: 6,
    fasilitas: 'Kolam pribadi, Tiga kamar, Dapur lengkap, Pemandangan lembah, Layanan butler',
  },
  {
    no_kamar: 'Family Residence 2',
    harga: '3800000.00',
    kapasitas: 6,
    fasilitas: 'Kolam pribadi, Tiga kamar, Dapur lengkap, Pemandangan lembah, Layanan butler',
  },
];

function required(key: string, fallback: string): string {
  const value = process.env[key];
  if (value && value.trim().length > 0) return value.trim();
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Env ${key} wajib diisi pada environment production.`);
  }
  return fallback;
}

async function main() {
  const username = required('SEED_ADMIN_USERNAME', 'admin');
  const password = required('SEED_ADMIN_PASSWORD', 'Admin123!');
  const email = required('SEED_ADMIN_EMAIL', 'admin@savanavilla.local');
  const nama = required('SEED_ADMIN_NAMA', 'Administrator Savana Villa');
  const noHp = process.env.SEED_ADMIN_NO_HP ?? null;

  // Password di-hash dengan bcrypt cost 10 (PRD-4 §3).
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.pengguna.upsert({
    where: { username },
    update: { nama_lengkap: nama, email, no_hp: noHp, password: hashed, role: Role.ADMIN },
    create: {
      username,
      password: hashed,
      nama_lengkap: nama,
      email,
      no_hp: noHp,
      role: Role.ADMIN,
    },
  });
  console.log(`[seed] admin siap: ${admin.username} (${admin.email})`);

  for (const kamar of SAMPLE_KAMAR) {
    await prisma.kamar.upsert({
      where: { no_kamar: kamar.no_kamar },
      update: { harga: kamar.harga, kapasitas: kamar.kapasitas, fasilitas: kamar.fasilitas },
      create: {
        no_kamar: kamar.no_kamar,
        harga: kamar.harga,
        kapasitas: kamar.kapasitas,
        fasilitas: kamar.fasilitas,
        status: StatusKamar.KOSONG,
      },
    });
  }
  console.log(`[seed] ${SAMPLE_KAMAR.length} kamar contoh dibuat`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('[seed] gagal:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
