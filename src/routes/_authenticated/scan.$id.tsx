import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, BadgeCheck, AlertTriangle, IndianRupee, Stethoscope, FileDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { speak, stopSpeaking } from "@/lib/voice-mode";
import { DISEASES } from "@/data/diseases";
import { useAuth } from "@/lib/auth-context";
import { downloadReportPdf, shareReport } from "@/lib/pdf-report";

export const Route = createFileRoute("/_authenticated/scan/$id")({
  component: ScanResult,
});

type AiAnalysis = {
  crop: string; disease: string; isHealthy: boolean;
  confidenceLevel: "high" | "medium" | "low"; confidencePercent: number;
  symptoms: string[]; organicTreatment: string[]; chemicalTreatment: string[];
  prevention: string[]; needsExpert: boolean; notes: string;
} | null;

type Scan = {
  id: string; crop_name: string; image_url: string | null;
  disease_key: string; confidence: number; severity: string;
  cost_estimate: number | null; sent_to_expert: boolean;
  created_at: string;
  ai_analysis: AiAnalysis;
};

function ScanResult() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const q = useQuery({
    queryKey: ["scan", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("scans").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Scan;
    },
  });

  if (q.isLoading) return <AppShell><div className="py-10 text-center text-muted-foreground">...</div></AppShell>;
  if (!q.data) return <AppShell><div className="py-10 text-center">Not found</div></AppShell>;
  const s = q.data;
  const disease = DISEASES.find((d) => d.key === s.disease_key) ?? DISEASES[0];

  const severityTone =
    s.severity === "high" ? "bg-destructive/15 text-destructive border-destructive/40"
    : s.severity === "medium" ? "bg-warning/15 text-warning-foreground border-warning/40"
    : "bg-success/15 text-success-foreground border-success/40";

  const fullSpoken = `${disease.name[lang]}. ${t("confidence")} ${s.confidence}%. ${disease.cause[lang]}. ${disease.organic[lang]}`;

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("result")}</h1>
      <p className="mt-0.5 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()} · {s.crop_name}</p>

      {s.image_url && <HeatmapImage src={s.image_url} severity={s.severity as "low" | "medium" | "high"} />}

      {s.ai_analysis && <AiDiagnosisCard ai={s.ai_analysis} lang={lang} />}

      <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="deva text-xl font-semibold">{disease.name.mr}</div>
            <div className="text-lg text-primary">{disease.name.en}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`chip ${severityTone}`}><AlertTriangle className="h-3.5 w-3.5" /> {t("severity")}: {s.severity}</span>
            <span className="chip"><BadgeCheck className="h-3.5 w-3.5" /> {t("confidence")}: {s.confidence}%</span>
          </div>
        </div>

        <SpeakButton text={fullSpoken} />

        <Section label={t("cause")} mr={disease.cause.mr} en={disease.cause.en} />
        <Section label={t("organicTreatment")} mr={disease.organic.mr} en={disease.organic.en} accent="bg-success/10" />
        <Section
          label={t("chemicalTreatment")}
          mr={disease.chemical.mr}
          en={disease.chemical.en}
          accent="bg-secondary"
          footer={disease.brands.length > 0 && <div className="mt-2 text-xs text-muted-foreground">{lang === "mr" ? "उपलब्ध ब्रँड्स" : "Available brands"}: {disease.brands.join(", ")}</div>}
        />

        {s.cost_estimate ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-accent/30 p-3">
            <IndianRupee className="h-5 w-5 text-soil" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("estimatedCost")}</div>
              <div className="text-base font-semibold">₹{disease.costRange[0]} – ₹{disease.costRange[1]} <span className="text-xs text-muted-foreground">/ acre</span></div>
            </div>
          </div>
        ) : null}

        {s.confidence < 60 && (
          <ExpertButton scanId={s.id} userId={user!.id} alreadySent={s.sent_to_expert} onSent={() => q.refetch()} />
        )}

        <ReportActions scan={s} />
      </div>
    </AppShell>
  );
}

