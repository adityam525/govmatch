import type { Metadata } from 'next';
import SessionProvider from '@/components/providers/SessionProvider';
import '@fontsource-variable/inter';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: { siteName: 'GovMatch', type: 'website', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
  title: 'GovMatch — Find Government Jobs That Match Your Profile',
  description: 'Personalized government job recommendations for Indian job seekers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
