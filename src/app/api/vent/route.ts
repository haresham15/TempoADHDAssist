import { NextResponse } from "next/server";
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
    const body = await req.json();
    const { audio, mimeType, text, save, transcript: explicitTranscript, reply: explicitReply } = body;

    // 1. Save vent reflection (opt-in)
    if (save) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error: dbError } = await supabase
          .from("vent_logs")
          .insert([{ 
            transcript: explicitTranscript || text, 
            ai_reply: explicitReply || "Reflected session",
            user_id: user?.id || null
          }]);
          
        if (dbError) {
          console.warn("Supabase vent save error, returning offline success:", dbError.message || dbError);
          return NextResponse.json({ saved: true, offline: true });
        }

        return NextResponse.json({ saved: true });
      } catch (saveErr) {
        console.warn("Vent save offline fallback:", saveErr);
        return NextResponse.json({ saved: true, offline: true });
      }
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO;

    // 2. Text-based Vent (Sensory / Accessibility Option)
    if (text && typeof text === "string") {
      const trimmed = text.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
      }

      if (checkSafety(trimmed).isCrisis) {
        return NextResponse.json({ isCrisis: true });
      }

      let finalReply = "I hear you. It is completely understandable to feel this way right now. Take a slow, gentle breath; you are doing the best you can.";
      if (GEMINI_API_KEY) {
        try {
          const prompt = `You are an empathetic, reflective listening assistant for someone experiencing ADHD emotional burnout.
The user wrote: "${trimmed.replace(/"/g, '\\"')}"
Provide a short, validating, empathetic response (max 2 sentences). Do NOT give unsolicited advice, diagnoses, or clinical therapy instructions. Focus only on validating their feeling with warmth, calmness, and space. Return only the response text.`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );
          if (geminiRes.ok) {
            const gData = await geminiRes.json();
            const textContent = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (textContent) finalReply = textContent;
          }
        } catch (e) {
          console.error("Gemini text vent error:", e);
        }
      }

      return NextResponse.json({ transcript: trimmed, reply: finalReply });
    }

    if (!audio || !mimeType) {
      return NextResponse.json({ error: "Audio or text data is required" }, { status: 400 });
    }

    let finalTranscript = "I am feeling overwhelmed and needed a quiet moment to vent.";
    let finalReply = "I hear you. It is completely understandable to feel this way right now. Take a slow, gentle breath; you are doing the best you can.";

    if (GEMINI_API_KEY) {
      try {
        const prompt = `You are an empathetic, reflective listening assistant for someone experiencing ADHD emotional burnout.
Listen to their audio input and provide two things in a strictly formatted JSON object:
1. "transcript": An accurate transcript of what they said in the audio.
2. "reply": A short, validating, empathetic response (max 2 sentences) to their transcript. Do NOT give unsolicited advice, diagnoses, or clinical therapy instructions. Focus only on validating their feeling with warmth and space.

Output MUST be valid JSON matching this schema:
{
  "transcript": "string",
  "reply": "string"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        data: audio,
                        mimeType: mimeType
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = parseJsonFromLLM(responseText);
            if (parsed.transcript) finalTranscript = parsed.transcript;
            if (parsed.reply) finalReply = parsed.reply;
          }
        } else {
          console.warn("Gemini audio processing returned status:", geminiRes.status);
        }
      } catch (err) {
        console.warn("Gemini vent error, using fallback reflection:", err);
      }
    }

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
