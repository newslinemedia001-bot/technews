import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
import { getCategoryBySlug } from '@/lib/categories';
import styles from './page.module.css';

export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = getCategoryBySlug(slug);

    if (!category) {
        return {
            title: 'Category Not Found - TechNews',
        };
    }

    return {
        title: `${category.name} News - TechNews`,
        description: `Latest news and updates regarding ${category.name}.`,
    };
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const category = getCategoryBySlug(slug);

    if (!category) {
        return (
            <div className={styles.error}>
                <h1>Category Not Found</h1>
                <p>The category you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/" className={styles.backBtn}>Back to Home</Link>
            </div>
        );
    }

    let articles = [];
    try {
        const result = await getArticlesByCategory(category.id, 24);
        articles = result.articles;
    } catch (error) {
        console.error('Error fetching category articles:', error);
    }

    return (
        <div className={styles.categoryPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className="container">
                    <nav className={styles.breadcrumb}>
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <span className={styles.current}>{category.name}</span>
                    </nav>
                    <h1 className={styles.title}>{category.name}</h1>
                </div>
            </header>

            {/* Articles */}
            <section className={styles.articlesSection}>
                <div className="container">
                    {articles.length > 0 ? (
                        <div className={styles.articlesGrid}>
                            {articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
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

