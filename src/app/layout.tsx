import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SalleRésa — Réservation de Salles de Réunion',
  description: 'Réservez vos salles de réunion facilement',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
