import { createClient } from "redis";

import { env } from "../env";
import { logger } from "../logger";
import type { NearbyStore } from "../stores/types";

const CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = {
  value: NearbyStore[];
  expiresAt: number;
};

const inMemoryCache = new Map<string, CacheEntry>();

let redisClient: ReturnType<typeof createClient> | null = null;
let redisReady = false;
let redisInit: Promise<boolean> | null = null;

function shouldUseRedis(): boolean {
  return process.env.NODE_ENV !== "test";
}

async function ensureRedis(): Promise<boolean> {
  if (!shouldUseRedis()) return false;
  if (redisInit) return redisInit;

  redisInit = (async () => {
    try {
      redisClient = createClient({ url: env.REDIS_URL });
      redisClient.on("error", (err) => {
        logger.warn({ err }, "redis error");
      });
      await redisClient.connect();
      redisReady = true;
      return true;
    } catch (error) {
      logger.warn({ err: error }, "redis unavailable, using memory cache");
      redisReady = false;
      return false;
    }
  })();

  return redisInit;
}

export function buildNearbyStoresCacheKey(lat: number, lng: number): string {
  return `nearbyStores:${lat.toFixed(4)}:${lng.toFixed(4)}`;
}

export async function getCachedNearbyStores(
  key: string,
): Promise<NearbyStore[] | null> {
  if (redisReady || (await ensureRedis())) {
    try {
      const raw = await redisClient!.get(key);
      return raw ? (JSON.parse(raw) as NearbyStore[]) : null;
    } catch (error) {
      logger.warn({ err: error }, "redis read failed");
    }
  }

  const entry = inMemoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function setCachedNearbyStores(
  key: string,
  stores: NearbyStore[],
): Promise<void> {
  const expiresAt = Date.now() + CACHE_TTL_MS;
  inMemoryCache.set(key, { value: stores, expiresAt });

  if (redisReady || (await ensureRedis())) {
    try {
      await redisClient!.set(key, JSON.stringify(stores), {
        PX: CACHE_TTL_MS,
      });
    } catch (error) {
      logger.warn({ err: error }, "redis write failed");
    }
  }
}

export function clearInMemoryNearbyStoresCache(): void {
  inMemoryCache.clear();
}
