# FasalMitra Build Plan

This is a very large scope (28 modules, 23 pages, bilingual, voice, Supabase backend with ~12 tables, mock AI, weather, mandi, forum, etc.). To ship something solid rather than 28 half-broken screens, I'll build it in phases. Phase 1 lands a complete, navigable app skeleton with the highest-value features fully working; later phases fill in the rest.

## Phase 1 — Foundation (this turn)
**Goal:** beautiful landing page, design system, bilingual context, auth, dashboard shell, and 4 flagship modules fully working end-to-end.

1. **Design system & i18n**
   - Earthy palette (greens, browns, warm yellows) in `src/styles.css` as oklch tokens; custom button/card variants. Distinctive typography (e.g. Fraunces + Inter via `<link>` in `__root.tsx`).
   - `LanguageProvider` (mr/en) with a `t()` helper and a single translations dictionary, persisted to localStorage. Structured so Hindi/Telugu can drop in later (req 28).
   - `VoiceModeProvider` for the large-icon low-literacy toggle (req 4).

2. **Landing page** (`/`)
   - Generated seedling hero illustration (sprout emerging from soil with water droplets), placed at top, fixed/static, responsive.
   - Bilingual headline "शेतकऱ्याचा डिजिटल मित्र / Your Digital Farming Companion", subtext, CTA to `/auth`.

3. **Lovable Cloud + Auth + Onboarding**
   - Enable Lovable Cloud.
   - Email/password + Google sign-in on `/auth`.
   - `/onboarding` collects name, village, primary crops, language → writes to `profiles` and `crops`.
   - Managed `_authenticated` layout gates the app.

4. **Database (Phase 1 tables)**
   `profiles`, `crops`, `scans`, `community_posts`, `community_replies`, `reminders`, `expert_queue`, `expense_logs`, `outbreak_signals`. All with RLS + GRANTs per project rules. Seed data via migration for diseases, schemes, mandi prices, seed codes, service centers, climate→crop mappings, soil profiles (static JSON in `src/data/`, not tables, for read-only curated content).

5. **Dashboard** (`/_authenticated/`)
   - Multi-crop health cards (green/yellow/red), weather alert banner (Open-Meteo with try/catch → mock fallback), upcoming reminders, price-crash banner, community outbreak banner.
   - Large touch targets; switches to icon-only grid in Voice-Only Mode.

6. **Flagship modules wired fully**
   - **Crop Scan + Result** (`/scan`, `/scan/:id`): upload/capture → mock disease detector (10 diseases JSON) with confidence, severity, organic + chemical treatments (Indian brand names), cost estimate, canvas red/yellow heatmap overlay, Marathi/English side-by-side, Web Speech mic input + speech synthesis playback, "Send to Expert" if confidence <60%, auto-saves to `scans` with weather snapshot. Code structured with a single `detectDisease()` seam clearly commented for a real TFLite swap.
   - **Crop Journal** (`/journal`): timeline of scans + season summary card.
   - **Community Alerts** (`/community`): outbreak banner logic (≥5 same disease in same village within 14 days) using `outbreak_signals` aggregation.
   - **Settings** (`/settings`): language toggle, voice-only mode toggle, sign out.

7. **Navigation shell**
   - Bottom tab bar (mobile-first) + side drawer for the remaining modules; each remaining route gets a real file with a clean "Coming in next phase" placeholder using the design system (so nav never dead-ends). Phase 2 fills them in.

8. **Reliability rails**
   - Every external call (Open-Meteo) wrapped in try/catch with mock fallback.
   - All "AI" / "live" features powered by local JSON or Supabase — no rate-limited dependencies.
   - Skeleton loaders, never blank/error states.

## Phase 2 (next turn, after Phase 1 ships and you confirm direction)
Forum, Schemes matcher, Side-Income, Reminders UI, KhetBazaar (mandi prices + listings + price-crash), PaaniBudget, KrishiKarz chatbot, Beej Tracker, Mandi Mitra forecast.

## Phase 3
Input Cost Tracker, Krishi Kendra finder, Climate-Resilient Crops, Debt-Free Tips, Soil Health Scanner, Labour/Equipment sharing, Carbon Credit Estimator.

## Technical notes
- TanStack Start + Lovable Cloud (Supabase under the hood).
- Server functions only where needed (weather fetch, outbreak aggregation); most reads go through the browser Supabase client with RLS.
- `lucide-react` icons throughout.
- Mock detector lives in `src/lib/disease-detector.ts` with a clearly marked `// TODO: replace with TFLite inference` seam.
- Static curated datasets (diseases, schemes, mandi prices, seed codes, service centers, climate-crop, soil profiles, side-income, debt-free tips) live in `src/data/*.ts` so they're instant and never rate-limited.

## Ask before I start
1. **Phasing OK?** Shipping all 28 modules in one turn would mean every screen is a shallow stub. Phase 1 above gives you a fully working, demo-able core (landing → auth → dashboard → scan → result → journal → community → settings) plus navigable placeholders for the rest. Confirm and I'll build Phase 1 now, then continue.
2. **Auth method:** default to email/password + Google. OK, or email-only / phone OTP instead? (Phone OTP needs extra Twilio-style setup — email + Google is faster and matches the prompt's "phone or email".)