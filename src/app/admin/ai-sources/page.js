'use client';

import { useState, useEffect } from 'react';
import styles from '../articles/page.module.css';

export default function AISourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      // Show updated default sources matching RSS feeds
      const defaultSources = [
        // News
        { name: 'The Star Kenya', url: 'https://www.the-star.co.ke/feed', category: 'news', enabled: true },
        { name: 'Kenyans.co.ke', url: 'https://www.kenyans.co.ke/feed', category: 'news', enabled: true },
        // Technology
        { name: 'TechNewsWorld', url: 'https://www.technewsworld.com/perl/syndication/rssfull.pl', category: 'technology', enabled: true },
        { name: 'TechTrends KE', url: 'https://techtrendske.co.ke/feed/', category: 'technology', enabled: true },
        // Business
        { name: 'The Star Business', url: 'https://www.the-star.co.ke/business/feed', category: 'business', enabled: true },
        { name: 'Kenyans Business', url: 'https://www.kenyans.co.ke/business/feed', category: 'business', enabled: true },
        // Featured
        { name: 'Tech-ish', url: 'https://tech-ish.com/feed/', category: 'featured', enabled: true },
        // Reviews
        { name: 'TechTrends Reviews', url: 'https://techtrendske.co.ke/feed/', category: 'reviews', enabled: true },
        // Lifestyle
        { name: 'The Star Lifestyle', url: 'https://www.the-star.co.ke/lifestyle/feed', category: 'lifestyle', enabled: true },
        // Videos
        { name: 'TED Talks', url: 'https://www.ted.com/talks/rss', category: 'videos', enabled: true },
        { name: 'Vimeo Staff Picks', url: 'https://vimeo.com/channels/staffpicks/videos/rss', category: 'videos', enabled: true },
        // Podcasts
        { name: 'NPR Podcasts', url: 'https://www.npr.org/rss/podcast.php?id=510318', category: 'podcasts', enabled: true },
        { name: 'The Daily', url: 'https://feeds.simplecast.com/54nAGcIl', category: 'podcasts', enabled: true }
      ];
      setSources(defaultSources);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sources:', error);
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Generate AI content from all enabled sources? This may take a few minutes.')) {
      return;
    }

    setGenerating(true);
    setMessage('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '8fcb0cec763622059af59b1b541af454ff06059e9195aaf0e5616633b4e1fd27'
        }
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Generated ${result.totalGenerated} articles from ${result.successfulSources} sources!`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>AI Content Sources</h1>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Content Sources</h1>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className={styles.primaryButton}
        >
          {generating ? 'Generating...' : '🤖 Generate AI Content'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>How AI Content Generation Works:</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Discovers latest articles from configured sources</li>
          <li>Fetches full article content and images</li>
          <li>Uses Gemini AI to completely rewrite the article</li>
          <li>Extracts and includes original images</li>
          <li>Publishes as new content with proper attribution</li>
        </ol>
        <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
          ⏰ AI content generation runs automatically every 6 hours alongside RSS feeds
        </p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Source Name</th>
              <th>URL</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source, index) => (
              <tr key={index}>
                <td>{source.name}</td>
                <td>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.url}
                  </a>
                </td>
                <td>
                  <span className={styles.badge}>{source.category}</span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: source.enabled ? '#d4edda' : '#f8d7da',
                    color: source.enabled ? '#155724' : '#721c24'
                  }}>
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h3>⚠️ Important Notes:</h3>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>AI-generated articles are marked with "AI Rewritten" in the author field</li>
          <li>Original source URLs are preserved for attribution</li>
          <li>Content is completely rewritten to avoid plagiarism</li>
          <li>Images are pulled from original articles when available</li>
          <li>Rate limiting: 2 articles per source per run</li>
        </ul>
      </div>
    </div>
  );
}
