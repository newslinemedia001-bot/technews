import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'About Us - TechNews',
    description: 'Learn more about TechNews, your premier source for technology and business news.',
};

export default function AboutPage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>About Us</span>
                </nav>

                <div className={styles.content}>
                    <h1 className={styles.title}>About TechNews</h1>

                    <div className={styles.body}>
                        <p className={styles.lead}>
                            TechNews is your premier source for technology and business news, delivering
                            accurate, timely, and insightful coverage of the tech industry.
                        </p>

                        <h2>Our Mission</h2>
                        <p>
                            At TechNews, we are committed to providing our readers with comprehensive
                            coverage of the latest developments in technology, business, and innovation.
                            Our team of experienced journalists and industry experts work tirelessly to
                            bring you the news that matters.
                        </p>

                        <h2>What We Cover</h2>
                        <ul>
                            <li><strong>Technology:</strong> Breaking news on software, hardware, AI, and emerging tech</li>
                            <li><strong>Business:</strong> Corporate news, market analysis, and industry trends</li>
                            <li><strong>Startups:</strong> Innovation stories and entrepreneurship insights</li>
                            <li><strong>Gadgets:</strong> Product reviews and consumer technology</li>
                            <li><strong>Science:</strong> Research breakthroughs and scientific discoveries</li>
                        </ul>

                        <h2>Our Values</h2>
                        <p>
                            We believe in accuracy, integrity, and independence. Every story we publish
                            is thoroughly researched and fact-checked to ensure our readers receive
                            reliable information they can trust.
                        </p>

                        <h2>Contact Us</h2>
                        <p>
                            Have a story tip or want to get in touch? Visit our <Link href="/contact">Contact page</Link> or
                            reach out to us at <a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
