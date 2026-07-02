import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Sprout, AlertTriangle, CloudRain, CloudSun, Plus, Bell, Trash2, Pencil, Calendar as CalIcon, Check, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { OfflineBanner } from "@/components/offline-banner";
import { ProfileScore } from "@/components/profile-score";
import { DailyAdvisory } from "@/components/daily-advisory";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { useVoiceMode } from "@/lib/voice-mode";
import { getForecast } from "@/lib/weather";
import { DISEASES } from "@/data/diseases";

export const Route = createFileRoute("/_authenticated/app")({
  component: Dashboard,
});

type Profile = { id: string; full_name: string; village: string; onboarded: boolean; language: string };
type Crop = { id: string; name: string; health_status: "healthy" | "minor" | "urgent"; area_acres: number | null; sown_at: string | null; soil_type: string | null; notes: string | null; created_at: string };

function Dashboard() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { voiceOnly } = useVoiceMode();
  const navigate = useNavigate();

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user, staleTime: 5 * 60 * 1000,
  });

  const cropsCountQ = useQuery({
    queryKey: ["crops-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("crops").select("id", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
    enabled: !!user, staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (profileQ.data?.language && profileQ.data.language !== lang) {
      setLang(profileQ.data.language as "mr" | "en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQ.data?.language]);

  if (profileQ.isLoading) {
    return <AppShell><div className="py-10 text-center text-muted-foreground">{t("loading")}</div></AppShell>;
  }
  if (profileQ.data && !profileQ.data.onboarded) {
    return <Onboarding onDone={() => profileQ.refetch()} />;
  }

  const village = profileQ.data?.village ?? "";

  return (
    <AppShell>
      <OfflineBanner />
      <WelcomeHeader name={profileQ.data?.full_name ?? ""} village={village} />
      <ProfileScore profile={profileQ.data} cropsCount={cropsCountQ.data ?? 0} />
      <WeatherBanner />
      <DailyAdvisory village={village} crop={cropsCountQ.data ? "mixed" : ""} weather="" />
      <OutbreakBanner village={village} />
      <RemindersStrip />


      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{t("myCrops")}</h2>
          <AddCropButton />
        </div>
        <CropCards userId={user!.id} voiceOnly={voiceOnly} />
      </section>

      <button
        onClick={() => navigate({ to: "/scan" })}
        className="big-tap mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-primary px-6 py-5 text-lg font-medium text-primary-foreground shadow-[var(--shadow-warm)]"
      >
        <Camera className="h-6 w-6" /> {t("scanCrop")}
      </button>
    </AppShell>
  );
}

function WelcomeHeader({ name, village }: { name: string; village: string }) {
  const { lang } = useI18n();
  const greeting = lang === "mr" ? "नमस्कार" : "Hello";
  return (
    <div className="mb-5">
      <h1 className="font-display text-2xl font-semibold leading-tight">
        {greeting}, {name || (lang === "mr" ? "शेतकरी मित्र" : "farmer friend")} 🙏
      </h1>
      {village && <p className="text-sm text-muted-foreground">{village}</p>}
    </div>
  );
}

function WeatherBanner() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["weather"],
    queryFn: () => getForecast(),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000, // auto-refresh every 30 min
  });
  if (q.isLoading || !q.data) return <div className="h-20 animate-pulse rounded-2xl bg-secondary/50" />;
  const w = q.data;
  const Icon = w.rainExpected ? CloudRain : CloudSun;
  const hourly = w.hours.map((h) => ({
    t: new Date(h.time).getHours() + "h",
    temp: h.temp,
  }));
  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-6 w-6 ${w.rainExpected ? "text-blue-500" : "text-[var(--color-sun)]"}`} />
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("weatherAlert")}</div>
          <div className="deva mt-0.5 font-medium">{w.summary.mr}</div>
          <div className="text-sm text-muted-foreground">{w.summary.en}</div>
        </div>
      </div>
      <div className="mt-3 h-24">
        <ResponsiveContainer>
          <LineChart data={hourly}>
            <XAxis dataKey="t" fontSize={9} interval={2} />
            <YAxis fontSize={9} width={24} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 text-[11px] text-muted-foreground">
        {w.days.map((d) => (
          <div key={d.date} className="min-w-[52px] rounded-lg bg-secondary/40 px-2 py-1 text-center">
            <div>{new Date(d.date).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", { weekday: "short" })}</div>
            <div className="font-medium text-foreground">{d.tempMax}°/{d.tempMin}°</div>
            {d.rainMm > 0 && <div className="text-blue-600">{d.rainMm}mm</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function OutbreakBanner({ village }: { village: string }) {
  const { lang, t } = useI18n();
  const qc = useQueryClient();

  // realtime updates
  useEffect(() => {
    const ch = supabase.channel("outbreak-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "outbreak_signals" }, () => {
        qc.invalidateQueries({ queryKey: ["outbreak-top", village] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [village, qc]);

  const q = useQuery({
    queryKey: ["outbreak-top", village],
    enabled: !!village,
    queryFn: async () => {
      const since = new Date(Date.now() - 14 * 86400000).toISOString();
      // include user's own village + nearby (any) — pick top by count
      const { data } = await supabase.from("outbreak_signals").select("village, disease_key").gte("created_at", since);
      const map = new Map<string, { village: string; disease: string; count: number }>();
      (data ?? []).forEach((r: { village: string; disease_key: string }) => {
        const k = `${r.village}|${r.disease_key}`;
        const cur = map.get(k) ?? { village: r.village, disease: r.disease_key, count: 0 };
        cur.count++; map.set(k, cur);
      });
      const arr = [...map.values()].sort((a, b) => b.count - a.count);
      return arr.find((x) => x.village === village && x.count >= 3) ?? arr.find((x) => x.count >= 5) ?? null;
    },
  });
  if (!q.data) return null;
  const d = DISEASES.find((x) => x.key === q.data!.disease);
  const label = d ? d.name[lang] : q.data.disease;
  return (
    <div className="mb-3 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/15 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-foreground" />
      <div className="text-sm">
        <div className="deva font-medium">{t("outbreakNearby")}</div>
        <div className="text-muted-foreground">
          {q.data.count} {lang === "mr" ? "अहवाल" : "reports"} · {label} · {q.data.village}
        </div>
      </div>
    </div>
  );
}

function RemindersStrip() {
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase.channel("reminders-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "reminders", filter: `user_id=eq.${user?.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["reminders", user?.id] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, qc]);
  const q = useQuery({
    queryKey: ["reminders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("reminders").select("*")
        .eq("user_id", user!.id).eq("done", false).gte("due_date", today)
        .order("due_date").limit(3);
      return data ?? [];
    },
  });
  if (!q.data?.length) return null;
  return (
    <div className="mb-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Bell className="h-4 w-4" /> {t("reminders")}</div>
      <ul className="space-y-1.5 text-sm">
        {q.data.map((r: { id: string; title: string; due_date: string }) => (
          <li key={r.id} className="flex items-center justify-between">
            <span>{r.title}</span>
            <span className="text-muted-foreground">{r.due_date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CropCards({ userId, voiceOnly }: { userId: string; voiceOnly: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const ch = supabase.channel("crops-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "crops", filter: `user_id=eq.${userId}` }, () => {
        qc.invalidateQueries({ queryKey: ["crops", userId] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc]);

  const q = useQuery({
    queryKey: ["crops", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("crops").select("*").eq("user_id", userId).order("created_at");
      if (error) throw error;
      return (data ?? []) as Crop[];
    },
  });

  const scanCountQ = useQuery({
    queryKey: ["scan-counts", userId],
    queryFn: async () => {
      const { data } = await supabase.from("scans").select("crop_name, created_at").eq("user_id", userId).order("created_at", { ascending: false });
      const map: Record<string, { count: number; last: string }> = {};
      (data ?? []).forEach((s: { crop_name: string; created_at: string }) => {
        if (!map[s.crop_name]) map[s.crop_name] = { count: 0, last: s.created_at };
        map[s.crop_name].count++;
      });
      return map;
    },
  });

  if (q.isLoading) return <div className="h-24 animate-pulse rounded-2xl bg-secondary/50" />;
  if (!q.data?.length) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
      {lang === "mr" ? "अद्याप पीक जोडलेले नाही" : "No crops added yet"}
    </div>;
  }

  async function deleteCrop(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    const { error } = await supabase.from("crops").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(lang === "mr" ? "काढले" : "Deleted");
  }

  return (
    <div className={voiceOnly ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
      {q.data.map((c) => {
        const stats = scanCountQ.data?.[c.name];
        const tone =
          c.health_status === "healthy" ? "border-success/40 bg-success/10"
          : c.health_status === "minor" ? "border-warning/40 bg-warning/15"
          : "border-destructive/40 bg-destructive/10";
        const label = c.health_status === "healthy" ? t("healthy") : c.health_status === "minor" ? t("minor") : t("urgent");
        if (editing === c.id) {
          return <EditCropCard key={c.id} crop={c} onDone={() => setEditing(null)} tone={tone} />;
        }
        const isOpen = expanded === c.id;
        return (
          <div key={c.id} className={`rounded-2xl border p-4 ${tone}`}>
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => setExpanded(isOpen ? null : c.id)} className="flex flex-1 items-center gap-2 text-left text-sm font-medium">
                <Sprout className="h-4 w-4" /> {c.name}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(c.id)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-background/60" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteCrop(c.id)} className="grid h-7 w-7 place-items-center rounded-full text-destructive hover:bg-destructive/15" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            {isOpen && (
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <Detail k={lang === "mr" ? "पेरणी" : "Sown"} v={c.sown_at ?? "—"} />
                <Detail k={lang === "mr" ? "क्षेत्र" : "Area"} v={c.area_acres ? `${c.area_acres} acre` : "—"} />
                <Detail k={lang === "mr" ? "माती" : "Soil"} v={c.soil_type ?? "—"} />
                <Detail k={lang === "mr" ? "तपासण्या" : "Scans"} v={String(stats?.count ?? 0)} />
                <Detail k={lang === "mr" ? "शेवटची तपासणी" : "Last scan"} v={stats ? new Date(stats.last).toLocaleDateString() : "—"} />
                <Detail k={lang === "mr" ? "आरोग्य" : "Health"} v={label} />
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}
function Detail({ k, v }: { k: string; v: string }) {
  return <><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></>;
}

function EditCropCard({ crop, onDone, tone }: { crop: Crop; onDone: () => void; tone: string }) {
  const { lang } = useI18n();
  const [name, setName] = useState(crop.name);
  const [area, setArea] = useState<string>(crop.area_acres?.toString() ?? "");
  const [sownAt, setSownAt] = useState(crop.sown_at ?? "");
  const [soil, setSoil] = useState(crop.soil_type ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="space-y-2 text-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "mr" ? "नाव" : "Name"} className="w-full rounded-xl border border-border bg-background px-3 py-1.5" />
        <div className="grid grid-cols-2 gap-2">
          <input value={area} onChange={(e) => setArea(e.target.value)} inputMode="decimal" placeholder={lang === "mr" ? "क्षेत्र (एकर)" : "Area (acre)"} className="rounded-xl border border-border bg-background px-3 py-1.5" />
          <input type="date" value={sownAt} onChange={(e) => setSownAt(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-1.5" />
        </div>
        <select value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-1.5">
          <option value="">{lang === "mr" ? "माती प्रकार" : "Soil type"}</option>
          <option value="black">{lang === "mr" ? "काळी" : "Black"}</option>
          <option value="red">{lang === "mr" ? "लाल" : "Red"}</option>
          <option value="sandy">{lang === "mr" ? "वालुकामय" : "Sandy"}</option>
          <option value="loamy">{lang === "mr" ? "गाळाची" : "Loamy"}</option>
        </select>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onDone} className="grid h-8 w-8 place-items-center rounded-full hover:bg-background/60"><X className="h-4 w-4" /></button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const { error } = await supabase.from("crops").update({
              name: name.trim(), area_acres: area ? Number(area) : null, sown_at: sownAt || null, soil_type: soil || null,
            }).eq("id", crop.id);
            setBusy(false);
            if (error) return toast.error(error.message);
            toast.success(lang === "mr" ? "जतन झाले" : "Saved"); onDone();
          }}
          className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function AddCropButton() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [sownAt, setSownAt] = useState("");
  if (!adding) {
    return (
      <button onClick={() => setAdding(true)} className="chip">
        <Plus className="h-4 w-4" /> {lang === "mr" ? "पीक जोडा" : "Add crop"}
      </button>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const { error } = await supabase.from("crops").insert({
          user_id: user!.id, name: name.trim(),
          area_acres: area ? Number(area) : null, sown_at: sownAt || null,
        });
        if (error) return toast.error(error.message);
        setName(""); setArea(""); setSownAt(""); setAdding(false);
        toast.success(lang === "mr" ? "जोडले" : "Added");
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "mr" ? "पीक नाव" : "Crop name"} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm" />
      <input value={area} onChange={(e) => setArea(e.target.value)} placeholder={lang === "mr" ? "एकर" : "acre"} className="w-16 rounded-full border border-border bg-background px-3 py-1.5 text-sm" />
      <input type="date" value={sownAt} onChange={(e) => setSownAt(e.target.value)} className="rounded-full border border-border bg-background px-2 py-1.5 text-xs" />
      <button className="chip" type="submit"><Check className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => setAdding(false)} className="text-xs text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
    </form>
  );
}

function Onboarding({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? "");
  const [village, setVillage] = useState("");
  const [crop, setCrop] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const { error: e1 } = await supabase.from("profiles").update({
        full_name: fullName, village, language: lang, onboarded: true,
      }).eq("id", user!.id);
      if (e1) throw e1;
      if (crop.trim()) {
        const { error: e2 } = await supabase.from("crops").insert({ user_id: user!.id, name: crop.trim() });
        if (e2) throw e2;
      }
      onDone();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-semibold">{t("onboardTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lang === "mr" ? "ही माहिती तुमच्या स्थानिक सल्ल्यासाठी वापरली जाईल." : "We use this to tailor advice to your area."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label={t("fullName")}><input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="big-tap w-full rounded-2xl border border-border bg-card px-4" /></Field>
          <Field label={t("village")}><input required value={village} onChange={(e) => setVillage(e.target.value)} placeholder={lang === "mr" ? "उदा. वारणा, सांगली" : "e.g. Warana, Sangli"} className="big-tap w-full rounded-2xl border border-border bg-card px-4" /></Field>
          <Field label={t("primaryCrop")}><input required value={crop} onChange={(e) => setCrop(e.target.value)} placeholder={lang === "mr" ? "उदा. कापूस, ऊस, टोमॅटो" : "e.g. Cotton, Sugarcane, Tomato"} className="big-tap w-full rounded-2xl border border-border bg-card px-4" /></Field>
          <button disabled={busy} className="big-tap w-full rounded-full bg-primary font-medium text-primary-foreground hover:opacity-95 disabled:opacity-60">
            {busy ? "..." : t("finish")}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-muted-foreground">{label}</span>{children}</label>;
}

// unused placeholder marker to satisfy strict TS about CalIcon import if unused
void CalIcon;
