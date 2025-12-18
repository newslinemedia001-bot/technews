export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // Disallow admin and internal api routes
        },
        sitemap: 'https://technews.co.ke/sitemap.xml',
    }
}
