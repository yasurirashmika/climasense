import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ClimaSense',
  description:
    'Real-time weather analytics dashboard with custom Comfort Index scoring for cities worldwide.',
};

/**
 * Root layout — wraps the entire application.
 *
 * UserProvider: Makes Auth0 user session available to all
 * client components via the useUser() hook. It reads the
 * session cookie set by the server-side Auth0 SDK.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} antialiased`}>
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}
