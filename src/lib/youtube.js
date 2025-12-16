// Extract YouTube video ID from various URL formats
export const extractYouTubeId = (url) => {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
};

// Get YouTube thumbnail URL
export const getYouTubeThumbnail = (videoId, quality = 'maxresdefault') => {
    if (!videoId) return null;
    
    // Quality options: default, mqdefault, hqdefault, sddefault, maxresdefault
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// Get YouTube embed URL
export const getYouTubeEmbedUrl = (videoId) => {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
};

// Check if URL is a YouTube URL
export const isYouTubeUrl = (url) => {
    if (!url) return false;
    return /(?:youtube\.com|youtu\.be)/.test(url);
};
