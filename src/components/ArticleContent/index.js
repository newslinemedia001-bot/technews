'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { incrementViews, getLatestArticles } from '@/lib/articles';
import { getCategoryById } from '@/lib/categories';
import { formatArticleDate, calculateReadingTime } from '@/lib/utils';
import ArticleCard from '@/components/ArticleCard';
import styles from './ArticleContent.module.css';

export default function ArticleContent({ initialArticle, slug }) {
    const [article, setArticle] = useState(initialArticle);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [latestNews, setLatestNews] = useState([]);
    const [readAlsoArticles, setReadAlsoArticles] = useState([]);
    const [loading, setLoading] = useState(!initialArticle);
    const [error, setError] = useState(null);

    // Phase 1: If no initial article (fallback), fetch it client side (unlikely with Server Component usage)
    useEffect(() => {
        if (!initialArticle && slug) {
            const fetchArticle = async () => {
                try {
                    const { getArticleBySlug } = await import('@/lib/articles');
                    const articleData = await getArticleBySlug(slug);

                    if (!articleData) {
                        setError('Article not found');
                        setLoading(false);
                        return;
                    }

                    setArticle(articleData);
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching article:', err);
                    setError('Failed to load article');
                    setLoading(false);
                }
            };
            fetchArticle();
        } else if (initialArticle) {
            setArticle(initialArticle);
            setLoading(false);
        }
    }, [initialArticle, slug]);

    // Phase 2: Load related content & increment views
    useEffect(() => {
        if (article) {
            // Increment views (non-blocking)
            incrementViews(article.id).catch(err =>
                console.error('Error incrementing views:', err)
            );

            // Fetch related content
            const fetchRelated = async () => {
                try {
                    const { getArticlesByCategory } = await import('@/lib/articles');
                    let related = [];

                    // Try to get articles from same category
                    if (article.category) {
                        const categoryResult = await getArticlesByCategory(article.category, 6);
                        related = categoryResult.articles.filter(a => a.id !== article.id);
                    }

                    // If not enough, add latest articles
                    if (related.length < 4) {
                        const latestResult = await getLatestArticles(6);
                        const latest = latestResult.articles.filter(a =>
                            a.id !== article.id && !related.find(r => r.id === a.id)
                        );
                        related = [...related, ...latest];
                    }

                    setRelatedArticles(related.slice(0, 4));

                    // Fetch "Read Also" articles (6 total: 3 inline + 3 bottom)
                    const readAlsoResult = await getLatestArticles(12); // Increased to get enough for latest news too
                    const readAlso = readAlsoResult.articles.filter(a => a.id !== article.id).slice(0, 6);
                    setReadAlsoArticles(readAlso);

                    // Set Latest News (distinct from related, usually the most recent global)
                    // We can take from the same result or fetch new if we want specific ordering
                    const latestForBottom = readAlsoResult.articles
                        .filter(a => a.id !== article.id && !related.find(r => r.id === a.id) && !readAlso.find(r => r.id === a.id))
                        .slice(0, 4);
                    setLatestNews(latestForBottom);
                } catch (err) {
                    console.error('Error loading related articles:', err);
                }
            };

            // Small delay to ensure main content paint is prioritized
            setTimeout(fetchRelated, 100);
        }
    }, [article]);

    if (loading) {
        return (
            <article className={styles.article}>
                <header className={styles.header}>
                    <div className="container">
                        <nav className={styles.breadcrumb}>
                            <div style={{ width: '60px', height: '12px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
                            <span>/</span>
                            <div style={{ width: '80px', height: '12px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
                        </nav>
                        <div style={{ width: '120px', height: '24px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '1rem' }}></div>
                        <div style={{ width: '80%', height: '48px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '1rem' }}></div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', borderRadius: '50%' }}></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ width: '150px', height: '14px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '8px' }}></div>
                                <div style={{ width: '200px', height: '12px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className={styles.featuredImage}>
                    <div className="container">
                        <div className={styles.imageWrapper} style={{ background: 'var(--bg-tertiary)' }}></div>
                    </div>
                </div>
                <div className={styles.contentWrapper}>
                    <div className="container">
                        <div className={styles.contentGrid}>
                            <div className={styles.mainContent}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} style={{
                                        width: i % 3 === 0 ? '100%' : '95%',
                                        height: '16px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '4px',
                                        marginBottom: '12px'
                                    }}></div>
                                ))}
                            </div>
                            <aside className={styles.sidebar}>
                                <div className={styles.widget}>
                                    <div style={{ width: '100%', height: '200px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}></div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </article>
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

    const category = article ? getCategoryById(article.category) : null;
    const readingTime = article ? calculateReadingTime(article.content) : '';

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

                        {/* Summary */}
                        {article.summary && (
                            <div className={styles.summary}>{article.summary}</div>
                        )}

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
                                {/* YouTube Video Embed - Show if video article */}
                                {article.videoId && (
                                    <div className={styles.videoEmbed}>
                                        <iframe
                                            width="100%"
                                            height="500"
                                            src={`https://www.youtube.com/embed/${article.videoId}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            title="Video"
                                        ></iframe>
                                    </div>
                                )}

                                {/* Article Body with Injected Read Also Links */}
                                <div
                                    className={styles.articleContent}
                                    dangerouslySetInnerHTML={{
                                        __html: (() => {
                                            let content = article.content?.replace(/contenteditable="false"/g, '') || '';

                                            // Only inject if we have read also articles
                                            if (readAlsoArticles.length >= 6) {
                                                // Split content into paragraphs
                                                const paragraphs = content.split('</p>');
                                                const totalParagraphs = paragraphs.length;

                                                // Calculate positions to inject (roughly 25%, 50%, 75% through the article)
                                                const positions = [
                                                    Math.floor(totalParagraphs * 0.25),
                                                    Math.floor(totalParagraphs * 0.50),
                                                    Math.floor(totalParagraphs * 0.75)
                                                ];

                                                // Create read also boxes for injection
                                                const createReadAlsoBox = (articles, startIndex) => `
                                                    <p class="${styles.readAlsoInline}"><strong class="${styles.readAlsoInlineTitle}">Read Also:</strong> ${articles.slice(startIndex, startIndex + 1).map(article => `<a href="/article/${article.slug}" class="${styles.readAlsoInlineLink}">${article.title}</a>`).join('')}</p>
                                                `;

                                                // Inject read also boxes at calculated positions
                                                let injectedCount = 0;
                                                positions.forEach((pos, index) => {
                                                    if (pos < paragraphs.length && injectedCount < 3) {
                                                        paragraphs[pos] += '</p>' + createReadAlsoBox(readAlsoArticles, injectedCount);
                                                        injectedCount++;
                                                    }
                                                });

                                                content = paragraphs.join('</p>');
                                            }

                                            return content;
                                        })()
                                    }}
                                />

                                {/* Read Also - Bottom Box (3 remaining links) */}
                                {readAlsoArticles.length > 3 && (
                                    <div className={styles.readAlsoBox}>
                                        <h3 className={styles.readAlsoBoxTitle}>Read Also</h3>
                                        <ul className={styles.readAlsoList}>
                                            {readAlsoArticles.slice(3, 6).map((readArticle) => (
                                                <li key={readArticle.id} className={styles.readAlsoItem}>
                                                    <Link href={`/article/${readArticle.slug}`} className={styles.readAlsoLink}>
                                                        {readArticle.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

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

                                {/* Trending Articles */}
                                <div className={styles.widget}>
                                    <h4 className={styles.widgetTitle}>Trending Now</h4>
                                    <div className={styles.trendingList}>
                                        {readAlsoArticles.length > 0 ? (
                                            readAlsoArticles.map((trendingArticle, index) => (
                                                <Link
                                                    key={trendingArticle.id}
                                                    href={`/article/${trendingArticle.slug}`}
                                                    className={styles.trendingItem}
                                                >
                                                    <span className={styles.trendingNumber}>{index + 1}</span>
                                                    {trendingArticle.featuredImage && (
                                                        <div className={styles.trendingImage}>
                                                            <Image
                                                                src={trendingArticle.featuredImage}
                                                                alt={trendingArticle.title}
                                                                fill
                                                                sizes="80px"
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className={styles.trendingContent}>
                                                        <h5 className={styles.trendingTitle}>{trendingArticle.title}</h5>
                                                        <span className={styles.trendingDate}>
                                                            {formatArticleDate(trendingArticle.createdAt)}
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            // Skeleton loaders while trending articles load
                                            [...Array(5)].map((_, index) => (
                                                <div key={index} className={styles.trendingItem}>
                                                    <span className={styles.trendingNumber}>{index + 1}</span>
                                                    <div style={{
                                                        width: '80px',
                                                        height: '60px',
                                                        background: 'var(--bg-tertiary)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        flexShrink: 0
                                                    }}></div>
                                                    <div className={styles.trendingContent}>
                                                        <div style={{
                                                            height: '14px',
                                                            background: 'var(--bg-tertiary)',
                                                            borderRadius: '4px',
                                                            marginBottom: '8px',
                                                            width: index % 2 === 0 ? '100%' : '85%'
                                                        }}></div>
                                                        <div style={{
                                                            height: '12px',
                                                            background: 'var(--bg-tertiary)',
                                                            borderRadius: '4px',
                                                            width: '60px'
                                                        }}></div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>

                {/* Related Articles Section */}
                {relatedArticles.length > 0 && (
                    <section className={styles.relatedSection}>
                        <div className="container">
                            <div className={styles.relatedHeader}>
                                <h2 className={styles.relatedTitle}>Related Articles</h2>
                                <div className={styles.relatedDivider}></div>
                            </div>
                            <div className={styles.relatedGrid}>
                                {relatedArticles.map((relatedArticle) => (
                                    <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>

            {/* Latest News Section */}
            {latestNews.length > 0 && (
                <section className={styles.relatedSection} style={{ paddingTop: '0' }}>
                    <div className="container">
                        <div className={styles.relatedHeader}>
                            <h2 className={styles.relatedTitle}>Latest News</h2>
                            <div className={styles.relatedDivider}></div>
                        </div>
                        <div className={styles.relatedGrid}>
                            {latestNews.map((newsArticle) => (
                                <ArticleCard key={newsArticle.id} article={newsArticle} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
