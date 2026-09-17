import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Sejak Prisma ORM 7, connection string untuk kebutuhan CLI
// (migrate dev, migrate deploy, db pull, dsb) dikonfigurasi di sini,
// BUKAN lagi di dalam datasource block pada schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Isi kalau Anda memakai shadow database terpisah untuk migrate dev.
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});