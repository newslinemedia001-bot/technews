import Link from 'next/link';
import styles from '../about/page.module.css';

export const metadata = {
    title: 'Privacy Policy - TechNews',
    description: 'Learn how TechNews collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Privacy Policy</span>
                </nav>

                <div className={styles.content}>
                    <h1 className={styles.title}>Privacy Policy</h1>

                    <div className={styles.body}>
                        <p className={styles.lead}>
                            This Privacy Policy describes how TechNews collects, uses, and shares
                            your personal information when you visit our website.
                        </p>

                        <h2>Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you
                            subscribe to our newsletter, fill out a contact form, or interact
                            with our website.
                        </p>
                        <ul>
                            <li><strong>Email Address:</strong> When you subscribe to our newsletter</li>
                            <li><strong>Contact Information:</strong> When you reach out to us</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website</li>
                        </ul>

                        <h2>How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Send you our newsletter and updates</li>
                            <li>Respond to your inquiries and requests</li>
                            <li>Improve our website and services</li>
                            <li>Analyze trends and user behavior</li>
                        </ul>

                        <h2>Information Sharing</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer your personal information
                            to third parties without your consent, except as required by law or
                            to protect our rights.
                        </p>

                        <h2>Cookies</h2>
                        <p>
                            We use cookies and similar technologies to enhance your experience
                            on our website. You can control cookie settings through your browser.
                        </p>

                        <h2>Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your personal
                            information against unauthorized access, alteration, or destruction.
                        </p>

                        <h2>Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy, please contact us at{' '}
                            <a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a>.
                        </p>

                        <p><em>Last updated: December 2024</em></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
