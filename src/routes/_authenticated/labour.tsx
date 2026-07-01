import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/labour")({ component: Page });

const KINDS = ["labour", "tractor", "sprayer", "harvester"];

function Page() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<"need" | "offer">("need");
  return (
    <ModulePage title={t("modLabour")} subtitle={lang === "mr" ? "मजूर व यंत्र शेअरिंग" : "Farm labour & equipment sharing"}>
      <div className="mb-3 flex gap-2 text-sm">
        <button onClick={() => setTab("need")} className={`chip ${tab === "need" ? "bg-primary text-primary-foreground" : ""}`}>{lang === "mr" ? "मदत हवी" : "Need help"}</button>
        <button onClick={() => setTab("offer")} className={`chip ${tab === "offer" ? "bg-primary text-primary-foreground" : ""}`}>{lang === "mr" ? "मदत देणार" : "Offer help"}</button>
      </div>
      <NewListing offerOrNeed={tab} />
      <Listings filter={tab} />
    </ModulePage>
  );
}

function NewListing({ offerOrNeed }: { offerOrNeed: "need" | "offer" }) {
  const { user } = useAuth(); const { lang } = useI18n(); const qc = useQueryClient();
  const [form, setForm] = useState({ kind: "labour", description: "", date_needed: "", village: "", phone: "", rate_per_day: "" });
  return (
    <Card>
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2">
          {KINDS.map((k) => <option key={k}>{k}</option>)}
        </select>
        <input type="date" value={form.date_needed} onChange={(e) => setForm({ ...form, date_needed: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2" />
        <input value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder={lang === "mr" ? "गाव" : "Village"} className="rounded-xl border border-border bg-background px-3 py-2" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={lang === "mr" ? "फोन" : "Phone"} className="rounded-xl border border-border bg-background px-3 py-2" />
        <input inputMode="decimal" value={form.rate_per_day} onChange={(e) => setForm({ ...form, rate_per_day: e.target.value })} placeholder="₹/day" className="rounded-xl border border-border bg-background px-3 py-2" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={lang === "mr" ? "तपशील" : "Details"} className="rounded-xl border border-border bg-background px-3 py-2 sm:col-span-3" />
      </div>
      <button
        onClick={async () => {
          const poster = (user?.user_metadata?.full_name as string) ?? "Farmer";
          const { error } = await supabase.from("labour_listings").insert({
            user_id: user!.id, kind: form.kind, offer_or_need: offerOrNeed,
            description: form.description || null, date_needed: form.date_needed || null,
            village: form.village || null, phone: form.phone || null,
            rate_per_day: form.rate_per_day ? Number(form.rate_per_day) : null, poster_name: poster,
          });
          if (error) return toast.error(error.message);
          toast.success(lang === "mr" ? "पोस्ट झाले" : "Posted"); qc.invalidateQueries({ queryKey: ["labour"] });
        }}
        className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground"><Send className="mr-1 inline h-4 w-4" /> {lang === "mr" ? "पोस्ट करा" : "Post"}</button>
    </Card>
  );
}

function Listings({ filter }: { filter: "need" | "offer" }) {
  const { lang } = useI18n(); const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase.channel("lab-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "labour_listings" }, () => qc.invalidateQueries({ queryKey: ["labour"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  const q = useQuery({
    queryKey: ["labour"],
    queryFn: async () => ((await supabase.from("labour_listings").select("*").order("created_at", { ascending: false })).data ?? []),
  });
  const items = (q.data ?? []).filter((l: { offer_or_need: string }) => l.offer_or_need === filter);
  return (
    <div className="mt-3 space-y-2">
      {items.length === 0 && <Card><div className="text-sm text-muted-foreground">{lang === "mr" ? "अद्याप यादी नाही" : "No listings yet"}</div></Card>}
      {items.map((l: { id: string; kind: string; description: string | null; village: string | null; phone: string | null; rate_per_day: number | null; poster_name: string; date_needed: string | null }) => (
        <Card key={l.id}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-medium"><Chip tone="info">{l.kind}</Chip>{l.village ?? "—"}</div>
              <div className="mt-1 text-xs text-muted-foreground">{l.description ?? ""}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{l.poster_name} · {l.date_needed ?? ""} {l.rate_per_day ? ` · ₹${l.rate_per_day}/day` : ""}</div>
            </div>
            {l.phone && <a href={`tel:${l.phone}`} className="chip bg-primary text-primary-foreground"><Phone className="h-3.5 w-3.5" /></a>}
          </div>
        </Card>
      ))}
    </div>
  );
}
