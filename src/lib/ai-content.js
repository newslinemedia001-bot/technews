import { GoogleGenerativeAI } from '@google/generative-ai';
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

// RSS feeds to use for AI content generation (different from regular RSS feeds)
export const aiContentSources = [
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
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'technology',
    enabled: true
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'technology',
    enabled: true
  }
];

// Extract content from RSS item
function extractContentFromRSS(item) {
  let content = item['content:encoded'] ||
    item.contentEncoded ||
    item.content ||
    item.description ||
    item.summary || '';

  const textContent = content.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src && !src.includes('pixel') && !src.includes('1x1') && !src.includes('feedburner')) {
      images.push(src);
    }
  }

  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
    images.push(item.enclosure.url);
  }

  return {
    title: item.title,
    content: textContent.substring(0, 5000),
    images,
    sourceUrl: item.link
  };
}

// Rewrite article using Gemini AI
async function rewriteArticle(originalContent, originalTitle) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are a professional tech journalist. Rewrite the following article in your own words while maintaining the key facts and information. Make it engaging, well-structured, and SEO-friendly.

Original Title: ${originalTitle}

Original Content:
${originalContent}

Instructions:
1. Create a new, catchy title (different from the original)
2. Rewrite the entire article in 4-6 well-structured paragraphs
3. Keep all important facts and details
4. Make it engaging and easy to read
5. Use proper HTML paragraph tags (<p></p>)
6. Add subheadings where appropriate using <h2> tags
7. Do NOT copy sentences directly - completely rewrite in your own words
8. Maintain a professional, journalistic tone

Format your response as JSON:
{
  "title": "Your new title here",
  "content": "Your rewritten article with HTML tags",
  "excerpt": "A brief 2-sentence summary (max 200 chars)"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const rewritten = JSON.parse(jsonMatch[0]);

    return {
      title: rewritten.title,
      content: rewritten.content,
      excerpt: rewritten.excerpt
    };
  } catch (error) {
    console.error('Error rewriting article with AI:', error);
    throw error;
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function articleExists(sourceUrl) {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, where('sourceUrl', '==', sourceUrl));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function generateAIArticle(item, sourceName, category) {
  try {
    if (await articleExists(item.link)) {
      console.log(`Article already exists: ${item.link}`);
      return { success: false, reason: 'duplicate' };
    }

    console.log(`Processing RSS item: ${item.title}`);
    const original = extractContentFromRSS(item);

    if (!original.content || original.content.length < 200) {
      console.log(`Insufficient content for: ${item.title}`);
      return { success: false, reason: 'insufficient_content' };
    }

    console.log(`Rewriting article with AI: ${original.title}`);
    const rewritten = await rewriteArticle(original.content, original.title);

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

    // If no image was found, try to auto-search for one
    if (!featuredImage) {
      try {
        const { findAndSetArticleImage } = await import('@/lib/image-search');
        // Run image search in background (don't wait for it)
        findAndSetArticleImage(docRef.id, rewritten.title, rewritten.content, category).catch(err => {
          console.log('Background image search failed:', err.message);
        });
      } catch (error) {
        console.log('Image search not available');
      }
    }

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

export async function generateFromSource(source, limit = 2) {
  try {
    console.log(`Fetching RSS feed from ${source.name}...`);
    const feed = await parser.parseURL(source.url);

    const results = [];
    let generated = 0;

    const items = feed.items.slice(0, limit * 2);

    for (const item of items) {
      if (generated >= limit) break;

      const result = await generateAIArticle(item, source.name, source.category);
      results.push(result);

      if (result.success) {
        generated++;
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
