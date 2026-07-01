import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Camera, BookOpen, Bell, Settings as Cog, Menu, Sprout, X, Languages } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useVoiceMode } from "@/lib/voice-mode";

const MODULES: Array<{ to: string; key: Parameters<ReturnType<typeof useI18n>["t"]>[0]; icon?: ReactNode }> = [
  { to: "/app", key: "dashboard" },
  { to: "/scan", key: "modScan" },
  { to: "/journal", key: "modJournal" },
  { to: "/community", key: "modCommunity" },
  { to: "/calendar", key: "modCalendar" },
  { to: "/yield", key: "modYield" },
  { to: "/schemes", key: "modSchemes" },
  { to: "/side-income", key: "modSideIncome" },
  { to: "/forum", key: "modForum" },
  { to: "/khetbazaar", key: "modKhetBazaar" },
  { to: "/paani", key: "modPaani" },
  { to: "/krishikarz", key: "modKrishiKarz" },
  { to: "/beej", key: "modBeej" },
  { to: "/mandi-mitra", key: "modMandi" },
  { to: "/kharch", key: "modKharch" },
  { to: "/kendra", key: "modKendra" },
  { to: "/climate", key: "modClimate" },
  { to: "/debt-free", key: "modDebtFree" },
  { to: "/soil", key: "modSoil" },
  { to: "/labour", key: "modLabour" },
  { to: "/carbon", key: "modCarbon" },
  { to: "/settings", key: "settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { voiceOnly } = useVoiceMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="surface-warm min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/app" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">{t("appName")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "mr" ? "en" : "mr")} className="chip" aria-label="Toggle language">
              <Languages className="h-4 w-4" /> {lang === "mr" ? "EN" : "मराठी"}
            </button>
            <button onClick={() => setDrawerOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-secondary" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className={voiceOnly ? "mx-auto max-w-3xl px-4 py-6 text-lg" : "mx-auto max-w-3xl px-4 py-6"}>
        {children}
      </main>

      {/* Bottom nav (mobile-first) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          <BottomTab to="/app" icon={<Home />} label={t("dashboard")} active={location.pathname === "/app"} />
          <BottomTab to="/scan" icon={<Camera />} label={t("modScan")} active={location.pathname.startsWith("/scan")} />
          <BottomTab to="/journal" icon={<BookOpen />} label={t("modJournal")} active={location.pathname === "/journal"} />
          <BottomTab to="/community" icon={<Bell />} label={t("modCommunity")} active={location.pathname === "/community"} />
          <BottomTab to="/settings" icon={<Cog />} label={t("settings")} active={location.pathname === "/settings"} />
        </div>
      </nav>

      {/* Drawer for all modules */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{t("appName")}</h3>
              <button onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {MODULES.map((m) => (
                <li key={m.to}>
                  <Link
                    to={m.to as "/app"}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-2xl border border-border bg-background p-3 text-sm font-medium hover:bg-secondary"
                  >
                    {t(m.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}

function BottomTab({ to, icon, label, active }: { to: string; icon: ReactNode; label: string; active: boolean }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate({ to: to as "/app" })}
      className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      <span className={`grid h-7 w-7 place-items-center ${active ? "scale-110" : ""}`}>{icon}</span>
      <span className="truncate px-1">{label}</span>
    </button>
  );
}
