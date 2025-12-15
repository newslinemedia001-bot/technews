'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug, incrementViews, getLatestArticles } from '@/lib/articles';
import { getCategoryById } from '@/lib/categories';
import { formatArticleDate, calculateReadingTime } from '@/lib/utils';
import ArticleCard from '@/components/ArticleCard';
import styles from './page.module.css';

export default function ArticlePage({ params }) {
    const resolvedParams = use(params);
    const { slug } = resolvedParams;

    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const articleData = await getArticleBySlug(slug);

                if (!articleData) {
                    setError('Article not found');
                    setLoading(false);
                    return;
                }

                setArticle(articleData);

                // Increment views
                await incrementViews(articleData.id);

                // Fetch related articles
                const latestResult = await getLatestArticles(4);
                setRelatedArticles(latestResult.articles.filter(a => a.id !== articleData.id).slice(0, 3));
            } catch (err) {
                console.error('Error fetching article:', err);
                setError('Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading article...</p>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className={styles.error}>
                <div className={styles.errorIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                        <line x1="9" x2="9.01" y1="9" y2="9" />
                        <line x1="15" x2="15.01" y1="9" y2="9" />
                    </svg>
                </div>
                <h1>Article Not Found</h1>
                <p>The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <Link href="/" className={styles.backBtn}>
                    Back to Home
                </Link>
            </div>
        );
    }

    const category = getCategoryById(article.category);
    const readingTime = calculateReadingTime(article.content);

    return (
        <>
            {/* Article Header */}
            <article className={styles.article}>
                {/* Hero */}
                <header className={styles.header}>
                    <div className="container">
                        {/* Breadcrumb */}
                        <nav className={styles.breadcrumb}>
                            <Link href="/">Home</Link>
                            <span>/</span>
                            {category && (
                                <>
                                    <Link href={`/category/${category.slug}`}>{category.name}</Link>
                                    <span>/</span>
                                </>
                            )}
                            <span className={styles.current}>Article</span>
                        </nav>

                        {/* Category */}
                        {category && (
                            <Link href={`/category/${category.slug}`} className={styles.category}>
                                {category.name}
                            </Link>
                        )}

                        {/* Title */}
                        <h1 className={styles.title}>{article.title}</h1>

                        {/* Meta */}
                        <div className={styles.meta}>
                            <div className={styles.author}>
                                <div className={styles.authorAvatar}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="5" />
                                        <path d="M20 21a8 8 0 0 0-16 0" />
                                    </svg>
                                </div>
                                <div className={styles.authorInfo}>
                                    <span className={styles.authorName}>{article.author || 'TechNews'}</span>
                                    <span className={styles.authorTitle}>Editor</span>
                                </div>
                            </div>
                            <div className={styles.metaDetails}>
                                <span>{formatArticleDate(article.createdAt)}</span>
                                <span className={styles.separator}>•</span>
                                <span>{readingTime}</span>
                                <span className={styles.separator}>•</span>
                                <span>{article.views || 0} views</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {article.featuredImage && (
                    <div className={styles.featuredImage}>
                        <div className="container">
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={article.featuredImage}
                                    alt={article.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
                                    sizes="(max-width: 768px) 100vw, 1200px"
                                />
                            </div>
                            {article.featuredImageCaption && (
                                <p className={styles.imageCaption}>{article.featuredImageCaption}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className={styles.contentWrapper}>
                    <div className="container">
                        <div className={styles.contentGrid}>
                            {/* Main Content */}
                            <div className={styles.mainContent}>
                                {/* Article Body */}
                                <div
                                    className={styles.articleContent}
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />

                                {/* Tags */}
                                {article.tags && article.tags.length > 0 && (
                                    <div className={styles.tags}>
                                        <span className={styles.tagsLabel}>Tags:</span>
                                        {article.tags.map((tag, index) => (
                                            <Link key={index} href={`/tag/${tag}`} className={styles.tag}>
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Share Buttons */}
                                <div className={styles.share}>
                                    <span className={styles.shareLabel}>Share:</span>
                                    <div className={styles.shareButtons}>
                                        <button
                                            className={styles.shareBtn}
                                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank')}
                                            aria-label="Share on Twitter"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </button>
                                        <button
                                            className={styles.shareBtn}
                                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                                            aria-label="Share on Facebook"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </button>
                                        <button
                                            className={styles.shareBtn}
                                            onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`, '_blank')}
                                            aria-label="Share on LinkedIn"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                        </button>
                                        <button
                                            className={styles.shareBtn}
                                            onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}
                                            aria-label="Copy link"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <aside className={styles.sidebar}>
                                {/* Author Box */}
                                <div className={styles.authorBox}>
                                    <div className={styles.authorBoxAvatar}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="8" r="5" />
                                            <path d="M20 21a8 8 0 0 0-16 0" />
                                        </svg>
                                    </div>
                                    <h4 className={styles.authorBoxName}>{article.author || 'TechNews'}</h4>
                                    <p className={styles.authorBoxBio}>
                                        Editor at TechNews. Covering technology, business, and innovation.
                                    </p>
                                </div>

                                {/* Newsletter */}
                                <div className={styles.widget}>
                                    <h4 className={styles.widgetTitle}>Newsletter</h4>
                                    <p className={styles.widgetText}>
                                        Get the latest tech news delivered to your inbox.
                                    </p>
                                    <form className={styles.newsletterForm}>
                                        <input
                                            type="email"
                                            placeholder="Your email"
                                            className={styles.newsletterInput}
                                        />
                                        <button type="submit" className={styles.newsletterBtn}>
                                            Subscribe
                                        </button>
                                    </form>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className={styles.related}>
                        <div className="container">
                            <h2 className={styles.relatedTitle}>Related Articles</h2>
                            <div className={styles.relatedGrid}>
                                {relatedArticles.map((relatedArticle) => (
                                    <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </>
    );
}
