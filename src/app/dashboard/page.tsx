'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState, useMemo } from 'react';
import type { CityWeatherResult } from '../../lib/weather-api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Inline SVGs to guarantee rendering in React 19 ---
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>);
const ForecastIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const MapIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const LogoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>);

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [weatherData, setWeatherData] = useState<CityWeatherResult[]>([]);
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const weatherRes = await fetch('/api/weather');
        if (weatherRes.ok) {
          const data = await weatherRes.json();
          setWeatherData(data.cities || []);
        }
        const cacheRes = await fetch('/api/weather/cache-status');
        if (cacheRes.ok) {
          setCacheStatus(await cacheRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return weatherData;
    return weatherData.filter(c => c.cityName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [weatherData, searchTerm]);

  const bestCity = useMemo(() => {
    if (!weatherData.length) return null;
    return [...weatherData].sort((a, b) => b.comfortScore - a.comfortScore)[0];
  }, [weatherData]);

  const averageScore = useMemo(() => {
    if (!weatherData.length) return 0;
    const total = weatherData.reduce((acc, city) => acc + city.comfortScore, 0);
    return Math.round(total / weatherData.length);
  }, [weatherData]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-sm font-medium text-main animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] font-sans text-main overflow-x-hidden">
      
      {/* Sidebar: Collapsible */}
      <aside className={`
        flex flex-col shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-50 sticky top-0 h-screen transition-all duration-300 shadow-sm
        ${isSidebarOpen ? 'w-[260px] p-6' : 'w-0 p-0 opacity-0 overflow-hidden border-none'}
      `}>
        <div className="flex items-center gap-3 mb-10 min-w-[200px]">
          <div className="w-8 h-8 relative shrink-0 flex items-center justify-center">
            <LogoIcon />
          </div>
          <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">ClimaSense</h1>
        </div>

        <nav className="flex-1 space-y-2 min-w-[200px]">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-brand rounded-xl font-semibold transition-colors">
            <div className="shrink-0"><DashboardIcon /></div>
            <span className="text-sm whitespace-nowrap">Dashboard</span>
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 px-4 py-3 text-sub hover:bg-[var(--bg-primary)] hover:text-main rounded-xl font-medium transition-colors">
            <div className="shrink-0"><ForecastIcon /></div>
            <span className="text-sm whitespace-nowrap">Forecast</span>
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 px-4 py-3 text-sub hover:bg-[var(--bg-primary)] hover:text-main rounded-xl font-medium transition-colors">
            <div className="shrink-0"><MapIcon /></div>
            <span className="text-sm whitespace-nowrap">World Map</span>
          </a>
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--border-color)] min-w-[200px] pb-4">
          <a href="/auth/logout" className="flex items-center gap-3 px-4 py-3 text-sub hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 rounded-xl font-medium transition-colors">
            <div className="shrink-0"><LogoutIcon /></div>
            <span className="text-sm whitespace-nowrap">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-[var(--bg-primary)] h-screen overflow-hidden">
        
        {/* Full-width Header with distinct background */}
        <header className="h-[72px] shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] z-40 shadow-sm transition-all duration-300 w-full">
          <div className="max-w-6xl mx-auto w-full h-full px-6 lg:px-8 flex items-center justify-between">
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 rounded-lg text-sub hover:bg-[var(--bg-primary)] hover:text-main transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                aria-label="Toggle Sidebar"
              >
                <MenuIcon />
              </button>

              <div>
                <h2 className="text-xl font-bold tracking-tight">Weather Analytics</h2>
                <p className="text-xs text-sub mt-1.5 hidden sm:block">Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-48 md:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sub">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="Search city..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-brand transition-colors"
                />
              </div>
              <button onClick={toggleTheme} className="p-2 border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-lg text-sub hover:text-main transition-colors" title="Toggle Theme">
                🌓
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            
            {/* Section 1: Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
              <div className="analytics-card flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-sub uppercase tracking-wider">Cities Monitored</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${cacheStatus?.cacheStatus === 'HIT' || cacheStatus?.processed?.status === 'HIT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
                    Cache: {cacheStatus?.cacheStatus || cacheStatus?.processed?.status || 'MISS'}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold">{weatherData.length}</span>
                </div>
              </div>
              
              <div className="analytics-card flex flex-col justify-center">
                <span className="text-xs font-semibold text-sub uppercase tracking-wider mb-2">Average Comfort</span>
                <div className="text-4xl font-bold text-amber-500">{averageScore}</div>
              </div>

              <div className="analytics-card flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-sub uppercase tracking-wider mb-2 block">Best City</span>
                  <div className="text-2xl font-bold">{bestCity?.cityName || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-sub uppercase tracking-wider mb-2 block">Score</span>
                  <div className="text-3xl font-bold text-emerald-500">{bestCity?.comfortScore || 0}</div>
                </div>
              </div>
            </div>

            {/* Section 2: Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Left Column (Main Analytics) */}
              <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                
                {/* Top Recommended City: Horizontal Card */}
                {bestCity && (
                  <div className="analytics-card flex flex-col sm:flex-row items-center justify-between !py-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
                        {bestCity.weather && (
                          <img src={`https://openweathermap.org/img/wn/${bestCity.weather.icon}@2x.png`} alt="weather" className="w-12 h-12" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-brand uppercase tracking-wider mb-0.5">Top Recommended</div>
                        <h3 className="text-xl font-bold">{bestCity.cityName}</h3>
                        {bestCity.weather && (
                          <p className="text-sm text-sub capitalize">{bestCity.weather.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[var(--border-color)] pt-4 sm:pt-0 sm:pl-6">
                      <div>
                        <div className="text-xs text-sub mb-1">Temp</div>
                        <div className="text-xl font-bold">{bestCity.temperature.toFixed(1)}°</div>
                      </div>
                      <div>
                        <div className="text-xs text-sub mb-1">Humidity</div>
                        <div className="text-sm font-semibold">{bestCity.humidity}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-sub mb-1">Wind</div>
                        <div className="text-sm font-semibold">{bestCity.windSpeed}m/s</div>
                      </div>
                      <div className="text-right ml-auto sm:ml-4">
                        <div className="text-[10px] uppercase font-bold text-sub mb-1">Score</div>
                        <div className="text-2xl font-bold text-emerald-500">{bestCity.comfortScore}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comfort Score Chart */}
                <div className="analytics-card">
                  <h3 className="text-sm font-bold mb-4">Comfort Score Distribution</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...weatherData].sort((a,b) => b.comfortScore - a.comfortScore)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="cityName" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                          itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="comfortScore" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Right Column: Rankings List */}
              <div className="analytics-card flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold">City Rankings</h3>
                  <span className="text-[10px] font-semibold text-sub uppercase">Score</span>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {filteredData.map((city, index) => {
                    const scoreColor = city.comfortScore >= 80 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 
                                       city.comfortScore >= 60 ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 
                                       'text-red-500 bg-red-50 dark:bg-red-500/10';
                    
                    return (
                      <div key={city.cityCode} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-bold text-sub w-4">{index + 1}.</div>
                          <div>
                            <div className="text-sm font-semibold">{city.cityName}</div>
                            <div className="text-xs text-sub">{city.temperature.toFixed(0)}°C, {city.humidity}%</div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${scoreColor}`}>
                          {city.comfortScore}
                        </div>
                      </div>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <div className="text-xs text-sub text-center py-4">No cities found.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
