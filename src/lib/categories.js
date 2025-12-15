// Categories based on The Star structure
export const categories = [
    {
        id: 'news',
        name: 'News',
        slug: 'news',
        subcategories: [
            { id: 'national', name: 'National', slug: 'national' },
            { id: 'politics', name: 'Politics', slug: 'politics' },
            { id: 'international', name: 'International', slug: 'international' },
            { id: 'education', name: 'Education', slug: 'education' },
            { id: 'crime', name: 'Crime', slug: 'crime' }
        ]
    },
    {
        id: 'technology',
        name: 'Technology',
        slug: 'technology',
        subcategories: [
            { id: 'gadgets', name: 'Gadgets', slug: 'gadgets' },
            { id: 'software', name: 'Software', slug: 'software' },
            { id: 'startups', name: 'Startups', slug: 'startups' },
            { id: 'ai', name: 'AI & ML', slug: 'ai' },
            { id: 'cybersecurity', name: 'Cybersecurity', slug: 'cybersecurity' }
        ]
    },
    {
        id: 'business',
        name: 'Business',
        slug: 'business',
        subcategories: [
            { id: 'markets', name: 'Markets', slug: 'markets' },
            { id: 'finance', name: 'Finance', slug: 'finance' },
            { id: 'economy', name: 'Economy', slug: 'economy' },
            { id: 'companies', name: 'Companies', slug: 'companies' },
            { id: 'entrepreneurship', name: 'Entrepreneurship', slug: 'entrepreneurship' }
        ]
    },
    {
        id: 'sports',
        name: 'Sports',
        slug: 'sports',
        subcategories: [
            { id: 'football', name: 'Football', slug: 'football' },
            { id: 'athletics', name: 'Athletics', slug: 'athletics' },
            { id: 'cricket', name: 'Cricket', slug: 'cricket' },
            { id: 'tennis', name: 'Tennis', slug: 'tennis' },
            { id: 'esports', name: 'Esports', slug: 'esports' }
        ]
    },
    {
        id: 'opinion',
        name: 'Opinion',
        slug: 'opinion',
        subcategories: [
            { id: 'editorial', name: 'Editorial', slug: 'editorial' },
            { id: 'analysis', name: 'Analysis', slug: 'analysis' },
            { id: 'columnists', name: 'Columnists', slug: 'columnists' }
        ]
    },
    {
        id: 'lifestyle',
        name: 'Lifestyle',
        slug: 'lifestyle',
        subcategories: [
            { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
            { id: 'fashion', name: 'Fashion', slug: 'fashion' },
            { id: 'health', name: 'Health', slug: 'health' },
            { id: 'travel', name: 'Travel', slug: 'travel' },
            { id: 'food', name: 'Food', slug: 'food' }
        ]
    },
    {
        id: 'videos',
        name: 'Videos',
        slug: 'videos',
        subcategories: []
    },
    {
        id: 'podcasts',
        name: 'Podcasts',
        slug: 'podcasts',
        subcategories: []
    }
];

// Get category by ID
export const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
};

// Get category by slug
export const getCategoryBySlug = (slug) => {
    return categories.find(cat => cat.slug === slug);
};

// Get subcategory
export const getSubcategory = (categoryId, subcategoryId) => {
    const category = getCategoryById(categoryId);
    if (!category) return null;
    return category.subcategories.find(sub => sub.id === subcategoryId);
};

// Get all categories for navigation
export const getNavigationCategories = () => {
    return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        hasSubmenu: cat.subcategories.length > 0,
        subcategories: cat.subcategories
    }));
};

// Flatten all categories and subcategories for select options
export const getAllCategoriesFlat = () => {
    const flat = [];

    categories.forEach(cat => {
        flat.push({
            value: cat.id,
            label: cat.name,
            isParent: true
        });

        cat.subcategories.forEach(sub => {
            flat.push({
                value: `${cat.id}/${sub.id}`,
                label: `${cat.name} > ${sub.name}`,
                isParent: false,
                parentId: cat.id
            });
        });
    });

    return flat;
};
