// src/shared/utils/cache/index.ts

import { ICache } from "./cache.interface";
import { MemoryCache } from "./memory-cache";

// Criar instância padrão do cache
const defaultCache: ICache = new MemoryCache(
  parseInt(process.env.CACHE_DEFAULT_TTL || "3600", 10),
  parseInt(process.env.CACHE_CLEANUP_INTERVAL || "60000", 10)
);

export { ICache, MemoryCache, defaultCache };
