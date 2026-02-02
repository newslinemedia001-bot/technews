/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dlvgrs5vp/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      // RSS Feed image sources
      {
        protocol: 'https',
        hostname: 'cdn.arstechnica.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'techcrunch.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform.theverge.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.wired.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.reuters.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cnn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.kinja-img.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.vogue.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.simplecastcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'npr.brightspotcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static01.nyt.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.nyt.com',
        port: '',
        pathname: '/**',
      },
      // Kenyan news sites
      {
        protocol: 'https',
        hostname: 'techweez.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.techweez.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'techtrendske.co.ke',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.techtrendske.co.ke',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tech-ish.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tech-ish.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'the-star.co.ke',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.the-star.co.ke',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kenyans.co.ke',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.kenyans.co.ke',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'technewsworld.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.technewsworld.com',
        port: '',
        pathname: '/**',
      },
      // Wildcard for any other RSS sources
      {
        protocol: 'https',
        hostname: '**.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.gq.com',
        port: '',
        pathname: '/**',
      },
      // Allow any HTTPS image (for legacy articles)
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig;
