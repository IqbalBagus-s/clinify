// prisma/seed.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

// PENTING: Prisma 7 mewajibkan adapter — pola yang sama seperti di prisma.service.ts.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --------------------------------------------------------------------
  // 1. Seed specializations
  //    upsert() dipakai (bukan create()) supaya skrip ini AMAN dijalankan
  //    berulang kali tanpa error "unique constraint violation" pada `name`.
  // --------------------------------------------------------------------
  const specializationNames = ['Umum', 'Gigi', 'Anak', 'Penyakit Dalam', 'Kandungan'];

  for (const name of specializationNames) {
    await prisma.specialization.upsert({
      where: { name },
      update: {}, // tidak ada yang perlu diubah kalau sudah ada
      create: { name, status: 'ACTIVE' },
    });
  }
  console.log(`✔ ${specializationNames.length} specializations siap.`);

  // --------------------------------------------------------------------
  // 2. Seed satu akun admin
  //    Dicek dulu via findUnique agar tidak membuat admin duplikat
  //    setiap kali skrip ini dijalankan ulang.
  // --------------------------------------------------------------------
  const adminEmail = 'admin@clinic.local';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log('✔ Akun admin sudah ada, dilewati.');
    return;
  }

  // CATATAN KRITIS: bcryptjs dipakai di sini hanya sebagai placeholder.
  // Kalau nanti PasswordHasherService final Anda pakai algoritma lain
  // (mis. Argon2id), GANTI baris hash di bawah ini supaya format hash-nya
  // konsisten — kalau tidak, login pakai akun seed ini akan gagal karena
  // hasher produksi tidak bisa memverifikasi hash dari algoritma berbeda.
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  await prisma.user.create({
    data: {
      username: 'admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      emailVerifiedAt: new Date(), // admin seed tidak perlu alur verifikasi email
      profile: {
        create: { fullName: 'Administrator' },
      },
      admin: {
        create: {},
      },
    },
  });

  console.log(`✔ Akun admin dibuat -> email: ${adminEmail} | password: ChangeMe123!`);
  console.log('  Ganti password ini lewat change-password use-case setelah login pertama.');
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });