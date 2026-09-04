import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { parseJsonFromLLM } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { checkSafety } from "@/lib/safety";

export const maxDuration = 60; // Allow up to 60s for Vercel Serverless Function

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { audio, mimeType, save, transcript: explicitTranscript, reply: explicitReply } = await req.json();

    // Dedicated save action if requested
    if (save && explicitTranscript) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: dbError } = await supabase
        .from("vent_logs")
        .insert([{ 
          transcript: explicitTranscript, 
          ai_reply: explicitReply || "Reflected session",
          user_id: user?.id || null
        }]);
        
      if (dbError) {
        console.error("Failed to save to Supabase:", dbError);
        return NextResponse.json({ error: "Could not save reflection." }, { status: 500 });
      }

      return NextResponse.json({ saved: true });
    }

    if (!audio || !mimeType) {
      return NextResponse.json({ error: "Audio data is required" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO;

    if (!GEMINI_API_KEY) {
      console.warn("Missing GEMINI_API_KEY_TEMPO environment variable. Using fallback.");
      return NextResponse.json({ 
        isCrisis: false,
        reply: "I hear you. It is completely understandable to feel overwhelmed right now. Take a gentle breath; you are doing your best.",
        transcript: "I am feeling overwhelmed and needed a moment to vent."
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an empathetic, reflective listening assistant for someone experiencing ADHD emotional burnout. 
Listen to their audio input and provide two things in a strictly formatted JSON object:
1. "transcript": A highly accurate transcript of what they said in the audio.
2. "reply": A short, validating, empathetic response (max 2 sentences) to their transcript. Do NOT give unsolicited advice, diagnoses, or clinical therapy instructions. Focus only on validating their feeling with warmth and space.

Output MUST be valid JSON matching this schema:
{
  "transcript": "string",
  "reply": "string"
}`;

    const audioPart = {
      inlineData: {
        data: audio,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, audioPart]);
    const responseText = result.response.text();
    const parsed = parseJsonFromLLM(responseText);
    
    const finalTranscript = parsed.transcript || "";
    const finalReply = parsed.reply || "I hear you. It is okay to feel this way.";

    // DETERMINISTIC SAFETY CHECK on spoken transcript
    const safety = checkSafety(finalTranscript);
    if (safety.isCrisis) {
      return NextResponse.json({
        isCrisis: true,
        transcript: finalTranscript
      });
    }

    // Ephemeral by default — do not auto-save to DB
    return NextResponse.json({ 
      isCrisis: false,
      reply: finalReply,
      transcript: finalTranscript
    });

  } catch (error) {
    console.error("Error in vent route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
