import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Sprout, AlertTriangle, CloudRain, CloudSun, Plus, Bell, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { useVoiceMode } from "@/lib/voice-mode";
import { getForecast } from "@/lib/weather";

export const Route = createFileRoute("/_authenticated/app")({
  component: Dashboard,
});

type Profile = { id: string; full_name: string; village: string; onboarded: boolean; language: string };
type Crop = { id: string; name: string; health_status: "healthy" | "minor" | "urgent" };

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
    enabled: !!user,
  });

  // Sync user's saved language to UI on first load
  useEffect(() => {
    if (profileQ.data?.language && profileQ.data.language !== lang) {
      setLang(profileQ.data.language as "mr" | "en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQ.data?.language]);

  // Onboarding gate
  if (profileQ.isLoading) {
    return <AppShell><div className="py-10 text-center text-muted-foreground">...</div></AppShell>;
  }
  if (profileQ.data && !profileQ.data.onboarded) {
    return <Onboarding onDone={() => profileQ.refetch()} />;
  }

  const village = profileQ.data?.village ?? "";

  return (
    <AppShell>
      <WelcomeHeader name={profileQ.data?.full_name ?? ""} village={village} />

      <WeatherBanner />
      <OutbreakBanner village={village} />
      <RemindersStrip />

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{t("myCrops")}</h2>
          <AddCropButton onAdded={() => {}} />
        </div>
        <CropCards userId={user!.id} voiceOnly={voiceOnly} />
      </section>

      {/* Big quick-action: scan */}
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
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["weather"], queryFn: () => getForecast(), staleTime: 30 * 60 * 1000 });
  if (q.isLoading) return <div className="h-20 animate-pulse rounded-2xl bg-secondary/50" />;
  const w = q.data!;
  const Icon = w.rainExpected ? CloudRain : CloudSun;
  return (
    <div className="mb-3 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <Icon className={`mt-0.5 h-6 w-6 ${w.rainExpected ? "text-blue-500" : "text-[var(--color-sun)]"}`} />
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("weatherAlert")}</div>
        <div className="deva mt-0.5 font-medium">{w.summary.mr}</div>
        <div className="text-sm text-muted-foreground">{w.summary.en}</div>
        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
          {w.days.map((d) => (
            <div key={d.date}>
              <div>{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className="font-medium text-foreground">{d.tempMax}°/{d.tempMin}°</div>
              {d.rainMm > 0 && <div className="text-blue-600">{d.rainMm}mm</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutbreakBanner({ village }: { village: string }) {
  const { t } = useI18n();
  const q = useQuery({
    queryKey: ["outbreak", village],
    enabled: !!village,
    queryFn: async () => {
      const since = new Date(Date.now() - 14 * 86400000).toISOString();
      const { data } = await supabase
        .from("outbreak_signals")
        .select("disease_key")
        .eq("village", village)
        .gte("created_at", since);
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r: { disease_key: string }) => { counts[r.disease_key] = (counts[r.disease_key] || 0) + 1; });
      const top = Object.entries(counts).find(([, n]) => n >= 5);
      return top ? { disease: top[0], count: top[1] } : null;
    },
  });
  if (!q.data) return null;
  return (
    <div className="mb-3 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/15 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-foreground" />
      <div className="text-sm">
        <div className="deva font-medium">{t("outbreakNearby")}</div>
        <div className="text-muted-foreground">{q.data.count} farmers reported "{q.data.disease}" in {village} in the last 14 days.</div>
      </div>
    </div>
  );
}

function RemindersStrip() {
  const { user } = useAuth();
  const { t } = useI18n();
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
  const { t } = useI18n();
  const q = useQuery({
    queryKey: ["crops", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("crops").select("*").eq("user_id", userId).order("created_at");
      if (error) throw error;
      return (data ?? []) as Crop[];
    },
  });
  if (q.isLoading) return <div className="h-24 animate-pulse rounded-2xl bg-secondary/50" />;
  if (!q.data?.length) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
      {t("noScans")}
    </div>;
  }
  return (
    <div className={voiceOnly ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
      {q.data.map((c) => {
        const tone =
          c.health_status === "healthy" ? "border-success/40 bg-success/10"
          : c.health_status === "minor" ? "border-warning/40 bg-warning/15"
          : "border-destructive/40 bg-destructive/10";
        const label = c.health_status === "healthy" ? t("healthy") : c.health_status === "minor" ? t("minor") : t("urgent");
        return (
          <div key={c.id} className={`rounded-2xl border p-4 ${tone}`}>
            <div className="flex items-center gap-2 text-sm font-medium"><Sprout className="h-4 w-4" /> {c.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function AddCropButton({ onAdded }: { onAdded: () => void }) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
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
        const { error } = await supabase.from("crops").insert({ user_id: user!.id, name: name.trim() });
        if (error) return toast.error(error.message);
        setName(""); setAdding(false); onAdded();
        toast.success(lang === "mr" ? "जोडले" : "Added");
      }}
      className="flex items-center gap-2"
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "mr" ? "पीक नाव" : "Crop name"} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm" />
      <button className="chip" type="submit">OK</button>
      <button type="button" onClick={() => setAdding(false)} className="text-xs text-muted-foreground">×</button>
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
