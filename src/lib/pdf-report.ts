// Client-side PDF export for scan reports.
// Pure jsPDF (no html2canvas / DOM screenshot) so oklch() CSS colors are never parsed.
import type { Lang } from "@/lib/i18n";
import { DISEASES } from "@/data/diseases";
import { generateScanReportPDF } from "@/lib/generateReport";

export type ReportInput = {
  farmerName: string;
  village: string;
  date: string; // human readable
  cropName: string;
  imageDataUrl?: string | null;
  diseaseKey: string;
  confidence: number;
  severity: string;
  costEstimate?: number | null;
  lang: Lang;
  ai?: {
    disease?: string;
    symptoms?: string[];
    organicTreatment?: string[];
    chemicalTreatment?: string[];
    prevention?: string[];
    notes?: string;
  } | null;
};

/** Generate and download a PDF report built directly from data. */
export async function downloadReportPdf(r: ReportInput): Promise<Blob> {
  const d = DISEASES.find((x) => x.key === r.diseaseKey) ?? DISEASES[0];
  const ai = r.ai ?? null;

  return generateScanReportPDF({
    imageUrl: r.imageDataUrl ?? null,
    cropType: r.cropName || "-",
    diseaseName: ai?.disease || d.name.en,
    diseaseNameMarathi: d.name.mr,
    confidence: Math.round(r.confidence ?? 0),
    severity: r.severity,
    symptoms: ai?.symptoms?.length ? ai.symptoms : [d.cause.en],
    organicTreatment: ai?.organicTreatment?.length ? ai.organicTreatment.join(" • ") : d.organic.en,
    chemicalTreatment: [
      ai?.chemicalTreatment?.length ? ai.chemicalTreatment.join(" • ") : d.chemical.en,
      d.brands.length ? `Brands: ${d.brands.join(", ")}` : "",
    ].filter(Boolean).join("\n"),
    fertilizerRecommendation: r.costEstimate
      ? `Balanced NPK as per soil card. Estimated input cost: Rs ${r.costEstimate}/acre.`
      : "Apply balanced NPK as per your soil health card.",
    preventionTips: [
      ai?.prevention?.length ? ai.prevention.join(" • ") : "",
      ai?.notes || "",
      "Re-check the crop after 3-5 days. Contact your local Krishi officer if it worsens.",
    ].filter(Boolean).join("\n"),
    scanDate: r.date,
    farmerName: r.farmerName,
    village: r.village,
  });
}

/** Web Share API with graceful fallback: shares the PDF blob if supported, else copies a summary. */
export async function shareReport(r: ReportInput, blob: Blob) {
  const file = new File([blob], `FasalMitra_${r.cropName || "report"}.pdf`, { type: "application/pdf" });
  const summary = `${r.cropName} · ${r.diseaseKey.replace(/_/g, " ")} (${r.confidence}%) — FasalMitra`;
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: "FasalMitra Report", text: summary }); return "shared"; }
    catch { return "cancelled"; }
  }
  if (navigator.share) {
    try { await navigator.share({ title: "FasalMitra Report", text: summary }); return "shared"; } catch { return "cancelled"; }
  }
  try { await navigator.clipboard.writeText(summary); return "copied"; } catch { return "unsupported"; }
}
