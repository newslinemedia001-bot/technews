import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['dc:creator', 'creator']
    ]
  }
});

export const defaultFeeds = [
  // News
  {
    name: 'Capital FM',
    url: 'https://www.capitalfm.co.ke/news/feed/',
    category: 'news',
    enabled: true
  },
  {
    name: 'Nairobi Wire',
    url: 'https://nairobiwire.com/category/news/feed/',
    category: 'news',
    enabled: true
  },
  // Business
  {
    name: 'Capital FM Business',
    url: 'https://www.capitalfm.co.ke/business/feed/',
    category: 'business',
    enabled: true
  },
  {
    name: 'Nairobi Wire Business',
    url: 'https://nairobiwire.com/category/business/feed/',
    category: 'business',
    enabled: true
  },
  // Technology
  {
    name: 'Nairobi Wire Tech',
    url: 'https://nairobiwire.com/category/tech/feed/',
    category: 'technology',
    enabled: true
  },
  // Lifestyle
  {
    name: 'Capital FM Lifestyle',
    url: 'https://www.capitalfm.co.ke/lifestyle/feed/',
    category: 'lifestyle',
    enabled: true
  },
  {
    name: 'Nairobi Wire Entertainment',
    url: 'https://nairobiwire.com/category/entertainment/feed/',
    category: 'lifestyle',
    enabled: true
  },
  // Videos
  {
    name: 'Capital FM Videos',
    url: 'https://www.capitalfm.co.ke/news/category/videos/feed/',
    category: 'videos',
    enabled: true
  },
  // Reviews 
  {
    name: 'Nairobi Wire Reviews',
    url: 'https://nairobiwire.com/category/reviews/feed/',
    category: 'reviews',
    enabled: true
  }
];

// Fetch and parse RSS feed
export async function fetchRSSFeed(feedUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    throw error;
  }
}

