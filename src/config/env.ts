// src/config.ts
import * as dotenv from "dotenv";
import { z } from "zod";
import { EnvVars } from "./types";

// Load environment variables from .env file
dotenv.config();

// Define the schema for your environment variables using Zod
const envSchema = z.object({
  PORT: z.string().default("8080").transform(Number), // default to 3000
  AUTH0_AUDIENCE: z.string(),
  AUTH0_DOMAIN: z.string(),
  AUTH0_BASIC_CLIENT_ID: z.string(),
  AUTH0_BASIC_CLIENT_SECRET: z.string(),
  AZURE_OPENAI_API_KEY: z.string(),
  AZURE_OPENAI_ENDPOINT: z.string().url(),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string(),
  AZURE_OPENAI_API_VERSION: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_SSL: z
    .string()
    .default("true")
    .transform((val) => val === "true"), // transform to boolean based on "true"
  POSTGRES_USER: z.string().default("prop"),
  POSTGRES_DB: z.string().default("prop-db"),
  POSTGRES_PORT: z.string().default("5432").transform(Number), // ensure it's a number
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default("6379").transform(Number), // ensure it's a number
  REDIS_PASSWORD: z.string(),
  REDIS_DB: z.string().transform(Number), // convert to number
  GOOGLE_MAPS_API_KEY: z.string(),
  PROPERTY_DATA_API_KEY: z.string(),
});

// Parse the environment variables using the schema
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.errors);
  process.exit(1);
}

// Export the validated environment variables for use in the app
export const config: EnvVars = parsedEnv.data;
