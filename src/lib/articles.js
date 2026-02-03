import { db } from './firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    Timestamp,
    increment
} from 'firebase/firestore';
import slugify from 'slugify';

const ARTICLES_COLLECTION = 'articles';

// Generate unique slug from title
export const generateSlug = async (title) => {
    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        trim: true
    });

    // Check if slug exists
    const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('slug', '>=', baseSlug),
        where('slug', '<=', baseSlug + '\uf8ff')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return baseSlug;
    }

    // Add number suffix if slug exists
    const existingSlugs = snapshot.docs.map(doc => doc.data().slug);
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;

    while (existingSlugs.includes(newSlug)) {
        counter++;
        newSlug = `${baseSlug}-${counter}`;
    }

    return newSlug;
};

// Create a new article
export const createArticle = async (articleData) => {
    const slug = await generateSlug(articleData.title);

    const article = {
        ...articleData,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        status: articleData.status || 'draft'
    };

    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), article);
    return { id: docRef.id, slug };
};

// Update an article
export const updateArticle = async (articleId, articleData) => {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);

    // If title changed, regenerate slug
    let updateData = {
        ...articleData,
        updatedAt: serverTimestamp()
    };

    if (articleData.titleChanged) {
        updateData.slug = await generateSlug(articleData.title);
        delete updateData.titleChanged;
    }

    await updateDoc(docRef, updateData);
    return updateData.slug || articleData.slug;
};

// Delete an article
export const deleteArticle = async (articleId) => {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(docRef);
};

// Get article by slug
export const getArticleBySlug = async (slug) => {
    try {
        // Use a direct query with slug and status for faster lookup
        const q = query(
            collection(db, ARTICLES_COLLECTION),
            where('slug', '==', slug),
            where('status', '==', 'published'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const articleDoc = snapshot.docs[0];
        return { id: articleDoc.id, ...articleDoc.data() };
    } catch (error) {
        console.error('Error fetching article by slug:', error);
        console.error('Error details:', error.code, error.message);
        throw error;
    }
};

// Get article by ID
export const getArticleById = async (articleId) => {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return { id: docSnap.id, ...docSnap.data() };
};

// Get articles by category (optimized - minimal data)
export const getArticlesByCategory = async (category, limitCount = 10, lastDoc = null) => {
    let q = query(
        collection(db, ARTICLES_COLLECTION),
        where('category', '==', category),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 5) // Fetch 5x more to account for filtering
    );

    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs
        .map(doc => {
            const data = doc.data();
            const contentPreview = data.content ? data.content.substring(0, 500) : '';
            return {
                id: doc.id,
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                featuredImage: data.featuredImage,
                category: data.category,
                author: data.author,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                views: data.views,
                content: contentPreview, // Truncated
                videoId: data.videoId || null
            };
        })
        .filter(article => article.featuredImage && article.featuredImage.trim() !== '') // Only articles with valid images
        .slice(0, limitCount); // Limit to requested count
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { articles, lastVisible };
};

// Get latest articles (optimized - minimal data for cards)
export const getLatestArticles = async (limitCount = 10, lastDoc = null) => {
    let q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2) // Fetch more to account for filtering
    );

    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs
        .map(doc => {
            const data = doc.data();
            // Only get first 500 chars of content for reading time calc
            const contentPreview = data.content ? data.content.substring(0, 500) : '';
            return {
                id: doc.id,
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                featuredImage: data.featuredImage,
                category: data.category,
                author: data.author,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                views: data.views,
                content: contentPreview, // Truncated content
                videoId: data.videoId || null
            };
        })
        .filter(article => article.featuredImage) // Only articles with images
        .slice(0, limitCount); // Limit to requested count
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { articles, lastVisible };
};

// Get featured articles (optimized - minimal data)
export const getFeaturedArticles = async (limitCount = 5) => {
    const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2) // Fetch more to account for filtering
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => {
            const data = doc.data();
            const contentPreview = data.content ? data.content.substring(0, 500) : '';
            return {
                id: doc.id,
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                featuredImage: data.featuredImage,
                category: data.category,
                author: data.author,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                views: data.views,
                content: contentPreview // Truncated
            };
        })
        .filter(article => article.featuredImage) // Only articles with images
        .slice(0, limitCount); // Limit to requested count
};

// Get trending articles (by views) - optimized with thumbnail
export const getTrendingArticles = async (limitCount = 10) => {
    const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published'),
        orderBy('views', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            slug: data.slug,
            views: data.views,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            featuredImage: data.featuredImage
        };
    });
};

// Increment article views (atomic)
export const incrementViews = async (articleId) => {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    // Use Firestore atomic increment
    await updateDoc(docRef, {
        views: increment(1)
    });
};

// Get all articles (for admin)
export const getAllArticles = async (statusFilter = null) => {
    let q;

    if (statusFilter) {
        q = query(
            collection(db, ARTICLES_COLLECTION),
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc')
        );
    } else {
        q = query(
            collection(db, ARTICLES_COLLECTION),
            orderBy('createdAt', 'desc')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Search articles - improved client-side search
export const searchArticles = async (searchTerm, limitCount = 20) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    const searchLower = searchTerm.toLowerCase().trim();

    // Get all published articles (with caching this is fast)
    const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(100) // Get more articles to search through
    );

    const snapshot = await getDocs(q);

    // Client-side filtering for better search
    const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(article => {
            // Must have featured image
            if (!article.featuredImage) return false;
            
            const titleMatch = article.title?.toLowerCase().includes(searchLower);
            const excerptMatch = article.excerpt?.toLowerCase().includes(searchLower);
            const contentMatch = article.content?.toLowerCase().includes(searchLower);
            return titleMatch || excerptMatch || contentMatch;
        })
        .slice(0, limitCount);

    return results;
};

// Get articles count by category
export const getArticlesCountByCategory = async () => {
    const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);
    const counts = {};

    snapshot.docs.forEach(doc => {
        const category = doc.data().category;
        counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
};
