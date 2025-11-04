/**
 * @file Loads and validates the application's environment variables.
 */

import * as dotenv from "dotenv";
import { z } from "zod";

// Load .env
dotenv.config();

// Define schema
const envSchema = z.object({
  APP_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),

  DB_TYPE: z
    .enum([
      "postgres",
      "mysql",
      "mariadb",
      "sqlite",
      "mssql",
      "oracle",
      "cockroachdb",
    ])
    .default("postgres"),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
});

// Parse
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Fatal Error: Invalid environment variables.",
    result.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = result.data;
