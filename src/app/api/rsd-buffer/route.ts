import { NextResponse } from "next/server";
import { parseJsonFromLLM } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { checkSafety } from "@/lib/safety";

export const maxDuration = 60; // Allow up to 60s for Vercel Serverless Function

const MAX_INPUT_LENGTH = 3000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please take a moment and try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawMessage = body?.message;

    // 1. Validation: check presence and length
    if (!rawMessage || typeof rawMessage !== "string" || !rawMessage.trim()) {
      return NextResponse.json(
        { error: "Please enter a message to review." },
        { status: 400 }
      );
    }

    const message = rawMessage.trim();
    if (message.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds the ${MAX_INPUT_LENGTH.toLocaleString()} character limit.` },
        { status: 400 }
      );
    }

    // 2. Deterministic Safety Check (non-AI, zero model calls, zero database writes)
    const safety = checkSafety(message);
    if (safety.isCrisis) {
      return NextResponse.json({
        isCrisis: true
      });
    }

    // 3. Model call with high-availability fallback
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO;

    let emotion = "";
    let pattern = "";
    let translation = "";

    // A. Primary: Try DeepSeek
    if (DEEPSEEK_API_KEY) {
      try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `You are an empathetic communication coach. The user is experiencing Rejection Sensitive Dysphoria (RSD) after reading or drafting a high-emotion message.
Respond in JSON format with exactly three keys:
1. "emotion": A warm, validating, one-line reflection of the feeling the user is experiencing. Do not use clinical, diagnostic, or therapeutic jargon. (e.g., "It makes complete sense that you feel hurt and dismissed by that brief reply.")
2. "pattern": A concise (under 10 words), plain-language name for the thinking pattern at work. (e.g., "Your brain jumped to the worst-case version", "Filling in silence with perceived anger", "Treating brevity as rejection")
3. "translation": A calmer, clearer, editable rewording of the message that communicates effectively while maintaining calm boundaries.`
              },
              { role: "user", content: message }
            ],
            response_format: { type: "json_object" },
            max_tokens: 450,
            temperature: 0.3
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "{}";
          const rsdData = parseJsonFromLLM(content);
          if (rsdData.emotion) emotion = rsdData.emotion.trim();
          if (rsdData.pattern) pattern = rsdData.pattern.trim();
          if (rsdData.translation) translation = rsdData.translation.trim();
        } else {
          console.warn(`DeepSeek returned ${response.status}. Attempting Gemini fallback.`);
        }
      } catch (deepseekErr) {
        console.warn("DeepSeek request failed, falling back to Gemini:", deepseekErr);
      }
    }

    // B. Secondary Fallback: Gemini 3.5 Flash Lite
    if ((!emotion || !translation) && GEMINI_API_KEY) {
      try {
        const geminiPrompt = `You are an empathetic communication coach for someone experiencing ADHD Rejection Sensitive Dysphoria.
Analyze this message: "${message}"

Output ONLY a JSON object with this exact schema:
{
  "emotion": "A warm, validating, one-line reflection of what they might be feeling without clinical jargon",
  "pattern": "A concise under-10-word name for the thinking pattern at work (e.g. Your brain jumped to the worst-case version)",
  "translation": "A calmer, clearer rewording that preserves calm boundaries"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 450
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const textCandidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textCandidate) {
            const parsed = parseJsonFromLLM(textCandidate);
            if (parsed.emotion) emotion = parsed.emotion.trim();
            if (parsed.pattern) pattern = parsed.pattern.trim();
            if (parsed.translation) translation = parsed.translation.trim();
          }
        } else {
          console.warn("Gemini fallback returned non-200:", geminiRes.status);
        }
      } catch (geminiErr) {
        console.warn("Gemini fallback failed:", geminiErr);
      }
    }

    // C. Graceful Heuristic Fallback (Zero-crash guarantee for users in distress)
    if (!emotion) {
      emotion = "It makes complete sense that this feels sharp, unsettling, and difficult to process right now.";
    }
    if (!pattern) {
      pattern = "Your brain jumped to the worst-case version";
    }
    if (!translation) {
      translation = "I received your note and want to make sure I understand where you're coming from. Could we touch base briefly when you have a moment?";
    }

    return NextResponse.json({
      isCrisis: false,
      emotion,
      pattern,
      translation
    });

  } catch (err: unknown) {
    console.error("RSD Buffer error:", err);
    return NextResponse.json(
      { error: "We encountered a hiccup processing that. Please try again." },
      { status: 500 }
    );
  }
}
