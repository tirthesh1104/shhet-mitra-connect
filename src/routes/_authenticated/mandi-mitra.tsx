import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { MANDI_CROPS } from "@/data/content";

export const Route = createFileRoute("/_authenticated/mandi-mitra")({ component: Page });

const REASONS: Record<string, { mr: string; en: string }> = {
  wheat: { mr: "निर्यात मागणी वाढली", en: "Export demand rising" },
  onion: { mr: "अतिपाऊस झाला", en: "Excess rainfall" },
  tomato: { mr: "स्थिर स्थानिक मागणी", en: "Stable local demand" },
  sugarcane: { mr: "साखर कारखाने वाढ", en: "New sugar mills operational" },
  soybean: { mr: "जागतिक दर वाढले", en: "Global rates up" },
  cotton: { mr: "उत्पादन कमी", en: "Lower production" },
  jowar: { mr: "पौष्टिक अन्नाला मागणी", en: "Healthy-food demand" },
  tur: { mr: "आयात घट", en: "Import shortfall" },
  grape: { mr: "निर्यातीत तेजी", en: "Export boom" },
  pomegranate: { mr: "युरोप मागणी", en: "Europe demand" },
};

function historyForecast(base: number, seed: number) {
  const arr: { m: string; hist: number | null; fcast: number | null }[] = [];
  const now = new Date();
  for (let i = 35; i >= 0; i--) {
    const d = new Date(now); d.setMonth(d.getMonth() - i);
    const noise = ((Math.sin(seed * (i + 1)) + 1) / 2 - 0.5) * base * 0.15;
    arr.push({ m: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), hist: Math.round(base + noise), fcast: null });
  }
  const last = arr[arr.length - 1].hist!;
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now); d.setMonth(d.getMonth() + i);
    arr.push({ m: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), hist: null, fcast: Math.round(last * (1 + i * 0.02 * ((seed % 2) ? 1 : -1))) });
  }
  return arr;
}

function Page() {
  const { t, lang } = useI18n();
  return (
    <ModulePage title={t("modMandi")} subtitle={lang === "mr" ? "पुढील हंगामाचा मागणी अंदाज" : "Next-season demand forecast"}>
      <div className="space-y-3">
        {MANDI_CROPS.map((c, i) => {
          const T = c.trend === "up" ? TrendingUp : c.trend === "down" ? TrendingDown : Minus;
          const tone = c.trend === "up" ? "success" : c.trend === "down" ? "danger" : "neutral";
          return (
            <Card key={c.key}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs">{i + 1}</span>
                    {lang === "mr" ? c.mr : c.en}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">₹{c.base}/qtl · {REASONS[c.key]?.[lang]}</div>
                </div>
                <Chip tone={tone}><T className="h-3 w-3" /> {c.trend === "up" ? "📈" : c.trend === "down" ? "📉" : "➡️"}</Chip>
              </div>
              <div className="mt-2 h-32">
                <ResponsiveContainer>
                  <AreaChart data={historyForecast(c.base, i + 1)}>
                    <XAxis dataKey="m" fontSize={9} tickLine={false} axisLine={false} interval={5} />
                    <YAxis hide />
                    <Tooltip />
                    <ReferenceLine x={historyForecast(c.base, i + 1).find((d) => d.fcast != null)?.m} stroke="oklch(0.65 0.12 60)" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="hist" stroke="oklch(0.55 0.12 130)" fill="oklch(0.55 0.12 130 / 0.2)" strokeWidth={2} />
                    <Area type="monotone" dataKey="fcast" stroke="oklch(0.65 0.12 60)" fill="oklch(0.65 0.12 60 / 0.2)" strokeDasharray="4 4" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>
    </ModulePage>
  );
}
