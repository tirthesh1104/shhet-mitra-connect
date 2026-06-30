import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Languages, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { useVoiceMode } from "@/lib/voice-mode";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { voiceOnly, setVoiceOnly } = useVoiceMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  async function saveLang(l: "mr" | "en") {
    setLang(l);
    await supabase.from("profiles").update({ language: l }).eq("id", user!.id);
  }

  async function saveVoice(v: boolean) {
    setVoiceOnly(v);
    await supabase.from("profiles").update({ voice_mode: v }).eq("id", user!.id);
    toast.success(v ? "Voice-only mode on" : "Voice-only mode off");
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold">{t("settings")}</h1>

      <div className="mt-5 space-y-4">
        <Card>
          <Row icon={<Languages className="h-5 w-5" />} title={t("language")}>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => saveLang(l.code)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${lang === l.code ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </Row>
        </Card>

        <Card>
          <Row icon={<Volume2 className="h-5 w-5" />} title={t("voiceOnly")} subtitle={t("voiceOnlyDesc")}>
            <Toggle checked={voiceOnly} onChange={saveVoice} />
          </Row>
        </Card>

        <Card>
          <div className="text-sm">
            <div className="text-muted-foreground">{lang === "mr" ? "खाते" : "Account"}</div>
            <div className="mt-1 font-medium">{profileQ.data?.full_name || user?.email}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            {profileQ.data?.village && <div className="text-xs text-muted-foreground">{profileQ.data.village}</div>}
          </div>
          <button onClick={signOut} className="big-tap mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 text-sm font-medium text-destructive hover:bg-destructive/15">
            <LogOut className="h-4 w-4" /> {t("signOut")}
          </button>
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">{children}</div>;
}
function Row({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
