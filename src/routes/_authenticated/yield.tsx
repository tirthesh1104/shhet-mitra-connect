import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { MANDI_CROPS } from "@/data/content";

export const Route = createFileRoute("/_authenticated/yield")({ component: Page });

const YIELDS: Record<string, { base: number; district: number }> = {
  wheat: { base: 18, district: 16 }, cotton: { base: 6, district: 5 }, sugarcane: { base: 350, district: 320 },
  soybean: { base: 10, district: 9 }, tomato: { base: 120, district: 100 }, onion: { base: 140, district: 130 },
  jowar: { base: 12, district: 10 }, tur: { base: 8, district: 7 }, grape: { base: 90, district: 80 }, pomegranate: { base: 60, district: 55 },
};

function Page() {
  const { t, lang } = useI18n(); const { user } = useAuth();
  const [crop, setCrop] = useState("wheat");
  const [acres, setAcres] = useState("1");
  const [soil, setSoil] = useState("70");
  const [irr, setIrr] = useState<"rain" | "drip" | "flood">("drip");
  const [rain, setRain] = useState<"low" | "normal" | "high">("normal");
  const [res, setRes] = useState<null | { low: number; high: number; revenue: number; district: number; price: number }>(null);

  function compute() {
    const y = YIELDS[crop] ?? { base: 10, district: 9 };
    const soilMul = 0.7 + (Number(soil) / 100) * 0.6;
    const irrMul = irr === "drip" ? 1.15 : irr === "flood" ? 1.0 : 0.85;
    const rainMul = rain === "normal" ? 1 : rain === "high" ? 1.1 : 0.75;
    const yieldMid = y.base * soilMul * irrMul * rainMul;
    const low = Math.round(yieldMid * 0.9 * Number(acres || 1));
    const high = Math.round(yieldMid * 1.1 * Number(acres || 1));
    const price = MANDI_CROPS.find((m) => m.key === crop)?.base ?? 2000;
    const revenue = Math.round(((low + high) / 2) * price);
    setRes({ low, high, revenue, district: Math.round(y.district * Number(acres || 1)), price });
  }

  async function save() {
    if (!res) return;
    const { error } = await supabase.from("yield_estimates").insert({
      user_id: user!.id, crop_name: crop, area_acres: Number(acres || 1),
      inputs: { soil, irr, rain }, estimated_yield_qtl: (res.low + res.high) / 2, estimated_revenue_inr: res.revenue,
    });
    if (error) return toast.error(error.message);
    toast.success(lang === "mr" ? "जतन झाले" : "Saved");
  }

  return (
    <ModulePage title={t("modYield")} subtitle={lang === "mr" ? "अंदाजित उत्पन्न व उलाढाल" : "Estimate yield & revenue"}>
      <Card>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <label>{lang === "mr" ? "पीक" : "Crop"}
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
              {MANDI_CROPS.map((m) => <option key={m.key} value={m.key}>{lang === "mr" ? m.mr : m.en}</option>)}
            </select>
          </label>
          <label>{lang === "mr" ? "क्षेत्र (एकर)" : "Area (acres)"}
            <input value={acres} onChange={(e) => setAcres(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" />
          </label>
          <label>{lang === "mr" ? "माती स्कोर (0-100)" : "Soil health (0-100)"}
            <input value={soil} onChange={(e) => setSoil(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" />
          </label>
          <label>{lang === "mr" ? "सिंचन" : "Irrigation"}
            <select value={irr} onChange={(e) => setIrr(e.target.value as typeof irr)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
              <option value="rain">Rain-fed</option><option value="drip">Drip</option><option value="flood">Flood</option>
            </select>
          </label>
          <label className="sm:col-span-2">{lang === "mr" ? "अपेक्षित पाऊस" : "Expected rainfall"}
            <select value={rain} onChange={(e) => setRain(e.target.value as typeof rain)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
            </select>
          </label>
        </div>
        <button onClick={compute} className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground"><Calculator className="mr-1 inline h-4 w-4" /> {lang === "mr" ? "अंदाज काढा" : "Estimate"}</button>
      </Card>
      {res && (
        <Card className="mt-3">
          <div className="text-sm font-medium">{lang === "mr" ? "अंदाजित उत्पन्न" : "Estimated yield"}</div>
          <div className="mt-1 text-2xl font-semibold">{res.low} – {res.high} qtl</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Chip tone="info">₹{res.price}/qtl · {lang === "mr" ? "आजचा भाव" : "today's rate"}</Chip>
            <Chip tone="success">{lang === "mr" ? "अंदाजित उलाढाल" : "Est. revenue"}: ₹{res.revenue.toLocaleString()}</Chip>
            <Chip>{lang === "mr" ? "जिल्हा सरासरी" : "District avg"}: {res.district} qtl</Chip>
          </div>
          <button onClick={save} className="mt-3 chip">{lang === "mr" ? "जतन" : "Save"}</button>
        </Card>
      )}
    </ModulePage>
  );
}
