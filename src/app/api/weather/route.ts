import { NextResponse } from 'next/server';
import { getWeatherData } from '../../../lib/weather-api';

/**
 * GET /api/weather
 *
 * Returns weather data + comfort scores for all cities.
 * Response includes cacheStatus ("HIT" or "MISS") so the
 * frontend can display whether data came from cache.
 *
 * Protected by Auth0 middleware (added in Step 8).
 * For now, it's open so we can test it.
 */
export async function GET() {
  try {
    const data = await getWeatherData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Tell browsers not to cache this — our server-side cache handles it
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
