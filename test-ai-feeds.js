
const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

const feeds = [
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://www.wired.com/feed/rss',
    'https://feeds.arstechnica.com/arstechnica/index'
];

async function testFeeds() {
    console.log('Testing AI Feeds...');

    for (const url of feeds) {
        try {
            console.log(`\nFetching ${url}...`);
            const feed = await parser.parseURL(url);
            console.log(`✅ Success: Found ${feed.items.length} items`);
            console.log(`   Sample title: ${feed.items[0].title}`);
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
}

testFeeds();
