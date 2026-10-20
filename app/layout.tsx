import type { Metadata } from 'next';
import SessionProvider from '@/components/providers/SessionProvider';
import '@fontsource-variable/inter';
import './globals.css';

export const metadata: Metadata = {
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
