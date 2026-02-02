import { Inter, Merriweather } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif'
});

export const metadata = {
  metadataBase: new URL('https://technews.co.ke'),
  title: {
    default: 'TechNews Kenya - Latest Technology, Business & Innovation News',
    template: '%s | TechNews Kenya'
  },
  description: 'TechNews Kenya is your premier source for technology news, business insights, startup stories, and innovation updates. Get breaking tech news, gadget reviews, AI developments, and expert analysis from Kenya and around the world.',
  keywords: [
    'tech news Kenya',
    'technology news',
    'business news Kenya',
    'startup news',
    'innovation Kenya',
    'AI news',
    'gadget reviews',
    'software updates',
    'tech trends',
    'digital transformation',
    'Kenya tech',
    'African technology',
    'mobile technology',
    'cybersecurity news',
    'cloud computing',
    'fintech Kenya',
    'e-commerce Kenya',
    'tech startups Africa'
  ].join(', '),
  authors: [{ name: 'TechNews Kenya Editorial Team' }],
  creator: 'TechNews Kenya',
  publisher: 'TechNews Kenya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://technews.co.ke',
    siteName: 'TechNews Kenya',
    title: 'TechNews Kenya - Latest Technology, Business & Innovation News',
    description: 'Your premier source for technology news, business insights, startup stories, and innovation updates from Kenya and around the world.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'TechNews Kenya Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechNews Kenya - Latest Technology, Business & Innovation News',
    description: 'Your premier source for technology news, business insights, startup stories, and innovation updates from Kenya and around the world.',
    creator: '@TechNewsKE',
    site: '@TechNewsKE',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://technews.co.ke',
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
  category: 'technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="icon" href="/logo.png" type="image/x-icon" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5672747362546507"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
