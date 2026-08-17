import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sprout, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · FasalMitra" }, { name: "description", content: "Sign in or create your FasalMitra account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/app", replace: true });
  }, [session, loading, navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin + "/app",
          },
        });
        if (error) throw error;
        toast.success(lang === "mr" ? "खाते तयार झाले!" : "Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    // Redirect back to the site root (a public route) so the OAuth callback never
    // lands on a protected path — that is what caused 404s on deployed builds.
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/" });

    if (result.error) { toast.error(result.error.message); setBusy(false); }
  }

  return (
    <main className="surface-warm grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> मुख्यपान · Home
        </Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Sprout className="h-5 w-5" /></span>
              <span className="font-display text-lg font-semibold">{t("appName")}</span>
            </div>
            <button onClick={() => setLang(lang === "mr" ? "en" : "mr")} className="chip" aria-label="Toggle language">
              {lang === "mr" ? "EN" : "मराठी"}
            </button>
          </div>

          <h1 className="font-display text-2xl font-semibold">
            {mode === "signin" ? (lang === "mr" ? "लॉगिन करा" : "Welcome back") : (lang === "mr" ? "नवीन खाते" : "Create account")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="big-tap mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-medium hover:bg-secondary disabled:opacity-60"
          >
            <GoogleMark /> {t("continueGoogle")}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> {lang === "mr" ? "किंवा" : "or"} <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e) => setName(e.target.value)} required
                placeholder={t("fullName")}
                className="big-tap w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-primary"
              />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder={t("email")}
              className="big-tap w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-primary"
            />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              placeholder={t("password")}
              className="big-tap w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-primary"
            />
            <button type="submit" disabled={busy}
              className="big-tap w-full rounded-full bg-primary text-base font-medium text-primary-foreground hover:opacity-95 disabled:opacity-60"
            >
              {busy ? "..." : (mode === "signin" ? t("signIn") : t("signUp"))}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? (lang === "mr" ? "नवीन आहात? खाते तयार करा" : "New here? Create an account")
              : (lang === "mr" ? "आधीच खाते आहे? लॉगिन करा" : "Already have an account? Sign in")}
          </button>
        </div>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.1 4 9.3 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.2 39.6 16 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
