import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
  ),
  title: 'Margot Atlani - Diététicienne à Saint-Alban',
  description:
    'Margot Atlani, diététicienne à Saint-Alban. Consultations en nutrition, rééquilibrage alimentaire, suivi sportif et intolérances alimentaires.',
  openGraph: {
    title: 'Margot Atlani - Diététicienne à Saint-Alban',
    description:
      'Accompagnement nutritionnel bienveillant au cabinet, à Saint-Alban.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Margot Atlani - Diététicienne à Saint-Alban',
    description:
      'Accompagnement nutritionnel bienveillant au cabinet, à Saint-Alban.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
