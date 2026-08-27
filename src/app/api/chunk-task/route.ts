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
    const { task } = await req.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      console.error("Missing DEEPSEEK_API_KEY environment variable");
      // Fallback for development without API key
      return NextResponse.json({ 
        steps: [
          "Stand up from your current position.",
          "Identify one physical item related to this task.",
          "Move that item to its correct place."
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
        model: "deepseek-chat", // DeepSeek V4 Flash equivalent
        messages: [
          {
            role: "system",
            content: "You are an ADHD executive dysfunction assistant. The user will give you a broad, overwhelming task. Your job is to break it down into exactly 3 to 5 highly actionable, immediate physical micro-steps. Do not provide any conversational filler, greetings, or conclusions. Only return a JSON object with a 'steps' key containing an array of strings representing the steps. Make them very simple and physically actionable (e.g. 'Grab a trash bag')."
          },
          {
            role: "user",
            content: task
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API returned status ${response.status}`);
    }

    const data = await response.json();
    let steps = [];
    
    try {
      const content = data.choices[0].message.content;
      const parsed = parseJsonFromLLM(content);
      if (Array.isArray(parsed)) {
        steps = parsed;
      } else if (parsed.steps && Array.isArray(parsed.steps)) {
        steps = parsed.steps;
      } else {
        steps = Object.values(parsed).find(v => Array.isArray(v)) || [];
      }
      
      // Save to Supabase
      if (steps.length > 0) {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const { error: dbError } = await supabase
          .from("task_chunks")
          .insert([{ 
            original_task: task, 
            steps,
            user_id: session?.user?.id || null
          }]);
          
        if (dbError) {
          console.error("Failed to save to Supabase:", dbError);
        }
      }
    } catch (e) {
      console.error("Failed to parse LLM response as JSON:", e);
      steps = data.choices[0].message.content
        .split('\n')
        .map((line: string) => line.replace(/^[\d\-\.\*\s]+/, '').trim())
        .filter((line: string) => line.length > 0);
    }

    return NextResponse.json({ steps: steps.slice(0, 5) });

  } catch (error) {
    console.error("Error in chunk-task route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
