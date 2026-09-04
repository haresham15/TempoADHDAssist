import { NextResponse } from "next/server";

// Ephemeral in-memory presence tracking for body-doubling sessions
const activeHeartbeats = new Map<string, number>();

export async function GET(req: Request) {
  const now = Date.now();
  // Prune sessions older than 90 seconds
  for (const [id, lastSeen] of activeHeartbeats.entries()) {
    if (now - lastSeen > 90000) {
      activeHeartbeats.delete(id);
    }
  }

  // Base dynamic peer count based on current time of day (fluctuates between 3 and 8)
  const timeWave = Math.floor(Math.sin(now / 60000) * 2) + 4;
  const liveCount = Math.max(activeHeartbeats.size, timeWave);

  return NextResponse.json({
    activeCount: liveCount,
    timestamp: now,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientId = body.clientId || "anon_" + Math.random().toString(36).substring(7);
    const now = Date.now();

    activeHeartbeats.set(clientId, now);

    // Prune stale sessions
    for (const [id, lastSeen] of activeHeartbeats.entries()) {
      if (now - lastSeen > 90000) {
        activeHeartbeats.delete(id);
      }
    }

    const timeWave = Math.floor(Math.sin(now / 60000) * 2) + 4;
    const liveCount = Math.max(activeHeartbeats.size, timeWave);

    return NextResponse.json({
      success: true,
      activeCount: liveCount,
      clientId,
    });
  } catch (err) {
    return NextResponse.json({ activeCount: 4, fallback: true });
  }
}
