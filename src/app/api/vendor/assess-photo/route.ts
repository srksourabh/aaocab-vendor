import { type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PHOTO_LABELS: Record<string, string> = {
  front: "front exterior",
  rear: "rear exterior",
  left: "left side exterior",
  right: "right side exterior",
  interior_front: "front interior (dashboard and front seats)",
  interior_rear: "rear interior (back seats)",
  boot: "boot/trunk",
  odometer: "odometer reading",
};

export async function POST(request: NextRequest): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const photoType = formData.get("photoType") as string | null;

  if (!file || !photoType) {
    return Response.json({ error: "file and photoType are required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({
      score: 7,
      isValid: true,
      damageDetected: false,
      notes: "[AI not configured — using fallback score]",
    });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = (file.type || "image/jpeg") as string;

  const label = PHOTO_LABELS[photoType] ?? photoType.replace(/_/g, " ");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: { mimeType, data: base64 },
    },
    `Assess this vehicle photo (expected: ${label} view) for a cab aggregator platform.

Respond with ONLY a JSON object:
{
  "score": <1-10 integer, where 10 is perfect>,
  "isValid": <true if this is actually a ${label} photo, false otherwise>,
  "damageDetected": <true if visible damage, dents, or scratches are present>,
  "notes": "<one sentence about the photo quality and vehicle condition>"
}

Scoring guide: 9-10=excellent, 7-8=good, 5-6=acceptable, 3-4=poor, 1-2=unusable.`,
  ]);

  const responseText = result.response.text();

  let assessment = { score: 5, isValid: true, damageDetected: false, notes: "Assessment complete." };
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as typeof assessment;
      assessment = {
        score: Math.max(1, Math.min(10, Number(parsed.score) || 5)),
        isValid: Boolean(parsed.isValid),
        damageDetected: Boolean(parsed.damageDetected),
        notes: String(parsed.notes || ""),
      };
    }
  } catch {
    assessment.notes = responseText.slice(0, 200);
  }

  return Response.json(assessment);
}
