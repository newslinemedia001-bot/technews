import { getLatestArticles } from '@/lib/articles';
import { categories } from '@/lib/categories';

export default async function sitemap() {
    const baseUrl = 'https://technews.co.ke';

    // Get latest articles for sitemap
    // Note: In a real large app, you might want to paginate or split sitemaps
    const { articles } = await getLatestArticles(100);

    const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt?.toDate?.() || article.createdAt?.toDate?.() || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    const staticRoutes = [
        '',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms',
        '/advertise',
        '/careers',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1.0 : 0.5,
    }));

    return [...staticRoutes, ...categoryUrls, ...articleUrls];
}
