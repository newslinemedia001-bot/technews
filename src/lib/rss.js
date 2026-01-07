import Parser from 'rss-parser';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

// Default RSS feeds - mixed categories
export const defaultFeeds = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology',
    enabled: true
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'technology',
    enabled: true
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'technology',
    enabled: true
  },
  {
    name: 'BBC Business',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'business',
    enabled: true
  },
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'business',
    enabled: true
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'news',
    enabled: true
  },
  {
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    category: 'news',
    enabled: true
  },
  {
    name: 'Lifehacker',
    url: 'https://lifehacker.com/rss',
    category: 'lifestyle',
    enabled: true
  },
  {
    name: 'Vogue',
    url: 'https://www.vogue.com/feed/rss',
    category: 'lifestyle',
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

// Extract image from RSS item
function extractImage(item) {
  // Try media:content
  if (item.mediaContent && item.mediaContent.$) {
    return item.mediaContent.$.url;
  }
  
  // Try media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$) {
    return item.mediaThumbnail.$.url;
  }
  
  // Try enclosure
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try to extract from content
  if (item.contentEncoded) {
    const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
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
    const image = extractImage(item);
    
    // Clean content
    let content = item.contentEncoded || item.content || item.description || '';
    // Remove HTML tags for excerpt
    const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 200);
    
    const articleData = {
      title: item.title,
      slug: slug,
      content: content,
      excerpt: excerpt,
      category: category,
      author: `${feedName} (Aggregated)`,
      featuredImage: image,
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
    console.log(`Imported article: ${item.title}`);
    
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
  
  const categories = ['technology', 'business', 'news', 'lifestyle'];
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
