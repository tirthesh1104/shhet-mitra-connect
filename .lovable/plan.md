This is a large scope (2 critical bugs + weather overhaul + dashboard cards + 11 new feature modules + 9 new tables). I'll ship it in 4 phases so we can verify each phase before piling on the next. If you want to reorder or drop anything, tell me before I start Phase A.

## Phase A — Critical bug fixes (ship first, standalone)

**A1. PDF oklch crash** (`src/lib/pdf-report.ts`)
- Before `html2canvas`, walk the cloned node tree, read `getComputedStyle`, and rewrite any color/background/border/fill/stroke value containing `oklch(...)` to a hex fallback.
- Use a small oklch→sRGB converter (no new dep — ~40 lines) so the fallback matches the actual theme color, not a hard-coded palette.
- Force `backgroundColor: "#FBF7EE"` on html2canvas (already set) and add `onclone` hook as the sanitization point so the live DOM is untouched.

**A2. Calendar month length** (`src/routes/_authenticated/calendar.tsx`)
- Replace hard-coded 31-day grid with `new Date(year, month + 1, 0).getDate()`.
- Align first cell to `new Date(year, month, 1).getDay()` (leading blanks stay empty).
- Wire Prev/Next buttons, header shows `"<मराठी महिना> YYYY / <English month> YYYY"`, default to today's month in 2026.

## Phase B — Weather + Dashboard polish

- **Weather panel** on dashboard: hourly LineChart (recharts) for today, 7-day cards (extend `getForecast`), current temp/humidity/rain/wind/UV chips, "शेवटची अपडेट" timestamp, 30-min auto-refresh, localStorage cache + offline fallback banner.
- **New route** `/_authenticated/weather-history` — Open-Meteo `archive-api` for last 30 days, AreaChart of rainfall + temp, total-mm summary.
- **Daily Advisory card** on dashboard — Lovable AI Gateway (`google/gemini-3-flash-preview`) via a `createServerFn` that takes {weather, crop, lastScan} → Marathi + English advisory. Cached per-day in localStorage so it doesn't re-bill on every mount. WhatsApp share button (`wa.me/?text=...`).
- **Profile completion ring** on dashboard header (SVG circle, counts 6 fields).
- **Global offline banner** in `AppShell` using `navigator.onLine` + `online`/`offline` listeners.

## Phase C — Calendar color dots + Live Monitoring + Mandi upgrades

- **Calendar dots**: aggregate reminders + scans + irrigation schedule + harvest estimates → color-coded dots + legend + tap-to-popup.
- **New route** `/_authenticated/live` — per-crop status cards: growth stage bar computed from `sowing_date`, days-since/until-harvest, weather risk level, last scan summary, next-action chip, 10-min auto-refresh, blinking live dot.
- **Mandi upgrades** in `khetbazaar.tsx` / `mandi-mitra.tsx`: last-updated stamp, refresh button with jitter, ↑/↓/→ vs yesterday, expandable 7-day BarChart per crop.

## Phase D — 11 new feature modules + schema

New Supabase migration (single call) adding: `animals`, `animal_health_logs`, `vaccinations`, `milk_logs`, `field_plots`, `season_expenses`, `season_income`, `market_trips`, `rotation_history` — each with RLS scoped to `auth.uid()` and full GRANTs to `authenticated` + `service_role`.

New routes under `_authenticated/`:
- `field-map.tsx` — Google Maps Platform connector (browser key) with Drawing polygon → area calc → save to `field_plots`. Fallback: SVG grid drawer if connector not linked.
- `rotation.tsx` — form for last 2–3 crops per plot → Lovable AI Gateway suggestion with reasoning.
- `fertilizer.tsx` — static NPK lookup table (crop × soil) → Urea/DAP/MOP kg + ₹ cost.
- `animals.tsx` — CRUD + vaccination reminders (7-day alert) + emergency vet call button; **milk log tab** with morning/evening entry, weekly/monthly totals, LineChart, income estimate.
- `pnl.tsx` — expense + income forms → PieChart breakdown + season comparison (uses `season_expenses` + `season_income`).
- `footprint.tsx` — carbon score form → rating + tips + RadarChart.
- `rainwater.tsx` — added as section inside existing `paani.tsx` (not a new route).
- `market-trips.tsx` — added as tab inside `khetbazaar.tsx` writing to `market_trips` + auto-adds yellow calendar dot.
- `agri-shops.tsx` — geolocation + Google Maps Places (New) via connector, mock fallback.
- `whatsapp-demo.tsx` — styled mock chat + `wa.me` CTA.

Navigation: append all new modules to the "More" drawer in `app-shell.tsx`. Add all Marathi/English strings to `src/lib/i18n.tsx` dict. All charts use `recharts` + `ResponsiveContainer`.

## Notes / decisions I'm defaulting on (say if you disagree)

- **AI advisory + rotation planner** will use Lovable AI Gateway (Gemini Flash), not Groq — same latency, no key setup needed, already wired in the project. If you specifically need Groq, I'll switch and ask for the key.
- **Field map + agri shops** need the Google Maps Platform connector linked; I'll surface the connect prompt when we hit Phase D. Fallback UIs will work without it.
- **Weather history** uses Open-Meteo archive API (no key needed) — matches your existing weather stack.
- Not touching any existing working route, table, or component beyond the surgical points listed above.

Reply "go" and I'll start Phase A immediately, or tell me which phases to cut/reorder.