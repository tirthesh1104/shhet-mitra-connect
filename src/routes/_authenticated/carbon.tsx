import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Star } from "lucide-react";
import { ModulePage, Card } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/carbon")({ component: Page });

const CROP_FACTOR: Record<string, number> = { Wheat: 0.9, Cotton: 1.1, Sugarcane: 1.3, Soybean: 0.8, Tomato: 0.6, Onion: 0.5, Jowar: 0.7 };

function Page() {
  const { t, lang } = useI18n();
  const [crop, setCrop] = useState("Wheat");
  const [acres, setAcres] = useState("1");
  const [method, setMethod] = useState<"organic" | "mixed" | "chemical">("organic");
  const [result, setResult] = useState<null | { score: number; kg: number; stars: number }>(null);

  function compute() {
    const base = CROP_FACTOR[crop] ?? 1;
    const methodMul = method === "organic" ? 1.4 : method === "mixed" ? 1.0 : 0.5;
    const score = Math.min(100, Math.round(base * methodMul * 55));
    const kg = Math.round(Number(acres || 1) * base * methodMul * 850);
    const stars = Math.max(1, Math.min(3, Math.ceil(score / 34)));
    setResult({ score, kg, stars });
  }

  return (
    <ModulePage title={t("modCarbon")} subtitle={lang === "mr" ? "तुमच्या शेतीचा कार्बन स्कोर" : "Your farm carbon score"}>
      <Card>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2">
            {Object.keys(CROP_FACTOR).map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={acres} onChange={(e) => setAcres(e.target.value)} inputMode="decimal" placeholder="acres" className="rounded-xl border border-border bg-background px-3 py-2" />
          <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="rounded-xl border border-border bg-background px-3 py-2">
            <option value="organic">{lang === "mr" ? "सेंद्रिय" : "Organic"}</option>
            <option value="mixed">{lang === "mr" ? "मिश्र" : "Mixed"}</option>
            <option value="chemical">{lang === "mr" ? "रासायनिक" : "Chemical"}</option>
          </select>
        </div>
        <button onClick={compute} className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground">{lang === "mr" ? "अंदाज काढा" : "Estimate"}</button>
      </Card>
      {result && (
        <Card className="mt-3 border border-success/40 bg-success/10">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-success-foreground" />
            <div>
              <div className="font-semibold">{lang === "mr" ? "कार्बन स्कोर" : "Carbon score"}: {result.score}/100</div>
              <div className="text-sm text-muted-foreground">CO₂ offset: {result.kg.toLocaleString()} kg / {lang === "mr" ? "हंगाम" : "season"}</div>
              <div className="mt-1 flex">{Array.from({ length: 3 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < result.stars ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
              ))}</div>
            </div>
          </div>
        </Card>
      )}
      <Card className="mt-3">
        <div className="text-sm font-medium">{lang === "mr" ? "कार्बन क्रेडिट म्हणजे काय?" : "What are carbon credits?"}</div>
        <p className="mt-1 text-sm">{lang === "mr"
          ? "शेतकऱ्याने कमी उत्सर्जनाच्या पद्धती वापरल्यास (सेंद्रिय, कमी मशागत, कव्हर पिके), त्या CO₂ बचतीचे 'क्रेडिट्स' विकून अतिरिक्त पैसे मिळू शकतात."
          : "By adopting low-emission practices (organic, no-till, cover crops), farmers earn 'credits' for CO₂ saved that can be sold on voluntary markets."}
        </p>
        <div className="mt-3 text-sm font-medium">{lang === "mr" ? "मुख्य कार्यक्रम" : "Major programs"}</div>
        <ul className="mt-1 space-y-1 text-sm">
          <li>• <b>Verra (VCS)</b> — {lang === "mr" ? "जागतिक स्वैच्छिक बाजार." : "Global voluntary market."}</li>
          <li>• <b>Gold Standard</b> — {lang === "mr" ? "समुदाय-केंद्रित उच्च-प्रामाणिकता क्रेडिट्स." : "Community-focused high-integrity credits."}</li>
        </ul>
      </Card>
    </ModulePage>
  );
}
