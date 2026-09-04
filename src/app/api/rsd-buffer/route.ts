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

    // 3. Model call (DeepSeek, JSON mode)
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      console.warn("Missing DEEPSEEK_API_KEY environment variable. Using fallback response.");
      return NextResponse.json({
        isCrisis: false,
        emotion: "It makes complete sense that this feels sharp and unsettling right now.",
        pattern: "Your brain jumped to the worst-case version",
        translation: "Could you please clarify what you meant? I want to make sure we're on the same page."
      });
    }

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
2. "pattern": A concise (under 10 words), plain-language name for the thinking pattern at work. This teaches pattern recognition without clinical terms. (e.g., "Your brain jumped to the worst-case version", "Filling in silence with perceived anger", "Treating brevity as rejection")
3. "translation": A calmer, clearer, editable rewording of the message that communicates effectively while maintaining calm boundaries.`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 450,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      throw new Error(`Model API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const rsdData = parseJsonFromLLM(content);

    const emotion = rsdData.emotion?.trim() || "It makes complete sense that this feels overwhelming right now.";
    const pattern = rsdData.pattern?.trim() || "Your brain jumped to the worst-case version";
    const translation = rsdData.translation?.trim() || "Could you clarify what you meant? I want to ensure I understood.";

    // 4. Return, do not persist. Ephemeral by default.
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
