import { auth0 } from '../lib/auth0';
import { redirect } from 'next/navigation';
import { CloudSunny } from 'iconsax-react';

export default async function Home() {
  // Check if user is already logged in
  const session = await auth0.getSession();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-var-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Main Content */}
      <main className="z-10 text-center max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="animate-fade-in delay-1 mb-8">
          <span className="inline-block py-1.5 px-4 rounded-full bg-var-secondary border border-var-color text-xs font-semibold tracking-wider text-var-secondary">
            v2.0 is now live
          </span>
        </div>

        {/* Logo/Icon */}
        <div className="flex justify-center mb-6 animate-fade-in delay-2">
          <div className="p-4 bg-var-secondary rounded-2xl shadow-sm border border-var-color text-accent-primary">
            <CloudSunny size="48" variant="Bulk" />
          </div>
        </div>

        {/* Hero Headline */}
        <h1 
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in delay-2 text-var-primary"
        >
          Intelligence for <br className="hidden md:block"/>
          <span className="text-accent-primary">Every Climate.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-var-secondary mb-10 max-w-2xl mx-auto animate-fade-in delay-3">
          ClimaSense analyzes real-time meteorological data across global cities, calculating the ultimate Comfort Index to help you decide your next destination.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-in delay-4"
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a href="/auth/login" className="btn-accent shadow-sm">
            Sign In to Dashboard →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-sm text-var-muted animate-fade-in delay-5 text-center">
        Powered by Next.js, Auth0, and OpenWeatherMap. <br/>
        Designed for human comfort.
      </footer>
    </div>
  );
}
