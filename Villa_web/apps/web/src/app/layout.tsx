import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Savana Villa', template: '%s · Savana Villa' },
  description: 'Villa tropis untuk beristirahat, menikmati hidangan lokal, dan menciptakan kenangan baru di Ubud, Bali.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body className={`${manrope.variable} ${playfair.variable} font-sans`}><Providers>{children}</Providers></body></html>;
}
