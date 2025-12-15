/**
 * Invitus SEO Analyzer
 * A real-time content optimization tool that scores blog posts based on 15 SEO best practices
 * Similar to Rank Math SEO but built from scratch
 */

// Strip HTML tags from content
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
};

// Count words in text
const countWords = (text) => {
    const cleanText = stripHtml(text);
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
};

// Calculate keyword density
const calculateKeywordDensity = (content, keyword) => {
    if (!content || !keyword) return 0;

    const text = stripHtml(content).toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const keywordWords = keywordLower.split(/\s+/);

    if (words.length === 0) return 0;

    // Count keyword occurrences
    let count = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const slice = words.slice(i, i + keywordWords.length).join(' ');
        if (slice.includes(keywordLower)) {
            count++;
        }
    }

    return (count / words.length) * 100;
};

// Check if keyword is in text
const containsKeyword = (text, keyword) => {
    if (!text || !keyword) return false;
    return stripHtml(text).toLowerCase().includes(keyword.toLowerCase());
};

// Check if text has headings
const hasHeadings = (html, level) => {
    if (!html) return false;
    const regex = new RegExp(`<h${level}[^>]*>`, 'gi');
    return regex.test(html);
};

// Check if text has images
const hasImages = (html) => {
    if (!html) return false;
    return /<img[^>]*>/gi.test(html);
};

// Check if text has links
const hasLinks = (html) => {
    if (!html) return false;
    return /<a[^>]*href/gi.test(html);
};

// Validate slug format
const isValidSlug = (slug) => {
    if (!slug) return false;
    // Should be lowercase, no spaces, only hyphens as separators
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
};

// SEO Check definitions
const seoChecks = [
    {
        id: 'keyword_in_title',
        name: 'Focus keyword in SEO title',
        description: 'Your focus keyword should appear in the SEO title',
        weight: 1,
        check: (data) => containsKeyword(data.seoTitle, data.focusKeyword)
    },
    {
        id: 'keyword_in_meta',
        name: 'Focus keyword in meta description',
        description: 'Your focus keyword should appear in the meta description',
        weight: 1,
        check: (data) => containsKeyword(data.metaDescription, data.focusKeyword)
    },
    {
        id: 'keyword_in_url',
        name: 'Focus keyword in URL',
        description: 'Your focus keyword should appear in the URL/slug',
        weight: 1,
        check: (data) => containsKeyword(data.slug, data.focusKeyword)
    },
    {
        id: 'keyword_in_first_paragraph',
        name: 'Focus keyword in first paragraph',
        description: 'Your focus keyword should appear in the first 100 words of your content',
        weight: 1,
        check: (data) => {
            if (!data.content || !data.focusKeyword) return false;
            const text = stripHtml(data.content);
            const first100Words = text.split(/\s+/).slice(0, 100).join(' ');
            return containsKeyword(first100Words, data.focusKeyword);
        }
    },
    {
        id: 'keyword_density',
        name: 'Optimal keyword density',
        description: 'Keyword density should be between 0.5% and 2.5%',
        weight: 1,
        check: (data) => {
            const density = calculateKeywordDensity(data.content, data.focusKeyword);
            return density >= 0.5 && density <= 2.5;
        }
    },
    {
        id: 'title_length',
        name: 'SEO title length',
        description: 'SEO title should be between 50-60 characters',
        weight: 1,
        check: (data) => {
            const length = (data.seoTitle || '').length;
            return length >= 50 && length <= 60;
        }
    },
    {
        id: 'meta_length',
        name: 'Meta description length',
        description: 'Meta description should be between 150-160 characters',
        weight: 1,
        check: (data) => {
            const length = (data.metaDescription || '').length;
            return length >= 150 && length <= 160;
        }
    },
    {
        id: 'content_length',
        name: 'Content length',
        description: 'Content should have at least 300 words',
        weight: 1,
        check: (data) => countWords(data.content) >= 300
    },
    {
        id: 'has_h2',
        name: 'Use of H2 headings',
        description: 'Content should include H2 headings for better structure',
        weight: 1,
        check: (data) => hasHeadings(data.content, 2)
    },
    {
        id: 'has_h3',
        name: 'Use of H3 headings',
        description: 'Content should include H3 headings for better structure',
        weight: 1,
        check: (data) => hasHeadings(data.content, 3)
    },
    {
        id: 'has_images',
        name: 'Images in content',
        description: 'Content should include at least one image',
        weight: 1,
        check: (data) => hasImages(data.content) || !!data.featuredImage
    },
    {
        id: 'has_links',
        name: 'Internal/external links',
        description: 'Content should include at least one link',
        weight: 1,
        check: (data) => hasLinks(data.content)
    },
    {
        id: 'valid_slug',
        name: 'SEO-friendly URL',
        description: 'URL should be clean and SEO-friendly (lowercase, hyphenated)',
        weight: 1,
        check: (data) => isValidSlug(data.slug)
    },
    {
        id: 'keyword_in_content',
        name: 'Focus keyword in content',
        description: 'Your focus keyword should appear in the main content',
        weight: 1,
        check: (data) => containsKeyword(data.content, data.focusKeyword)
    },
    {
        id: 'featured_image',
        name: 'Featured image set',
        description: 'Article should have a featured image',
        weight: 1,
        check: (data) => !!data.featuredImage
    }
];

/**
 * Analyze content for SEO
 * @param {Object} data - Article data
 * @param {string} data.focusKeyword - The focus keyword to optimize for
 * @param {string} data.seoTitle - The SEO title
 * @param {string} data.metaDescription - The meta description
 * @param {string} data.slug - The URL slug
 * @param {string} data.content - The article content (HTML)
 * @param {string} data.featuredImage - The featured image URL
 * @returns {Object} Analysis results
 */
export const analyzeContent = (data) => {
    const results = [];
    let passedCount = 0;
    let totalWeight = 0;

    seoChecks.forEach(check => {
        const passed = check.check(data);
        totalWeight += check.weight;

        if (passed) {
            passedCount += check.weight;
        }

        results.push({
            id: check.id,
            name: check.name,
            description: check.description,
            passed,
            weight: check.weight
        });
    });

    const score = Math.round((passedCount / totalWeight) * 100);

    return {
        score,
        totalChecks: seoChecks.length,
        passedChecks: results.filter(r => r.passed).length,
        failedChecks: results.filter(r => !r.passed).length,
        status: getScoreStatus(score),
        results,
        stats: {
            wordCount: countWords(data.content),
            keywordDensity: calculateKeywordDensity(data.content, data.focusKeyword).toFixed(2),
            titleLength: (data.seoTitle || '').length,
            metaLength: (data.metaDescription || '').length
        }
    };
};

/**
 * Get score status and color
 */
const getScoreStatus = (score) => {
    if (score >= 80) {
        return { label: 'Good', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' };
    }
    if (score >= 60) {
        return { label: 'OK', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' };
    }
    return { label: 'Needs Work', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
};

/**
 * Get improvement suggestions
 */
export const getImprovementSuggestions = (results) => {
    return results
        .filter(r => !r.passed)
        .map(r => ({
            id: r.id,
            suggestion: r.description,
            priority: r.weight > 1 ? 'High' : 'Medium'
        }));
};

/**
 * Calculate optimal keyword count
 */
export const getOptimalKeywordCount = (wordCount) => {
    // Optimal density is 1-2%, so calculate range
    const minCount = Math.ceil(wordCount * 0.01);
    const maxCount = Math.floor(wordCount * 0.025);
    return { min: minCount, max: maxCount };
};

export default {
    analyzeContent,
    getImprovementSuggestions,
    getOptimalKeywordCount
};