function ReportActions({ scan }: { scan: Scan }) {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [busy, setBusy] = useState<"mr" | "en" | "share" | null>(null);

  async function build(pdfLang: "mr" | "en") {
    setBusy(pdfLang);
    try {
      const profile = (await supabase.from("profiles").select("full_name, village").eq("id", user!.id).maybeSingle()).data;
      const blob = await downloadReportPdf({
        farmerName: profile?.full_name ?? "", village: profile?.village ?? "",
        date: new Date(scan.created_at).toLocaleDateString(),
        cropName: scan.crop_name, imageDataUrl: scan.image_url,
        diseaseKey: scan.disease_key, confidence: scan.confidence, severity: scan.severity,
        costEstimate: scan.cost_estimate, lang: pdfLang,
      });
      return blob;
    } finally { setBusy(null); }
  }
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button disabled={!!busy} onClick={async () => { await build("mr"); toast.success(t("downloadPdf")); }} className="chip"><FileDown className="h-3.5 w-3.5" /> {busy === "mr" ? "..." : "मराठी PDF"}</button>
      <button disabled={!!busy} onClick={async () => { await build("en"); toast.success(t("downloadPdf")); }} className="chip"><FileDown className="h-3.5 w-3.5" /> English PDF</button>
      <button
        disabled={!!busy}
        onClick={async () => {
          setBusy("share");
          try {
            const blob = await build(lang);
            const r = await shareReport({
              farmerName: "", village: "", date: new Date(scan.created_at).toLocaleDateString(),
              cropName: scan.crop_name, diseaseKey: scan.disease_key, confidence: scan.confidence, severity: scan.severity, lang,
            }, blob);
            if (r === "copied") toast.success(lang === "mr" ? "सारांश कॉपी झाला" : "Summary copied");
          } finally { setBusy(null); }
        }}
        className="chip"
      ><Share2 className="h-3.5 w-3.5" /> {t("share")}</button>
    </div>
  );
}

function AiDiagnosisCard({ ai, lang }: { ai: NonNullable<Scan["ai_analysis"]>; lang: "mr" | "en" }) {
  const L = (mr: string, en: string) => (lang === "mr" ? mr : en);
  const confTone = ai.confidenceLevel === "high"
    ? "bg-success/15 text-success-foreground border-success/40"
    : ai.confidenceLevel === "medium"
      ? "bg-warning/15 text-warning-foreground border-warning/40"
      : "bg-destructive/15 text-destructive border-destructive/40";
  const List = ({ items }: { items: string[] }) =>
    items.length === 0 ? null : (
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((x, i) => <li key={i} className={lang === "mr" ? "deva" : ""}>{x}</li>)}
      </ul>
    );
  return (
    <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
        <BadgeCheck className="h-4 w-4" /> {L("AI निदान", "AI Diagnosis")}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{L("पीक", "Crop")}</div>
          <div className={`text-lg font-semibold ${lang === "mr" ? "deva" : ""}`}>{ai.crop}</div>
          <div className="mt-2 text-xs text-muted-foreground">{L("रोग", "Disease")}</div>
          <div className={`text-base font-medium ${lang === "mr" ? "deva" : ""}`}>{ai.disease}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`chip ${confTone}`}>{L("विश्वास", "Confidence")}: {ai.confidenceLevel} · {ai.confidencePercent}%</span>
          {ai.isHealthy && <span className="chip bg-success/15 text-success-foreground border-success/40">{L("निरोगी", "Healthy")}</span>}
        </div>
      </div>

      {ai.symptoms.length > 0 && (
        <div className="mt-4 rounded-2xl bg-muted/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{L("लक्षणे", "Symptoms")}</div>
          <List items={ai.symptoms} />
        </div>
      )}
      {ai.organicTreatment.length > 0 && (
        <div className="mt-3 rounded-2xl bg-success/10 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{L("सेंद्रिय उपाय", "Organic Treatment")}</div>
          <List items={ai.organicTreatment} />
        </div>
      )}
      {ai.chemicalTreatment.length > 0 && (
        <div className="mt-3 rounded-2xl bg-secondary p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{L("रासायनिक उपाय", "Chemical Treatment")}</div>
          <List items={ai.chemicalTreatment} />
        </div>
      )}
      {ai.prevention.length > 0 && (
        <div className="mt-3 rounded-2xl bg-accent/30 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{L("प्रतिबंध", "Prevention")}</div>
          <List items={ai.prevention} />
        </div>
      )}
      {(ai.needsExpert || ai.confidenceLevel === "low") && (
        <div className="mt-3 rounded-2xl border border-warning/40 bg-warning/10 p-3 text-sm">
          <AlertTriangle className="mr-1 inline h-4 w-4" />
          {L("अचूक निदानासाठी जवळच्या कृषी अधिकाऱ्याचा सल्ला घ्या.", "Consult a local agriculture officer for accurate diagnosis.")}
        </div>
      )}
      {ai.notes && (
        <div className={`mt-3 text-xs text-muted-foreground ${lang === "mr" ? "deva" : ""}`}>{ai.notes}</div>
      )}
    </div>
  );
}

