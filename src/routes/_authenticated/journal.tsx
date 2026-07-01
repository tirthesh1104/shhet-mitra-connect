import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sprout, Calendar, Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { DISEASES } from "@/data/diseases";
import { downloadReportPdf } from "@/lib/pdf-report";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

type Scan = {
  id: string; crop_name: string; disease_key: string; confidence: number; severity: string;
  cost_estimate: number | null; image_url: string | null; created_at: string; user_id: string;
};

function JournalPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("scans-journal")
      .on("postgres_changes", { event: "*", schema: "public", table: "scans", filter: `user_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["scans", user.id] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const q = useQuery({
    queryKey: ["scans", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("scans").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Scan[];
    },
    staleTime: 60_000,
  });

  const profileQ = useQuery({
    queryKey: ["profile-short", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("full_name, village").eq("id", user!.id).maybeSingle()).data,
  });

  const scans = q.data ?? [];
  const totalCost = scans.reduce((sum, s) => sum + (s.cost_estimate ?? 0), 0);
  const diseases = new Set(scans.map((s) => s.disease_key).filter((k) => k !== "healthy")).size;

  async function del(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    const { error } = await supabase.from("scans").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(lang === "mr" ? "काढले" : "Deleted");
  }
  async function downloadPdf(s: Scan) {
    try {
      await downloadReportPdf({
        farmerName: profileQ.data?.full_name ?? "",
        village: profileQ.data?.village ?? "",
        date: new Date(s.created_at).toLocaleDateString(),
        cropName: s.crop_name, imageDataUrl: s.image_url,
        diseaseKey: s.disease_key, confidence: s.confidence, severity: s.severity,
        costEstimate: s.cost_estimate, lang,
      });
      toast.success(lang === "mr" ? "अहवाल डाउनलोड झाला" : "Report downloaded");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("journal")}</h1>
      <p className="deva text-sm text-muted-foreground">{lang === "mr" ? "तुमच्या सर्व तपासण्यांचा एकत्रित नोंदवही" : "All your scans in one place"}</p>

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
            <li key={s.id} className="rounded-2xl border border-border bg-card p-3">
              <Link to="/scan/$id" params={{ id: s.id }} className="flex gap-3">
                {s.image_url ? <img src={s.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  : <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary"><Sprout className="h-6 w-6 text-muted-foreground" /></div>}
                <div className="min-w-0 flex-1">
                  <div className="deva truncate font-medium">{disease.name.mr}</div>
                  <div className="truncate text-xs text-muted-foreground">{disease.name.en} · {s.crop_name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" /> {new Date(s.created_at).toLocaleDateString()} · {s.confidence}%</div>
                </div>
              </Link>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button onClick={() => downloadPdf(s)} className="chip"><FileDown className="h-3.5 w-3.5" /> {t("downloadPdf")}</button>
                <button onClick={() => del(s.id)} className="chip border-destructive/30 text-destructive"><Trash2 className="h-3.5 w-3.5" /> {t("delete")}</button>
              </div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><div className="text-lg font-semibold">{value}</div><div className="text-[11px] text-muted-foreground">{label}</div></div>;
}
