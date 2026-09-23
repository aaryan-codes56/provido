// Prisma 7 moved the CLI's database connection out of schema.prisma and into
// this file. This config is only used by CLI commands (migrate, studio,
// generate) — the running app connects via the driver adapter in
// src/lib/prisma.ts instead.
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
