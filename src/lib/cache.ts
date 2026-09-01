import NodeCache from 'node-cache';

// ============================================================
// Dual-Layer Cache for ClimaSense
// ============================================================
// Layer 1 (RAW):       Caches individual OpenWeatherMap API responses
//                      Key: "weather_{cityCode}", TTL: 5 minutes
// Layer 2 (PROCESSED): Caches the computed comfort index results
//                      Key: "comfort_all", TTL: 5 minutes
//
// Why two layers?
// - If only one city's raw data expires, we don't need to re-fetch
//   ALL cities — just the expired one.
// - The processed cache avoids re-computing the Comfort Index
//   when all raw data is still fresh.
// ============================================================

const CACHE_TTL = 300; // 5 minutes in seconds

// Raw weather data cache (one entry per city)
const rawCache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: 60,      // Check for expired keys every 60 seconds
  useClones: false,      // Return references (faster, safe for read-only data)
});

// Processed comfort index cache (single entry for all cities)
const processedCache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: 60,
  useClones: false,
});

// ---- Raw Cache Operations ----

/**
 * Get cached raw weather data for a city.
 * Returns undefined on cache MISS.
 */
export function getRawWeather(cityCode: string): object | undefined {
  return rawCache.get(`weather_${cityCode}`);
}

/**
 * Store raw weather data for a city.
 */
export function setRawWeather(cityCode: string, data: object): void {
  rawCache.set(`weather_${cityCode}`, data);
}

// ---- Processed Cache Operations ----

/**
 * Get cached processed comfort index results.
 * Returns undefined on cache MISS.
 */
export function getProcessedResults(): object | undefined {
  return processedCache.get('comfort_all');
}

/**
 * Store processed comfort index results.
 */
export function setProcessedResults(data: object): void {
  processedCache.set('comfort_all', data);
}

// ---- Cache Status (for debug endpoint) ----

/**
 * Returns the status of all cache entries.
 * Used by the /api/weather/cache-status debug endpoint.
 * 
 * For each key, returns:
 * - status: "HIT" (data exists) or "MISS" (expired or never cached)
 * - ttl: seconds remaining before expiry (0 if MISS)
 */
export function getCacheStatus(cityCodes: string[]) {
  const rawStatus: Record<string, { status: string; ttl: number }> = {};

  for (const code of cityCodes) {
    const key = `weather_${code}`;
    const ttl = rawCache.getTtl(key);

    if (ttl) {
      // ttl is a Unix timestamp in ms — convert to seconds remaining
      const secondsRemaining = Math.round((ttl - Date.now()) / 1000);
      rawStatus[key] = {
        status: 'HIT',
        ttl: secondsRemaining,
      };
    } else {
      rawStatus[key] = {
        status: 'MISS',
        ttl: 0,
      };
    }
  }

  // Check processed cache
  const processedTtl = processedCache.getTtl('comfort_all');
  const processedStatus = processedTtl
    ? {
        status: 'HIT' as const,
        ttl: Math.round((processedTtl - Date.now()) / 1000),
      }
    : {
        status: 'MISS' as const,
        ttl: 0,
      };

  return {
    raw: rawStatus,
    processed: processedStatus,
    stats: {
      rawKeys: rawCache.keys().length,
      rawHits: rawCache.getStats().hits,
      rawMisses: rawCache.getStats().misses,
      processedHits: processedCache.getStats().hits,
      processedMisses: processedCache.getStats().misses,
    },
  };
}