import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/mandi-mitra")({ component: Page });

type Row = { commodity: string; arrival_date: string; modal_price: number | null };

function Page() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["mandi-history"],
    queryFn: async () => {
      const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("mandi_prices")
        .select("commodity, arrival_date, modal_price")
        .eq("state", "Maharashtra")
        .gte("arrival_date", since)
        .order("arrival_date", { ascending: true })
        .limit(4000);
      return (data ?? []) as Row[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const items = useMemo(() => {
    const map = new Map<string, Map<string, number[]>>();
    for (const r of q.data ?? []) {
      if (r.modal_price == null) continue;
      const inner = map.get(r.commodity) ?? new Map<string, number[]>();
      const arr = inner.get(r.arrival_date) ?? [];
      arr.push(Number(r.modal_price));
      inner.set(r.arrival_date, arr);
      map.set(r.commodity, inner);
    }
    const out: { commodity: string; data: { m: string; hist: number | null; fcast: number | null }[]; latest: number; delta: number }[] = [];
    for (const [commodity, inner] of map) {
      const points = [...inner.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, arr]) => ({
          date,
          price: Math.round(arr.reduce((s, x) => s + x, 0) / arr.length),
        }));
      if (points.length < 4) continue;
      const hist = points.map((p) => ({
        m: p.date.slice(5),
        hist: p.price,
        fcast: null as number | null,
      }));
      const last = points[points.length - 1].price;
      // simple linear projection using average delta of last 5 points
      const tail = points.slice(-5);
      const slope = tail.length > 1 ? (tail[tail.length - 1].price - tail[0].price) / (tail.length - 1) : 0;
      const forecast: { m: string; hist: number | null; fcast: number | null }[] = [];
      const now = new Date(points[points.length - 1].date);
      for (let i = 1; i <= 6; i++) {
        const d = new Date(now); d.setMonth(d.getMonth() + i);
        forecast.push({ m: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), hist: null, fcast: Math.max(0, Math.round(last + slope * i * 4)) });
      }
      // bridge the transition
      const bridged: typeof hist = [...hist];
      if (bridged.length > 0) bridged[bridged.length - 1] = { ...bridged[bridged.length - 1], fcast: last };
      const combined = [...bridged, ...forecast];
      out.push({ commodity, data: combined, latest: last, delta: slope });
    }
    return out.sort((a, b) => a.commodity.localeCompare(b.commodity)).slice(0, 12);
  }, [q.data]);

  return (
    <ModulePage title={t("modMandi")} subtitle={lang === "mr" ? "मागील ३ महिन्यांवरून पुढील अंदाज" : "Forecast from last 3 months of live data"}>
      {q.isLoading && <Card><div className="text-center text-sm text-muted-foreground">{lang === "mr" ? "लोड होत आहे…" : "Loading…"}</div></Card>}
      {!q.isLoading && items.length === 0 && (
        <Card>
          <div className="text-sm text-muted-foreground">
            {lang === "mr" ? "अंदाज तयार करण्यासाठी पुरेसा भाव इतिहास नाही." : "Not enough price history yet to build a forecast."}
          </div>
          <Link to="/mandi-bhav" className="chip mt-3 bg-primary text-primary-foreground">
            <ExternalLink className="h-3.5 w-3.5" /> {lang === "mr" ? "थेट मंडी भाव पाहा" : "Open Mandi Bhav"}
          </Link>
        </Card>
      )}
      <div className="space-y-3">
        {items.map(({ commodity, data, latest, delta }, i) => {
          const trend = delta > 5 ? "up" : delta < -5 ? "down" : "stable";
          const T = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
          const tone = trend === "up" ? "success" : trend === "down" ? "danger" : "neutral";
          const bridgeIdx = data.findIndex((d) => d.fcast != null);
          return (
            <Card key={commodity}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs">{i + 1}</span>
                    {commodity}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">₹{latest.toLocaleString("en-IN")}/qtl · {lang === "mr" ? "ताजा" : "latest"}</div>
                </div>
                <Chip tone={tone}><T className="h-3 w-3" /> {trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️"}</Chip>
              </div>
              <div className="mt-2 h-32">
                <ResponsiveContainer>
                  <AreaChart data={data}>
                    <XAxis dataKey="m" fontSize={9} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(data.length / 6))} />
                    <YAxis hide />
                    <Tooltip />
                    {bridgeIdx > 0 && <ReferenceLine x={data[bridgeIdx]?.m} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
                    <Area type="monotone" dataKey="hist" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                    <Area type="monotone" dataKey="fcast" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" strokeDasharray="4 4" strokeWidth={2} />
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
