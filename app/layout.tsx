import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Geist } from 'next/font/google';
import './globals.css';
import { SITE } from '@/content/site';
import { orgLd } from '@/lib/seo';
import { JsonLd } from '@/components/ui/JsonLd';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { TransitionProvider } from '@/components/layout/TransitionProvider';
import { CanvasRoot } from '@/components/3d/CanvasRoot';
import { Grain } from '@/components/layout/Grain';
import { Preloader } from '@/components/layout/Preloader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AltitudeRail } from '@/components/layout/AltitudeRail';
import { SoundToggle } from '@/components/layout/SoundToggle';
import { Cursor } from '@/components/layout/Cursor';
import { Toaster } from '@/components/ui/Toast';
import { EasterEgg } from '@/components/layout/EasterEgg';
import { BeatObserver } from '@/components/layout/BeatObserver';

const display = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display', display: 'swap' });
const text = Geist({ subsets: ['latin'], variable: '--font-text', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.short}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: '/api/og', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: { card: 'summary_large_image', images: ['/api/og'] },
};

export const viewport: Viewport = { themeColor: '#070B10', colorScheme: 'dark', width: 'device-width', initialScale: 1 };

const seenScript = `try{if(localStorage.getItem('ta_seen')==='1')document.documentElement.setAttribute('data-seen','')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: seenScript }} />
        <noscript>
          <style>{`main,header[data-nav]{opacity:1!important}#preloader{display:none!important}[data-split]{visibility:visible!important}`}</style>
        </noscript>
        <JsonLd data={orgLd} />
      </head>
      <body>
        <SmoothScroll />
        <TransitionProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <CanvasRoot />
          <Grain />
          <Preloader />
          <Navbar />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
          <AltitudeRail />
          <SoundToggle />
          <Cursor />
          <Toaster />
          <EasterEgg />
          <BeatObserver />
        </TransitionProvider>
      </body>
    </html>
  );
}
