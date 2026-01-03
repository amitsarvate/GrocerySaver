process.env.DATABASE_URL ??=
  "postgresql://grocerysaver:grocerysaver@localhost:5432/grocerysaver";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.GEOCODER_USER_AGENT ??= "GrocerySaver/0.1 (vitest)";
process.env.GEOCODER_THROTTLE_MS ??= "1";
