import { NextResponse } from 'next/server';
import { generateFromAllSources } from '@/lib/ai-content';

export async function POST(request) {
  try {
    // API key authentication
    const apiKeyHeader = request.headers.get('x-api-key');
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.RSS_IMPORT_API_KEY || 'your-secret-key';
    
    let apiKey = apiKeyHeader;
    
    if (!apiKey && authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    }
    
    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    console.log('Starting AI content generation...');
    
    // Generate 2 articles per source
    const result = await generateFromAllSources(2);
    
    const summary = {
      totalSources: result.totalSources,
      successfulSources: result.successfulSources,
      totalGenerated: result.totalGenerated,
      totalDuplicates: result.totalDuplicates,
      details: result.results
    };
    
    console.log('AI content generation completed:', summary);
    
    return NextResponse.json({
      success: true,
      message: `Generated ${result.totalGenerated} AI articles from ${result.successfulSources} sources`,
      ...summary
    });
  } catch (error) {
    console.error('Error in AI generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI content', details: error.message },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint (GET)
export async function GET(request) {
  try {
    const result = await generateFromAllSources(2);
    
    return NextResponse.json({
      success: true,
      message: 'AI content generation completed',
      ...result
    });
  } catch (error) {
    console.error('Error in manual AI generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI content', details: error.message },
      { status: 500 }
    );
  }
}
