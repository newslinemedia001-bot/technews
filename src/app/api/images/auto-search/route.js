import { NextResponse } from 'next/server';
import { processArticlesWithoutImages } from '@/lib/image-search';

export async function POST(request) {
  try {
    // API key authentication
    const apiKeyHeader = request.headers.get('x-api-key');
    const expectedKey = process.env.RSS_IMPORT_API_KEY || 'your-secret-key';
    
    if (apiKeyHeader !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    console.log('Starting auto image search for articles...');
    
    const result = await processArticlesWithoutImages();
    
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} articles out of ${result.total} without images`,
      processed: result.processed,
      total: result.total
    });
  } catch (error) {
    console.error('Error in auto image search API:', error);
    return NextResponse.json(
      { error: 'Failed to process images', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await processArticlesWithoutImages();
    
    return NextResponse.json({
      success: true,
      message: 'Auto image search completed',
      ...result
    });
  } catch (error) {
    console.error('Error in manual image search:', error);
    return NextResponse.json(
      { error: 'Failed to process images', details: error.message },
      { status: 500 }
    );
  }
}