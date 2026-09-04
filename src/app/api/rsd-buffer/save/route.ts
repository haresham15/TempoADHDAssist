import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

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
    const { originalMessage, translation, pattern, emotion, userReframe } = body;

    if (!originalMessage || typeof originalMessage !== "string" || !originalMessage.trim()) {
      return NextResponse.json({ error: "Original message is required." }, { status: 400 });
    }

    if (!translation || typeof translation !== "string" || !translation.trim()) {
      return NextResponse.json({ error: "Translation is required." }, { status: 400 });
    }

    const trimmedOriginal = originalMessage.trim();
    const trimmedTranslation = translation.trim();

    if (trimmedOriginal.length > 3000 || trimmedTranslation.length > 3000) {
      return NextResponse.json({ error: "Content exceeds maximum length." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const distortionsPayload: Record<string, string> = {
      emotion: emotion || "Reflected emotion",
      pattern: pattern || "Thinking pattern"
    };

    if (userReframe && typeof userReframe === "string" && userReframe.trim()) {
      distortionsPayload.user_reframe = userReframe.trim().slice(0, 1000);
    }

    const { error: dbError } = await supabase
      .from("rsd_logs")
      .insert([
        {
          original_message: trimmedOriginal,
          neutral_translation: trimmedTranslation,
          distortions: distortionsPayload,
          user_id: user?.id || null
        }
      ]);

    if (dbError) {
      console.error("Failed to save RSD log to Supabase:", dbError);
      return NextResponse.json(
        { error: "Could not save your session to the database." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Save endpoint error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving." },
      { status: 500 }
    );
  }
}
