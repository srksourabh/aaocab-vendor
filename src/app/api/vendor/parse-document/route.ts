import { type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_FIELDS: Record<string, Record<string, string>> = {
  pan: { name: "", pan_number: "", dob: "", fathers_name: "" },
  aadhaar: { name: "", aadhaar_number: "", address: "", dob: "", gender: "" },
  license: { name: "", dl_number: "", expiry: "", vehicle_classes: "", dob: "" },
  rc_book: { registration_number: "", owner_name: "", validity: "", vehicle_class: "", fuel_type: "" },
  insurance: { expiry_date: "", policy_number: "", insured_name: "", vehicle_number: "" },
  fitness: { expiry_date: "", certificate_number: "", vehicle_number: "" },
  puc: { expiry_date: "", certificate_number: "", vehicle_number: "", emission_result: "" },
  police_verification: { name: "", verification_date: "", result: "" },
  medical_fitness: { name: "", expiry_date: "", result: "" },
};

const DOCUMENT_PROMPTS: Record<string, string> = {
  pan: "Extract from this Indian PAN card: name, pan_number (format AAAAA9999A), dob (YYYY-MM-DD), fathers_name.",
  aadhaar: "Extract from this Indian Aadhaar card: name, aadhaar_number (12 digits, no spaces), address, dob (YYYY-MM-DD), gender.",
  license: "Extract from this Indian Driving Licence: name, dl_number (state code + year + number), expiry (YYYY-MM-DD), vehicle_classes (e.g. LMV MCWG), dob (YYYY-MM-DD), blood_group, issue_date (YYYY-MM-DD).",
  rc_book: "Extract from this Indian vehicle Registration Certificate: registration_number (e.g. KA01AB1234), owner_name, validity (YYYY-MM-DD), chassis_number, engine_number, vehicle_class, fuel_type, maker.",
  insurance: "Extract from this vehicle insurance document: expiry_date (YYYY-MM-DD), policy_number, insured_name, vehicle_number, insurer, coverage_type.",
  fitness: "Extract from this vehicle Fitness Certificate: expiry_date (YYYY-MM-DD), certificate_number, vehicle_number, issue_date (YYYY-MM-DD).",
  puc: "Extract from this PUC (Pollution Under Control) certificate: expiry_date (YYYY-MM-DD), certificate_number, vehicle_number, emission_result.",
  police_verification: "Extract from this Police Verification document: name, verification_date (YYYY-MM-DD), station, result.",
  medical_fitness: "Extract from this Medical Fitness Certificate: name, expiry_date (YYYY-MM-DD), doctor_name, hospital, result.",
};

export async function POST(request: NextRequest): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const documentType = formData.get("documentType") as string | null;

  if (!file || !documentType) {
    return Response.json({ error: "file and documentType are required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({
      documentType,
      fields: FALLBACK_FIELDS[documentType] ?? {},
      confidence: 0.5,
      rawText: "[AI not configured — using fallback]",
    });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = (file.type || "image/jpeg") as string;

  const prompt = DOCUMENT_PROMPTS[documentType] ?? `Extract all visible text fields from this document (type: ${documentType}).`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: { mimeType, data: base64 },
    },
    `${prompt}\n\nRespond with ONLY a JSON object containing the extracted fields and a "rawText" field with all visible text. Do not include any explanation.`,
  ]);

  const responseText = result.response.text();

  let parsed: Record<string, string> & { rawText?: string } = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    }
  } catch {
    parsed = { rawText: responseText };
  }

  const rawText = parsed.rawText ?? responseText;
  const { rawText: _removed, ...fields } = parsed;

  const expected = Object.keys(FALLBACK_FIELDS[documentType] ?? {});
  const filled = expected.filter((k) => fields[k] && fields[k].trim() !== "").length;
  const confidence = expected.length > 0 ? 0.7 + (filled / expected.length) * 0.27 : 0.85;

  return Response.json({ documentType, fields, confidence, rawText });
}
