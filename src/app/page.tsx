'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Landing Page (Public)
 *
 * - If user is already logged in → redirect to /dashboard
 * - If not logged in → show hero section with login CTA
 *
 * This is a client component because:
 * - useUser() hook needs client-side React context
 * - useRouter() for client-side navigation
 */
export default function HomePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Hero Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}>
        {/* Logo / Brand */}
        <div className="animate-fade-in" style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>🌤️</span>
        </div>

        <h1
          className="animate-fade-in"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}
        >
          <span className="gradient-text">ClimaSense</span>
        </h1>

        <p
          className="animate-fade-in delay-1"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            marginBottom: '0.5rem',
            lineHeight: 1.6,
          }}
        >
          Real-time weather analytics with a custom{' '}
          <strong style={{ color: 'var(--accent-primary)' }}>Comfort Index</strong>{' '}
          that ranks cities from most to least comfortable.
        </p>

        <p
          className="animate-fade-in delay-2"
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            maxWidth: '500px',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}
        >
          Powered by OpenWeatherMap • Secured by Auth0 • Built with Next.js
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in delay-3"
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a href="/auth/login" className="btn-accent">
            🔐 Sign In to Dashboard
          </a>
        </div>

        {/* Feature Pills */}
        <div
          className="animate-fade-in delay-4"
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['10 Global Cities', 'Comfort Scoring', 'Server-Side Caching', 'Dark Mode'].map(
            (feature) => (
              <span
                key={feature}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {feature}
              </span>
            )
          )}
        </div>
      </div>
    </main>
  );
}
