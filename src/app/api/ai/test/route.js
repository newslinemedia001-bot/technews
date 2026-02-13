import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Test Gemini API connection
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = 'Say "Hello! Gemini AI is working correctly." in a friendly way.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({
      success: true,
      message: 'Gemini AI is configured correctly!',
      response: text,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
}
