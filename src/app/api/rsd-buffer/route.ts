import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJsonFromLLM } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rateLimit";

export const maxDuration = 60; // Allow up to 60s for Vercel Serverless Function

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      console.error("Missing DEEPSEEK_API_KEY environment variable");
      // Fallback for development without API key
      return NextResponse.json({ 
        neutralTranslation: "This is a placeholder translation since no API key was provided. I hear what you are saying and I will respond when I have time.",
        distortions: [
          { name: "Mind Reading", explanation: "Assuming you know what the other person is thinking." },
          { name: "Catastrophizing", explanation: "Expecting the worst possible outcome." }
        ]
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
            content: `You are an empathetic mediator. The user is experiencing Rejection Sensitive Dysphoria (RSD).
Respond in JSON format with exactly two keys:
1. "emotion": A warm, validating, one-line reflection of the emotion the user is feeling based on the message. Do not use clinical terms like "cognitive distortion". (e.g., "It makes complete sense that you feel hurt and overlooked by this.")
2. "translation": A calmer, more objective version of the message they can send, or a neutral interpretation of what was said to them. Keep it clear, polite, and boundaries-focused.`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API returned status ${response.status}`);
    }

    const data = await response.json();
    const result = {
      emotion: "",
      translation: ""
    };
    
    try {
      const content = data.choices[0].message.content;
      const rsdData = parseJsonFromLLM(content);
      result.emotion = rsdData.emotion || "It makes sense that this feels overwhelming right now.";
      result.translation = rsdData.translation || "Could you please clarify what you meant?";
      
      // Save to Supabase
      if (result.translation) {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const { error: dbError } = await supabase
          .from("rsd_logs")
          .insert([{ 
            original_message: message, 
            neutral_translation: result.translation, 
            distortions: { emotion: result.emotion },
            user_id: session?.user?.id || null
          }]);
          
        if (dbError) {
          console.error("Failed to save to Supabase:", dbError);
        }
      }
    } catch (e) {
      console.error("Failed to parse LLM response as JSON:", e);
      result.translation = "An error occurred while parsing the response. Please try again.";
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in rsd-buffer route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