// Extract image from RSS item - prefer high quality
function extractImage(item) {
  const images = [];

  // Try media:content (often has multiple sizes)
  if (item.mediaContent) {
    if (Array.isArray(item.mediaContent)) {
      item.mediaContent.forEach(media => {
        if (media.$ && media.$.url && media.$.medium === 'image') {
          const width = parseInt(media.$.width) || 0;
          images.push({ url: media.$.url, width });
        }
      });
    } else if (item.mediaContent.$ && item.mediaContent.$.url) {
      images.push({ url: item.mediaContent.$.url, width: parseInt(item.mediaContent.$.width) || 0 });
    }
  }

  // Try media:thumbnail
  if (item.mediaThumbnail) {
    if (Array.isArray(item.mediaThumbnail)) {
      item.mediaThumbnail.forEach(thumb => {
        if (thumb.$ && thumb.$.url) {
          const width = parseInt(thumb.$.width) || 0;
          images.push({ url: thumb.$.url, width });
        }
      });
    } else if (item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
      images.push({ url: item.mediaThumbnail.$.url, width: parseInt(item.mediaThumbnail.$.width) || 0 });
    }
  }

  // Try enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image')) {
    images.push({ url: item.enclosure.url, width: 0 });
  }

  // Try iTunes image (common in podcast feeds)
  if (item.itunes && item.itunes.image) {
    const imageUrl = typeof item.itunes.image === 'string' ? item.itunes.image : item.itunes.image.href || item.itunes.image.$?.href;
    if (imageUrl) {
      images.push({ url: imageUrl, width: 1000 }); // iTunes images are usually high quality
    }
  }

  // Use cheerio for content extraction for better reliability
  const extractFromHtml = (html) => {
    if (!html) return;
    try {
      const $ = cheerio.load(html);
      $('img').each((i, el) => {
        const url = $(el).attr('src');
        if (url && !url.includes('1x1') && !url.includes('pixel') && !url.includes('feedburner') && !url.includes('icon')) {
          const widthAttr = $(el).attr('width');
          const width = widthAttr ? parseInt(widthAttr) : 0;
          images.push({ url, width: isNaN(width) ? 0 : width });
        }
      });
    } catch (e) {
      console.error('Error parsing HTML for images:', e);
    }
  };

  extractFromHtml(item.contentEncoded || item['content:encoded']);
  extractFromHtml(item.content);
  extractFromHtml(item.description);

  // Sort by width (prefer larger images) and return the best one
  if (images.length > 0) {
    images.sort((a, b) => b.width - a.width);
    return images[0].url;
  }

  return null;
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Check if article already exists
async function articleExists(link) {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, where('sourceUrl', '==', link));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Import single article from RSS item
export async function importArticle(item, feedName, category) {
  try {
    // Check if already imported
    if (await articleExists(item.link)) {
      console.log(`Article already exists: ${item.title}`);
      return { success: false, reason: 'duplicate' };
    }

    const slug = generateSlug(item.title);
    let image = extractImage(item);
    let videoId = null;

    // Check if it's a YouTube video and extract video ID
    // YouTube RSS feeds use format: https://www.youtube.com/watch?v=VIDEO_ID
    if (item.link && (item.link.includes('youtube.com') || item.link.includes('youtu.be'))) {
      const youtubeMatch = item.link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) {
        videoId = youtubeMatch[1];
        // Always use YouTube thumbnail for video content (maxresdefault is highest quality)
        image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    // Also check the ID field that YouTube RSS feeds provide
    if (!videoId && item.id && item.id.includes('yt:video:')) {
      videoId = item.id.replace('yt:video:', '');
      image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // Get the best content available - try multiple sources
    let content = item['content:encoded'] || item.contentEncoded || item.content || item.description || item.summary || '';

    // Clean and format content
    if (content) {
      // Remove script and style tags
      content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      // Remove tracking pixels and ads
      content = content.replace(/<img[^>]*feedburner[^>]*>/gi, '');
      content = content.replace(/<a[^>]*feedburner[^>]*>.*?<\/a>/gi, '');
    }

    // Get text-only version for length checking
    const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Ensure content has at least 3 paragraphs (minimum 600 characters)
    if (textOnly.length < 600) {
      // Split existing content into sentences
      const sentences = textOnly.match(/[^.!?]+[.!?]+/g) || [textOnly];

      // Create paragraphs from sentences (2-3 sentences per paragraph)
      const paragraphs = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const paragraph = sentences.slice(i, i + 2).join(' ').trim();
        if (paragraph) {
          paragraphs.push(`<p>${paragraph}</p>`);
        }
      }

      // If still too short, add a read more section
      if (paragraphs.length < 3 || textOnly.length < 400) {
        paragraphs.push(`<p><strong>This article continues with more details and analysis.</strong></p>`);
        paragraphs.push(`<p><a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-full-article-link">Read the complete article on ${feedName} →</a></p>`);
      }

      content = paragraphs.join('\n\n');
    } else {
      // Content is good, just ensure it's wrapped in paragraphs if not already
      if (!content.includes('<p>') && !content.includes('<div>')) {
        // Split by double line breaks and wrap in paragraphs
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
        content = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n\n');
      }
    }

    // Create excerpt from content
    const excerptText = textOnly.substring(0, 300) + (textOnly.length > 300 ? '...' : '');

    // CRITICAL: Ensure image exists - if none found, try to auto-search for one
    if (!image || image.trim() === '') {
      // Try to find an image automatically
      try {
        const { findAndSetArticleImage } = await import('@/lib/image-search');
        // We'll set this after creating the article
        image = null;
      } catch (error) {
        console.log('Image search not available:', error.message);
        image = null;
      }
    }

    const articleData = {
      title: item.title,
      slug: slug,
      content: content,
      excerpt: excerptText,
      category: category,
      author: feedName,
      featuredImage: image || null,
      image: image || null,
      videoId: videoId || '',
      status: 'published',
      featured: false,
      sourceUrl: item.link,
      sourceName: feedName,
      isAggregated: true,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0
    };

    const docRef = await addDoc(collection(db, 'articles'), articleData);
    console.log(`Imported article: ${item.title} (${textOnly.length} chars)${videoId ? ' [VIDEO]' : ''}${!extractImage(item) ? ' [NO IMG - WILL SEARCH]' : ''}`);

    // If no image was found, try to auto-search for one
    if (!image) {
      try {
        const { findAndSetArticleImage } = await import('@/lib/image-search');
        // Run image search in background (don't wait for it)
        findAndSetArticleImage(docRef.id, item.title, textOnly, category).catch(err => {
          console.log('Background image search failed:', err.message);
        });
      } catch (error) {
        console.log('Image search not available');
      }
    }

    return { success: true, id: docRef.id, title: item.title };
  } catch (error) {
    console.error(`Error importing article ${item.title}:`, error);
    return { success: false, error: error.message };
  }
}

// Import articles from a feed
export async function importFromFeed(feedUrl, feedName, category, limit = 5) {
  try {
    const feed = await fetchRSSFeed(feedUrl);
    const results = [];

    // Limit number of articles to import
    const items = feed.items.slice(0, limit);

    for (const item of items) {
      const result = await importArticle(item, feedName, category);
      results.push(result);
    }

    return {
      success: true,
      feedName,
      total: items.length,
      imported: results.filter(r => r.success).length,
      duplicates: results.filter(r => r.reason === 'duplicate').length,
      results
    };
  } catch (error) {
    console.error(`Error importing from feed ${feedName}:`, error);
    return {
      success: false,
      feedName,
      error: error.message
    };
  }
}

// Import from all enabled feeds with category rotation
export async function importFromAllFeeds() {
  const feeds = await getEnabledFeeds();

  // Get last imported category from Firebase
  const { doc, getDoc, setDoc } = await import('firebase/firestore');
  const settingsRef = doc(db, 'settings', 'rssRotation');
  const settingsDoc = await getDoc(settingsRef);

  // Only categories that have feeds
  const categories = ['news', 'business', 'technology', 'lifestyle', 'videos', 'reviews'];
  let currentCategoryIndex = 0;

  if (settingsDoc.exists()) {
    const lastCategory = settingsDoc.data().lastCategory;
    const lastIndex = categories.indexOf(lastCategory);
    currentCategoryIndex = (lastIndex + 1) % categories.length;
  }

  const currentCategory = categories[currentCategoryIndex];

  // Filter feeds by current category
  const categoryFeeds = feeds.filter(feed => feed.category === currentCategory);

  const results = [];

  if (categoryFeeds.length > 0) {
    for (const feed of categoryFeeds) {
      const result = await importFromFeed(feed.url, feed.name, feed.category, 5);
      results.push(result);
    }
  } else {
    // If no feeds for this category, skip to next one immediately
    console.log(`No feeds for category ${currentCategory}, skipping...`);
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
  }

  // Save current category for next rotation
  await setDoc(settingsRef, {
    lastCategory: currentCategory,
    lastRun: new Date(),
    nextCategory: categories[(currentCategoryIndex + 1) % categories.length]
  });

  return {
    category: currentCategory,
    nextCategory: categories[(currentCategoryIndex + 1) % categories.length],
    results
  };
}

// Import from specific category (MANUAL MODE)
export async function importFromCategoryFeeds(category) {
  const feeds = await getEnabledFeeds();

  // Filter feeds by requested category
  const categoryFeeds = feeds.filter(feed => feed.category === category);

  if (categoryFeeds.length === 0) {
    return {
      category: category,
      results: [],
      message: `No enabled feeds found for category: ${category}`
    };
  }

  const results = [];

  for (const feed of categoryFeeds) {
    const result = await importFromFeed(feed.url, feed.name, feed.category, 5);
    results.push(result);
  }

  return {
    category: category,
    results
  };
}

// Get enabled feeds from Firestore
export async function getEnabledFeeds() {
  try {
    const feedsRef = collection(db, 'rssFeeds');
    const q = query(feedsRef, where('enabled', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Return default feeds if none configured
      return defaultFeeds;
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting feeds:', error);
    return defaultFeeds;
  }
}

// Save feed configuration
export async function saveFeed(feedData) {
  try {
    const docRef = await addDoc(collection(db, 'rssFeeds'), {
      ...feedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving feed:', error);
    return { success: false, error: error.message };
  }
}

// Update feed
export async function updateFeed(feedId, feedData) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'rssFeeds', feedId), {
      ...feedData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating feed:', error);
    return { success: false, error: error.message };
  }
}

// Delete feed
export async function deleteFeed(feedId) {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'rssFeeds', feedId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting feed:', error);
    return { success: false, error: error.message };
  }
}

// Get all feeds
export async function getAllFeeds() {
  try {
    const feedsRef = collection(db, 'rssFeeds');
    const snapshot = await getDocs(feedsRef);

    if (snapshot.empty) {
      return defaultFeeds;
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all feeds:', error);
    return defaultFeeds;
  }
}
