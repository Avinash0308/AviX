import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/avix",
  },
});