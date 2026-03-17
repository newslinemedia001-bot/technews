import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/ArticleCard';
import { getLatestArticles, getFeaturedArticles, getTrendingArticles, getArticlesByCategory } from '@/lib/articles';
import { categories } from '@/lib/categories';
import WeatherWidget from '@/components/WeatherWidget';
import NewsletterWidget from '@/components/NewsletterWidget/NewsletterWidget';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Ensure fresh data on every request

export const metadata = {
  title: 'TechNews Kenya - Latest Technology, Business & Innovation News',
  description: 'Stay updated with breaking technology news, business insights, startup stories, gadget reviews, and innovation updates from Kenya and around the world. Your trusted source for tech news.',
  keywords: 'tech news Kenya, technology news, business news, startup news, innovation, AI, gadgets, software, Kenya tech, African technology',
  openGraph: {
    title: 'TechNews Kenya - Latest Technology, Business & Innovation News',
    description: 'Stay updated with breaking technology news, business insights, startup stories, and innovation updates from Kenya and around the world.',
    type: 'website',
    url: 'https://technews.co.ke',
  },
  alternates: {
    canonical: 'https://technews.co.ke',
  },
};

// Helper to serialize Firebase timestamps
function prepareArticles(articles) {
  if (!articles) return [];
  return articles.map(article => ({
    ...article,
    createdAt: article.createdAt?.toDate?.()?.toISOString() || article.createdAt,
    updatedAt: article.updatedAt?.toDate?.()?.toISOString() || article.updatedAt,
    pubDate: article.pubDate?.toDate?.()?.toISOString() || article.pubDate
  }));
}

// Helper to filter articles with valid images only - DISABLED FOR NOW
function filterArticlesWithValidImages(articles) {
  if (!articles) return [];
  // SHOW ALL ARTICLES - no filtering
  return articles;
}

export default async function HomePage() {
  // Fetch all data in parallel - fetching MORE to ensure we have enough after filtering
  const [
    featuredArticles,
    latestResult,
    trendingArticles,
    techArticles,
    bizArticles,
    lifestyleArticles,
    reviewsArticles,
    videoArticles
  ] = await Promise.all([
    getFeaturedArticles(1),
    getLatestArticles(30), // Fetch more to ensure enough with images
    getTrendingArticles(15), // Fetch more to ensure enough with images
    getArticlesByCategory('technology', 25), // Fetch more to ensure enough with images
    getArticlesByCategory('business', 50), // Fetch more to ensure enough with images
    getArticlesByCategory('lifestyle', 20), // Fetch more to ensure enough with images
    getArticlesByCategory('reviews', 10), // Increased from 4
    getArticlesByCategory('videos', 10) // Increased from 4
  ]);

  const serializedFeatured = filterArticlesWithValidImages(prepareArticles(featuredArticles));

  // Process all articles but filter for valid images only
  const latestArticles = filterArticlesWithValidImages(prepareArticles(latestResult?.articles || []));
  const serializedTrending = filterArticlesWithValidImages(prepareArticles(trendingArticles));

  // Category specific processing - only show articles with valid images
  const categoryArticles = {
    technologyHero: filterArticlesWithValidImages(prepareArticles(techArticles?.articles || [])),
    technology: filterArticlesWithValidImages(prepareArticles(techArticles?.articles || [])),
    business: filterArticlesWithValidImages(prepareArticles(bizArticles?.articles || [])),
    lifestyle: filterArticlesWithValidImages(prepareArticles(lifestyleArticles?.articles || [])),
    reviews: filterArticlesWithValidImages(prepareArticles(reviewsArticles?.articles || [])),
    videos: filterArticlesWithValidImages(prepareArticles(videoArticles?.articles || []))
  };

  const hasArticles = (latestArticles.length > 0) || (serializedFeatured.length > 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'TechNews Kenya',
    alternateName: 'TechNews',
    url: 'https://technews.co.ke',
    logo: {
      '@type': 'ImageObject',
      url: 'https://technews.co.ke/logo.png',
      width: 600,
      height: 600
    },
    description: 'Premier source for technology news, business insights, and innovation updates from Kenya and around the world',
    sameAs: [
      'https://facebook.com/technewske',
      'https://twitter.com/technewske',
      'https://youtube.com/technewske',
      'https://instagram.com/technewske',
      'https://linkedin.com/company/technewske'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-742-577-038',
      contactType: 'customer service',
      areaServed: 'KE',
      availableLanguage: ['English']
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
      addressLocality: 'Nairobi'
    },
    foundingDate: '2024',
    keywords: 'technology news, business news, innovation, startups, Kenya tech, African technology'
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
                  {categoryArticles['technologyHero']?.slice(0, 4).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="minimal"
                      showMeta={true}
                      showMinimalImage={false}
                      lightText={true} // Technology side has blue background
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {/* Featured Article - Center */}
              {serializedFeatured[0] && (
                <div className={styles.heroMain}>
                  <ArticleCard article={serializedFeatured[0]} variant="featured" />
                </div>
              )}

              {/* Business - Right Side */}
              <div className={`${styles.heroSide} ${styles.businessSide}`}>
                <h3 className={styles.heroSideTitle}>Business</h3>
                <div className={styles.heroSideContent}>
                  {categoryArticles['business']?.slice(0, 3).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="minimal"
                      showMeta={true}
                      showMinimalImage={false}
                      index={index}
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
                {latestArticles.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {latestArticles.slice(0, 4).map((article, index) => (
                      <ArticleCard key={article.id} article={article} index={index} />
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
                    {categoryArticles['technology'].slice(0, 4).map((article, index) => (
                      <ArticleCard key={article.id} article={article} index={index} />
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
                    {categoryArticles['business'].slice(0, 4).map((article, index) => (
                      <ArticleCard key={article.id} article={article} index={index} />
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

              {/* Reviews Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Reviews</h2>
                  <Link href="/category/reviews" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {categoryArticles['reviews']?.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {categoryArticles['reviews'].slice(0, 4).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noArticlesSmall}>
                    <p>No articles in this category yet.</p>
                  </div>
                )}
              </div>

              {/* Videos Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Videos</h2>
                  <Link href="/category/videos" className={styles.sectionLink}>
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
                {categoryArticles['videos']?.length > 0 ? (
                  <div className={styles.articlesGrid}>
                    {categoryArticles['videos'].slice(0, 4).map((article) => (
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
                  {serializedTrending && serializedTrending.length > 0 ? (
                    serializedTrending.map((article, index) => (
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
                          <path d="m 9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <NewsletterWidget />

              {/* Weather Widget */}
              <div className={styles.widget} style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
                <WeatherWidget />
              </div>

              {/* Technology Articles */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>Technology</h3>
                <div className={styles.trendingList}>
                  {categoryArticles['technology']?.slice(0, 5).map((article) => (
                    <Link key={article.id} href={`/article/${article.slug}`} className={styles.trendingItem}>
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
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

