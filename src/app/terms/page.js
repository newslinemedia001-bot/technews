import Link from 'next/link';
import styles from '../about/page.module.css';

export const metadata = {
    title: 'Terms of Service - TechNews',
    description: 'Read the terms and conditions for using the TechNews website.',
};

export default function TermsPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Terms of Service</span>
                </nav>

                <div className={styles.content}>
                    <h1 className={styles.title}>Terms of Service</h1>

                    <div className={styles.body}>
                        <p className={styles.lead}>
                            By accessing and using TechNews, you agree to be bound by these
                            Terms of Service.
                        </p>

                        <h2>Use of Content</h2>
                        <p>
                            All content on TechNews, including articles, images, and graphics,
                            is protected by copyright. You may not reproduce, distribute, or
                            transmit any content without prior written permission.
                        </p>

                        <h2>User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use our website for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Transmit any viruses or malicious code</li>
                            <li>Collect user information without consent</li>
                        </ul>

                        <h2>Comments and Feedback</h2>
                        <p>
                            Any comments, feedback, or suggestions you provide may be used by
                            TechNews without any obligation to you. You represent that any
                            content you submit does not infringe on third-party rights.
                        </p>

                        <h2>Third-Party Links</h2>
                        <p>
                            Our website may contain links to third-party websites. We are not
                            responsible for the content or practices of these websites.
                        </p>

                        <h2>Disclaimer</h2>
                        <p>
                            TechNews provides content for informational purposes only. We make
                            no warranties about the accuracy, completeness, or reliability of
                            any content on our website.
                        </p>

                        <h2>Limitation of Liability</h2>
                        <p>
                            TechNews shall not be liable for any indirect, incidental, special,
                            or consequential damages arising from your use of our website.
                        </p>

                        <h2>Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued
                            use of our website after changes constitutes acceptance of the
                            modified terms.
                        </p>

                        <h2>Contact Us</h2>
                        <p>
                            For questions about these Terms, contact us at{' '}
                            <a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a>.
                        </p>

                        <p><em>Last updated: December 2024</em></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
