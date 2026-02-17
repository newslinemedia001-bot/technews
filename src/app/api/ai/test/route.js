import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Test Gemini API connection
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use gemini-1.5-pro (better quality)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = 'Say "Hello! Gemini AI is working correctly." in a friendly way.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: 'Gemini AI is configured correctly!',
      response: text,
      modelUsed: 'gemini-1.5-flash',
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      apiKeyLength: process.env.GEMINI_API_KEY?.length
    }, { status: 200 });
  }
}
