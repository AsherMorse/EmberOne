/**
 * Root layout with global providers and styles.
 * Includes Geist fonts and auth context.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AuthProvider } from '@/lib/auth/context';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/Provider';

// Geist Sans font config
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono font config
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EmberOne',
  description: 'Kindling Connections, One Ticket at a Time',
  icons: {
    icon: '/favicon.ico',
  },
};

/** Root layout with HTML structure and providers */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCProvider>
          <AuthProvider>{children}</AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
