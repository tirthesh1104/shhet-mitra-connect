import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Droplet } from "lucide-react";
import { ModulePage, Card } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { getForecast } from "@/lib/weather";

export const Route = createFileRoute("/_authenticated/paani")({ component: Page });

const CROPS = ["Wheat", "Sugarcane", "Cotton", "Tomato", "Onion", "Soybean", "Grapes"];
const SOILS = [
  { key: "sandy", mr: "वालुकामय", en: "Sandy", freqAdj: -1, ltrAdj: 500 },
  { key: "loamy", mr: "गाळाची", en: "Loamy", freqAdj: 0, ltrAdj: 0 },
  { key: "clay", mr: "चिकणमाती", en: "Clay", freqAdj: 1, ltrAdj: -500 },
];
const BASE = { Wheat: [5, 8000], Sugarcane: [4, 12000], Cotton: [6, 7000], Tomato: [3, 5000], Onion: [4, 6000], Soybean: [5, 7500], Grapes: [4, 9000] } as Record<string, [number, number]>;

function Page() {
  const { t, lang } = useI18n();
  const [crop, setCrop] = useState("Wheat");
  const [soil, setSoil] = useState("loamy");
  const [acres, setAcres] = useState("1");
  const [result, setResult] = useState<null | { freq: number; ltr: number; next: string; saved: number }>(null);
  const wx = useQuery({ queryKey: ["weather"], queryFn: getForecast, staleTime: 10 * 60 * 1000 });

  function compute() {
    const s = SOILS.find((x) => x.key === soil)!;
    const [freqBase, ltrBase] = BASE[crop];
    const rainSoon = wx.data?.days?.some((d) => d.rainMm > 5);
    const freq = Math.max(2, freqBase + s.freqAdj + (rainSoon ? 2 : 0));
    const ltr = Math.max(3000, ltrBase + s.ltrAdj);
    const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + (rainSoon ? 3 : 1));
    setResult({ freq, ltr, next: nextDate.toLocaleDateString(), saved: 40 + (soil === "sandy" ? -5 : soil === "clay" ? 10 : 5) });
  }

  return (
    <ModulePage title={t("modPaani")} subtitle={lang === "mr" ? "पीक व मातीसाठी ठिबक-अनुकूल शेड्यूल" : "Drip-friendly irrigation schedule"}>
      <Card>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2">
            {CROPS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={soil} onChange={(e) => setSoil(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2">
            {SOILS.map((s) => <option key={s.key} value={s.key}>{lang === "mr" ? s.mr : s.en}</option>)}
          </select>
          <input inputMode="decimal" value={acres} onChange={(e) => setAcres(e.target.value)} placeholder="acres" className="rounded-xl border border-border bg-background px-3 py-2" />
        </div>
        <button onClick={compute} className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground">{lang === "mr" ? "शेड्यूल तयार करा" : "Generate schedule"}</button>
      </Card>
      {result && (
        <Card className="mt-3">
          <div className="flex items-center gap-2 text-sm font-medium"><Droplet className="h-4 w-4 text-blue-500" /> {lang === "mr" ? "सल्ला" : "Recommendation"}</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li><b>{lang === "mr" ? "पाणी देण्याची वारंवारता" : "Watering frequency"}:</b> {result.freq} {lang === "mr" ? "दिवसांतून एकदा" : "days between"}</li>
            <li><b>{lang === "mr" ? "प्रमाण" : "Water per acre/session"}:</b> {result.ltr * Number(acres || 1)} L</li>
            <li><b>{lang === "mr" ? "पुढील पाणी" : "Next watering"}:</b> {result.next}</li>
          </ul>
          <div className="mt-3 text-xs text-muted-foreground">{lang === "mr" ? "पूर सिंचनाच्या तुलनेत बचत" : "Saved vs flood irrigation"}: {result.saved}%</div>
          <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${result.saved}%` }} /></div>
          {wx.data?.days?.some((d) => d.rainMm > 5) && (
            <div className="mt-3 rounded-xl bg-blue-500/15 p-2 text-xs">{lang === "mr" ? "पावसाची शक्यता — पुढील सिंचन पुढे ढकलले." : "Rain expected — next irrigation deferred."}</div>
          )}
        </Card>
      )}
    </ModulePage>
  );
}
