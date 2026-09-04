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
    const { originalMessage, translation, pattern, emotion, userReframe, relationshipCategory } = body;

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

    const allowedCategories = ["general", "boss_colleague", "partner", "friend", "family"];
    const category = typeof relationshipCategory === "string" && allowedCategories.includes(relationshipCategory.toLowerCase())
      ? relationshipCategory.toLowerCase()
      : "general";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const distortionsPayload: Record<string, string> = {
      emotion: emotion || "Reflected emotion",
      pattern: pattern || "Thinking pattern",
      relationship_category: category
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
          relationship_category: category,
          distortions: distortionsPayload,
          user_id: user?.id || null
        }
      ]);

    if (dbError) {
      console.warn("Supabase unreachable or unconfigured:", dbError.message || dbError);
      return NextResponse.json({ success: true, offline: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.warn("Save endpoint offline fallback:", err);
    return NextResponse.json({ success: true, offline: true });
  }
}
