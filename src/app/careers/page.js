'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import styles from '../about/page.module.css';
import careerStyles from './page.module.css';

export default function CareersPage() {
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const q = query(collection(db, 'careers'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const careersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCareers(careersData);
            } catch (error) {
                console.error('Error fetching careers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCareers();
    }, []);

    return (
        <div className={styles.page}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Careers</span>
                </nav>

                <div className={styles.content}>
                    <h1 className={styles.title}>Careers at TechNews</h1>

                    <div className={styles.body}>
                        <p className={styles.lead}>
                            Join our dynamic team and help shape the future of tech journalism.
                            We are always looking for passionate individuals to join us.
                        </p>

                        <h2>Why Work With Us?</h2>
                        <ul>
                            <li>Be part of a fast-growing digital media company</li>
                            <li>Work with cutting-edge technology and platforms</li>
                            <li>Collaborate with talented journalists and tech experts</li>
                            <li>Flexible work environment</li>
                            <li>Competitive compensation and benefits</li>
                        </ul>

                        <h2>Open Positions</h2>

                        {loading ? (
                            <div className={careerStyles.loading}>Loading positions...</div>
                        ) : careers.length > 0 ? (
                            <div className={careerStyles.jobList}>
                                {careers.map((career) => (
                                    <div key={career.id} className={careerStyles.jobCard}>
                                        <div className={careerStyles.jobHeader}>
                                            <h3>{career.title}</h3>
                                            <span className={careerStyles.jobType}>{career.type || 'Full-time'}</span>
                                        </div>
                                        <p className={careerStyles.jobLocation}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {career.location || 'Thika, Kenya'}
                                        </p>
                                        <p className={careerStyles.jobDescription}>{career.description}</p>
                                        <a href={`mailto:newslinedigitaltv@gmail.com?subject=Application: ${career.title}`} className={careerStyles.applyBtn}>
                                            Apply Now
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={careerStyles.noJobs}>
                                <p>No open positions at the moment. Check back soon!</p>
                                <p>You can also send your CV to <a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a></p>
                            </div>
                        )}

                        <div className={careerStyles.contactBox}>
                            <h3>Dont See a Position That Fits?</h3>
                            <p>
                                We are always interested in hearing from talented individuals.
                                Send your resume and a cover letter to{' '}
                                <a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
