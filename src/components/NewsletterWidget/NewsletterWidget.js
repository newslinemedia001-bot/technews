'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/lib/subscribers';
import styles from './NewsletterWidget.module.css';

export default function NewsletterWidget() {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;

        const result = await subscribeToNewsletter(newsletterEmail);
        setNewsletterStatus(result.message);

        if (result.success) {
            setNewsletterEmail('');
        }

        setTimeout(() => setNewsletterStatus(''), 3000);
    };

    return (
        <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>Newsletter</h3>
            <p className={styles.widgetText}>
                Get the latest tech news delivered to your inbox.
            </p>
            <form className={styles.newsletterForm} onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Your email address"
                    className={styles.newsletterInput}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                />
                <button type="submit" className={styles.newsletterBtn}>
                    Subscribe
                </button>
            </form>
            {newsletterStatus && (
                <p style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    color: newsletterStatus.includes('Success') ? '#22c55e' : '#ef4444'
                }}>
                    {newsletterStatus}
                </p>
            )}
        </div>
    );
}
