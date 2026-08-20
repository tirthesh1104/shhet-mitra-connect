import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Camera, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { detectDisease } from "@/lib/disease-detector";
import { analyzeCropImage } from "@/lib/disease-ai.functions";
import { getForecast } from "@/lib/weather";
import { captureLocation, EMPTY_LOCATION } from "@/lib/geolocation";

export const Route = createFileRoute("/_authenticated/scan")({
  component: ScanPage,
});

// Downscale to keep base64 small for the demo (no public Storage bucket needed).
async function downscaleToDataUrl(file: File, max = 640): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function ScanPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [cropName, setCropName] = useState("");

  const analyze = useServerFn(analyzeCropImage);

  async function handleFile(f: File) {
    if (!f) return;
    setBusy(true);
    try {
      const dataUrl = await downscaleToDataUrl(f);
      const [detection, weather, profile, aiResult, location] = await Promise.all([
        detectDisease(f),
        getForecast(),
        supabase.from("profiles").select("village").eq("id", user!.id).maybeSingle(),
        analyze({ data: { imageDataUrl: dataUrl, cropHint: cropName.trim(), lang } }).catch(() => null),
        captureLocation(5000).catch(() => EMPTY_LOCATION),
      ]);
      const village = profile.data?.village ?? "";
      const ai = aiResult?.diagnosis ?? null;

      // Bug 3: reject non-crop images before saving/analysing.
      if (ai && ai.isValidCropImage === false) {
        toast.error(lang === "mr"
          ? "कृपया पिकाचा/पानाचा स्पष्ट फोटो टाका"
          : "Please upload a clear photo of a crop or leaf");
        setBusy(false);
        return;
      }


      // Prefer AI values when available
      const confidence = ai
        ? ai.confidencePercent
        : detection.confidence;
      const severity: "low" | "medium" | "high" = ai
        ? (ai.isHealthy ? "low" : ai.confidenceLevel === "high" ? "high" : ai.confidenceLevel === "medium" ? "medium" : "low")
        : detection.severity;
      const cost = Math.round(
        (detection.disease.costRange[0] + detection.disease.costRange[1]) / 2,
      );

      const { data: inserted, error } = await supabase.from("scans").insert({
        user_id: user!.id,
        crop_name: (ai?.crop || cropName.trim() || "Unknown"),
        image_url: dataUrl,
        disease_key: detection.disease.key,
        confidence,
        severity,
        weather_snapshot: { rainExpected: weather.rainExpected, days: weather.days, source: weather.source },
        village,
        cost_estimate: cost,
        ai_analysis: ai as unknown as never,
      }).select("id").single();
      if (error) throw error;

      // Log community outbreak signal (skip healthy)
      const notHealthy = ai ? !ai.isHealthy : detection.disease.key !== "healthy";
      if (village && notHealthy) {
        await supabase.from("outbreak_signals").insert({ village, disease_key: detection.disease.key });
      }
      // Update crop health if matches a known crop
      if (cropName.trim()) {
        const health = !notHealthy ? "healthy" : severity === "high" ? "urgent" : "minor";
        await supabase.from("crops").update({ health_status: health }).eq("user_id", user!.id).eq("name", cropName.trim());
      }

      toast.success(t("saveJournal"));
      navigate({ to: "/scan/$id", params: { id: inserted.id } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("scanCrop")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("uploadOrCapture")}</p>

      <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">{lang === "mr" ? "पीक नाव (वैकल्पिक)" : "Crop name (optional)"}</label>
        <input value={cropName} onChange={(e) => setCropName(e.target.value)} placeholder={lang === "mr" ? "उदा. टोमॅटो" : "e.g. Tomato"}
          className="big-tap mb-5 w-full rounded-2xl border border-border bg-background px-4 text-base" />

        <div className="grid gap-3 sm:grid-cols-2">
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button disabled={busy} onClick={() => cameraRef.current?.click()}
            className="big-tap flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-medium text-primary-foreground disabled:opacity-60">
            <Camera className="h-5 w-5" /> {lang === "mr" ? "फोटो काढा" : "Take photo"}
          </button>
          <button disabled={busy} onClick={() => fileRef.current?.click()}
            className="big-tap flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 font-medium hover:bg-secondary disabled:opacity-60">
            <Upload className="h-5 w-5" /> {lang === "mr" ? "अपलोड" : "Upload"}
          </button>
        </div>

        {busy && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
            <Sparkles className="h-5 w-5 animate-pulse text-primary" />
            <span>{t("analyzing")}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
