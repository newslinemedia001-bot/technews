'use client';

import { useState, useEffect } from 'react';
import { getAllFeeds, saveFeed, updateFeed, deleteFeed, importFromFeed } from '@/lib/rss';
import styles from '../articles/page.module.css';

export default function RSSFeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [articlesPerFeed, setArticlesPerFeed] = useState(5);
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    category: 'technology',
    enabled: true
  });

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    try {
      const feedsList = await getAllFeeds();
      setFeeds(feedsList);
    } catch (error) {
      console.error('Error loading feeds:', error);
      setMessage('Error loading feeds');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (e) => {
    e.preventDefault();
    try {
      if (editingFeed) {
        const result = await updateFeed(editingFeed.id, newFeed);
        if (result.success) {
          setMessage('✓ Feed updated successfully!');
          setEditingFeed(null);
        } else {
          setMessage('✗ Error updating feed: ' + result.error);
        }
      } else {
        const result = await saveFeed(newFeed);
        if (result.success) {
          setMessage('✓ Feed added successfully!');
        } else {
          setMessage('✗ Error adding feed: ' + result.error);
        }
      }
      setNewFeed({ name: '', url: '', category: 'technology', enabled: true });
      setShowAddForm(false);
      loadFeeds();
    } catch (error) {
      setMessage('✗ Error: ' + error.message);
    }
  };

  const handleEditFeed = (feed) => {
    setEditingFeed(feed);
    setNewFeed({
      name: feed.name,
      url: feed.url,
      category: feed.category,
      enabled: feed.enabled
    });
    setShowAddForm(true);
  };

  const handleDeleteFeed = async (feedId) => {
    if (!confirm('Are you sure you want to delete this feed?')) return;
    
    try {
      const result = await deleteFeed(feedId);
      if (result.success) {
        setMessage('✓ Feed deleted successfully!');
        loadFeeds();
      } else {
        setMessage('✗ Error deleting feed: ' + result.error);
      }
    } catch (error) {
      setMessage('✗ Error: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingFeed(null);
    setNewFeed({ name: '', url: '', category: 'technology', enabled: true });
    setShowAddForm(false);
  };

  const handleImportFromFeed = async (feed) => {
    setImporting(true);
    setMessage(`Importing from ${feed.name}...`);
    
    try {
      const result = await importFromFeed(feed.url, feed.name, feed.category, articlesPerFeed);
      if (result.success) {
        setMessage(`✓ Imported ${result.imported} articles from ${feed.name} (${result.duplicates} duplicates skipped)`);
      } else {
        setMessage(`✗ Error importing from ${feed.name}: ${result.error}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleImportAll = async () => {
    setImporting(true);
    setMessage('Importing from all feeds...');
    
    try {
      const response = await fetch('/api/rss/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '8fcb0cec763622059af59b1b541af454ff06059e9195aaf0e5616633b4e1fd27'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage(`✓ Imported ${result.totalImported} articles from ${result.category.toUpperCase()} category (${result.totalDuplicates} duplicates skipped). Next import: ${result.nextCategory.toUpperCase()}`);
      } else {
        setMessage(`✗ Error: ${result.error || 'Unknown error'} - ${result.details || ''}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>RSS Feeds</h1>
        </div>
        <p>Loading feeds...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>RSS Feed Aggregator</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Articles per feed:
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={articlesPerFeed}
              onChange={(e) => setArticlesPerFeed(parseInt(e.target.value) || 5)}
              style={{
                width: '70px',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <button
            onClick={handleImportAll}
            disabled={importing}
            className={styles.button}
            style={{ backgroundColor: '#22c55e' }}
          >
            {importing ? 'Importing...' : 'Import from All Feeds'}
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) handleCancelEdit();
            }}
            className={styles.button}
          >
            {showAddForm ? 'Cancel' : 'Add New Feed'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: message.includes('✓') ? '#22c55e' : message.includes('✗') ? '#ef4444' : '#3b82f6',
          color: 'white',
          borderRadius: '8px'
        }}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>{editingFeed ? 'Edit Feed' : 'Add New RSS Feed'}</h2>
          <form onSubmit={handleAddFeed}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Feed Name</label>
              <input
                type="text"
                value={newFeed.name}
                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                placeholder="e.g., TechCrunch"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Feed URL</label>
              <input
                type="url"
                value={newFeed.url}
                onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                placeholder="https://example.com/feed.xml"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
              <select
                value={newFeed.category}
                onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="news">News</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <button type="submit" className={styles.button}>
              {editingFeed ? 'Update Feed' : 'Add Feed'}
            </button>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Configured Feeds</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Auto-import runs every 6 hours, rotating through categories (Technology → Business → News → Lifestyle → repeat)
        </p>
        
        {feeds.length === 0 ? (
          <p>No feeds configured. Using default feeds.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feeds.map((feed, index) => (
              <div
                key={feed.id || index}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{feed.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {feed.url}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                      <span>Category: <strong>{feed.category}</strong></span>
                      <span>Status: <strong style={{ color: feed.enabled ? '#22c55e' : '#ef4444' }}>
                        {feed.enabled ? 'Enabled' : 'Disabled'}
                      </strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEditFeed(feed)}
                      className={styles.button}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleImportFromFeed(feed)}
                      disabled={importing || !feed.enabled}
                      className={styles.button}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      Import Now
                    </button>
                    {feed.id && (
                      <button
                        onClick={() => handleDeleteFeed(feed.id)}
                        className={styles.button}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#ef4444' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
