// Netlify Scheduled Function - Runs every 6 hours automatically
// To change the schedule, edit the last line of this file

const { schedule } = require('@netlify/functions');

const handler = async (event) => {
  console.log('Starting scheduled RSS import...');
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/rss/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.RSS_IMPORT_API_KEY || 'your-secret-key'
      }
    });
    
    const result = await response.json();
    console.log('RSS Import completed:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'RSS import completed successfully',
        result
      })
    };
  } catch (error) {
    console.error('Error in scheduled import:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'RSS import failed',
        error: error.message
      })
    };
  }
};

// CHANGE SCHEDULE HERE:
// Every 6 hours: '0 */6 * * *'
// Every 3 hours: '0 */3 * * *'
// Every 12 hours: '0 */12 * * *'
// Once daily: '0 9 * * *'
module.exports.handler = schedule('0 */6 * * *', handler);
