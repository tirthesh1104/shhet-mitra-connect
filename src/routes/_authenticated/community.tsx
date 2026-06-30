import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { DISEASES } from "@/data/diseases";

export const Route = createFileRoute("/_authenticated/community")({
  component: CommunityPage,
});

function CommunityPage() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["outbreaks-all"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data } = await supabase.from("outbreak_signals").select("village, disease_key").gte("created_at", since);
      const map = new Map<string, number>();
      (data ?? []).forEach((r: { village: string; disease_key: string }) => {
        const k = `${r.village}|${r.disease_key}`;
        map.set(k, (map.get(k) || 0) + 1);
      });
      return [...map.entries()]
        .map(([k, count]) => { const [village, disease] = k.split("|"); return { village, disease, count }; })
        .filter((r) => r.count >= 2)
        .sort((a, b) => b.count - a.count);
    },
  });

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("community")}</h1>
      <p className="text-sm text-muted-foreground deva">{lang === "mr" ? "तुमच्या भागातील रोगांची सद्यस्थिती" : "Disease activity in nearby villages"}</p>

      <ul className="mt-5 space-y-3">
        {(!q.data || q.data.length === 0) && (
          <li className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{t("noAlerts")}</li>
        )}
        {q.data?.map((r) => {
          const disease = DISEASES.find((d) => d.key === r.disease) ?? DISEASES[0];
          const urgent = r.count >= 5;
          return (
            <li key={r.village + r.disease} className={`flex items-start gap-3 rounded-2xl border p-4 ${urgent ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10"}`}>
              <AlertTriangle className={`mt-0.5 h-5 w-5 ${urgent ? "text-destructive" : "text-warning-foreground"}`} />
              <div className="flex-1">
                <div className="deva font-medium">{disease.name.mr}</div>
                <div className="text-sm">{disease.name.en}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {r.village} · {r.count} reports</div>
              </div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
