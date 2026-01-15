import { getAllArticles } from '@/lib/articles';
import { categories } from '@/lib/categories';

export default async function sitemap() {
  const baseUrl = 'https://technews.co.ke';

  // Get all published articles
  const articles = await getAllArticles('published', 1000);

  // Article URLs
  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.updatedAt?.toDate?.() || article.createdAt?.toDate?.() || new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Category URLs
  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...categoryUrls, ...articleUrls];
}
