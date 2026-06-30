import { DISEASES, type Disease } from "@/data/diseases";

export type DetectionResult = {
  disease: Disease;
  confidence: number; // 0-100
  severity: "low" | "medium" | "high";
  heatmapZones: Array<{ x: number; y: number; r: number; intensity: number }>;
};

/**
 * MOCK disease detector.
 *
 * TODO: REAL MODEL SEAM
 * Replace the body of this function with a TensorFlow.js / TFLite inference call:
 *   const tensor = preprocess(imageFile);
 *   const logits = await model.predict(tensor);
 *   const { diseaseKey, confidence } = topK(logits);
 *   return { disease: DISEASES.find(d => d.key === diseaseKey), confidence, ... };
 *
 * The rest of the app talks to this function only — no other change needed.
 */
export async function detectDisease(_file: File): Promise<DetectionResult> {
  await new Promise((r) => setTimeout(r, 1200)); // simulate inference latency
  const pool = DISEASES.filter((d) => d.key !== "healthy");
  // 15% chance the crop is just healthy
  const disease = Math.random() < 0.15
    ? DISEASES.find((d) => d.key === "healthy")!
    : pool[Math.floor(Math.random() * pool.length)];

  const confidence = disease.key === "healthy"
    ? Math.round(85 + Math.random() * 10)
    : Math.round(55 + Math.random() * 40); // 55-95
  const severity: DetectionResult["severity"] =
    disease.key === "healthy" ? "low"
      : confidence > 80 ? "high"
        : confidence > 65 ? "medium" : "low";

  // Generate 3-7 heatmap zones (normalized 0..1 coords on the image)
  const zoneCount = disease.key === "healthy" ? 0 : 3 + Math.floor(Math.random() * 5);
  const heatmapZones = Array.from({ length: zoneCount }, () => ({
    x: 0.15 + Math.random() * 0.7,
    y: 0.15 + Math.random() * 0.7,
    r: 0.06 + Math.random() * 0.12,
    intensity: 0.4 + Math.random() * 0.6,
  }));

  return { disease, confidence, severity, heatmapZones };
}
