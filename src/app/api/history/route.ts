import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        rsdLogs: [],
        taskChunks: [],
        ventLogs: []
      });
    }

    const [rsdRes, taskRes, ventRes] = await Promise.all([
      supabase
        .from("rsd_logs")
        .select("id, created_at, original_message, neutral_translation, distortions")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("task_chunks")
        .select("id, created_at, original_task, steps")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vent_logs")
        .select("id, created_at, transcript, ai_reply")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      authenticated: true,
      rsdLogs: rsdRes.data || [],
      taskChunks: taskRes.data || [],
      ventLogs: ventRes.data || [],
    });
  } catch (err: unknown) {
    console.error("History API GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch session history." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, table } = body;

    if (!id || !table || !["rsd_logs", "task_chunks", "vent_logs"].includes(table)) {
      return NextResponse.json({ error: "Invalid request parameters." }, { status: 400 });
    }

    const { error: delError } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (delError) {
      console.error("History API DELETE error:", delError);
      return NextResponse.json({ error: "Failed to delete record." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("History API DELETE error:", err);
    return NextResponse.json({ error: "Unexpected error during deletion." }, { status: 500 });
  }
}
