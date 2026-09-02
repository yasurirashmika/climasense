# ClimaSense: Weather Analytics Dashboard

ClimaSense is a secure, full-stack weather analytics application built with **Next.js 16** and **TypeScript**. It fetches real-time meteorological data for global cities from OpenWeatherMap, processes it using a proprietary Comfort Index algorithm, and presents the insights on a beautifully designed, responsive dashboard.

**Live Demo:** [https://climasense-theta.vercel.app](https://climasense-theta.vercel.app)

## 🚀 Features

- **Real-Time Data Retrieval:** Fetches live weather data for multiple cities simultaneously via OpenWeatherMap.
- **Custom Comfort Index Algorithm:** Evaluates cities based on Temperature, Humidity, Wind Speed, and Cloudiness using a weighted Gaussian scoring model to determine a 0-100 "Comfort Score".
- **City Rankings:** All cities are ranked from "Most Comfortable" to "Least Comfortable" with color-coded scores.
- **24h Temperature Trend Graph:** Click any city to see its 24-hour temperature forecast visualized as an interactive area chart using Recharts.
- **Enterprise-Grade Security:** Fully secured using Auth0 with OIDC Authorization Code Flow. The dashboard is protected via Next.js edge middleware, and public sign-ups are disabled (whitelisted users only).
- **Multi-Factor Authentication (MFA):** MFA is enforced via Auth0 with One-Time Password (OTP) and Email verification factors enabled.
- **Server-Side Caching:** Implements a dual-layer in-memory caching system (via `node-cache`) — Layer 1 caches raw API responses per city, Layer 2 caches processed comfort results. Both use a 5-minute TTL. A debug endpoint (`/api/weather/cache-status`) shows HIT/MISS status.
- **Dark/Light Mode:** Toggle between dark and light themes with a single click. Preference is persisted.
- **Search & Filter:** Instantly filter city rankings from the frontend search bar without any API calls.
- **Responsive UI:** Fully responsive layout supporting mobile (sidebar drawer with hamburger menu) and desktop views.
- **Comprehensive Unit Tests:** Core algorithm logic is fully tested using Vitest.

---

## 📊 The Comfort Index Algorithm

The ClimaSense Comfort Index calculates a human-centric comfort score between `0` and `100` for any given city. It uses a **Weighted Gaussian Decay Model**, inspired by the Universal Thermal Climate Index (UTCI).

### How It Works
Instead of a simple linear scale, human comfort peaks at a specific "ideal" value and drops off non-linearly as conditions become extreme. We use a Gaussian function for each weather parameter:

```
SubScore = 100 × exp(-0.5 × ((value - ideal) / sigma)²)
```

This ensures that values close to the ideal score near 100, while values far from the ideal decay toward 0. The steepness of this decay is controlled by `sigma`.

### Parameter Weights & Reasoning

The final score is a weighted composite of four parameters:

| Parameter | Weight | Ideal Value | Sigma | Reasoning |
|---|---|---|---|---|
| **Temperature** | 40% | 23°C | 8 | Dominant physiological factor in thermal comfort. 23°C is widely accepted as ideal. σ=8 gives a gentle drop-off (15°C and 31°C still score ~68). |
| **Humidity** | 25% | 45% | 20 | High humidity prevents sweat evaporation; very low humidity causes dry skin. 45% is the sweet spot. Wide σ=20 reflects human adaptability. |
| **Wind Speed** | 20% | 3 m/s | 4 | A gentle breeze (3 m/s ≈ 11 km/h) aids evaporative cooling. Stagnant air feels stuffy; gales (>10 m/s) are unpleasant. |
| **Cloudiness** | 15% | 40% | 30 | Partial cloud cover reduces UV glare without feeling gloomy. Lowest physiological impact, hence lowest weight and widest σ. |

### Score Interpretation

| Score | Level | Description |
|---|---|---|
| 90–100 | Excellent | Perfect conditions |
| 70–89 | Good | Comfortable for most |
| 50–69 | Moderate | Some discomfort |
| 30–49 | Poor | Noticeable discomfort |
| 0–29 | Harsh | Extreme conditions |

---

## 🧠 Architectural Trade-offs & Considerations

### 1. Caching Strategy
* **Design:** We implemented a **dual-layer in-memory cache** using `node-cache` with a 5-minute TTL. Layer 1 caches raw OpenWeatherMap API responses per city (`weather_{cityCode}`). Layer 2 caches the fully processed and ranked comfort index results (`comfort_all`).
* **Trade-off:** In-memory caching means that if this application is deployed to a serverless environment (like Vercel) across multiple regions, the cache is not shared globally (each function instance has its own cache). For a production app at scale, a distributed cache like Redis (Upstash) would be preferable. However, for the scope of this assignment, `node-cache` introduces zero external latency and completely eliminates OpenWeatherMap API rate-limit violations during standard use.

### 2. Client-Side vs Server-Side Data Fetching
* **Design:** The Auth0 session is validated on the server via edge middleware, but the weather data is fetched via a client-side `useEffect` hitting our protected `/api/weather` endpoint.
* **Trade-off:** We could have used Next.js Server Components to fetch the data at request time and stream it to the client. We opted for a client-side fetch pattern to allow for a polished loading state (skeleton/pulse UI) and to easily support dynamic features like client-side search filtering and interactive chart switching without requiring full page reloads.

### 3. Authentication & Authorization Flow
* **Design:** Auth0 handles identity management using the OpenID Connect (OIDC) Authorization Code Flow. Public sign-ups are disabled via Auth0 tenant settings. Multi-Factor Authentication (MFA) is enforced with both OTP and Email factors enabled, with the policy set to "Always".
* **Trade-off:** Delegating identity management to Auth0 means we cannot build a custom "Profile Settings" page to change passwords directly inside ClimaSense. Users must manage their identity at the IdP level, which significantly increases security at the cost of slight UX friction.

### 4. Gaussian vs Linear Scoring
* **Design:** The Comfort Index uses Gaussian (bell curve) decay functions rather than simple linear interpolation.
* **Trade-off:** A linear formula would be simpler to implement and explain, but it cannot model the non-linear nature of human comfort. For example, the difference between 23°C and 28°C feels minor, but the difference between 35°C and 40°C is dramatic. The Gaussian approach naturally captures this diminishing-returns behavior.

---

## 🛠 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- pnpm (recommended) or npm
- An OpenWeatherMap API Key ([register here](https://openweathermap.org/api))
- An Auth0 Tenant & Application ([register here](https://auth0.com))

### 2. Clone & Install

```bash
git clone https://github.com/yasurirashmika/climasense.git
cd climasense
pnpm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```bash
# Auth0 Configuration
AUTH0_SECRET='use_a_long_randomly_generated_string_32_characters_minimum'
APP_BASE_URL='http://localhost:3000'
AUTH0_DOMAIN='your-tenant.auth0.com'
AUTH0_CLIENT_ID='your_auth0_client_id'
AUTH0_CLIENT_SECRET='your_auth0_client_secret'

# OpenWeatherMap API
OPENWEATHERMAP_API_KEY='your_openweathermap_api_key'
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Running Unit Tests

```bash
pnpm test
```

### 6. Build for Production

```bash
pnpm build
```

### 7. Test Credentials
Because public signups are disabled, use the following test user to log in:
- **Email:** `careers@fidenz.com`
- **Password:** `Pass#fidenz`

---

## 🌐 Deployment

The application is deployed on **Vercel** at [https://climasense-theta.vercel.app](https://climasense-theta.vercel.app).

To deploy your own instance:
1. Push the repo to GitHub/GitLab.
2. Import the project in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` (update `APP_BASE_URL` to your Vercel domain).
4. Update Auth0 Allowed Callback URLs to include `https://your-domain.vercel.app/auth/callback`.
5. Update Auth0 Allowed Logout URLs to include `https://your-domain.vercel.app`.

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Authentication | Auth0 (`@auth0/nextjs-auth0`) |
| Styling | Tailwind CSS + CSS Custom Properties |
| Charts | Recharts |
| Caching | node-cache (in-memory, dual-layer) |
| Testing | Vitest |
| Deployment | Vercel |
| Weather API | OpenWeatherMap |

---

## ⚠️ Known Limitations

- **API Rate Limits:** The OpenWeatherMap free tier limits requests to 60/minute. The caching layer mitigates this, but a massive influx of concurrent users during a cold start could temporarily hit rate limits.
- **In-Memory Cache:** Cache is per-instance in serverless environments. A distributed cache (Redis/Upstash) would be needed for multi-region production deployments.
- **MFA Email Factor:** Auth0's free tier does not allow Email to be the sole MFA factor — OTP must remain enabled as a baseline. Both OTP and Email are enabled, and users can select their preferred method during enrollment.
- **Forecast Sidebar Tabs:** The "Forecast" and "World Map" sidebar tabs are placeholder screens, as multi-day forecasting and map integration were outside the core assignment scope.
