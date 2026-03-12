'use client';

import { useState } from 'react';
import styles from '../articles/page.module.css';

export default function ImageSearchPage() {
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!confirm('Search for images for all articles without featured images? This may take a few minutes.')) {
      return;
    }

    setSearching(true);
    setMessage('');

    try {
      const response = await fetch('/api/images/auto-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '8fcb0cec763622059af59b1b541af454ff06059e9195aaf0e5616633b4e1fd27'
        }
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Processed ${result.processed} articles out of ${result.total} without images!`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Auto Image Search</h1>
        <button 
          onClick={handleSearch}
          disabled={searching}
          className={styles.primaryButton}
        >
          {searching ? 'Searching...' : '🔍 Find Images for Articles'}
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
        <h3>How Auto Image Search Works:</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Scans all published articles without featured images</li>
          <li>Generates search terms from article title and category</li>
          <li>Searches Pexels and Unsplash for relevant images</li>
          <li>Automatically sets the best matching image</li>
          <li>Processes up to 10 articles per batch (API limits)</li>
        </ol>
        <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
          ⚠️ Note: You need to configure Pexels and Unsplash API keys for this to work
        </p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h3>🔧 Setup Required:</h3>
        <p>To use auto image search, you need free API keys from:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Pexels:</strong> <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer">https://www.pexels.com/api/</a></li>
          <li><strong>Unsplash:</strong> <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer">https://unsplash.com/developers</a></li>
        </ul>
        <p style={{ marginTop: '10px' }}>
          Add these to your <code>.env.local</code> file:
        </p>
        <pre style={{ 
          backgroundColor: '#f1f1f1', 
          padding: '10px', 
          borderRadius: '4px', 
          fontSize: '14px',
          overflow: 'auto'
        }}>
{`PEXELS_API_KEY=your_pexels_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here`}
        </pre>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #bee5eb' }}>
        <h3>✨ Features:</h3>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Automatic image search when importing RSS feeds</li>
          <li>Background processing - doesn't slow down imports</li>
          <li>Smart search terms based on title and category</li>
          <li>High-quality landscape images preferred</li>
          <li>Respects API rate limits with delays</li>
          <li>Articles are marked with <code>autoImageSearch: true</code> flag</li>
        </ul>
      </div>
    </div>
  );
}