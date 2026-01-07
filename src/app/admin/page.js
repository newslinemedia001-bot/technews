'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin, signOutAdmin } from '@/lib/auth';
import { getAllArticles, deleteArticle } from '@/lib/articles';
import { formatRelativeDate } from '@/lib/utils';
import styles from './page.module.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const adminData = await getCurrentAdmin();
                if (!adminData) {
                    router.push('/admin/login');
                    return;
                }
                setAdmin(adminData);
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

    const handleLogout = async () => {
        try {
            await signOutAdmin();
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;

        setDeleting(true);
        try {
            await deleteArticle(deleteModal.id);
            setArticles(articles.filter(a => a.id !== deleteModal.id));
            setDeleteModal(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete article');
        } finally {
            setDeleting(false);
        }
    };

    const filteredArticles = articles.filter(article => {
        if (filter === 'all') return true;
        return article.status === filter;
    });

    const stats = {
        total: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        drafts: articles.filter(a => a.status === 'draft').length,
        views: articles.reduce((sum, a) => sum + (a.views || 0), 0)
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#1a365d" />
                            <path d="M10 12h20v3H10v-3zm0 7h15v3H10v-3zm0 7h20v3H10v-3z" fill="#ffffff" />
                            <circle cx="30" cy="22.5" r="4" fill="#ffffff" />
                        </svg>
                        <span>TechNews</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="7" height="9" x="3" y="3" rx="1" />
                            <rect width="7" height="5" x="14" y="3" rx="1" />
                            <rect width="7" height="9" x="14" y="12" rx="1" />
                            <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/articles" className={styles.navItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8" />
                            <path d="M15 18h-5" />
                            <path d="M10 6h8v4h-8V6Z" />
                        </svg>
                        <span>Articles</span>
                    </Link>
                    <Link href="/admin/articles/new" className={styles.navItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        <span>New Article</span>
                    </Link>
                    <Link href="/admin/careers" className={styles.navItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span>Careers</span>
                    </Link>
                    <Link href="/admin/subscribers" className={styles.navItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>Subscribers</span>
                    </Link>
                    <Link href="/admin/rss-feeds" className={styles.navItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 11a9 9 0 0 1 9 9" />
                            <path d="M4 4a16 16 0 0 1 16 16" />
                            <circle cx="5" cy="19" r="1" />
                        </svg>
                        <span>RSS Feeds</span>
                    </Link>
                    <Link href="/" className={styles.navItem} target="_blank">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                        <span>View Site</span>
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.adminInfo}>
                        <div className={styles.adminAvatar}>
                            {admin?.name?.charAt(0) || admin?.email?.charAt(0) || 'A'}
                        </div>
                        <div className={styles.adminDetails}>
                            <span className={styles.adminName}>{admin?.name || 'Admin'}</span>
                            <span className={styles.adminRole}>{admin?.role || 'Editor'}</span>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.pageTitle}>Dashboard</h1>
                        <p className={styles.pageSubtitle}>Welcome back, {admin?.name || 'Admin'}</p>
                    </div>
                    <Link href="/admin/articles/new" className={styles.addBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        New Article
                    </Link>
                </header>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.total}</span>
                            <span className={styles.statLabel}>Total Articles</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.success}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.published}</span>
                            <span className={styles.statLabel}>Published</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.warning}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.drafts}</span>
                            <span className={styles.statLabel}>Drafts</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.info}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.views}</span>
                            <span className={styles.statLabel}>Total Views</span>
                        </div>
                    </div>
                </div>

                {/* Articles Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>Recent Articles</h2>
                        <div className={styles.tableFilters}>
                            <button
                                className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({articles.length})
                            </button>
                            <button
                                className={`${styles.filterBtn} ${filter === 'published' ? styles.active : ''}`}
                                onClick={() => setFilter('published')}
                            >
                                Published ({stats.published})
                            </button>
                            <button
                                className={`${styles.filterBtn} ${filter === 'draft' ? styles.active : ''}`}
                                onClick={() => setFilter('draft')}
                            >
                                Drafts ({stats.drafts})
                            </button>
                        </div>
                    </div>

                    {filteredArticles.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                                </svg>
                            </div>
                            <h3>No articles yet</h3>
                            <p>Create your first article to get started.</p>
                            <Link href="/admin/articles/new" className={styles.emptyBtn}>
                                Create Article
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
                                        <th>Views</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArticles.map((article) => (
                                        <tr key={article.id}>
                                            <td>
                                                <div className={styles.articleTitle}>
                                                    {article.title}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.status} ${article.status === 'published' ? styles.published : styles.draft}`}>
                                                    {article.status}
                                                </span>
                                            </td>
                                            <td className={styles.category}>{article.category}</td>
                                            <td>{article.views || 0}</td>
                                            <td className={styles.date}>
                                                {formatRelativeDate(article.createdAt)}
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link
                                                        href={`/admin/articles/edit/${article.id}`}
                                                        className={styles.actionBtn}
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                                        </svg>
                                                    </Link>
                                                    {article.status === 'published' && (
                                                        <Link
                                                            href={`/article/${article.slug}`}
                                                            className={styles.actionBtn}
                                                            target="_blank"
                                                            title="View"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M15 3h6v6" />
                                                                <path d="M10 14 21 3" />
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                            </svg>
                                                        </Link>
                                                    )}
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.delete}`}
                                                        onClick={() => setDeleteModal(article)}
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18" />
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Modal */}
            {deleteModal && (
                <div className={styles.modalOverlay} onClick={() => setDeleteModal(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </div>
                        <h3 className={styles.modalTitle}>Delete Article?</h3>
                        <p className={styles.modalText}>
                            Are you sure you want to delete &quot;{deleteModal.title}&quot;? This action cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setDeleteModal(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.deleteBtn}
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
