import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import Parser from 'rss-parser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const parser = new Parser();

// RSS feeds to use for AI content generation
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
  
  // Extract images
  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src && !src.includes('pixel') && !src.includes('1x1') && !src.includes('feedburner')) {
      images.push(src);
    }
  }
  
  // Also check media content
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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
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
    
    // Extract JSON from response
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
    
    if (!original.content || original.content.length < 200) {
      console.log(`Insufficient content for: ${item.title}`);
      return { success: false, reason: 'insufficient_content' };
    }
    
    // Rewrite with AI
    console.log(`Rewriting article with AI: ${original.title}`);
    const rewritten = await rewriteArticle(original.content, original.title);
    
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

// Generate AI content from RSS feed
export async function generateFromSource(source, limit = 2) {
  try {
    console.log(`Fetching RSS feed from ${source.name}...`);
    const feed = await parser.parseURL(source.url);
    
    const results = [];
    let generated = 0;
    
    // Get items from feed
    const items = feed.items.slice(0, limit * 2); // Get more to account for duplicates
    
    for (const item of items) {
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
