import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

const sources = [
  { name: 'The Star Kenya', url: 'https://www.the-star.co.ke/feed' },
  { name: 'TechNewsWorld', url: 'https://www.technewsworld.com/perl/syndication/rssfull.pl' },
  { name: 'TechTrends KE', url: 'https://techtrendske.co.ke/feed/' }
];

console.log('Checking RSS feeds for new content...\n');

for (const source of sources) {
  try {
    console.log(`\n📡 ${source.name}`);
    console.log(`   URL: ${source.url}`);
    
    const feed = await parser.parseURL(source.url);
    
    console.log(`   ✅ Found ${feed.items.length} items`);
    
    if (feed.items.length > 0) {
      const latest = feed.items[0];
      console.log(`   Latest: "${latest.title}"`);
      console.log(`   Published: ${latest.pubDate}`);
      console.log(`   Link: ${latest.link}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}
