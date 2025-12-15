'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getArticlesByCategory } from '@/lib/articles';
import { getCategoryBySlug, categories } from '@/lib/categories';
import ArticleCard from '@/components/ArticleCard';
import styles from '../page.module.css';

export default function SubcategoryPage({ params }) {
    const resolvedParams = use(params);
    const { slug, subslug } = resolvedParams;

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Find the parent category and subcategory
    const parentCategory = categories.find(c => c.slug === slug);
    const subcategory = parentCategory?.subcategories?.find(s => s.slug === subslug);

    useEffect(() => {
        const fetchArticles = async () => {
            if (!subcategory) {
                setLoading(false);
                return;
            }

            try {
                // Use the full category path for subcategories
                const categoryId = `${parentCategory.id}/${subcategory.id}`;
                const result = await getArticlesByCategory(categoryId, 12);
                setArticles(result.articles);
                setLastDoc(result.lastVisible);
                setHasMore(result.articles.length === 12);
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [subcategory, parentCategory]);

    const loadMore = async () => {
        if (!hasMore || loadingMore || !lastDoc || !subcategory) return;

        setLoadingMore(true);
        try {
            const categoryId = `${parentCategory.id}/${subcategory.id}`;
            const result = await getArticlesByCategory(categoryId, 12, lastDoc);
            setArticles([...articles, ...result.articles]);
            setLastDoc(result.lastVisible);
            setHasMore(result.articles.length === 12);
        } catch (error) {
            console.error('Error loading more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading articles...</p>
            </div>
        );
    }

    if (!subcategory) {
        return (
            <div className={styles.error}>
                <h1>Category Not Found</h1>
                <p>The category you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/" className={styles.backBtn}>Back to Home</Link>
            </div>
        );
    }

    return (
        <div className={styles.categoryPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <nav className={styles.breadcrumb}>
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href={`/category/${slug}`}>{parentCategory.name}</Link>
                        <span>/</span>
                        <span className={styles.current}>{subcategory.name}</span>
                    </nav>
                    <h1 className={styles.title}>{subcategory.name}</h1>
                </div>
            </header>

            {/* Articles */}
            <section className={styles.articlesSection}>
                <div className="container">
                    {articles.length > 0 ? (
                        <>
                            <div className={styles.articlesGrid}>
                                {articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className={styles.loadMore}>
                                    <button
                                        className={styles.loadMoreBtn}
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Loading...' : 'Load More Articles'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                                </svg>
                            </div>
                            <h2>No Articles Yet</h2>
                            <p>There are no articles in this category yet. Check back soon!</p>
                            <Link href="/" className={styles.backBtn}>
                                Back to Home
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
