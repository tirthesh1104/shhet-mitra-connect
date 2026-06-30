import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sprout, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { DISEASES } from "@/data/diseases";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

function JournalPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["scans", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("scans").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const scans = q.data ?? [];
  const totalCost = scans.reduce((sum, s) => sum + (s.cost_estimate ?? 0), 0);
  const diseases = new Set(scans.map((s) => s.disease_key).filter((k) => k !== "healthy")).size;

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("journal")}</h1>
      <p className="text-sm text-muted-foreground deva">{lang === "mr" ? "तुमच्या सर्व तपासण्यांचा एकत्रित नोंदवही" : "All your scans in one place"}</p>

      {scans.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-3 text-center text-sm">
          <Stat label={lang === "mr" ? "तपासण्या" : "Scans"} value={scans.length} />
          <Stat label={lang === "mr" ? "रोग आढळले" : "Diseases"} value={diseases} />
          <Stat label={lang === "mr" ? "अंदाजित खर्च" : "Est. cost"} value={`₹${totalCost}`} />
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {scans.length === 0 && <li className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{t("noScans")}</li>}
        {scans.map((s) => {
          const disease = DISEASES.find((d) => d.key === s.disease_key) ?? DISEASES[0];
          return (
            <li key={s.id}>
              <Link to="/scan/$id" params={{ id: s.id }} className="flex gap-3 rounded-2xl border border-border bg-card p-3 hover:bg-secondary">
                {s.image_url ? <img src={s.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  : <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary"><Sprout className="h-6 w-6 text-muted-foreground" /></div>}
                <div className="min-w-0 flex-1">
                  <div className="deva truncate font-medium">{disease.name.mr}</div>
                  <div className="truncate text-xs text-muted-foreground">{disease.name.en} · {s.crop_name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" /> {new Date(s.created_at).toLocaleDateString()} · {s.confidence}%</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
