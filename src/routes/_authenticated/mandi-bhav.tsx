import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { RefreshCw, MapPin, Sprout } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { fetchMandiPrices, MANDI_COMMODITIES } from "@/lib/mandi.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/mandi-bhav")({
  component: MandiBhavPage,
});

const DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
  "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded",
  "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune",
  "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur",
  "Thane", "Wardha", "Washim", "Yavatmal",
];

function MandiBhavPage() {
  const { lang } = useI18n();
  const [district, setDistrict] = useState("");
  const [commodity, setCommodity] = useState("");
  const [nonce, setNonce] = useState(0);
  const call = useServerFn(fetchMandiPrices);

  const q = useQuery({
    queryKey: ["mandi", district, commodity, nonce],
    queryFn: () => call({ data: { district, commodity, forceRefresh: nonce > 0 } }),
    staleTime: 5 * 60 * 1000,
  });

  const rows = q.data?.rows ?? [];

  useEffect(() => {
    if (!import.meta.env.DEV || q.isFetching || !district || !commodity || rows.length > 0 || !q.data?.debug) return;
    console.info("[FasalMitra Mandi Debug] zero records", q.data.debug);
  }, [commodity, district, q.data?.debug, q.isFetching, rows.length]);

  const heading = lang === "mr" ? "मंडी भाव (महाराष्ट्र)" : "Mandi Prices (Maharashtra)";
  const sub = lang === "mr"
    ? "थेट Agmarknet — data.gov.in वरून"
    : "Live from Agmarknet — data.gov.in";

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
        </div>
        <button
          onClick={() => setNonce((n) => n + 1)}
          disabled={q.isFetching}
          className="chip"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} />
          {lang === "mr" ? "रिफ्रेश" : "Refresh"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {lang === "mr" ? "जिल्हा" : "District"}
          </span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="big-tap w-full rounded-2xl border border-border bg-background px-3 text-sm"
          >
            <option value="">{lang === "mr" ? "सर्व" : "All"}</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Sprout className="h-3 w-3" /> {lang === "mr" ? "पीक" : "Crop"}
          </span>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="big-tap w-full rounded-2xl border border-border bg-background px-3 text-sm"
          >
            <option value="">{lang === "mr" ? "सर्व" : "All"}</option>
            {MANDI_COMMODITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      {q.data?.source === "stale" && (
        <div className="mt-3 rounded-2xl border border-warning/40 bg-warning/10 p-3 text-xs">
          {lang === "mr" ? "सध्या नवीन डेटा मिळाला नाही — जुनी माहिती दाखवत आहोत." : "Live fetch failed — showing cached data."}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {q.isLoading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            {lang === "mr" ? "लोड होत आहे…" : "Loading…"}
          </div>
        )}
        {!q.isLoading && rows.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            {lang === "mr"
              ? "सध्या या गावासाठी भाव उपलब्ध नाही"
              : "No prices available for this district/crop right now."}
          </div>
        )}
        {rows.map((r, i) => (
          <div key={`${r.market}-${r.commodity}-${r.arrival_date}-${i}`}
               className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{r.commodity}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {lang === "mr" ? "बाजार" : "Market"}: {r.market} · {lang === "mr" ? "जिल्हा" : "District"}: {r.district}
                </div>
              </div>
              <span className="chip">{r.arrival_date}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <PriceCell label={lang === "mr" ? "किमान भाव" : "Min"} value={r.min_price} />
              <PriceCell label={lang === "mr" ? "कमाल भाव" : "Max"} value={r.max_price} highlight />
              <PriceCell label={lang === "mr" ? "सरासरी भाव" : "Modal"} value={r.modal_price} />
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              ₹ {lang === "mr" ? "प्रति क्विंटल" : "per quintal"}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function PriceCell({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-2 py-2 ${highlight ? "bg-primary/10" : "bg-muted/60"}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-base font-semibold ${highlight ? "text-primary" : ""}`}>
        {value != null ? `₹${value.toLocaleString("en-IN")}` : "—"}
      </div>
    </div>
  );
}
