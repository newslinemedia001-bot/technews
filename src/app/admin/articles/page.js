'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/auth';
import { getAllArticles, deleteArticle } from '@/lib/articles';
import { formatRelativeDate } from '@/lib/utils';

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
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading articles...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>All Articles</h1>
                <Link href="/admin/articles/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#13376a', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
                    New Article
                </Link>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button onClick={() => setFilter('all')} style={{ padding: '0.5rem 1rem', backgroundColor: filter === 'all' ? '#13376a' : '#f3f4f6', color: filter === 'all' ? 'white' : '#111827', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    All ({articles.length})
                </button>
                <button onClick={() => setFilter('published')} style={{ padding: '0.5rem 1rem', backgroundColor: filter === 'published' ? '#13376a' : '#f3f4f6', color: filter === 'published' ? 'white' : '#111827', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Published ({articles.filter(a => a.status === 'published').length})
                </button>
                <button onClick={() => setFilter('draft')} style={{ padding: '0.5rem 1rem', backgroundColor: filter === 'draft' ? '#13376a' : '#f3f4f6', color: filter === 'draft' ? 'white' : '#111827', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Drafts ({articles.filter(a => a.status === 'draft').length})
                </button>
            </div>

            {filteredArticles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No articles found.</p>
                    <Link href="/admin/articles/new" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#13376a', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
                        Create First Article
                    </Link>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Title</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArticles.map((article) => (
                                <tr key={article.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{article.title}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', backgroundColor: article.status === 'published' ? '#dcfce7' : '#fef3c7', color: article.status === 'published' ? '#166534' : '#92400e' }}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{article.category}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                        {formatRelativeDate(article.createdAt)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/admin/articles/edit/${article.id}`} style={{ padding: '0.5rem 1rem', backgroundColor: '#13376a', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.875rem' }}>
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
