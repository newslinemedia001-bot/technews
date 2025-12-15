import Link from 'next/link';
import styles from '../about/page.module.css';
import adStyles from './page.module.css';

export const metadata = {
    title: 'Advertise With Us - TechNews',
    description: 'Advertise your business with TechNews and reach thousands of tech-savvy readers.',
};

export default function AdvertisePage() {
    return (
        <div className={styles.page}>
            <div className="container">
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span>Advertise</span>
                </nav>

                <div className={styles.content}>
                    <h1 className={styles.title}>Advertise With Us</h1>

                    <div className={styles.body}>
                        <p className={styles.lead}>
                            Partner with TechNews to reach thousands of tech-savvy readers.
                            We offer various advertising solutions tailored to your needs.
                        </p>

                        <h2>Why Advertise With TechNews?</h2>
                        <ul>
                            <li><strong>Targeted Audience:</strong> Reach technology enthusiasts, business professionals, and decision-makers</li>
                            <li><strong>High Engagement:</strong> Our readers are highly engaged with our content</li>
                            <li><strong>Multiple Formats:</strong> Banner ads, sponsored content, newsletter placements, and more</li>
                            <li><strong>Competitive Rates:</strong> Affordable advertising packages for businesses of all sizes</li>
                        </ul>

                        <h2>Advertising Options</h2>

                        <div className={adStyles.adOptions}>
                            <div className={adStyles.adOption}>
                                <h3>Banner Advertising</h3>
                                <p>Display your brand prominently across our website with various banner sizes and placements.</p>
                            </div>
                            <div className={adStyles.adOption}>
                                <h3>Sponsored Content</h3>
                                <p>Get your message across through professionally written articles that resonate with our audience.</p>
                            </div>
                            <div className={adStyles.adOption}>
                                <h3>Newsletter Sponsorship</h3>
                                <p>Reach our subscribers directly with featured placement in our daily newsletter.</p>
                            </div>
                            <div className={adStyles.adOption}>
                                <h3>Custom Solutions</h3>
                                <p>Work with our team to create a custom advertising package that meets your specific goals.</p>
                            </div>
                        </div>

                        <div className={adStyles.contactBox}>
                            <h2>Ready to Get Started?</h2>
                            <p>Contact our advertising team to discuss your needs and get a quote.</p>

                            <div className={adStyles.contactDetails}>
                                <div className={adStyles.contactItem}>
                                    <strong>Location:</strong>
                                    <span>Zuhura Plaza, 4th Floor, along Kenyatta Highway, Thika Town</span>
                                </div>
                                <div className={adStyles.contactItem}>
                                    <strong>Call or WhatsApp:</strong>
                                    <a href="tel:+254742577038">0742 577 038</a>
                                </div>
                                <div className={adStyles.contactItem}>
                                    <strong>Email:</strong>
                                    <a href="mailto:newslinedigitaltv@gmail.com">newslinedigitaltv@gmail.com</a>
                                </div>
                            </div>

                            <Link href="/contact" className={adStyles.ctaBtn}>
                                Contact Us Today
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
