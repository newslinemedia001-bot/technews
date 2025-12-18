import { getArticleBySlug } from '@/lib/articles';
import { stripHtml } from '@/lib/utils';
import ArticleContent from '@/components/ArticleContent';
import { cache } from 'react';

// De-duplicate requests if called multiple times
const getArticle = cache(async (slug) => {
    return await getArticleBySlug(slug);
});

export async function generateMetadata({ params }) {
    const { slug } = await params; // await params in Next.js 15+
    const article = await getArticle(slug);

    if (!article) {
        return {
            title: 'Article Not Found - TechNews',
            description: 'The article you are looking for does not exist.',
        };
    }

    const siteUrl = 'https://technews.co.ke';
    const description = article.excerpt || article.summary || stripHtml(article.content).substring(0, 160);
    const imageUrl = article.featuredImage || `${siteUrl}/logo.png`;

    return {
        title: `${article.title} - TechNews`,
        description: description,
        openGraph: {
            type: 'article',
            title: article.title,
            description: description,
            url: `${siteUrl}/article/${article.slug}`,
            siteName: 'TechNews',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                }
            ],
            publishedTime: article.createdAt?.toDate?.().toISOString() || new Date(article.createdAt).toISOString(),
            section: article.category,
            authors: [article.author || 'TechNews'],
            tags: article.tags || [],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: description,
            images: [imageUrl],
        },
    };
}

// Helper to serialize Firestore types (Timestamp) for Client Components
const serializeArticle = (article) => {
    if (!article) return null;
    return {
        ...article,
        createdAt: article.createdAt?.toDate?.()?.toISOString() || article.createdAt,
        updatedAt: article.updatedAt?.toDate?.()?.toISOString() || article.updatedAt,
    };
};

export default async function ArticlePage({ params }) {
    const { slug } = await params;
    const article = await getArticle(slug);
    const serializedArticle = serializeArticle(article);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.excerpt || article.summary,
        image: [article.featuredImage],
        datePublished: article.createdAt?.toDate?.().toISOString() || new Date(article.createdAt).toISOString(),
        dateModified: article.updatedAt?.toDate?.().toISOString() || new Date(article.updatedAt || article.createdAt).toISOString(),
        author: [{
            '@type': 'Person',
            name: article.author || 'TechNews',
        }],
        publisher: {
            '@type': 'Organization',
            name: 'TechNews',
            logo: {
                '@type': 'ImageObject',
                url: 'https://technews.co.ke/logo.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://technews.co.ke/article/${slug}`
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleContent initialArticle={serializedArticle} slug={slug} />
        </>
    );
}
