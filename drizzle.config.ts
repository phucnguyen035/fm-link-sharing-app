import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ["./.env", "./.env.development.local"] });

export default defineConfig({
  driver: "pg",
  schema: "src/db/schema.ts",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL_NON_POOLING!,
  },
});
