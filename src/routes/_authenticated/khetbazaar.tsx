import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus, Phone, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/khetbazaar")({ component: Page });

function Page() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<"prices" | "sell" | "buy">("prices");
  return (
    <ModulePage title={t("modKhetBazaar")} subtitle={lang === "mr" ? "मंडी भाव व शेतमाल विक्री" : "Mandi prices & crop marketplace"}>
      <div className="mb-3 flex gap-2 text-sm">
        {(["prices", "sell", "buy"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`chip ${tab === k ? "bg-primary text-primary-foreground" : ""}`}>
            {k === "prices" ? (lang === "mr" ? "मंडी भाव" : "Prices") : k === "sell" ? (lang === "mr" ? "विक्री करा" : "Sell") : (lang === "mr" ? "खरेदी करा" : "Buy")}
          </button>
        ))}
      </div>
      {tab === "prices" && <PricesTab />}
      {tab === "sell" && <SellTab />}
      {tab === "buy" && <BuyTab />}
    </ModulePage>
  );
}

type PriceRow = { commodity: string; arrival_date: string; modal_price: number | null };

function PricesTab() {
  const { lang } = useI18n();
  const q = useQuery({
    queryKey: ["mandi-prices-recent"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("mandi_prices")
        .select("commodity, arrival_date, modal_price")
        .eq("state", "Maharashtra")
        .gte("arrival_date", since)
        .order("arrival_date", { ascending: true })
        .limit(2000);
      return (data ?? []) as PriceRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { date: string; price: number }[]>();
    for (const r of q.data ?? []) {
      if (r.modal_price == null) continue;
      const arr = map.get(r.commodity) ?? [];
      arr.push({ date: r.arrival_date, price: Number(r.modal_price) });
      map.set(r.commodity, arr);
    }
    // average per date to smooth across markets
    const out: { commodity: string; series: { date: string; price: number }[] }[] = [];
    for (const [commodity, rows] of map) {
      const byDate = new Map<string, number[]>();
      for (const r of rows) {
        const a = byDate.get(r.date) ?? [];
        a.push(r.price); byDate.set(r.date, a);
      }
      const series = [...byDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, arr]) => ({
          date: date.slice(5),
          price: Math.round(arr.reduce((s, x) => s + x, 0) / arr.length),
        }));
      if (series.length >= 2) out.push({ commodity, series });
    }
    return out.sort((a, b) => a.commodity.localeCompare(b.commodity));
  }, [q.data]);

  if (q.isLoading) {
    return <Card><div className="text-center text-sm text-muted-foreground">{lang === "mr" ? "लोड होत आहे…" : "Loading…"}</div></Card>;
  }

  if (grouped.length === 0) {
    return (
      <Card>
        <div className="text-sm text-muted-foreground">
          {lang === "mr" ? "अद्याप लाइव्ह भाव उपलब्ध नाहीत." : "No live prices cached yet."}
        </div>
        <Link to="/mandi-bhav" className="chip mt-3 bg-primary text-primary-foreground">
          <ExternalLink className="h-3.5 w-3.5" /> {lang === "mr" ? "थेट मंडी भाव पाहा" : "Open Mandi Bhav"}
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {grouped.map(({ commodity, series }) => {
        const first = series[0].price;
        const today = series[series.length - 1].price;
        const delta = today - first;
        const trend = delta > first * 0.02 ? "up" : delta < -first * 0.02 ? "down" : "stable";
        const T = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
        const tone = trend === "up" ? "success" : trend === "down" ? "danger" : "neutral";
        const prices = series.map((d) => d.price);
        const hi = Math.max(...prices); const lo = Math.min(...prices);
        return (
          <Card key={commodity}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{commodity}</div>
                <div className="text-xs text-muted-foreground">₹{today.toLocaleString("en-IN")}/qtl · {lang === "mr" ? "ताजा" : "latest"}</div>
              </div>
              <Chip tone={tone}><T className="h-3 w-3" /> {trend}</Chip>
            </div>
            <div className="mt-2 h-24">
              <ResponsiveContainer>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="2 4" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{lang === "mr" ? "उच्च" : "High"}: ₹{hi.toLocaleString("en-IN")}</span>
              <span>{lang === "mr" ? "कमी" : "Low"}: ₹{lo.toLocaleString("en-IN")}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SellTab() {
  const { user } = useAuth(); const { lang } = useI18n();
  const [form, setForm] = useState({ crop_name: "", quantity_qtl: "", price_per_qtl: "", village: "", phone: "" });
  const qc = useQueryClient();
  return (
    <Card>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <input placeholder={lang === "mr" ? "पीक" : "Crop"} value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2" />
        <input placeholder={lang === "mr" ? "क्विंटल" : "Quintals"} value={form.quantity_qtl} onChange={(e) => setForm({ ...form, quantity_qtl: e.target.value })} inputMode="decimal" className="rounded-xl border border-border bg-background px-3 py-2" />
        <input placeholder={lang === "mr" ? "अपेक्षित भाव ₹/qtl" : "Expected ₹/qtl"} value={form.price_per_qtl} onChange={(e) => setForm({ ...form, price_per_qtl: e.target.value })} inputMode="decimal" className="rounded-xl border border-border bg-background px-3 py-2" />
        <input placeholder={lang === "mr" ? "गाव" : "Village"} value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2" />
        <input placeholder={lang === "mr" ? "फोन" : "Phone"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2 sm:col-span-2" />
      </div>
      <button
        onClick={async () => {
          if (!form.crop_name || !form.quantity_qtl || !form.price_per_qtl) return toast.error(lang === "mr" ? "सर्व फील्ड भरा" : "Fill required fields");
          const seller = (user?.user_metadata?.full_name as string) ?? "Farmer";
          const { error } = await supabase.from("marketplace_listings").insert({
            user_id: user!.id, crop_name: form.crop_name, quantity_qtl: Number(form.quantity_qtl),
            price_per_qtl: Number(form.price_per_qtl), village: form.village || null, phone: form.phone || null, seller_name: seller,
          });
          if (error) return toast.error(error.message);
          setForm({ crop_name: "", quantity_qtl: "", price_per_qtl: "", village: "", phone: "" });
          toast.success(lang === "mr" ? "यादीत जोडले" : "Listed"); qc.invalidateQueries({ queryKey: ["marketplace"] });
        }}
        className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground"><Send className="mr-1 inline h-4 w-4" /> {lang === "mr" ? "यादीत जोडा" : "List for sale"}</button>
    </Card>
  );
}

function BuyTab() {
  const { lang } = useI18n(); const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase.channel("mkt-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "marketplace_listings" }, () => qc.invalidateQueries({ queryKey: ["marketplace"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  const q = useQuery({
    queryKey: ["marketplace"],
    queryFn: async () => ((await supabase.from("marketplace_listings").select("*").eq("status", "active").order("created_at", { ascending: false })).data ?? []),
    staleTime: 60_000,
  });
  return (
    <div className="space-y-3">
      {(q.data ?? []).length === 0 && <Card><div className="text-center text-sm text-muted-foreground">{lang === "mr" ? "अद्याप यादी नाही" : "No active listings"}</div></Card>}
      {(q.data ?? []).map((l: { id: string; crop_name: string; quantity_qtl: number; price_per_qtl: number; village: string | null; phone: string | null; seller_name: string }) => (
        <Card key={l.id}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">{l.crop_name} · {l.quantity_qtl} qtl</div>
              <div className="text-xs text-muted-foreground">₹{l.price_per_qtl}/qtl · {l.village ?? "—"} · {l.seller_name}</div>
            </div>
            {l.phone && (
              <a href={`tel:${l.phone}`} className="chip bg-primary text-primary-foreground"><Phone className="h-3.5 w-3.5" /> {lang === "mr" ? "संपर्क" : "Contact"}</a>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
