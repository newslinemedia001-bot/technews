import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
    }

    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
    }

    return format(date, 'MMMM d, yyyy');
};

// Format date relative (e.g., "2 hours ago")
export const formatRelativeDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
};

// Format date for article display
export const formatArticleDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM d, yyyy | h:mm a');
};

// Truncate text
export const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

// Strip HTML tags and decode entities
export const stripHtml = (html) => {
    if (!html) return '';

    let text = html;

    // First decode entities to handle escaped HTML (e.g. from database or truncation)
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Remove script and style tags including their content
    text = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');

    // Remove HTML tags
    text = text.replace(/<[^>]*>?/g, '');

    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
};

// Calculate reading time
export const calculateReadingTime = (content) => {
    if (!content) return '1 min read';

    const text = stripHtml(content);
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // Average 200 words per minute

    return `${readingTime} min read`;
};

// Generate excerpt from content
export const generateExcerpt = (content, maxLength = 200) => {
    if (!content) return '';

    const text = stripHtml(content);
    return truncateText(text, maxLength);
};

// Format number (e.g., 1500 -> "1.5K")
export const formatNumber = (num) => {
    if (!num) return '0';

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }

    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }

    return num.toString();
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};
