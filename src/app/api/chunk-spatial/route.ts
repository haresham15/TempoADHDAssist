import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { parseJsonFromLLM } from "@/lib/utils";

export const maxDuration = 60; // Max duration for serverless processing

export interface SpatialItem {
  id: number;
  title: string;
  category: string;
  estTime: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] (0 to 1000 scale)
}

export interface SpatialChunkResponse {
  spaceDescription: string;
  items: SpatialItem[];
  gatewayId: number;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { image, mimeType = "image/jpeg" } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "An image is required for spatial task chunking." }, { status: 400 });
    }

    // Clean base64 string if data URL scheme is present
    const cleanBase64 = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEMPO || process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      // Graceful fallback for local development without API keys
      return NextResponse.json(getFallbackSpatialChunk());
    }

    const systemPrompt = `You are an expert ADHD executive function and spatial cleanup coach.
Analyze this photo of a cluttered or overwhelming room, desk, counter, or physical space.
Your job is to visually break down the mess into 3 to 5 discrete physical micro-actions so the user doesn't have to formulate words or feel overwhelmed.

Identify 3 to 5 individual clutter items or small localized cleanup targets.
For each item, specify:
1. "id": number (1 to N)
2. "title": short, actionable, ultra-low-friction micro-task (e.g., "Pick up the coffee mug", "Collect the stray papers into one pile", "Toss the empty wrapper")
3. "category": string ("Trash", "Dishes", "Surface Clear", "Cables", "Organize")
4. "estTime": estimated time ("~30 sec", "~1 min")
5. "box_2d": [ymin, xmin, ymax, xmax] - normalized bounding box coordinates on a 0 to 1000 integer scale pinpointing the exact item in the photo.

CRITICAL RULES:
- The first item (id: 1) MUST be the absolute lowest-effort gateway item in the photo (e.g., single water bottle, single wrapper, single mug).
- Return strictly JSON in this exact structure with no surrounding markdown text:
{
  "spaceDescription": "A busy desk area with a few scattered items needing attention",
  "items": [
    {
      "id": 1,
      "title": "Pick up the stray mug",
      "category": "Dishes",
      "estTime": "~30 sec",
      "box_2d": [250, 410, 480, 560]
    }
  ]
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      console.warn("Gemini Vision returned status:", geminiRes.status);
      return NextResponse.json(getFallbackSpatialChunk());
    }

    const data = await geminiRes.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return NextResponse.json(getFallbackSpatialChunk());
    }

    const parsed = parseJsonFromLLM<{ spaceDescription: string; items: SpatialItem[] }>(rawContent);

    if (!parsed || !parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return NextResponse.json(getFallbackSpatialChunk());
    }

    return NextResponse.json({
      spaceDescription: parsed.spaceDescription || "Your space, broken down into small physical steps.",
      items: parsed.items,
      gatewayId: parsed.items[0]?.id || 1,
    });
  } catch (error) {
    console.error("Spatial task chunking error:", error);
    return NextResponse.json(getFallbackSpatialChunk());
  }
}

function getFallbackSpatialChunk(): SpatialChunkResponse {
  return {
    spaceDescription: "A cluttered surface area ready for gentle, low-friction organizing.",
    gatewayId: 1,
    items: [
      {
        id: 1,
        title: "Pick up the closest drink container or cup",
        category: "Dishes",
        estTime: "~30 sec",
        box_2d: [380, 420, 620, 580],
      },
      {
        id: 2,
        title: "Gather any loose paper or wrappers into one small spot",
        category: "Trash",
        estTime: "~45 sec",
        box_2d: [550, 200, 780, 450],
      },
      {
        id: 3,
        title: "Wipe or clear the center open space for breathing room",
        category: "Surface Clear",
        estTime: "~1 min",
        box_2d: [200, 300, 500, 700],
      },
    ],
  };
}
