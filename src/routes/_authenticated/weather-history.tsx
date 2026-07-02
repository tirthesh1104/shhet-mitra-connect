import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { getHistory } from "@/lib/weather";
import { CloudRain, Thermometer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/weather-history")({
  component: WeatherHistoryPage,
});

function WeatherHistoryPage() {
  const { lang } = useI18n();
  const q = useQuery({
    queryKey: ["weather-history"],
    queryFn: () => getHistory(),
    staleTime: 60 * 60 * 1000,
  });

  const data = (q.data?.days ?? []).map((d) => ({
    date: d.date.slice(5),
    max: d.tempMax,
    min: d.tempMin,
    rain: d.rainMm,
  }));
  const totalRain = data.reduce((s, d) => s + d.rain, 0);
  const avgMax = data.length ? Math.round(data.reduce((s, d) => s + d.max, 0) / data.length) : 0;

  return (
    <AppShell>
      <h1 className="mb-1 font-display text-2xl font-semibold">
        {lang === "mr" ? "हवामान इतिहास (३० दिवस)" : "Weather history (30 days)"}
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {lang === "mr" ? "मागील ३० दिवसांचा पाऊस व तापमान कल" : "Rainfall & temperature trends from the last 30 days"}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><CloudRain className="h-4 w-4" /> {lang === "mr" ? "एकूण पाऊस" : "Total rain"}</div>
          <div className="mt-1 text-2xl font-semibold">{totalRain} mm</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Thermometer className="h-4 w-4" /> {lang === "mr" ? "सरासरी उच्च" : "Avg high"}</div>
          <div className="mt-1 text-2xl font-semibold">{avgMax}°C</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">{lang === "mr" ? "पाऊस (mm)" : "Rainfall (mm)"}</div>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rain" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Area type="monotone" dataKey="rain" stroke="#3b82f6" fill="url(#rain)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-3">
        <div className="mb-2 text-sm font-medium">{lang === "mr" ? "तापमान (°C)" : "Temperature (°C)"}</div>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tmax" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Area type="monotone" dataKey="max" stroke="#f97316" fill="url(#tmax)" />
              <Area type="monotone" dataKey="min" stroke="#0ea5e9" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
