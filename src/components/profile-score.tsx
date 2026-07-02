import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

type ProfileLike = {
  full_name?: string | null;
  village?: string | null;
  language?: string | null;
  onboarded?: boolean | null;
} | null | undefined;

export function ProfileScore({ profile, cropsCount }: { profile: ProfileLike; cropsCount: number }) {
  const { lang } = useI18n();
  const checks = [
    !!profile?.full_name,
    !!profile?.village,
    !!profile?.language,
    !!profile?.onboarded,
    cropsCount > 0,
  ];
  const done = checks.filter(Boolean).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);
  const r = 22, c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  const color = pct >= 80 ? "var(--color-primary)" : pct >= 40 ? "var(--color-sun)" : "var(--color-warning, #f59e0b)";

  return (
    <Link to="/settings" className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] hover:bg-secondary/40">
      <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
        <circle cx="28" cy="28" r={r} stroke="hsl(var(--muted))" strokeWidth="5" fill="none" opacity="0.4" />
        <circle
          cx="28" cy="28" r={r}
          stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 28 28)"
        />
        <text x="28" y="32" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">{pct}%</text>
      </svg>
      <div className="flex-1">
        <div className="text-sm font-semibold">{lang === "mr" ? "प्रोफाइल पूर्णता" : "Profile completion"}</div>
        <div className="text-xs text-muted-foreground">
          {lang === "mr" ? `${done}/${total} पूर्ण — अधिक भरा` : `${done}/${total} complete — fill more for better advice`}
        </div>
      </div>
    </Link>
  );
}
