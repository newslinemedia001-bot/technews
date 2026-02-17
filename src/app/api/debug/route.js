import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    geminiKeyExists: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'none',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API'))
  });
}
