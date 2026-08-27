import type { Metadata } from 'next';
import { Noto_Serif_Display, Poppins } from 'next/font/google';
import './globals.css';

const notoSerifDisplay = Noto_Serif_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const glacialFallback = Poppins({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
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
      <body className={`${notoSerifDisplay.variable} ${glacialFallback.variable}`}>
        {children}
      </body>
    </html>
  );
}
