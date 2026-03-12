// Auto image search for articles without featured images
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

// Search for images using Unsplash API (free tier) - OPTIONAL
async function searchUnsplashImage(query) {
  // Skip if no API key configured
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
    }
  } catch (error) {
    console.error('Unsplash search failed:', error);
  }
  return null;
}

// Search for images using Pexels API (free tier) - PRIMARY
async function searchPexelsImage(query) {
  // Skip if no API key configured
  if (!process.env.PEXELS_API_KEY) {
    console.error('PEXELS_API_KEY not configured');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': process.env.PEXELS_API_KEY
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.large;
      }
    }
  } catch (error) {
    console.error('Pexels search failed:', error);
  }
  return null;
}

// Generate search terms from article title and content
function generateSearchTerms(title, content, category) {
  // Clean title and extract key terms
  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3);
  
  // Add category-specific terms
  const categoryTerms = {
    'technology': ['technology', 'tech', 'digital', 'innovation'],
    'business': ['business', 'corporate', 'office', 'meeting'],
    'lifestyle': ['lifestyle', 'people', 'modern', 'life'],
    'news': ['news', 'breaking', 'current', 'events'],
    'reviews': ['product', 'review', 'gadget', 'device'],
    'videos': ['video', 'media', 'screen', 'play']
  };
  
  const terms = [...titleWords];
  if (categoryTerms[category]) {
    terms.push(categoryTerms[category][0]);
  }
  
  return terms.join(' ');
}

// Main function to find and set image for article
export async function findAndSetArticleImage(articleId, title, content, category) {
  try {
    const searchQuery = generateSearchTerms(title, content, category);
    console.log(`Searching for image with query: ${searchQuery}`);
    
    // Try Pexels first (usually better quality)
    let imageUrl = await searchPexelsImage(searchQuery);
    
    // Fallback to Unsplash if Pexels fails
    if (!imageUrl) {
      imageUrl = await searchUnsplashImage(searchQuery);
    }
    
    // If we found an image, update the article
    if (imageUrl) {
      const articleRef = doc(db, 'articles', articleId);
      await updateDoc(articleRef, {
        featuredImage: imageUrl,
        autoImageSearch: true, // Flag to indicate this was auto-generated
        updatedAt: new Date()
      });
      
      console.log(`✅ Auto-found image for article: ${title}`);
      return imageUrl;
    } else {
      console.log(`❌ No image found for: ${title}`);
      return null;
    }
  } catch (error) {
    console.error('Error in findAndSetArticleImage:', error);
    return null;
  }
}

// Batch process articles without images
export async function processArticlesWithoutImages() {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Get articles without featured images
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published')
    );
    
    const snapshot = await getDocs(q);
    const articlesWithoutImages = [];
    const articlesWithImages = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.featuredImage || data.featuredImage.trim() === '' || data.featuredImage.includes('placeholder')) {
        articlesWithoutImages.push({
          id: doc.id,
          title: data.title,
          content: data.content || data.excerpt || '',
          category: data.category,
          currentImage: data.featuredImage
        });
      } else {
        articlesWithImages.push({
          id: doc.id,
          title: data.title,
          hasImage: !!data.featuredImage
        });
      }
    });
    
    console.log(`Found ${articlesWithoutImages.length} articles without images`);
    console.log(`Found ${articlesWithImages.length} articles WITH images`);
    console.log('Sample articles without images:', articlesWithoutImages.slice(0, 3).map(a => ({ title: a.title, currentImage: a.currentImage })));
    
    // Process each article (with delay to respect API limits)
    let processed = 0;
    for (const article of articlesWithoutImages.slice(0, 10)) { // Limit to 10 per batch
      const result = await findAndSetArticleImage(
        article.id,
        article.title,
        article.content,
        article.category
      );
      
      if (result) {
        processed++;
      }
      
      // Wait 2 seconds between requests to respect API limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return {
      processed: processed,
      total: articlesWithoutImages.length,
      withImages: articlesWithImages.length
    };
  } catch (error) {
    console.error('Error processing articles:', error);
    return { processed: 0, total: 0, withImages: 0 };
  }
}