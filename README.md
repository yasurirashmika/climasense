# ClimaSense: Weather Analytics Dashboard

ClimaSense is a secure, full-stack weather analytics application built with Next.js 14. It fetches real-time meteorological data for global cities from OpenWeatherMap, processes it using a proprietary Comfort Index algorithm, and presents the insights on a beautifully designed, responsive dashboard.

## 🚀 Features

- **Real-Time Data Retrieval:** Fetches live weather data for multiple cities simultaneously via OpenWeatherMap.
- **Custom Comfort Index Algorithm:** Evaluates cities based on Temperature, Humidity, Wind Speed, and Cloudiness using a weighted Gaussian scoring model to determine a 0-100 "Comfort Score".
- **Enterprise-Grade Security:** Fully secured using Auth0. The dashboard is protected, and public sign-ups are disabled (whitelisted users only).
- **Server-Side Caching:** Implements an in-memory caching layer (via `node-cache`) to respect API rate limits, ensure sub-second dashboard load times, and drastically reduce external API costs.
- **Modern UI/UX:** Features a sleek dark/light mode SaaS aesthetic, responsive layouts for mobile and desktop, glassmorphism elements, and Recharts integration for data visualization.
- **Comprehensive Unit Tests:** Core algorithm logic is fully tested using Vitest.

---

## 📊 The Comfort Index Algorithm

The ClimaSense Comfort Index calculates a human-centric comfort score between `0` and `100` for any given city. It uses a **Weighted Gaussian Decay Model**, inspired by the Universal Thermal Climate Index (UTCI).

### How It Works
Instead of a simple linear scale, human comfort peaks at a specific "ideal" value and drops off non-linearly as conditions become extreme. We use a Gaussian function for each weather parameter:
`SubScore = 100 × exp(-0.5 × ((value - ideal) / sigma)²)`

This ensures that values close to the ideal score near 100, while values far from the ideal decay toward 0. The steepness of this decay is controlled by `sigma`.

### Parameter Weights & Reasoning

The final score is a weighted composite of four parameters:

1. **Temperature (40% Weight | Ideal: 23°C | Sigma: 8)**
   * **Reasoning:** Temperature is the dominant physiological factor in human thermal comfort. 23°C is widely accepted as an ideal ambient outdoor temperature. The standard deviation (`sigma=8`) gives a gentle drop-off, meaning 15°C and 31°C still score decently (~68), but extremes rapidly approach 0.
2. **Humidity (25% Weight | Ideal: 45% | Sigma: 20)**
   * **Reasoning:** High humidity prevents sweat evaporation, making heat unbearable, while very low humidity causes dry skin and respiratory irritation. 45% is the sweet spot. We use a wide sigma (`20`) because humans are relatively adaptable to humidity variations compared to temperature.
3. **Wind Speed (20% Weight | Ideal: 3 m/s | Sigma: 4)**
   * **Reasoning:** A gentle breeze (3 m/s ≈ 11 km/h) aids evaporative cooling and feels pleasant. Completely stagnant air (0 m/s) feels stuffy, while gales (>10 m/s) are highly unpleasant.
4. **Cloudiness (15% Weight | Ideal: 40% | Sigma: 30)**
   * **Reasoning:** Partial cloud cover reduces harsh UV glare without feeling gloomy. It has the lowest physiological impact, hence the lowest weight (15%) and the widest sigma (`30`), making the algorithm highly forgiving of varying sky conditions.

---

## 🧠 Architectural Trade-offs & Considerations

### 1. Caching Strategy
* **Design:** We implemented an in-memory `node-cache` inside the Next.js API route (`/api/weather`) with a 5-minute TTL (Time-To-Live).
* **Trade-off:** In-memory caching means that if this application is deployed to a serverless environment (like Vercel) across multiple Edge regions, the cache is not shared globally (each lambda instance has its own cold start cache). For a production app at scale, a distributed cache like Redis (Upstash) would be preferable. However, for the scope of this assignment, `node-cache` introduces zero external latency and completely eliminates OpenWeatherMap API rate-limit violations during development and standard use.

### 2. Client-Side vs Server-Side Data Fetching
* **Design:** The Auth0 session is validated on the server, but the weather data is fetched via a client-side `useEffect` hitting our protected `/api/weather` endpoint.
* **Trade-off:** We could have used Next.js Server Components to fetch the data at request time and stream it to the client. We opted for a client-side fetch pattern to allow for a beautiful loading state (skeleton/pulse UI) and to easily support dynamic features like live polling and client-side sorting without requiring full page reloads.

### 3. Authentication Flow
* **Design:** Public sign-ups are disabled via Auth0 tenant settings. Multi-Factor Authentication (MFA) is enforced via Auth0 Email verification policies. 
* **Trade-off:** Delegating identity management to Auth0 means we cannot build a custom "Profile Settings" page to change passwords directly inside ClimaSense. Users must manage their identity at the IdP level, which significantly increases security at the cost of slight UX friction.

---

## 🛠 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- pnpm or npm
- An OpenWeatherMap API Key
- An Auth0 Tenant Domain & Application

### 2. Environment Variables
Clone the repository and create a `.env.local` file in the root directory. Add the following variables:

```bash
# Auth0 Configuration
AUTH0_SECRET='use_a_long_randomly_generated_string_32_characters_minimum'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'

# OpenWeatherMap API
OPENWEATHER_API_KEY='YOUR_OPENWEATHERMAP_API_KEY'
```

### 3. Installation & Running

Install dependencies and start the development server:
```bash
pnpm install
pnpm dev
```

### 4. Running Unit Tests
To run the Vitest test suite for the Comfort Index algorithm:
```bash
pnpm test
```

### 5. Test Credentials
Because public signups are disabled, you can use the following test user to log in:
- **Email:** `careers@fidenz.com`
- **Password:** `Pass#fidenz`

---

## ⚠️ Known Limitations
- **API Limits:** The OpenWeatherMap free tier limits requests to 60/minute. Our caching layer mitigates this, but if the cache is bypassed concurrently by a massive influx of users during a cold start, the API key may temporarily rate-limit.
- **Forecast Module:** The "Forecast" and "World Map" sidebar tabs are currently beautiful placeholder screens, as multi-day forecasting requires a premium OpenWeatherMap API tier not utilized in this version.
