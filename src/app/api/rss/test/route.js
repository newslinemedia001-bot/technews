import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Can we fetch an RSS feed?
    const response = await fetch('https://techcrunch.com/feed/');
    const text = await response.text();
    
    return NextResponse.json({
      success: true,
      message: 'RSS fetch works',
      feedLength: text.length,
      preview: text.substring(0, 200)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
