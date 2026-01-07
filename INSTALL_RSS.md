# Quick Install - RSS Aggregator

## Step 1: Install Dependencies

Run this command:

```bash
npm install rss-parser @netlify/functions
```

## Step 2: Set Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RSS_IMPORT_API_KEY=your-secret-key-here
```

Generate a secret key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Test Locally

1. Start your dev server:
```bash
npm run dev
```

2. Go to: http://localhost:3000/admin/rss-feeds

3. Click "Import from All Feeds" to test

## Step 4: Deploy to Netlify

1. Push to Git:
```bash
git add .
git commit -m "Add RSS aggregator"
git push
```

2. In Netlify Dashboard, add environment variables:
   - `NEXT_PUBLIC_SITE_URL` = your site URL
   - `RSS_IMPORT_API_KEY` = your secret key

3. Deploy will happen automatically

4. Check Netlify Dashboard → Functions to see `scheduled-import`

## Done!

The system will now:
- Import articles every 6 hours automatically
- Show source attribution on articles
- Allow manual imports from admin panel

Visit `/admin/rss-feeds` to manage feeds!
