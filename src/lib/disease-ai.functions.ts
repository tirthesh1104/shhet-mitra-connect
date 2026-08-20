import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20),
  cropHint: z.string().default(""),
  lang: z.enum(["mr", "en"]).default("mr"),
});

export type CropDiagnosis = {
  isValidCropImage: boolean;
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
  possibleAlternatives: string[];
  notes: string;
};

const FALLBACK: CropDiagnosis = {
  isValidCropImage: true,
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
  possibleAlternatives: [],
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

    const systemPrompt = `You are an expert Indian agricultural pathologist. First check whether the image actually shows a plant, leaf, crop, or agricultural produce. Then return ONLY a valid JSON object (no markdown, no prose) with this exact shape:
{
  "isValidCropImage": boolean (true ONLY if the image clearly shows a plant, leaf, crop, fruit, vegetable, or farm produce; false for people, animals, buildings, screenshots, random objects, or unrecognisable images),
  "crop": string,
  "disease": string,
  "isHealthy": boolean,
  "confidenceLevel": "high" | "medium" | "low",
  "confidencePercent": number (0-100),
  "symptoms": string[] (2-5 short bullets of what you actually see),
  "organicTreatment": string[] (2-4 practical steps with local ingredients),
  "chemicalTreatment": string[] (2-4 steps with generic actives + Indian brand names),
  "prevention": string[] (2-4 preventive measures for next season),
  "possible_alternative_diagnoses": string[] (1-2 other plausible causes when the image is ambiguous; empty array if you are sure),
  "needsExpert": boolean (true if confidenceLevel is low or image quality is poor),
  "notes": string (one line — extra advice; if uncertain, tell farmer to consult a local Krishi officer)
}
Rules:
- If isValidCropImage is false, set all other fields to safe defaults (empty strings/arrays, isHealthy=false, confidenceLevel="low", confidencePercent=0, needsExpert=true) and set notes to ask the farmer to upload a clear photo of the crop/leaf.
- If the plant looks healthy, set isHealthy=true, disease="Healthy" (or "निरोगी"), and leave treatment arrays empty.
- If the image is blurry or you cannot tell what plant it is, set confidenceLevel="low" and needsExpert=true and say so in notes.
- If you are not confident about the exact disease, say so honestly in the confidence score rather than guessing a specific disease name — a lower confidence score with an honest "possible causes" list is more useful to a farmer than a falsely confident wrong diagnosis.
- The confidence score must genuinely reflect image clarity: a blurry, dark, or partial photo must score lower than a clear, well-lit close-up.
- Do NOT guess wildly. Prefer honest "low confidence" over a wrong diagnosis.
- Always include at least one chemical option (unless the plant is healthy), using actives commonly sold in Indian agri-input shops: Mancozeb, Copper oxychloride, Imidacloprid, Carbendazim, Neem oil 3%, etc., with dosage per litre and spray interval.
- Organic steps must state the remedy, application method, and frequency.
- Never invent a disease when the plant looks healthy.
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
          temperature: 0.15,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) throw new Error(`Gateway ${res.status}`);
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as Partial<CropDiagnosis>;
      const diagnosis: CropDiagnosis = {
        isValidCropImage: parsed.isValidCropImage !== false,
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
        possibleAlternatives: arr(
          (parsed as Record<string, unknown>).possible_alternative_diagnoses ?? parsed.possibleAlternatives,
        ),
        notes: String(parsed.notes ?? ""),
      };

      // Validation gate: never present a low-confidence guess as a fact.
      const CONFIDENCE_FLOOR = 55;
      if (!diagnosis.isHealthy && diagnosis.confidencePercent < CONFIDENCE_FLOOR) {
        const guess = diagnosis.disease;
        if (guess && !diagnosis.possibleAlternatives.includes(guess)) {
          diagnosis.possibleAlternatives = [guess, ...diagnosis.possibleAlternatives].slice(0, 6);
        }
        diagnosis.disease = data.lang === "mr" ? "निदान निश्चित नाही" : "Not confidently identified";
        diagnosis.confidenceLevel = "low";
        diagnosis.needsExpert = true;
        diagnosis.notes = diagnosis.notes || FALLBACK.notes;
      }
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
