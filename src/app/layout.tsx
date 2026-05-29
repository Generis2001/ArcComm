import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ArcCom — Creator monetization on Arc Testnet',
  description:
    'Support creators and earn in USDC. Wallet-native subscriptions, exclusive content, and digital products on Arc Testnet.',
  icons: {
    icon: '/assets/logo.svg',
    shortcut: '/assets/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
