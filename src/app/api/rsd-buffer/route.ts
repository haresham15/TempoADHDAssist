import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60s for Vercel Serverless Function

export async function POST(req: Request) {
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
            content: `You are an empathetic CBT/DBT assistant designed to help someone with ADHD and Rejection Sensitive Dysphoria (RSD) process emotionally charged communication. 
            The user will provide a message (either one they received or one they drafted). 
            Your job is twofold:
            1. Provide an "emotionally neutral translation" of the message. If it's a drafted response, make it assertive but calm. If it's a received message, extract the pure factual intent without the perceived hostility.
            2. Identify 1 to 3 cognitive distortions (e.g., Catastrophizing, Black-and-White Thinking, Mind Reading, Personalization) present in the emotional context.
            
            Return ONLY a valid JSON object with two keys:
            - "neutralTranslation": A string containing the calm, factual translation.
            - "distortions": An array of objects, each with a "name" (string) and an "explanation" (string explaining briefly why it was flagged).`
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
    let result = {
      neutralTranslation: "",
      distortions: []
    };
    
    try {
      const content = data.choices[0].message.content;
      result = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse LLM response as JSON:", e);
      result.neutralTranslation = "An error occurred while parsing the response. Please try again.";
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
