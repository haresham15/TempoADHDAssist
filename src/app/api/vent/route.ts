import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow up to 60s for Vercel Serverless Function

export async function POST(req: Request) {
  try {
    const { audio, mimeType } = await req.json();

    if (!audio || !mimeType) {
      return NextResponse.json({ error: "Audio data is required" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO;

    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY_TEMPO environment variable");
      return NextResponse.json({ 
        reply: "I hear you. That sounds really exhausting. It's completely understandable that you feel this way right now. Please take a deep breath; you are doing your best."
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an empathetic CBT journal assistant for someone with ADHD experiencing burnout or frustration. 
Listen to their audio input and provide a short, highly empathetic, validating response (max 2-3 sentences). 
Do NOT provide actionable advice or solutions unless explicitly asked. Focus only on validation, naming the emotion, and offering a safe emotional space. Write it as spoken dialogue since it will be converted to Text-to-Speech.`;

    const audioPart = {
      inlineData: {
        data: audio,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, audioPart]);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText.trim() });

  } catch (error) {
    console.error("Error in vent route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
