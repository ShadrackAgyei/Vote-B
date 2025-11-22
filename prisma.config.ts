// Prisma configuration for Vote-B
// Loads environment variables from .env.local
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local file (Next.js convention)
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations (pooler doesn't support db push)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
