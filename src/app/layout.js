import { Inter, Merriweather } from 'next/font/google';
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
  title: 'TechNews - Your Source for Tech & Business News',
  description: 'Stay updated with the latest technology news, business insights, and in-depth analysis. TechNews delivers breaking news and expert opinions on tech, startups, and innovation.',
  keywords: 'tech news, technology, business, startups, innovation, AI, software, gadgets',
  openGraph: {
    title: 'TechNews - Your Source for Tech & Business News',
    description: 'Stay updated with the latest technology news, business insights, and in-depth analysis.',
    url: 'https://technews.co.ke',
    siteName: 'TechNews',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechNews - Your Source for Tech & Business News',
    description: 'Stay updated with the latest technology news, business insights, and in-depth analysis.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5672747362546507" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
