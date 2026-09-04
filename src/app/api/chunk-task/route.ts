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
    const { task, save, steps: explicitSteps } = await req.json();

    // Opt-in save action
    if (save && task && Array.isArray(explicitSteps)) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: dbError } = await supabase
        .from("task_chunks")
        .insert([{ 
          original_task: task.trim(), 
          steps: explicitSteps,
          user_id: user?.id || null
        }]);
        
      if (dbError) {
        console.error("Failed to save to Supabase:", dbError);
        return NextResponse.json({ error: "Could not save task breakdown." }, { status: 500 });
      }

      return NextResponse.json({ saved: true });
    }

    if (!task || typeof task !== "string" || !task.trim()) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const trimmedTask = task.trim();

    // Deterministic Safety Check
    const safety = checkSafety(trimmedTask);
    if (safety.isCrisis) {
      return NextResponse.json({ isCrisis: true });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        isCrisis: false,
        energyLevel: "Low",
        steps: [
          "Take a deep breath and touch one item related to this task.",
          "Clear a 12-inch space directly in front of you.",
          "Spend just 3 minutes on the easiest initial action.",
          "Step back and acknowledge the momentum."
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
            content: `You are an ADHD executive dysfunction specialist. The user is feeling paralyzed by a broad, daunting task.
Your goal is to break it down into 3 to 5 micro-steps focused on friction reduction.
Rule 1: The very first step MUST be a zero-friction gateway action (e.g. "Pick up one piece of paper", "Open the laptop lid and don't type yet").
Rule 2: Estimate the physical/emotional energy level needed for this breakdown: "Very Low", "Low", or "Medium".
Respond ONLY with a JSON object with this schema:
{
  "energyLevel": "Low",
  "steps": ["Step 1", "Step 2", "Step 3"]
}`
          },
          {
            role: "user",
            content: trimmedTask
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API returned status ${response.status}`);
    }

    const data = await response.json();
    let steps: string[] = [];
    let energyLevel = "Low";
    
    try {
      const content = data.choices[0].message.content;
      const parsed = parseJsonFromLLM(content);
      if (parsed.energyLevel) energyLevel = parsed.energyLevel;
      if (Array.isArray(parsed.steps)) {
        steps = parsed.steps;
      } else if (Array.isArray(parsed)) {
        steps = parsed;
      }
    } catch (e) {
      console.error("Failed to parse LLM response as JSON:", e);
      steps = data.choices[0].message.content
        .split('\n')
        .map((line: string) => line.replace(/^[\d\-\.\*\s]+/, '').trim())
        .filter((line: string) => line.length > 0);
    }

    // Ephemeral by default — do not auto-save to DB
    return NextResponse.json({ 
      isCrisis: false,
      energyLevel,
      steps: steps.slice(0, 5) 
    });

  } catch (error) {
    console.error("Error in chunk-task route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
