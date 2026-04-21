import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local so both Next.js and Prisma CLI share the same env file
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
