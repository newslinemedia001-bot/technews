import { NextResponse } from 'next/server';
import { importFromAllFeeds } from '@/lib/rss';

export async function POST(request) {
  try {
    // Optional: Add API key authentication
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.RSS_IMPORT_API_KEY || 'your-secret-key';
    
    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting RSS import with category rotation...');
    
    const result = await importFromAllFeeds();
    
    const summary = {
      category: result.category,
      nextCategory: result.nextCategory,
      totalFeeds: result.results.length,
      successfulFeeds: result.results.filter(r => r.success).length,
      totalImported: result.results.reduce((sum, r) => sum + (r.imported || 0), 0),
      totalDuplicates: result.results.reduce((sum, r) => sum + (r.duplicates || 0), 0),
      details: result.results
    };
    
    console.log('RSS import completed:', summary);
    
    return NextResponse.json({
      success: true,
      message: `Imported from ${result.category} category. Next: ${result.nextCategory}`,
      ...summary
    });
  } catch (error) {
    console.error('Error in RSS import API:', error);
    return NextResponse.json(
      { error: 'Failed to import RSS feeds', details: error.message },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint (GET)
export async function GET(request) {
  try {
    // Check if admin (you can add proper auth here)
    const results = await importFromAllFeeds();
    
    return NextResponse.json({
      success: true,
      message: 'Manual RSS import completed',
      results
    });
  } catch (error) {
    console.error('Error in manual RSS import:', error);
    return NextResponse.json(
      { error: 'Failed to import RSS feeds', details: error.message },
      { status: 500 }
    );
  }
}
