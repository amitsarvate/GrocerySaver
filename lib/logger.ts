import pino from "pino";

import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "grocerysaver",
    env: env.NODE_ENV ?? "development",
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true,
  },
});
