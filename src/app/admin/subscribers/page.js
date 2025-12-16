'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/auth';
import { getAllSubscribers, deleteSubscriber } from '@/lib/subscribers';
import styles from '../articles/page.module.css';

export default function SubscribersPage() {
    const router = useRouter();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
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
                await fetchSubscribers();
            } catch (error) {
                console.error('Auth error:', error);
                router.push('/admin/login');
            }
        };

        checkAuth();
    }, [router]);

    const fetchSubscribers = async () => {
        try {
            const subs = await getAllSubscribers();
            setSubscribers(subs);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyAllEmails = () => {
        const emails = subscribers.map(sub => sub.email).join(', ');
        navigator.clipboard.writeText(emails);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyEmail = (email) => {
        navigator.clipboard.writeText(email);
    };

    const handleDelete = async () => {
        if (!deleteModal) return;

        setDeleting(true);
        try {
            await deleteSubscriber(deleteModal.id);
            setSubscribers(subscribers.filter(s => s.id !== deleteModal.id));
            setDeleteModal(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete subscriber');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading subscribers...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Newsletter Subscribers ({subscribers.length})</h1>
                {subscribers.length > 0 && (
                    <button onClick={copyAllEmails} className={styles.signInBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        {copied ? '✓ Copied!' : 'Copy All Emails'}
                    </button>
                )}
            </div>

            {subscribers.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No subscribers yet.</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Subscribed Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber.id}>
                                    <td>{subscriber.email}</td>
                                    <td className={styles.dateText}>
                                        {subscriber.subscribedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles.published}`}>
                                            {subscriber.status || 'active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button 
                                                onClick={() => copyEmail(subscriber.email)}
                                                className={styles.signInBtn}
                                            >
                                                Copy
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal(subscriber)}
                                                className={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Delete Subscriber</h2>
                        <p>Are you sure you want to delete {deleteModal.email}?</p>
                        <div className={styles.modalActions}>
                            <button 
                                onClick={() => setDeleteModal(null)} 
                                className={styles.cancelBtn}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className={styles.confirmDeleteBtn}
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
