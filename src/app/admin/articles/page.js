'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/auth';
import { getAllArticles, deleteArticle } from '@/lib/articles';
import { formatRelativeDate } from '@/lib/utils';
import styles from './page.module.css';

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const adminData = await getCurrentAdmin();
                if (!adminData) {
                    router.push('/admin/login');
                    return;
                }
                await fetchArticles();
            } catch (error) {
                console.error('Auth error:', error);
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [router]);

    const fetchArticles = async () => {
        try {
            const allArticles = await getAllArticles();
            setArticles(allArticles);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(article => {
        if (filter === 'all') return true;
        return article.status === filter;
    });

    if (loading) {
        return <div className={styles.loading}>Loading articles...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>All Articles</h1>
                <Link href="/admin/articles/new" className={styles.newBtn}>
                    New Article
                </Link>
            </div>

            <div className={styles.filters}>
                <button 
                    onClick={() => setFilter('all')} 
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                >
                    All ({articles.length})
                </button>
                <button 
                    onClick={() => setFilter('published')} 
                    className={`${styles.filterBtn} ${filter === 'published' ? styles.active : ''}`}
                >
                    Published ({articles.filter(a => a.status === 'published').length})
                </button>
                <button 
                    onClick={() => setFilter('draft')} 
                    className={`${styles.filterBtn} ${filter === 'draft' ? styles.active : ''}`}
                >
                    Drafts ({articles.filter(a => a.status === 'draft').length})
                </button>
            </div>

            {filteredArticles.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No articles found.</p>
                    <Link href="/admin/articles/new" className={styles.newBtn}>
                        Create First Article
                    </Link>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArticles.map((article) => (
                                <tr key={article.id}>
                                    <td>{article.title}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[article.status]}`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td>{article.category}</td>
                                    <td className={styles.dateText}>
                                        {formatRelativeDate(article.createdAt)}
                                    </td>
                                    <td>
                                        <Link href={`/admin/articles/edit/${article.id}`} className={styles.editBtn}>
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
