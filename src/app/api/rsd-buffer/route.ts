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

    // 3. Safe-State RAG Memory Fabric Context
    const relationshipContext = body?.relationshipContext;
    let memoryContextPrompt = "";
    let defaultAnchor = "";

    if (relationshipContext && typeof relationshipContext === "string" && relationshipContext !== "General") {
      const relationshipDefaults: Record<string, string> = {
        "Boss / Colleague": "In workplace communications, brevity almost always reflects rushing between meetings, not criticism or dissatisfaction with your work.",
        "Partner": "In close relationships, distracted or terse replies are usually signs of fatigue or external stress, not a withdrawal of affection.",
        "Friend": "Friends often go quiet or send short replies when overwhelmed by their own obligations, not because they are pulling away from you.",
        "Family": "Family members often communicate in blunt shorthand habits without polish, without intending harm or rejection."
      };
      defaultAnchor = relationshipDefaults[relationshipContext] || "Remember that brevity or delayed replies are usually about the other person's bandwidth, not their feelings toward you.";
      memoryContextPrompt = `\nRELATIONSHIP CONTEXT MEMORY:
The communication is with someone in the category: "${relationshipContext}".
Grounded historical truth: "${defaultAnchor}"
Include a 1-sentence "relationshipAnchor" in your JSON output grounded in this objective context to dismantle worst-case assumptions.`;
    }

    // 4. Model call with high-availability fallback
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO;

    let emotion = "";
    let pattern = "";
    let translation = "";
    let relationshipAnchor: string | null = null;

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
                content: `You are an empathetic communication coach. The user is experiencing Rejection Sensitive Dysphoria (RSD) after reading or drafting a high-emotion message.${memoryContextPrompt}
Respond in JSON format with:
1. "emotion": A warm, validating, one-line reflection of the feeling the user is experiencing. Do not use clinical, diagnostic, or therapeutic jargon.
2. "pattern": A concise (under 10 words), plain-language name for the thinking pattern at work. (e.g., "Your brain jumped to the worst-case version")
3. "translation": A calmer, clearer, editable rewording of the message that communicates effectively while maintaining calm boundaries.
4. "relationshipAnchor": A 1-sentence objective grounding reminder based on the relationship history to dismantle catastrophic fear (or null if no relationship context was given).`
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
          if (rsdData.relationshipAnchor) relationshipAnchor = rsdData.relationshipAnchor.trim();
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
        const geminiPrompt = `You are an empathetic communication coach for someone experiencing ADHD Rejection Sensitive Dysphoria.${memoryContextPrompt}
Analyze this message: "${message}"

Output ONLY a JSON object with this exact schema:
{
  "emotion": "A warm, validating, one-line reflection of what they might be feeling without clinical jargon",
  "pattern": "A concise under-10-word name for the thinking pattern at work (e.g. Your brain jumped to the worst-case version)",
  "translation": "A calmer, clearer rewording that preserves calm boundaries",
  "relationshipAnchor": "A 1-sentence objective grounding reminder based on relationship history, or null"
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
            if (parsed.relationshipAnchor) relationshipAnchor = parsed.relationshipAnchor.trim();
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
    if (!relationshipAnchor && defaultAnchor) {
      relationshipAnchor = defaultAnchor;
    }

    return NextResponse.json({
      isCrisis: false,
      emotion,
      pattern,
      translation,
      relationshipAnchor: relationshipAnchor || null
    });

  } catch (err: unknown) {
    console.error("RSD Buffer error:", err);
    return NextResponse.json(
      { error: "We encountered a hiccup processing that. Please try again." },
      { status: 500 }
    );
  }
}
