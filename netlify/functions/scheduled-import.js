// Netlify Scheduled Function - Runs every 6 hours automatically
// To change the schedule, edit the last line of this file

const { schedule } = require('@netlify/functions');

const handler = async (event) => {
  console.log('Starting scheduled content import (RSS + AI)...');
  
  try {
    // Step 1: Import RSS feeds
    console.log('Step 1: Importing RSS feeds...');
    const rssResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/rss/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.RSS_IMPORT_API_KEY || 'your-secret-key'
      }
    });
    
    const rssResult = await rssResponse.json();
    console.log('RSS Import completed:', rssResult);
    
    // Step 2: Generate AI content
    console.log('Step 2: Generating AI content...');
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.RSS_IMPORT_API_KEY || 'your-secret-key'
      }
    });
    
    const aiResult = await aiResponse.json();
    console.log('AI Generation completed:', aiResult);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Content import completed successfully',
        rss: rssResult,
        ai: aiResult
      })
    };
  } catch (error) {
    console.error('Error in scheduled import:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Content import failed',
        error: error.message
      })
    };
  }
};

// CHANGE SCHEDULE HERE:
// Every 3 hours: '0 */3 * * *'
// Every 6 hours: '0 */6 * * *'
// Every 12 hours: '0 */12 * * *'
// Once daily: '0 9 * * *'
module.exports.handler = schedule('0 */3 * * *', handler);
