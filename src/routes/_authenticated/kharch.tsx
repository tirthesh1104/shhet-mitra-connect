import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/kharch")({ component: Page });

const CATS = ["seed", "fertilizer", "pesticide", "labour", "irrigation", "other"];

function Page() {
  const { t, lang } = useI18n(); const { user } = useAuth(); const qc = useQueryClient();
  const [form, setForm] = useState({ category: "seed", amount_inr: "", spent_on: new Date().toISOString().slice(0, 10), crop_name: "", note: "" });
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const ch = supabase.channel("expenses")
      .on("postgres_changes", { event: "*", schema: "public", table: "expense_logs", filter: `user_id=eq.${user?.id}` }, () => qc.invalidateQueries({ queryKey: ["expenses", user?.id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, qc]);

  const q = useQuery({
    queryKey: ["expenses", user?.id], enabled: !!user,
    queryFn: async () => ((await supabase.from("expense_logs").select("*").eq("user_id", user!.id).order("spent_on", { ascending: false })).data ?? []),
  });
  const cropsQ = useQuery({
    queryKey: ["crops-list", user?.id], enabled: !!user,
    queryFn: async () => ((await supabase.from("crops").select("name").eq("user_id", user!.id)).data ?? []),
  });
  const total = (q.data ?? []).reduce((s, e) => s + Number(e.amount_inr), 0);
  const profit = revenue - total;

  return (
    <ModulePage title={t("modKharch")} subtitle={lang === "mr" ? "हंगामाचा नफा-तोटा नोंदवा" : "Track season profit & loss"}>
      <Card>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div><div className="text-xs text-muted-foreground">{lang === "mr" ? "एकूण खर्च" : "Total spent"}</div><div className="font-semibold">₹{total.toLocaleString()}</div></div>
          <div>
            <div className="text-xs text-muted-foreground">{lang === "mr" ? "अपेक्षित उत्पन्न" : "Expected revenue"}</div>
            <input type="number" value={revenue || ""} onChange={(e) => setRevenue(Number(e.target.value) || 0)} className="w-full rounded-xl border border-border bg-background px-2 py-1 text-center text-sm" placeholder="₹" />
          </div>
          <div><div className="text-xs text-muted-foreground">{lang === "mr" ? "नफा/तोटा" : "Profit/Loss"}</div><div className={`font-semibold ${profit >= 0 ? "text-success-foreground" : "text-destructive"}`}>₹{profit.toLocaleString()}</div></div>
        </div>
      </Card>
      <Card className="mt-3">
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2">
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input inputMode="decimal" value={form.amount_inr} onChange={(e) => setForm({ ...form, amount_inr: e.target.value })} placeholder="₹" className="rounded-xl border border-border bg-background px-3 py-2" />
          <input type="date" value={form.spent_on} onChange={(e) => setForm({ ...form, spent_on: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2" />
          <select value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2">
            <option value="">{lang === "mr" ? "पीक" : "Crop"}</option>
            {(cropsQ.data ?? []).map((c: { name: string }) => <option key={c.name}>{c.name}</option>)}
          </select>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={lang === "mr" ? "नोंद" : "Note"} className="rounded-xl border border-border bg-background px-3 py-2 sm:col-span-2" />
        </div>
        <button
          onClick={async () => {
            if (!form.amount_inr || !form.crop_name) return toast.error(lang === "mr" ? "रक्कम व पीक भरा" : "Enter amount & crop");
            const { error } = await supabase.from("expense_logs").insert({
              user_id: user!.id, category: form.category, amount_inr: Number(form.amount_inr),
              spent_on: form.spent_on, crop_name: form.crop_name, note: form.note || null,
            });
            if (error) return toast.error(error.message);
            setForm({ ...form, amount_inr: "", note: "" });
            toast.success(lang === "mr" ? "जोडले" : "Added");
          }}
          className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground"><Plus className="mr-1 inline h-4 w-4" /> {lang === "mr" ? "खर्च जोडा" : "Add expense"}</button>
      </Card>
      <div className="mt-3 space-y-2">
        {(q.data ?? []).map((e: { id: string; category: string; amount_inr: number; spent_on: string; crop_name: string; note: string | null }) => (
          <Card key={e.id}>
            <div className="flex items-start justify-between text-sm">
              <div>
                <div className="font-medium">₹{e.amount_inr} · <Chip>{e.category}</Chip></div>
                <div className="text-xs text-muted-foreground">{e.crop_name} · {e.spent_on}{e.note ? ` · ${e.note}` : ""}</div>
              </div>
              <button onClick={async () => { await supabase.from("expense_logs").delete().eq("id", e.id); }} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
