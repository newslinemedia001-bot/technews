'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchArticles } from '@/lib/articles';
import ArticleCard, { ArticleCardSkeleton } from '@/components/ArticleCard';
import styles from './page.module.css';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);

    useEffect(() => {
        if (query) {
            setSearchInput(query);
            performSearch(query);
        }
    }, [query]);

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const articles = await searchArticles(searchQuery.trim());
            setResults(articles);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
        }
    };

    return (
        <div className={styles.searchPage}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Search</span>
                </nav>

                <div className={styles.searchHeader}>
                    <h1 className={styles.title}>Search</h1>
                    <form className={styles.searchForm} onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search articles..."
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchBtn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            Search
                        </button>
                    </form>
                </div>

                {query && (
                    <p className={styles.resultInfo}>
                        {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
                    </p>
                )}

                {loading ? (
                    <div className={styles.results}>
                        {[...Array(6)].map((_, i) => (
                            <ArticleCardSkeleton key={i} variant="horizontal" />
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className={styles.results}>
                        {results.map((article) => (
                            <ArticleCard key={article.id} article={article} variant="horizontal" />
                        ))}
                    </div>
                ) : query ? (
                    <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                                <path d="m9 9 4 4" />
                                <path d="m13 9-4 4" />
                            </svg>
                        </div>
                        <h2>No Results Found</h2>
                        <p>We couldnt find any articles matching your search. Try different keywords.</p>
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <p>Enter a search term to find articles.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
