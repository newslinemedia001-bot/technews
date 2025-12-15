'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../about/page.module.css';
import contactStyles from './page.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { subject, message, name, email } = formData;

        // Construct mailto link
        const mailtoLink = `mailto:newslinedigitaltv@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

        // Open email client
        window.location.href = mailtoLink;
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Contact Us</span>
                </nav>

                <div className={styles.content}>
                    <h1 className={styles.title}>Contact Us</h1>

                    <div className={styles.body}>
                        <p className={styles.lead}>
                            We would love to hear from you! Whether you have a news tip, feedback,
                            or a business inquiry, feel free to reach out.
                        </p>

                        <div className={contactStyles.contactGrid}>
                            {/* Contact Info */}
                            <div className={contactStyles.contactInfo}>
                                <h2>Get In Touch</h2>

                                <div className={contactStyles.infoItem}>
                                    <div className={contactStyles.infoIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div className={contactStyles.infoContent}>
                                        <h3>Location</h3>
                                        <p>Zuhura Plaza, 4th Floor<br />along Kenyatta Highway, Thika Town</p>
                                    </div>
                                </div>

                                <div className={contactStyles.infoItem}>
                                    <div className={contactStyles.infoIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                    </div>
                                    <div className={contactStyles.infoContent}>
                                        <h3>Call or WhatsApp</h3>
                                        <p><a href="tel:+254742577038">0742 577 038</a></p>
                                    </div>
                                </div>

                                <div className={contactStyles.infoItem}>
                                    <div className={contactStyles.infoIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    </div>
                                    <div className={contactStyles.infoContent}>
                                        <h3>Email</h3>
                                        <p><a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a></p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className={contactStyles.contactForm}>
                                <h2>Send a Message</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className={contactStyles.formGroup}>
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                    <div className={contactStyles.formGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Your email"
                                            required
                                        />
                                    </div>
                                    <div className={contactStyles.formGroup}>
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="Message subject"
                                            required
                                        />
                                    </div>
                                    <div className={contactStyles.formGroup}>
                                        <label>Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Your message"
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className={contactStyles.submitBtn}>Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
