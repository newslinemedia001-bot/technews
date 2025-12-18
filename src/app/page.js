'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/ArticleCard';
import ArticleCardSkeleton from '@/components/ArticleCard/ArticleCardSkeleton';
import { getLatestArticles, getFeaturedArticles, getTrendingArticles, getArticlesByCategory } from '@/lib/articles';
import { subscribeToNewsletter } from '@/lib/subscribers';

import { categories } from '@/lib/categories';
import WeatherWidget from '@/components/WeatherWidget';
import styles from './page.module.css';

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // PHASE 1: Load critical content first (hero section only)
        const [featured, latestResult] = await Promise.all([
          getFeaturedArticles(1), // Only 1 for hero
          getLatestArticles(8) // Reduced from 12
        ]);

        setFeaturedArticles(featured);
        setLatestArticles(latestResult.articles || []);
        setLoading(false); // Show content immediately

        // PHASE 2: Load secondary content in background (non-blocking)
        const [trending, ...categoryResults] = await Promise.all([
          getTrendingArticles(5),
          getArticlesByCategory('technology', 4),
          getArticlesByCategory('business', 4),
          getArticlesByCategory('lifestyle', 4),
          getArticlesByCategory('opinion', 4),
          getArticlesByCategory('videos', 4)
        ]);

        setTrendingArticles(trending);

        const catArticles = {
          technology: categoryResults[0].articles,
          business: categoryResults[1].articles,
          lifestyle: categoryResults[2].articles,
          opinion: categoryResults[3].articles,
          videos: categoryResults[4].articles
        };
        setCategoryArticles(catArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderSkeletons = () => (
    <div className={styles.homepage}>
      {/* Breaking News Ticker */}
      <div className={styles.breakingNews}>
        <div className="container">
          <div className={styles.breakingNewsContent}>
            <span className={styles.breakingLabel}>BREAKING</span>
            <div className={styles.tickerWrapper}>
              <div className={styles.ticker}>
                <span>Loading latest news...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={`${styles.heroSide} ${styles.technologySide}`}>
              <h3 className={styles.heroSideTitle}>Technology</h3>
              <div className={styles.heroSideContent}>
                {[...Array(4)].map((_, i) => (
                  <ArticleCardSkeleton key={i} variant="minimal" />
                ))}
              </div>
            </div>
            <div className={styles.heroMain}>
              <ArticleCardSkeleton variant="featured" />
            </div>
            <div className={`${styles.heroSide} ${styles.videosSide}`}>
              <h3 className={styles.heroSideTitle}>Videos</h3>
              <div className={styles.heroSideContent}>
                {[...Array(4)].map((_, i) => (
                  <ArticleCardSkeleton key={i} variant="minimal" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className={styles.mainContent}>
        <div className="container">
          <div className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Latest News</h2>
                </div>
                <div className={styles.articlesGrid}>
                  {[...Array(4)].map((_, i) => (
                    <ArticleCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
            <aside className={styles.sidebar}>
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>Trending</h3>
                <div className={styles.trendingList}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.trendingItem}>
                      <span className={styles.trendingNumber}>{i + 1}</span>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        flexShrink: 0
                      }}></div>
                      <div className={styles.trendingContent}>
                        <div style={{
                          height: '14px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '4px',
                          width: i % 2 === 0 ? '100%' : '80%'
                        }}></div>
                        <div style={{
                          height: '11px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          width: '60px'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );

  if (loading) {
    return renderSkeletons();
  }

  const hasArticles = (Array.isArray(latestArticles) && latestArticles.length > 0) || (Array.isArray(featuredArticles) && featuredArticles.length > 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'TechNews',
    url: 'https://technews.co.ke',
    logo: 'https://technews.co.ke/logo.png',
    sameAs: [
      'https://facebook.com/technews',
      'https://twitter.com/technews',
      'https://youtube.com/technews'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-742-577-038',
      contactType: 'customer service',
      areaServed: 'KE'
    }
  };

  return (
    <div className={styles.homepage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breaking News Ticker */}
      <div className={styles.breakingNews}>
        <div className="container">
          <div className={styles.breakingNewsContent}>
            <span className={styles.breakingLabel}>BREAKING</span>
            <div className={styles.tickerWrapper}>
              <div className={styles.ticker}>
                <span>Welcome to TechNews - Your premier source for technology and business news • Stay updated with the latest tech trends and innovations • Subscribe to our newsletter for daily updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          {hasArticles ? (
            <div className={styles.heroGrid}>
              {/* Technology Articles - Left Side */}
              <div className={`${styles.heroSide} ${styles.technologySide}`}>
                <h3 className={styles.heroSideTitle}>Technology</h3>
                <div className={styles.heroSideContent}>
                  {categoryArticles['technology']?.slice(0, 4).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="minimal"
                      showMeta={true}
                      showMinimalImage={false}
                      lightText={true} // Technology side has blue background
                    />
                  ))}
                </div>
              </div>

              {/* Featured Article - Center */}
              {featuredArticles[0] && (
                <div className={styles.heroMain}>
                  <ArticleCard article={featuredArticles[0]} variant="featured" />
                </div>
              )}

              {/* Videos - Right Side */}
              <div className={`${styles.heroSide} ${styles.videosSide}`}>
                <h3 className={styles.heroSideTitle}>Videos</h3>
                <div className={styles.heroSideContent}>
                  {categoryArticles['videos']?.slice(0, 4).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="minimal"
                      showMeta={true}
                      showMinimalImage={true}
                      titleLineClamp={2}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noArticles}>
              <p>No articles published yet. Check back soon for the latest news!</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className="container">
          <div className={styles.contentGrid}>
            {/* Main Articles */}
            <div className={styles.mainColumn}>
              {/* Latest News */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Latest News</h2>
                  <Link href="/category/news" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {Array.isArray(latestArticles) && latestArticles.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {latestArticles.slice(0, 4).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noArticlesSmall}>
                    <p>No articles in this section yet.</p>
                  </div>
                )}
              </div>

              {/* Technology Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Technology</h2>
                  <Link href="/category/technology" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {categoryArticles['technology']?.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {categoryArticles['technology'].slice(0, 4).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noArticlesSmall}>
                    <p>No articles in this category yet.</p>
                  </div>
                )}
              </div>

              {/* Business Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Business</h2>
                  <Link href="/category/business" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {categoryArticles['business']?.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {categoryArticles['business'].slice(0, 4).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noArticlesSmall}>
                    <p>No articles in this category yet.</p>
                  </div>
                )}
              </div>

              {/* Lifestyle Section - Different Layout */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Lifestyle</h2>
                  <Link href="/category/lifestyle" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {categoryArticles['lifestyle']?.length > 0 ? (
                  <div className={styles.lifestyleGrid}>
                    {categoryArticles['lifestyle'][0] && (
                      <div className={styles.lifestyleFeatured}>
                        <ArticleCard article={categoryArticles['lifestyle'][0]} variant="featured" />
                      </div>
                    )}
                    <div className={styles.lifestyleSide}>
                      {categoryArticles['lifestyle'].slice(1, 4).map((article) => (
                        <ArticleCard key={article.id} article={article} variant="horizontal" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.noArticlesSmall}>
                    <p>No articles in this category yet.</p>
                  </div>
                )}
              </div>

              {/* Opinion Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Opinion</h2>
                  <Link href="/category/opinion" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {categoryArticles['opinion']?.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {categoryArticles['opinion'].slice(0, 4).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noArticlesSmall}>
                    <p>No articles in this category yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* Trending */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>Trending</h3>
                <div className={styles.trendingList}>
                  {Array.isArray(trendingArticles) && trendingArticles.length > 0 ? (
                    trendingArticles.map((article, index) => (
                      <Link key={article.id} href={`/article/${article.slug}`} className={styles.trendingItem}>
                        <span className={styles.trendingNumber}>{index + 1}</span>
                        {article.featuredImage && (
                          <div className={styles.trendingImage}>
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              fill
                              sizes="60px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className={styles.trendingContent}>
                          <span className={styles.trendingTitle}>
                            {article.title}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className={styles.noItems}>No trending articles yet.</p>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>Categories</h3>
                <ul className={styles.categoryList}>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link href={`/category/${category.slug}`} className={styles.categoryLink}>
                        {category.name}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>Newsletter</h3>
                <p className={styles.widgetText}>
                  Get the latest tech news delivered to your inbox.
                </p>
                <form className={styles.newsletterForm} onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newsletterEmail) return;
                  const result = await subscribeToNewsletter(newsletterEmail);
                  setNewsletterStatus(result.message);
                  if (result.success) setNewsletterEmail('');
                  setTimeout(() => setNewsletterStatus(''), 3000);
                }}>
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
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: newsletterStatus.includes('Success') ? '#22c55e' : '#ef4444' }}>
                    {newsletterStatus}
                  </p>
                )}
              </div>

              {/* Weather Widget */}
              <div className={styles.widget} style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
                <WeatherWidget />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
