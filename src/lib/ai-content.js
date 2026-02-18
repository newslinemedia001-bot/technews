import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import Parser from 'rss-parser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

// Fetch full content if RSS is truncated
async function fetchFullContent(url) {
  try {
    console.log(`Fetching full content from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove clutter
    $('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .related-posts, .comments').remove();

    // Get main article content - try common selectors
    let content = '';
    const selectors = ['article', '.post-content', '.entry-content', '.article-body', '.story-body', 'main'];

    let mainElement = null;
    for (const selector of selectors) {
      if ($(selector).length > 0) {
        mainElement = $(selector).first();
        break;
      }
    }

    // If no specific container found, look for paragraphs in body
    if (!mainElement) mainElement = $('body');

    // Extract paragraphs
    mainElement.find('p').each((i, el) => {
      const text = $(el).text().trim();
      // Filter out short snippets like "Advertisement" or "Read more"
      if (text.length > 40) {
        content += `<p>${text}</p>\n\n`;
      }
    });

    return content || null;
  } catch (error) {
    console.warn(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}
// RSS feeds to use for AI content generation - matches RSS feeds exactly
export const aiContentSources = [
  // News
  {
    name: 'The Star Kenya',
    url: 'https://www.the-star.co.ke/feed',
    category: 'news',
    enabled: true
  },
  {
    name: 'Kenyans.co.ke',
    url: 'https://www.kenyans.co.ke/feed',
    category: 'news',
    enabled: true
  },
  // Technology
  {
    name: 'TechNewsWorld',
    url: 'https://www.technewsworld.com/perl/syndication/rssfull.pl',
    category: 'technology',
    enabled: true
  },
  {
    name: 'TechTrends KE',
    url: 'https://techtrendske.co.ke/feed/',
    category: 'technology',
    enabled: true
  },
  // Business
  {
    name: 'The Star Business',
    url: 'https://www.the-star.co.ke/business/feed',
    category: 'business',
    enabled: true
  },
  {
    name: 'Kenyans Business',
    url: 'https://www.kenyans.co.ke/business/feed',
    category: 'business',
    enabled: true
  },
  // Featured
  {
    name: 'Tech-ish',
    url: 'https://tech-ish.com/feed/',
    category: 'featured',
    enabled: true
  },
  // Reviews
  {
    name: 'TechTrends Reviews',
    url: 'https://techtrendske.co.ke/feed/',
    category: 'reviews',
    enabled: true
  },
  // Lifestyle
  {
    name: 'The Star Lifestyle',
    url: 'https://www.the-star.co.ke/lifestyle/feed',
    category: 'lifestyle',
    enabled: true
  },
  // Videos
  {
    name: 'TED Talks',
    url: 'https://www.ted.com/talks/rss',
    category: 'videos',
    enabled: true
  },
  {
    name: 'Vimeo Staff Picks',
    url: 'https://vimeo.com/channels/staffpicks/videos/rss',
    category: 'videos',
    enabled: true
  },
  // Podcasts
  {
    name: 'NPR Podcasts',
    url: 'https://www.npr.org/rss/podcast.php?id=510318',
    category: 'podcasts',
    enabled: true
  },
  {
    name: 'The Daily',
    url: 'https://feeds.simplecast.com/54nAGcIl',
    category: 'podcasts',
    enabled: true
  }
];

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

  // Extract from content:encoded
  if (item.contentEncoded || item['content:encoded']) {
    const content = item.contentEncoded || item['content:encoded'];
    const imgMatches = content.matchAll(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const url = match[1];
      // Skip small icons, tracking pixels, and ads
      if (!url.includes('1x1') && !url.includes('pixel') && !url.includes('feedburner') && !url.includes('icon')) {
        // Try to get width from img tag
        const widthMatch = match[0].match(/width=["']?(\d+)/i);
        const width = widthMatch ? parseInt(widthMatch[1]) : 0;
        images.push({ url, width });
      }
    }
  }

  // Extract from content
  if (item.content) {
    const imgMatches = item.content.matchAll(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const url = match[1];
      if (!url.includes('1x1') && !url.includes('pixel') && !url.includes('feedburner') && !url.includes('icon')) {
        const widthMatch = match[0].match(/width=["']?(\d+)/i);
        const width = widthMatch ? parseInt(widthMatch[1]) : 0;
        images.push({ url, width });
      }
    }
  }

  // Extract from description
  if (item.description) {
    const imgMatches = item.description.matchAll(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const url = match[1];
      if (!url.includes('1x1') && !url.includes('pixel') && !url.includes('feedburner') && !url.includes('icon')) {
        images.push({ url, width: 0 });
      }
    }
  }

  // Sort by width (prefer larger images) and return the best one
  if (images.length > 0) {
    images.sort((a, b) => b.width - a.width);
    return images[0].url;
  }

  return null;
}

// Extract content from RSS item
function extractContentFromRSS(item) {
  // Get content from various RSS fields
  let content = item['content:encoded'] ||
    item.contentEncoded ||
    item.content ||
    item.description ||
    item.summary || '';

  // Strip HTML tags to get plain text
  const textContent = content.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const featuredImage = extractImage(item);

  return {
    title: item.title,
    content: textContent.substring(0, 5000),
    images: featuredImage ? [featuredImage] : [],
    sourceUrl: item.link
  };
}



// Rewrite article using Gemini AI
async function rewriteArticle(originalContent, originalTitle, sourceLink) {
  try {
    // Check if content is too short (likely a summary)
    let contentToProcess = originalContent;

    if (!contentToProcess || contentToProcess.length < 500) {
      console.log(`Content too short (${contentToProcess?.length || 0} chars). Attempting to scrape full article...`);
      const scrapedContent = await fetchFullContent(sourceLink);

      if (scrapedContent && scrapedContent.length > 500) {
        contentToProcess = scrapedContent;
        console.log(`Successfully scraped ${scrapedContent.length} chars.`);
      } else {
        console.log('Scraping failed or returned short content. Using original summary.');
      }
    }

    // Use gemini-1.5-pro for better quality writing
    // Use JSON mode for reliable output
    // Use gemini-2.5-flash as it is the currently available model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are a professional tech journalist for InsightNews. 
    Your task is to write a high-quality, engaging news article based on the following source material.
    
    Source Title: ${originalTitle}
    
    Source Content:
    ${contentToProcess.substring(0, 15000)} // Limit input size
    
    Instructions:
    1. Write a completely new article - do NOT just summarize.
    2. Create a catchy, click-worthy title (different from original).
    3. Structure the article with 4-6 paragraphs.
    4. Use <h2> subheadings to break up the text.
    5. Maintain a professional, informative, and engaging tone.
    6. If the source content is short, expand on the topic using your general knowledge about the subject (but do not make up specific facts not in the source).
    7. Ensure the output is valid HTML within the JSON fields.
    
    Format your response as a JSON object with this exact schema:
    {
      "title": "New Article Title",
      "content": "<p>First paragraph...</p><h2>Subheading</h2><p>Second paragraph...</p>...",
      "excerpt": "A compelling 2-sentence summary for the homepage."
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response (should be clean JSON due to responseMimeType)
    try {
      const rewritten = JSON.parse(text);
      return {
        title: rewritten.title,
        content: rewritten.content,
        excerpt: rewritten.excerpt
      };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      // Fallback regex if JSON mode somehow fails (unlikely with pro model)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const rewritten = JSON.parse(jsonMatch[0]);
        return {
          title: rewritten.title,
          content: rewritten.content,
          excerpt: rewritten.excerpt
        };
      }
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('Error rewriting article with AI:', error);
    throw error;
  }
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Check if article already exists
async function articleExists(sourceUrl) {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, where('sourceUrl', '==', sourceUrl));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Generate AI article from RSS item
export async function generateAIArticle(item, sourceName, category) {
  try {
    // Check if already generated
    if (await articleExists(item.link)) {
      console.log(`Article already exists: ${item.link}`);
      return { success: false, reason: 'duplicate' };
    }

    // Extract content from RSS
    console.log(`Processing RSS item: ${item.title}`);
    const original = extractContentFromRSS(item);

    // Skip if no image found (Quality Control)
    if (!original.images || original.images.length === 0) {
      console.log(`Skipping article due to missing image: ${item.title}`);
      return { success: false, reason: 'missing_image', isEmpty: true };
    }

    if (!original.content || original.content.length < 50) {
      console.log(`Insufficient content logic will try scraping later for: ${item.title}`);
      // Don't return early - let rewriteArticle handle scraping
    }

    // Rewrite with AI
    console.log(`Rewriting article with AI: ${original.title}`);
    // Pass original URL for scraping fallback
    const rewritten = await rewriteArticle(original.content, original.title, item.link);

    // Use first available image
    const featuredImage = original.images.length > 0 ? original.images[0] : null;

    const slug = generateSlug(rewritten.title);

    const articleData = {
      title: rewritten.title,
      slug: slug,
      content: rewritten.content,
      excerpt: rewritten.excerpt,
      category: category,
      author: `${sourceName} (AI Rewritten)`,
      featuredImage: featuredImage,
      videoId: '',
      status: 'published',
      featured: false,
      sourceUrl: item.link,
      sourceName: sourceName,
      isAggregated: true,
      isAIGenerated: true,
      pubDate: new Date(item.pubDate || Date.now()),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0
    };

    const docRef = await addDoc(collection(db, 'articles'), articleData);
    console.log(`✅ AI article created: ${rewritten.title}`);

    return {
      success: true,
      id: docRef.id,
      title: rewritten.title,
      hasImage: !!featuredImage
    };
  } catch (error) {
    console.error(`Error generating AI article:`, error);
    return { success: false, error: error.message };
  }
}

// Scrape articles from a homepage (Non-RSS discovery)
async function discoverArticlesFromHomepage(url, limit = 5) {
  try {
    console.log(`Discovering articles from homepage: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`Failed to fetch homepage: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const links = new Set();
    const items = [];

    // Find article links - look for headings with links or specific article patterns
    $('a').each((i, el) => {
      if (links.size >= limit * 3) return; // Collect more than needed to filter later

      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (!href || !text || text.length < 15) return;

      // Filter for likely article links
      // 1. Must be internal or start with domain
      const fullUrl = href.startsWith('http') ? href : new URL(href, url).toString();
      const urlObj = new URL(fullUrl);

      // Basic check: only same domain
      if (urlObj.hostname !== new URL(url).hostname) return;

      // 2. Path should look like an article (e.g., /2024/, /news/, dashed-slug, > 20 chars)
      if (urlObj.pathname.length < 20 || urlObj.pathname === '/' || LINKS_BLACKLIST.some(b => urlObj.pathname.includes(b))) return;

      // 3. Avoid duplicates
      if (links.has(fullUrl)) return;

      links.add(fullUrl);
      items.push({
        title: text,
        link: fullUrl,
        pubDate: new Date(), // Approximate
        content: '', // Will be fetched by fetchFullContent
        source: 'scrape'
      });
    });

    console.log(`Found ${items.length} potential articles on ${url}`);
    return items.slice(0, limit * 2);

  } catch (error) {
    console.warn(`Scraping discovery failed for ${url}:`, error.message);
    return [];
  }
}

const LINKS_BLACKLIST = ['/category/', '/tag/', '/author/', '/page/', '/contact', '/about', '/privacy', '/terms', '/login', '/signup', '/search'];

// Generate AI content from RSS feed or Homepage Scraping
export async function generateFromSource(source, limit = 2) {
  try {
    let items = [];

    if (source.type === 'scrape') {
      // --- SCRAPING MODE ---
      items = await discoverArticlesFromHomepage(source.url, limit);
      if (items.length === 0) {
        return {
          success: false,
          sourceName: source.name,
          error: 'No articles found via scraping'
        };
      }
    } else {
      // --- RSS MODE ---
      console.log(`Fetching RSS feed from ${source.name}...`);
      try {
        const feed = await parser.parseURL(source.url);
        if (!feed.items || feed.items.length === 0) {
          console.warn(`⚠️ RSS Feed is empty for: ${source.name}`);
          return {
            success: false,
            sourceName: source.name,
            error: 'RSS Feed is empty', // Explicit empty state
            isEmpty: true
          };
        }
        items = feed.items;
      } catch (rssError) {
        console.warn(`RSS failed for ${source.name}, trying homepage discovery...`);
        // Fallback: If RSS fails, try finding the homepage URL from the feed URL and scrape
        try {
          const feedUrlObj = new URL(source.url);
          const homepageUrl = `${feedUrlObj.protocol}//${feedUrlObj.hostname}`;
          items = await discoverArticlesFromHomepage(homepageUrl, limit);
          if (items.length === 0) throw new Error('Discovery fallback failed');
        } catch (fallbackError) {
          throw rssError; // Throw original error if fallback also fails
        }
      }
    }

    const results = [];
    let generated = 0;

    // Process items (RSS or Scraped)
    const candidates = items.slice(0, limit * 3); // Check more candidates for duplicates

    for (const item of candidates) {
      if (generated >= limit) break;

      const result = await generateAIArticle(item, source.name, source.category);
      results.push(result);

      if (result.success) {
        generated++;
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return {
      success: true,
      sourceName: source.name,
      total: items.length,
      generated: results.filter(r => r.success).length,
      duplicates: results.filter(r => r.reason === 'duplicate').length,
      results
    };
  } catch (error) {
    console.error(`Error generating from source ${source.name}:`, error);
    return {
      success: false,
      sourceName: source.name,
      error: error.message
    };
  }
}

// Get enabled AI sources from Firestore
export async function getEnabledAISources() {
  try {
    const sourcesRef = collection(db, 'aiSources');
    const q = query(sourcesRef, where('enabled', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return aiContentSources;
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting AI sources:', error);
    return aiContentSources;
  }
}

// Generate from all enabled sources
export async function generateFromAllSources(articlesPerSource = 2) {
  const sources = await getEnabledAISources();
  const results = [];

  for (const source of sources) {
    const result = await generateFromSource(source, articlesPerSource);
    results.push(result);
  }

  return {
    totalSources: sources.length,
    successfulSources: results.filter(r => r.success).length,
    totalGenerated: results.reduce((sum, r) => sum + (r.generated || 0), 0),
    totalDuplicates: results.reduce((sum, r) => sum + (r.duplicates || 0), 0),
    results
  };
}
