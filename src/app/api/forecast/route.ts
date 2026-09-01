import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Cache forecasts for 10 minutes (600 seconds)
const forecastCache = new NodeCache({ stdTTL: 600 });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('cityCode');

    if (!cityCode) {
      return NextResponse.json({ error: 'Missing cityCode parameter' }, { status: 400 });
    }

    const cacheKey = `forecast_${cityCode}`;
    const cachedData = forecastCache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({ data: cachedData, source: 'cache' });
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY || process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Fetch 5-day/3-hour forecast data
    const url = `https://api.openweathermap.org/data/2.5/forecast?id=${cityCode}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from OpenWeatherMap' }, { status: response.status });
    }

    const rawData = await response.json();
    
    // Extract the next 24 hours of data (8 data points, since it's 3-hour intervals)
    // Map it to a clean format for Recharts
    const trendData = rawData.list.slice(0, 8).map((item: any) => {
      // Convert timestamp to a readable short time (e.g., "14:00")
      const date = new Date(item.dt * 1000);
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return {
        time: timeString,
        temp: Math.round(item.main.temp),
      };
    });

    forecastCache.set(cacheKey, trendData);

    return NextResponse.json({ data: trendData, source: 'api' });
    
  } catch (error) {
    console.error('Forecast API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
