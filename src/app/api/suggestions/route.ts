import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const VALID_CATEGORIES = ["feature", "usability", "bug", "other"];

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
    const { category, content, contactEmail } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Please write a suggestion or feedback message." },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 5) {
      return NextResponse.json(
        { error: "Please provide a bit more detail (at least 5 characters)." },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 3000) {
      return NextResponse.json(
        { error: "Suggestion exceeds maximum length of 3,000 characters." },
        { status: 400 }
      );
    }

    const cleanCategory = typeof category === "string" && VALID_CATEGORIES.includes(category.toLowerCase())
      ? category.toLowerCase()
      : "feature";

    const cleanEmail = typeof contactEmail === "string" && contactEmail.trim().length > 0
      ? contactEmail.trim().slice(0, 255)
      : null;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase
      .from("suggestions")
      .insert([
        {
          category: cleanCategory,
          content: trimmedContent,
          contact_email: cleanEmail,
          user_id: user?.id || null,
        }
      ]);

    if (dbError) {
      console.warn("Supabase suggestions write warning:", dbError.message || dbError);
      return NextResponse.json({ success: true, offline: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.warn("Suggestions endpoint fallback:", err);
    return NextResponse.json({ success: true, offline: true });
  }
}
