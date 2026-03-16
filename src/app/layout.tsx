import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Studio One AI — The Multimodal Movie Engine',
  description:
    'Talk to your AI Director. Write scripts, generate storyboards, produce cinematic clips, and export finished movies — all from one conversational interface powered by Gemini.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${nunito.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

