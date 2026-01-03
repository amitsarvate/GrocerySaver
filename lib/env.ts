import { z } from "zod";

const logLevelSchema = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  LOG_LEVEL: logLevelSchema.optional().default("info"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  GEOCODER_PROVIDER: z.enum(["nominatim"]).optional().default("nominatim"),
  GEOCODER_USER_AGENT: z.string().min(1, "GEOCODER_USER_AGENT is required"),
  GEOCODER_THROTTLE_MS: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(1100),
  NOMINATIM_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("https://nominatim.openstreetmap.org"),
  TIDEWAVE_ALLOW_REMOTE_ACCESS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(rawEnv: NodeJS.ProcessEnv): Env {
  const parsed = envSchema.safeParse(rawEnv);
  if (parsed.success) return parsed.data;

  const flattened = parsed.error.flatten();
  const fieldErrors = Object.entries(flattened.fieldErrors)
    .map(([key, value]) => `${key}: ${value?.join(", ")}`)
    .join("; ");
  const formErrors = flattened.formErrors.join("; ");

  throw new Error(
    `Invalid environment configuration. ${[fieldErrors, formErrors]
      .filter(Boolean)
      .join("; ")}`.trim(),
  );
}

export const env = loadEnv(process.env);
