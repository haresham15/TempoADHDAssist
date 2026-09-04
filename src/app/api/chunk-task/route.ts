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
      try {
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
          console.warn("Supabase task save error, returning offline success:", dbError.message || dbError);
          return NextResponse.json({ saved: true, offline: true });
        }

        return NextResponse.json({ saved: true });
      } catch (saveErr) {
        console.warn("Task save offline fallback:", saveErr);
        return NextResponse.json({ saved: true, offline: true });
      }
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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO;

    let steps: string[] = [];
    let energyLevel = "Low";

    // A. Primary: DeepSeek
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
              { role: "user", content: trimmedTask }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
            temperature: 0.3
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "{}";
          const parsed = parseJsonFromLLM(content);
          if (parsed.energyLevel) energyLevel = parsed.energyLevel;
          if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
            steps = parsed.steps;
          }
        } else {
          console.warn(`DeepSeek in chunk-task returned ${response.status}. Attempting Gemini fallback.`);
        }
      } catch (deepseekErr) {
        console.warn("DeepSeek chunk-task failed, falling back to Gemini:", deepseekErr);
      }
    }

    // B. Secondary Fallback: Gemini 3.5 Flash Lite
    if (steps.length === 0 && GEMINI_API_KEY) {
      try {
        const geminiPrompt = `You are an ADHD executive dysfunction specialist. The user is feeling paralyzed by this task: "${trimmedTask}".
Break it down into 3 to 5 micro-steps focused on low friction.
Rule 1: The first step MUST be a zero-friction gateway action (e.g. "Touch one item related to this", "Open the blank document").
Rule 2: Energy level must be "Very Low", "Low", or "Medium".

Respond ONLY in valid JSON matching this schema:
{
  "energyLevel": "Low",
  "steps": ["Gateway Step", "Step 2", "Step 3"]
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
                maxOutputTokens: 350
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const textCandidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textCandidate) {
            const parsed = parseJsonFromLLM(textCandidate);
            if (parsed.energyLevel) energyLevel = parsed.energyLevel;
            if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
              steps = parsed.steps;
            }
          }
        } else {
          console.warn("Gemini chunk-task returned status:", geminiRes.status);
        }
      } catch (geminiErr) {
        console.warn("Gemini chunk-task fallback failed:", geminiErr);
      }
    }

    // C. Heuristic Fallback (Zero-friction guarantee)
    if (steps.length === 0) {
      energyLevel = "Low";
      steps = [
        `Take one slow breath and physically touch one object related to: ${trimmedTask.slice(0, 40)}.`,
        "Clear a 12-inch space directly in front of you.",
        "Spend just 2 minutes on the easiest initial action, with zero expectation to finish.",
        "Pause and acknowledge the momentum you just created."
      ];
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
