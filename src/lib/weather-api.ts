import { promises as fs } from 'fs';
import path from 'path';
import {
  computeComfortIndex,
  getComfortLevel,
  getComfortColor,
  kelvinToCelsius,
  WeatherParams,
} from './comfort-index';
import {
  getRawWeather,
  setRawWeather,
  getProcessedResults,
  setProcessedResults,
} from './cache';

// ============================================================
// Weather API Service
// ============================================================
// Orchestrates: data loading → caching → API fetching →
// comfort scoring → ranking. This is the main "brain" that
// the API route calls.
// ============================================================

/** Shape of each city in cities.json */
interface CityEntry {
  CityCode: string;
  CityName: string;
}

/** Shape of the cities.json file */
interface CitiesFile {
  List: CityEntry[];
}

/** The processed result for a single city, sent to the frontend */
export interface CityWeatherResult {
  rank: number;
  cityCode: string;
  cityName: string;
  country: string;
  weather: {
    description: string;
    icon: string;
    main: string;
  };
  temperature: number;       // Celsius
  feelsLike: number;         // Celsius
  humidity: number;          // %
  windSpeed: number;         // m/s
  cloudiness: number;        // %
  pressure: number;          // hPa
  visibility: number;        // meters
  comfortScore: number;      // 0-100
  comfortLevel: string;      // "Excellent", "Good", etc.
  comfortColor: string;      // hex color for UI
}

/** Full response from the service */
export interface WeatherResponse {
  cities: CityWeatherResult[];
  cachedAt: string | null;    // ISO timestamp if from cache
  fetchedAt: string;          // ISO timestamp of this response
  cacheStatus: 'HIT' | 'MISS';
}

// ---- Helper: Load cities from JSON ----

let citiesCache: CityEntry[] | null = null;

/**
 * Reads and parses cities.json.
 * Cached in memory after first read (file doesn't change at runtime).
 */
export async function loadCities(): Promise<CityEntry[]> {
  if (citiesCache) return citiesCache;

  const filePath = path.join(process.cwd(), 'data', 'cities.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const parsed: CitiesFile = JSON.parse(fileContent);

  citiesCache = parsed.List;
  return citiesCache;
}

// ---- Helper: Fetch weather from OpenWeatherMap ----

/**
 * Fetches current weather for a single city from OpenWeatherMap.
 * Uses the city ID endpoint with metric units.
 *
 * Why not use `units=metric`?
 * We COULD pass &units=metric to get Celsius directly, but then
 * the raw cached data would be in a non-standard format. By keeping
 * the default (Kelvin), we store the canonical API response and
 * convert only when processing. This makes debugging easier.
 */
async function fetchWeatherFromAPI(cityCode: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY is not set in environment variables');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error for city ${cityCode}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ---- Main Service Function ----

/**
 * Fetches weather data for all cities, computes comfort scores,
 * and returns ranked results.
 *
 * Cache strategy:
 * 1. Check processed cache first (fastest path)
 * 2. If miss, check raw cache per city (avoid unnecessary API calls)
 * 3. If raw miss, fetch from OpenWeatherMap and cache the response
 * 4. Compute scores, rank, cache the processed result
 */
export async function getWeatherData(): Promise<WeatherResponse> {
  // Step 1: Check processed cache
  const cached = getProcessedResults() as WeatherResponse | undefined;
  if (cached) {
    return {
      ...cached,
      cacheStatus: 'HIT',
    };
  }

  // Step 2: Load city codes
  const cities = await loadCities();

  // Step 3: Fetch weather for each city (with per-city caching)
  const results: CityWeatherResult[] = [];

  for (const city of cities) {
    try {
      // Check raw cache first
      let rawData = getRawWeather(city.CityCode) as Record<string, unknown> | undefined;

      if (!rawData) {
        // Cache MISS — fetch from API
        rawData = await fetchWeatherFromAPI(city.CityCode);
        setRawWeather(city.CityCode, rawData);
      }

      // Step 4: Extract weather parameters
      const main = rawData.main as Record<string, number>;
      const wind = rawData.wind as Record<string, number>;
      const clouds = rawData.clouds as Record<string, number>;
      const weather = (rawData.weather as Array<Record<string, string>>)?.[0];
      const sys = rawData.sys as Record<string, string>;

      const temperature = kelvinToCelsius(main.temp);
      const feelsLike = kelvinToCelsius(main.feels_like);
      const humidity = main.humidity;
      const windSpeed = wind.speed;
      const cloudiness = clouds.all;

      // Step 5: Compute Comfort Index
      const params: WeatherParams = {
        temperature,
        humidity,
        windSpeed,
        cloudiness,
      };

      const comfortScore = computeComfortIndex(params);

      results.push({
        rank: 0, // Will be set after sorting
        cityCode: city.CityCode,
        cityName: (rawData.name as string) || city.CityName,
        country: sys.country || '',
        weather: {
          description: weather?.description || 'N/A',
          icon: weather?.icon || '01d',
          main: weather?.main || 'N/A',
        },
        temperature,
        feelsLike,
        humidity,
        windSpeed,
        cloudiness,
        pressure: main.pressure,
        visibility: (rawData.visibility as number) || 0,
        comfortScore,
        comfortLevel: getComfortLevel(comfortScore),
        comfortColor: getComfortColor(comfortScore),
      });
    } catch (error) {
      console.error(`Failed to fetch weather for ${city.CityName} (${city.CityCode}):`, error);
      // Skip failed cities rather than crashing the entire request
    }
  }

  // Step 6: Sort by comfort score (highest first = most comfortable)
  results.sort((a, b) => b.comfortScore - a.comfortScore);

  // Step 7: Assign rank positions (1-based)
  results.forEach((city, index) => {
    city.rank = index + 1;
  });

  // Step 8: Build response and cache it
  const now = new Date().toISOString();
  const response: WeatherResponse = {
    cities: results,
    cachedAt: now,
    fetchedAt: now,
    cacheStatus: 'MISS',
  };

  setProcessedResults(response);

  return response;
}
