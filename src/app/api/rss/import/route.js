import { NextResponse } from 'next/server';
import { importFromAllFeeds } from '@/lib/rss';

export async function POST(request) {
  try {
    // API key authentication - support both x-api-key and Authorization Bearer
    const apiKeyHeader = request.headers.get('x-api-key');
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.RSS_IMPORT_API_KEY || 'your-secret-key';
    
    let apiKey = apiKeyHeader;
    
    // Check Authorization Bearer format
    if (!apiKey && authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    }
    
    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Check if specific category is requested
    const body = await request.json().catch(() => ({}));
    const requestedCategory = body.category;

    if (requestedCategory) {
      // Manual mode: Import from specific category
      console.log(`Starting manual RSS import for category: ${requestedCategory}`);
      
      const { importFromCategoryFeeds } = await import('@/lib/rss');
      const result = await importFromCategoryFeeds(requestedCategory);
      
      const summary = {
        mode: 'manual',
        category: requestedCategory,
        totalFeeds: result.results.length,
        successfulFeeds: result.results.filter(r => r.success).length,
        totalImported: result.results.reduce((sum, r) => sum + (r.imported || 0), 0),
        totalDuplicates: result.results.reduce((sum, r) => sum + (r.duplicates || 0), 0),
        details: result.results
      };
      
      console.log('Manual RSS import completed:', summary);
      
      return NextResponse.json({
        success: true,
        message: `Manually imported from ${requestedCategory} category`,
        ...summary
      });
    } else {
      // Automatic mode: Sequential category rotation
      console.log('Starting automatic RSS import with category rotation...');
      
      const result = await importFromAllFeeds();
      
      const summary = {
        mode: 'automatic',
        category: result.category,
        nextCategory: result.nextCategory,
        totalFeeds: result.results.length,
        successfulFeeds: result.results.filter(r => r.success).length,
        totalImported: result.results.reduce((sum, r) => sum + (r.imported || 0), 0),
        totalDuplicates: result.results.reduce((sum, r) => sum + (r.duplicates || 0), 0),
        details: result.results
      };
      
      console.log('Automatic RSS import completed:', summary);
      
      return NextResponse.json({
        success: true,
        message: `Imported from ${result.category} category. Next: ${result.nextCategory}`,
        ...summary
      });
    }
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
