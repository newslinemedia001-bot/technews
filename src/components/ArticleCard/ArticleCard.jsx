'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatRelativeDate, calculateReadingTime, truncateText, stripHtml } from '@/lib/utils';
import { getCategoryById } from '@/lib/categories';
import styles from './ArticleCard.module.css';

export default function ArticleCard({
    article,
    variant = 'default', // 'default', 'featured', 'horizontal', 'minimal'
    showExcerpt = true,
    showCategory = true,
    showMeta = true,
    imageHeight = 200,
    showMinimalImage = false, // Only show image in minimal variant if true
    titleLineClamp = null, // Optional line clamp for titles
    lightText = false // Force light text for dark backgrounds
}) {
    if (!article) return null;

    const category = getCategoryById(article.category);
    const categoryName = category?.name || article.category;
    const excerpt = article.excerpt || truncateText(stripHtml(article.content), 150);
    const readingTime = calculateReadingTime(article.content);
    const articleUrl = `/article/${article.slug}`;

    if (variant === 'featured') {
        return (
            <Link href={articleUrl} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <article className={styles.featuredCard}>
                    <div className={styles.featuredImage}>
                        {article.featuredImage ? (
                            <>
                                <Image
                                    src={article.featuredImage}
                                    alt={article.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                {article.videoId && (
                                    <div className={styles.playButton}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" opacity="0.9" />
                                            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                                        </svg>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className={styles.featuredBody}>
                        {showCategory && (
                            <span className={styles.category} onClick={(e) => e.stopPropagation()}>
                                {categoryName}
                            </span>
                        )}
                        <h2 className={styles.featuredTitle}>
                            {article.title}
                        </h2>
                        {showExcerpt && excerpt && (
                            <p className={styles.featuredExcerpt}>{excerpt}</p>
                        )}
                        {showMeta && (
                            <div className={styles.meta}>
                                <span className={styles.author}>{article.author || 'TechNews'}</span>
                                <span className={styles.separator}>•</span>
                                <span>{formatRelativeDate(article.createdAt)}</span>
                                <span className={styles.separator}>•</span>
                                <span>{readingTime}</span>
                            </div>
                        )}
                    </div>
                </article>
            </Link>
        );
    }

    if (variant === 'horizontal') {
        return (
            <article className={styles.horizontalCard}>
                <div className={styles.horizontalImage}>
                    {article.featuredImage ? (
                        <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="150px"
                        />
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className={styles.horizontalBody}>
                    {showCategory && (
                        <Link href={`/category/${article.category}`} className={styles.categorySmall}>
                            {categoryName}
                        </Link>
                    )}
                    <h3 className={styles.horizontalTitle}>
                        <Link href={articleUrl}>{article.title}</Link>
                    </h3>
                    {showMeta && (
                        <div className={styles.metaSmall}>
                            <span>{formatRelativeDate(article.createdAt)}</span>
                        </div>
                    )}
                </div>
            </article>
        );
    }

    if (variant === 'minimal') {
        return (
            <article className={styles.minimalCard}>
                {showMinimalImage && article.featuredImage && (
                    <Link href={articleUrl} className={styles.minimalImageLink}>
                        <div className={styles.minimalImage}>
                            <Image
                                src={article.featuredImage}
                                alt={article.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="80px"
                            />
                            {article.videoId && (
                                <div className={styles.minimalPlayIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                                        <circle cx="12" cy="12" r="10" opacity="0.9" />
                                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </Link>
                )}
                <div className={styles.minimalContent}>
                    <h3
                        className={styles.minimalTitle}
                        style={lightText ? { color: '#ffffff' } : {}}
                    >
                        <Link
                            href={articleUrl}
                            style={lightText ? { color: '#ffffff' } : {}}
                        >
                            {article.title}
                        </Link>
                    </h3>
                    {showMeta && (
                        <div
                            className={styles.metaSmall}
                            style={lightText ? { color: 'rgba(255, 255, 255, 0.8)' } : {}}
                        >
                            <span>{formatRelativeDate(article.createdAt)}</span>
                        </div>
                    )}
                </div>
            </article>
        );
    }

    // Default card
    return (
        <article className={styles.card}>
            <Link href={articleUrl} className={styles.imageLink}>
                <div className={styles.imageWrapper} style={{ height: imageHeight }}>
                    {article.featuredImage ? (
                        <>
                            <Image
                                src={article.featuredImage}
                                alt={article.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
                            />
                            {article.videoId && (
                                <div className={styles.playButton}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" opacity="0.9" />
                                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                                    </svg>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </div>
                    )}
                </div>
            </Link>
            <div className={styles.body}>
                {showCategory && (
                    <Link href={`/category/${article.category}`} className={styles.category}>
                        {categoryName}
                    </Link>
                )}
                <h3 className={styles.title}>
                    <Link href={articleUrl}>{article.title}</Link>
                </h3>
                {showExcerpt && excerpt && (
                    <p className={styles.excerpt}>{excerpt}</p>
                )}
                {showMeta && (
                    <div className={styles.meta}>
                        <span>{formatRelativeDate(article.createdAt)}</span>
                        <span className={styles.separator}>•</span>
                        <span>{readingTime}</span>
                    </div>
                )}
            </div>
        </article>
    );
}
