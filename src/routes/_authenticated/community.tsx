import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, MapPin, Users, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { DISEASES } from "@/data/diseases";

export const Route = createFileRoute("/_authenticated/community")({
  component: CommunityPage,
});

function CommunityPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase.channel("outbreaks-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "outbreak_signals" }, () => {
        qc.invalidateQueries({ queryKey: ["outbreaks-all"] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const q = useQuery({
    queryKey: ["outbreaks-all"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data } = await supabase.from("outbreak_signals").select("village, disease_key, created_at").gte("created_at", since);
      const map = new Map<string, { count: number; latest: string }>();
      (data ?? []).forEach((r: { village: string; disease_key: string; created_at: string }) => {
        const k = `${r.village}|${r.disease_key}`;
        const cur = map.get(k) ?? { count: 0, latest: r.created_at };
        cur.count++;
        if (r.created_at > cur.latest) cur.latest = r.created_at;
        map.set(k, cur);
      });
      return [...map.entries()]
        .map(([k, v]) => { const [village, disease] = k.split("|"); return { village, disease, ...v }; })
        .filter((r) => r.count >= 2)
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 60_000, refetchOnWindowFocus: true,
  });

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("community")}</h1>
      <p className="deva text-sm text-muted-foreground">{lang === "mr" ? "तुमच्या भागातील रोगांची सद्यस्थिती (लाइव्ह)" : "Live disease activity in nearby villages"}</p>

      <ul className="mt-5 space-y-3">
        {(!q.data || q.data.length === 0) && (
          <li className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{t("noAlerts")}</li>
        )}
        {q.data?.map((r) => {
          const disease = DISEASES.find((d) => d.key === r.disease) ?? DISEASES[0];
          const urgent = r.count >= 5;
          const tip = lang === "mr"
            ? "शिफारस: लगेच शेतात फेरफटका मारा व लक्षणे तपासा. आवश्यक असल्यास सेंद्रिय फवारणी करा."
            : "Tip: Inspect fields immediately. Apply organic spray if early symptoms appear.";
          return (
            <li key={r.village + r.disease} className={`rounded-2xl border p-4 ${urgent ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 ${urgent ? "text-destructive" : "text-warning-foreground"}`} />
                <div className="flex-1">
                  <div className="deva font-medium">{disease.name.mr}</div>
                  <div className="text-sm">{disease.name.en}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.village}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{r.count} {lang === "mr" ? "शेतकरी" : "farmers"}</span>
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(r.latest).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded-xl bg-background/50 p-2 text-xs">{tip}</div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

