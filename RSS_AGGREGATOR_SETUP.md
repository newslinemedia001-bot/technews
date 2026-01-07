# RSS Aggregator Setup Guide

## What Was Built

An automatic RSS feed aggregator that pulls articles from tech news sites and imports them to your site.

## Features

✅ **Automatic Import** - Runs every 6 hours via Netlify scheduled function
✅ **Multiple Sources** - TechCrunch, The Verge, Ars Technica, Wired (default)
✅ **Duplicate Detection** - Won't import the same article twice
✅ **Source Attribution** - Each article shows original source
✅ **Admin Panel** - Manage feeds at `/admin/rss-feeds`
✅ **Manual Trigger** - Import on-demand from admin panel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `rss-parser` - Parse RSS feeds
- `@netlify/functions` - Netlify scheduled functions

### 2. Set Environment Variables in Netlify

Go to Netlify Dashboard → Site Settings → Environment Variables and add:

```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
RSS_IMPORT_API_KEY=your-secret-key-here
```

Generate a random secret key for `RSS_IMPORT_API_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy to Netlify

```bash
git add .
git commit -m "Add RSS aggregator"
git push
```

Netlify will automatically:
- Deploy your site
- Set up the scheduled function
- Start importing articles every 6 hours

### 4. Verify Scheduled Function

1. Go to Netlify Dashboard → Functions
2. You should see `scheduled-import` function
3. Check logs to see when it runs

## How to Use

### Admin Panel

Visit: `https://your-site.com/admin/rss-feeds`

**Features:**
- View all configured feeds
- Add new RSS feeds
- Import from specific feed
- Import from all feeds (manual trigger)
- See import statistics

### Default Feeds

The system comes with these feeds pre-configured:

1. **TechCrunch** - https://techcrunch.com/feed/
2. **The Verge** - https://www.theverge.com/rss/index.xml
3. **Ars Technica** - https://feeds.arstechnica.com/arstechnica/index
4. **Wired** - https://www.wired.com/feed/rss

### Adding New Feeds

1. Go to `/admin/rss-feeds`
2. Click "Add New Feed"
3. Enter:
   - Feed Name (e.g., "TechCrunch")
   - Feed URL (RSS feed URL)
   - Category (technology, business, news, lifestyle)
4. Click "Add Feed"

### Finding RSS Feeds

Most news sites have RSS feeds:
- Look for RSS icon on the site
- Try: `https://site.com/feed` or `https://site.com/rss`
- Check site footer for "RSS" link

## How It Works

### Automatic Import (Every 6 Hours)

1. Netlify scheduled function runs at: 00:00, 06:00, 12:00, 18:00
2. Calls `/api/rss/import` endpoint
3. Fetches all enabled RSS feeds
4. Imports up to 5 articles per feed
5. Skips duplicates (checks by source URL)
6. Saves to Firebase with source attribution

### Article Data

Each imported article includes:
- Title
- Content/Description
- Featured Image (if available)
- Source Name (e.g., "TechCrunch")
- Source URL (link to original)
- Category
- Author: "[Source Name] (Aggregated)"
- `isAggregated: true` flag

### Duplicate Prevention

Articles are checked by `sourceUrl` before import. If an article with the same source URL exists, it's skipped.

## Customization

### Change Import Frequency

Edit `netlify/functions/scheduled-import.js`:

```javascript
// Current: Every 6 hours
module.exports.handler = schedule('0 */6 * * *', handler);

// Every 3 hours:
module.exports.handler = schedule('0 */3 * * *', handler);

// Every hour:
module.exports.handler = schedule('0 * * * *', handler);

// Daily at 9 AM:
module.exports.handler = schedule('0 9 * * *', handler);
```

### Change Articles Per Feed

Edit `src/lib/rss.js` in `importFromAllFeeds()`:

```javascript
// Current: 5 articles per feed
const result = await importFromFeed(feed.url, feed.name, feed.category, 5);

// Change to 10:
const result = await importFromFeed(feed.url, feed.name, feed.category, 10);
```

### Display Source Attribution

Aggregated articles have these fields:
- `isAggregated: true`
- `sourceName: "TechCrunch"`
- `sourceUrl: "https://..."`

Update your article display to show:
```jsx
{article.isAggregated && (
  <p>
    Source: <a href={article.sourceUrl} target="_blank">{article.sourceName}</a>
  </p>
)}
```

## Troubleshooting

### Function Not Running

1. Check Netlify Dashboard → Functions → Logs
2. Verify environment variables are set
3. Check function is deployed (should see `scheduled-import`)

### No Articles Imported

1. Check function logs for errors
2. Test manually: Visit `/admin/rss-feeds` and click "Import from All Feeds"
3. Check if feeds are enabled
4. Verify RSS feed URLs are valid

### Duplicate Articles

The system checks `sourceUrl` to prevent duplicates. If you see duplicates:
1. Check if articles have different source URLs
2. Clear old articles if needed

### API Authentication Failed

Make sure `RSS_IMPORT_API_KEY` environment variable matches in:
- Netlify environment variables
- Scheduled function call
- API route check

## Legal Considerations

⚠️ **Important:**

1. **Attribution Required** - Always show source name and link
2. **Fair Use** - Only import excerpts, not full articles
3. **Terms of Service** - Check each site's ToS
4. **Copyright** - Respect copyright laws
5. **Robots.txt** - Respect site's robots.txt

**Best Practices:**
- Link back to original article
- Show clear source attribution
- Don't claim content as your own
- Consider reaching out to sources for permission

## Support

If you need help:
1. Check Netlify function logs
2. Check browser console for errors
3. Test manual import first
4. Verify RSS feed URLs are valid

## Next Steps

1. Deploy to Netlify
2. Set environment variables
3. Wait for first scheduled run (or trigger manually)
4. Check `/admin/rss-feeds` for results
5. Add more feeds as needed
