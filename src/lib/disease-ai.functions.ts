import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20),
  cropHint: z.string().default(""),
  lang: z.enum(["mr", "en"]).default("mr"),
});

export type CropDiagnosis = {
  crop: string;
  disease: string;
  isHealthy: boolean;
  confidenceLevel: "high" | "medium" | "low";
  confidencePercent: number;
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  needsExpert: boolean;
  notes: string;
};

const FALLBACK: CropDiagnosis = {
  crop: "Unknown",
  disease: "Uncertain",
  isHealthy: false,
  confidenceLevel: "low",
  confidencePercent: 30,
  symptoms: [],
  organicTreatment: [],
  chemicalTreatment: [],
  prevention: [],
  needsExpert: true,
  notes: "अचूक निदानासाठी जवळच्या कृषी अधिकाऱ्याचा सल्ला घ्या. / Consult a local agriculture officer for accurate diagnosis.",
};

export const analyzeCropImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { diagnosis: FALLBACK, source: "fallback" as const };

    const langNote = data.lang === "mr"
      ? "All string values (crop, disease, symptoms, treatments, prevention, notes) MUST be written in Marathi (Devanagari script)."
      : "All string values MUST be written in English.";

    const systemPrompt = `You are an expert Indian agricultural pathologist. Analyze the crop photo and return ONLY a valid JSON object (no markdown, no prose) with this exact shape:
{
  "crop": string,
  "disease": string,
  "isHealthy": boolean,
  "confidenceLevel": "high" | "medium" | "low",
  "confidencePercent": number (0-100),
  "symptoms": string[] (2-5 short bullets of what you actually see),
  "organicTreatment": string[] (2-4 practical steps with local ingredients),
  "chemicalTreatment": string[] (2-4 steps with generic actives + Indian brand names),
  "prevention": string[] (2-4 preventive measures for next season),
  "needsExpert": boolean (true if confidenceLevel is low or image quality is poor),
  "notes": string (one line — extra advice; if uncertain, tell farmer to consult a local Krishi officer)
}
Rules:
- If the plant looks healthy, set isHealthy=true, disease="Healthy" (or "निरोगी"), and leave treatment arrays empty.
- If the image is blurry, not a plant, or you cannot tell, set confidenceLevel="low" and needsExpert=true and say so in notes.
- Do NOT guess wildly. Prefer honest "low confidence" over a wrong diagnosis.
- ${langNote}
${data.cropHint ? `- The farmer says the crop is: ${data.cropHint}. Use this as a hint, but correct it if the image clearly shows otherwise.` : ""}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this crop photo and return the JSON diagnosis." },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) throw new Error(`Gateway ${res.status}`);
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as Partial<CropDiagnosis>;
      const diagnosis: CropDiagnosis = {
        crop: String(parsed.crop ?? "Unknown"),
        disease: String(parsed.disease ?? "Uncertain"),
        isHealthy: Boolean(parsed.isHealthy),
        confidenceLevel: (parsed.confidenceLevel as "high" | "medium" | "low") ?? "low",
        confidencePercent: clamp(Number(parsed.confidencePercent) || 0, 0, 100),
        symptoms: arr(parsed.symptoms),
        organicTreatment: arr(parsed.organicTreatment),
        chemicalTreatment: arr(parsed.chemicalTreatment),
        prevention: arr(parsed.prevention),
        needsExpert: Boolean(parsed.needsExpert),
        notes: String(parsed.notes ?? ""),
      };
      return { diagnosis, source: "ai" as const };
    } catch {
      return { diagnosis: FALLBACK, source: "fallback" as const };
    }
  });

function arr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean).slice(0, 6);
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
