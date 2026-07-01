// Client-side PDF export for scan reports. Uses jsPDF + html2canvas to snapshot
// a bilingual HTML template, ensuring Marathi (Devanagari) renders correctly
// even though jsPDF's core fonts don't support the script.
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Lang } from "@/lib/i18n";
import { DISEASES } from "@/data/diseases";

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
};

function buildHtml(r: ReportInput): string {
  const d = DISEASES.find((x) => x.key === r.diseaseKey) ?? DISEASES[0];
  const L = r.lang;
  const L_ = (mr: string, en: string) => (L === "mr" ? mr : en);
  const brand = "FasalMitra · " + L_("शेतकऱ्याचा डिजिटल मित्र", "Your Digital Farming Companion");
  return `
    <div style="font-family: 'Noto Sans Devanagari', 'Inter', system-ui, sans-serif; width: 720px; padding: 32px; background: #FBF7EE; color: #1f2418; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 2px solid #6B8F3E;">
        <div>
          <div style="font-size: 22px; font-weight: 700; color: #3D5A17;">${brand}</div>
          <div style="font-size: 12px; color: #6b7255; margin-top: 2px;">${L_("पीक तपासणी अहवाल", "Crop Scan Report")} · ${r.date}</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #6b7255;">
          <div><b>${L_("शेतकरी", "Farmer")}:</b> ${escape(r.farmerName || "—")}</div>
          <div><b>${L_("गाव", "Village")}:</b> ${escape(r.village || "—")}</div>
          <div><b>${L_("पीक", "Crop")}:</b> ${escape(r.cropName || "—")}</div>
        </div>
      </div>

      <div style="display: flex; gap: 16px; margin-top: 20px;">
        ${r.imageDataUrl ? `<img src="${r.imageDataUrl}" style="width: 220px; height: 220px; object-fit: cover; border-radius: 12px; border: 1px solid #d9d3bf;" />` : ""}
        <div style="flex: 1;">
          <div style="font-size: 26px; font-weight: 700; color: #3D5A17;">${escape(d.name[L])}</div>
          <div style="font-size: 14px; color: #6b7255;">${escape(d.name[L === "mr" ? "en" : "mr"])}</div>
          <div style="margin-top: 12px; display: flex; gap: 12px; flex-wrap: wrap;">
            <span style="padding: 4px 10px; background: #E8DFC2; border-radius: 999px; font-size: 12px;"><b>${L_("विश्वास", "Confidence")}:</b> ${r.confidence}%</span>
            <span style="padding: 4px 10px; background: ${sevBg(r.severity)}; border-radius: 999px; font-size: 12px;"><b>${L_("तीव्रता", "Severity")}:</b> ${r.severity}</span>
            ${r.costEstimate ? `<span style="padding: 4px 10px; background: #E8DFC2; border-radius: 999px; font-size: 12px;"><b>${L_("अंदाजित खर्च", "Est. cost")}:</b> ₹${r.costEstimate}/acre</span>` : ""}
          </div>
        </div>
      </div>

      ${section(L_("कारण", "Cause"), d.cause[L])}
      ${section(L_("सेंद्रिय उपचार", "Organic treatment"), d.organic[L], "#E5EFDA")}
      ${section(L_("रासायनिक उपचार", "Chemical treatment"), d.chemical[L] + (d.brands.length ? "\n\n" + L_("उपलब्ध ब्रँड्स", "Available brands") + ": " + d.brands.join(", ") : ""), "#FDF2CE")}
      ${section(L_("पुढील पावले", "Next steps"), L_(
        "१) उपचार लगेच सुरू करा. २) ३-५ दिवसांनी पुन्हा तपासा. ३) परिस्थिती गंभीर असल्यास कृषी अधिकाऱ्याशी संपर्क साधा.",
        "1) Start treatment immediately. 2) Re-check after 3–5 days. 3) Contact agri officer if condition worsens.",
      ))}
      ${section(L_("संबंधित सरकारी योजना", "Related govt schemes"), L_(
        "• पीएम फसल विमा योजना — नुकसान भरपाईसाठी\n• मृदा आरोग्य कार्ड — मोफत माती चाचणी\n• PMKSY — ठिबक/तुषार सिंचन अनुदान",
        "• PM Fasal Bima Yojana — loss compensation\n• Soil Health Card — free soil testing\n• PMKSY — drip/sprinkler subsidy",
      ), "#EAF3E1")}

      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #d9d3bf; font-size: 10px; color: #6b7255; text-align: center;">
        ${L_("हा अहवाल संदर्भासाठी आहे. गंभीर परिस्थितीत तज्ज्ञांचा सल्ला घ्या.", "This report is for reference only. Consult an agri expert for critical cases.")}
      </div>
    </div>
  `;
}

function section(title: string, body: string, bg = "#F3EEDC") {
  return `<div style="margin-top: 14px; padding: 12px 14px; background: ${bg}; border-radius: 10px;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7255;">${escape(title)}</div>
    <div style="margin-top: 4px; font-size: 13px; white-space: pre-wrap; line-height: 1.55;">${escape(body)}</div>
  </div>`;
}
function sevBg(s: string) { return s === "high" ? "#F4C7C7" : s === "medium" ? "#FDF2CE" : "#DAECDD"; }
function escape(s: string) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!)); }

/** Generate and download a PDF report. Renders bilingual HTML → canvas → PDF. */
export async function downloadReportPdf(r: ReportInput): Promise<Blob> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.innerHTML = buildHtml(r);
  document.body.appendChild(container);
  try {
    const node = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#FBF7EE", useCORS: true, logging: false });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    let w = pageW - 40, h = w / ratio;
    if (h > pageH - 40) { h = pageH - 40; w = h * ratio; }
    pdf.addImage(img, "JPEG", (pageW - w) / 2, 20, w, h);
    const fileName = `FasalMitra_${r.cropName || "scan"}_${r.date.replace(/[^\d]/g, "-")}.pdf`;
    pdf.save(fileName);
    return pdf.output("blob");
  } finally {
    document.body.removeChild(container);
  }
}

/** Web Share API with graceful fallback: shares the PDF blob if supported, else copies a summary. */
export async function shareReport(r: ReportInput, blob: Blob) {
  const file = new File([blob], `FasalMitra_${r.cropName}.pdf`, { type: "application/pdf" });
  const summary = `${r.cropName} · ${r.diseaseKey.replace(/_/g, " ")} (${r.confidence}%) — FasalMitra`;
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: "FasalMitra Report", text: summary }); return "shared"; }
    catch { /* user cancelled */ return "cancelled"; }
  }
  if (navigator.share) {
    try { await navigator.share({ title: "FasalMitra Report", text: summary }); return "shared"; } catch { return "cancelled"; }
  }
  try { await navigator.clipboard.writeText(summary); return "copied"; } catch { return "unsupported"; }
}
