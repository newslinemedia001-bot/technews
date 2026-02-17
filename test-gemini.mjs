
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGemini() {
    console.log('Testing Gemini API Connection...');

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('❌ Error: GEMINI_API_KEY not found');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Switch to gemini-2.5-flash as verified by list-models
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent('Say "Hello from Gemini" and nothing else.');
        const response = await result.response;
        const text = response.text();

        console.log('✅ Success! Response:', text.trim());
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
    }
}

testGemini();