function Section({ label, mr, en, accent, footer }: { label: string; mr: string; en: string; accent?: string; footer?: React.ReactNode }) {
  return (
    <div className={`mt-4 rounded-2xl p-4 ${accent ?? "bg-muted/60"}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="deva mt-1 font-medium">{mr}</div>
      <div className="text-sm text-muted-foreground">{en}</div>
      {footer}
    </div>
  );
}

function SpeakButton({ text }: { text: string }) {
  const { t, lang } = useI18n();
  const [on, setOn] = useState(false);
  useEffect(() => () => stopSpeaking(), []);
  return (
    <button
      onClick={() => { if (on) { stopSpeaking(); setOn(false); } else { speak(text, lang); setOn(true); } }}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
    >
      {on ? <><VolumeX className="h-4 w-4" /> {t("stop")}</> : <><Volume2 className="h-4 w-4" /> {t("speakResult")}</>}
    </button>
  );
}

function ExpertButton({ scanId, userId, alreadySent, onSent }: { scanId: string; userId: string; alreadySent: boolean; onSent: () => void }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  if (alreadySent) {
    return <div className="mt-4 rounded-2xl border border-border bg-card p-3 text-sm text-success-foreground">✓ {t("expertSent")}</div>;
  }
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const { error } = await supabase.from("expert_queue").insert({ user_id: userId, scan_id: scanId });
        if (error) { toast.error(error.message); setBusy(false); return; }
        await supabase.from("scans").update({ sent_to_expert: true }).eq("id", scanId);
        toast.success(t("expertSent")); onSent(); setBusy(false);
      }}
      className="big-tap mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-soil text-soil-foreground hover:opacity-90 disabled:opacity-60"
    >
      <Stethoscope className="h-5 w-5" /> {t("sendToExpert")}
    </button>
  );
}

function HeatmapImage({ src, severity }: { src: string; severity: "low" | "medium" | "high" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return;
    const img = new Image();
    img.onload = () => {
      const w = cvs.clientWidth; const h = (img.height / img.width) * w;
      cvs.width = w; cvs.height = h;
      const ctx = cvs.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      if (severity === "low") return;
      // mock heatmap zones
      const zoneCount = severity === "high" ? 6 : 4;
      for (let i = 0; i < zoneCount; i++) {
        const x = (0.15 + Math.random() * 0.7) * w;
        const y = (0.15 + Math.random() * 0.7) * h;
        const r = (0.08 + Math.random() * 0.1) * w;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const color = severity === "high" ? "239,68,68" : "234,179,8";
        grad.addColorStop(0, `rgba(${color},0.55)`);
        grad.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    };
    img.src = src;
  }, [src, severity]);
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
