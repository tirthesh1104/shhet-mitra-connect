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

// ---- oklch → hex sanitizer ----------------------------------------------------
// html2canvas ≤1.4 cannot parse CSS color functions like oklch()/oklab()/color().
// The app's shadcn theme defines colors as oklch, so any computed style read from
// the report DOM crashes with "Attempting to parse an unsupported color function
// oklch". Fix: before rendering, walk every element in the report container, read
// its computed color-ish properties, and inline a hex fallback so html2canvas never
// sees the unsupported function.

function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }
function srgbCompand(x: number) {
  const s = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.round(clamp01(s) * 255);
}
function oklchToHex(L: number, C: number, hDeg: number, alpha = 1): string {
  // Björn Ottosson's OKLab → linear sRGB, then compand to sRGB.
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const hex = (n: number) => srgbCompand(n).toString(16).padStart(2, "0");
  const base = `#${hex(r)}${hex(g)}${hex(bl)}`;
  if (alpha >= 0.999) return base;
  return `${base}${Math.round(clamp01(alpha) * 255).toString(16).padStart(2, "0")}`;
}
function parseOklchToken(token: string): string | null {
  // Accepts "oklch(L C H)" / "oklch(L C H / A)" with L as % or 0..1, H in deg, C as number.
  const m = token.match(/oklch\(\s*([^)]+)\)/i);
  if (!m) return null;
  const inner = m[1].replace("/", " / ");
  const parts = inner.split(/[\s,]+/).filter(Boolean);
  const slash = parts.indexOf("/");
  const nums = (slash >= 0 ? parts.slice(0, slash) : parts).slice(0, 3);
  const alphaTok = slash >= 0 ? parts[slash + 1] : undefined;
  if (nums.length < 3) return null;
  const toNum = (s: string) => (s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s));
  const L = toNum(nums[0]);
  const C = parseFloat(nums[1]);
  const H = parseFloat(nums[2]);
  const A = alphaTok ? (alphaTok.endsWith("%") ? parseFloat(alphaTok) / 100 : parseFloat(alphaTok)) : 1;
  if ([L, C, H, A].some((v) => Number.isNaN(v))) return null;
  return oklchToHex(L, C, H, A);
}
function replaceOklchInValue(v: string): string {
  if (!v || !/oklch\(/i.test(v)) return v;
  return v.replace(/oklch\([^)]+\)/gi, (t) => parseOklchToken(t) ?? "#000000");
}
const COLOR_PROPS = [
  "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor",
  "borderBottomColor", "borderLeftColor", "outlineColor", "textDecorationColor",
  "fill", "stroke", "caretColor", "columnRuleColor",
];
function sanitizeOklch(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const nodes: HTMLElement[] = [root];
  let n = walker.nextNode();
  while (n) { nodes.push(n as HTMLElement); n = walker.nextNode(); }
  for (const el of nodes) {
    const cs = window.getComputedStyle(el);
    for (const p of COLOR_PROPS) {
      const raw = cs.getPropertyValue(p as string);
      if (raw && /oklch\(/i.test(raw)) {
        (el.style as unknown as Record<string, string>)[p] = replaceOklchInValue(raw);
      }
    }
    // background shorthand can also carry oklch
    const bg = cs.getPropertyValue("background-image");
    if (bg && /oklch\(/i.test(bg)) el.style.backgroundImage = replaceOklchInValue(bg);
    const bs = cs.getPropertyValue("box-shadow");
    if (bs && /oklch\(/i.test(bs)) el.style.boxShadow = replaceOklchInValue(bs);
  }
}

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
