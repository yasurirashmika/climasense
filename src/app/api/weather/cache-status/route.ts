import { NextResponse } from 'next/server';
import { getCacheStatus } from '../../../../lib/cache';
import { loadCities } from '../../../../lib/weather-api';

/**
 * GET /api/weather/cache-status
 *
 * Debug endpoint showing the current state of both cache layers.
 * For each city: HIT/MISS status and TTL (seconds remaining).
 * Also shows aggregate cache hit/miss statistics.
 *
 * Example response:
 * {
 *   "raw": {
 *     "weather_1248991": { "status": "HIT", "ttl": 243 },
 *     "weather_1850147": { "status": "MISS", "ttl": 0 }
 *   },
 *   "processed": { "status": "HIT", "ttl": 243 },
 *   "stats": { "rawHits": 10, "rawMisses": 10, ... }
 * }
 */
export async function GET() {
  try {
    // Load city codes to check their individual cache entries
    const cities = await loadCities();
    const cityCodes = cities.map((c) => c.CityCode);

    const status = getCacheStatus(cityCodes);

    return NextResponse.json(status, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Cache status error:', error);

    return NextResponse.json(
      { error: 'Failed to get cache status' },
      { status: 500 }
    );
  }
}
