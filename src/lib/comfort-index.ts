// ============================================================
// ClimaSense Comfort Index Algorithm
// ============================================================
// A weighted composite score (0-100) inspired by the Universal
// Thermal Climate Index (UTCI). Uses Gaussian decay functions
// centered on ideal values for each weather parameter.
//
// Formula:
//   ComfortIndex = (TempScore × 0.40) + (HumidityScore × 0.25)
//                + (WindScore × 0.20) + (CloudScore × 0.15)
//
// Each sub-score uses:
//   SubScore = 100 × exp(-0.5 × ((value - ideal) / sigma)²)
// ============================================================

/**
 * Weather parameters needed to compute the Comfort Index.
 * These map directly to fields in the OpenWeatherMap API response.
 */
export interface WeatherParams {
  temperature: number;  // in Celsius (converted from Kelvin)
  humidity: number;     // percentage (0-100)
  windSpeed: number;    // in m/s
  cloudiness: number;   // percentage (0-100)
}

/**
 * Configuration for a single Gaussian scoring function.
 * - ideal: the value where comfort is maximized (score = 100)
 * - sigma: controls how quickly the score drops away from ideal
 *          (smaller sigma = stricter, larger = more forgiving)
 * - weight: how much this parameter contributes to the final score
 */
interface ScoringParam {
  ideal: number;
  sigma: number;
  weight: number;
}

/**
 * Scoring configuration for each weather parameter.
 * 
 * Why these values?
 * - Temperature (40%): Dominant factor in thermal comfort.
 *   23°C is widely accepted as ideal room/outdoor temperature.
 *   σ=8 gives a gentle drop — 15°C and 31°C still score ~68.
 * 
 * - Humidity (25%): High humidity (>70%) prevents sweat evaporation,
 *   making heat unbearable. Very low (<20%) causes dry skin/eyes.
 *   45% is the midpoint of the 30-60% comfort zone. σ=20 is forgiving.
 * 
 * - Wind Speed (20%): A gentle breeze (3 m/s ≈ 11 km/h) aids
 *   evaporative cooling. Calm air feels stuffy; gales are unpleasant.
 *   σ=4 drops the score noticeably above ~10 m/s.
 * 
 * - Cloudiness (15%): Partial cloud cover (40%) reduces UV/glare
 *   without feeling overcast. Least physiological impact, hence
 *   lowest weight. σ=30 is very forgiving — even 0% or 100% scores ~40.
 */
const SCORING_CONFIG: Record<keyof WeatherParams, ScoringParam> = {
  temperature: { ideal: 23, sigma: 8, weight: 0.40 },
  humidity:    { ideal: 45, sigma: 20, weight: 0.25 },
  windSpeed:   { ideal: 3,  sigma: 4, weight: 0.20 },
  cloudiness:  { ideal: 40, sigma: 30, weight: 0.15 },
};

/**
 * Gaussian decay function.
 * Returns a value from 0 to 100, peaking at the ideal value.
 * 
 * Mathematical explanation:
 * - When value === ideal: exponent = 0, e^0 = 1, score = 100
 * - As value moves away from ideal: exponent grows negative,
 *   e^(negative) approaches 0, score approaches 0
 * - sigma controls the "width" of the bell curve
 */
function gaussianScore(value: number, ideal: number, sigma: number): number {
  const exponent = -0.5 * Math.pow((value - ideal) / sigma, 2);
  return 100 * Math.exp(exponent);
}

/**
 * Compute the ClimaSense Comfort Index for given weather conditions.
 * 
 * @param params - Weather parameters (temperature in °C, humidity %,
 *                 wind speed m/s, cloudiness %)
 * @returns A score from 0 to 100 where:
 *          90-100 = Excellent (perfect day)
 *          70-89  = Good (comfortable for most people)
 *          50-69  = Moderate (some discomfort)
 *          30-49  = Poor (noticeable discomfort)
 *          0-29   = Harsh (extreme conditions)
 */
export function computeComfortIndex(params: WeatherParams): number {
  let totalScore = 0;

  // Calculate weighted sum of all Gaussian sub-scores
  for (const [key, config] of Object.entries(SCORING_CONFIG)) {
    const value = params[key as keyof WeatherParams];
    const subScore = gaussianScore(value, config.ideal, config.sigma);
    totalScore += subScore * config.weight;
  }

  // Clamp to [0, 100] for safety (Gaussian naturally stays in range,
  // but floating-point arithmetic could theoretically exceed bounds)
  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

/**
 * Get a human-readable comfort level label for a given score.
 */
export function getComfortLevel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Poor';
  return 'Harsh';
}

/**
 * Get a color code for the comfort score (for UI display).
 * Green = comfortable, Yellow = moderate, Red = harsh.
 */
export function getComfortColor(score: number): string {
  if (score >= 90) return '#22c55e'; // green-500
  if (score >= 70) return '#84cc16'; // lime-500
  if (score >= 50) return '#eab308'; // yellow-500
  if (score >= 30) return '#f97316'; // orange-500
  return '#ef4444';                  // red-500
}

/**
 * Convert temperature from Kelvin (OpenWeatherMap default) to Celsius.
 */
export function kelvinToCelsius(kelvin: number): number {
  return Math.round((kelvin - 273.15) * 10) / 10;
}
