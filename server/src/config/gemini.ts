import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('CRITICAL: GEMINI_API_KEY is not defined in environment variables.');
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Uses Gemini 3.8 Flash for ultra-fast, high-accuracy multimodal diagnostic synthesis
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
