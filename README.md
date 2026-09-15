# Fasal Mitra App

# FasalMitra — Complete Lovable Prompt (FINAL MERGED VERSION)



Copy the entire prompt below into Lovable.



---



Build "FasalMitra" - an AI-powered Crop Health & Advisory web app for Indian farmers, 

fully bilingual (Marathi + English), mobile-first responsive design with an earthy, 

agricultural color theme (greens, browns, warm yellows).



## LANDING PAGE

- Hero section with a small, charming AI-generated illustration/image placed at 

  the very top/start of the landing page, fixed in position, depicting the 

  process of a seed germinating: a tiny seed planted in soil, water droplets 

  falling on it, and a small delicate green sprout/seedling just emerging out 

  of the soil with two tiny leaves unfurling - like the moment right after a 

  farmer plants a beej and waters it and the first rop starts to come out 

  - similar style/placement to how a hero illustration would appear on a 

  Labour Connector style landing page. Keep it simple, warm, and not overly 

  techy - it should feel organic and rooted in farming. This hero image should 

  remain fixed/static in this exact spot on the landing page, properly sized 

  and responsive, with no layout shifting.

- Headline in Marathi + English: "शेतकऱ्याचा डिजिटल मित्र" / "Your Digital Farming Companion"

- Brief subtext describing the app, CTA button to login/signup

- Keep the rest of landing page minimal and clean



## CORE FEATURES



1. AUTH & ONBOARDING

- Simple signup/login (phone number or email) using Supabase Auth

- Onboarding: collect farmer name, village/location, primary crops grown

- Language toggle: Marathi / English (persist preference)



2. CROP DISEASE DETECTION

- Upload or capture leaf/crop photo

- Show analysis result with: disease name, confidence %, severity level

- Display cause, organic treatment options, and chemical treatment options 

  (with common brand names available in Indian markets)

- Show results in both Marathi and English side by side

- Since this is a demo/mini-project, simulate the AI detection with a realistic 

  mock function that randomly selects from a database of 8-10 common crop diseases 

  (Late Blight, Powdery Mildew, Leaf Curl, Bacterial Spot, etc.) with realistic 

  confidence scores, BUT structure the code so a real TensorFlow Lite model 

  can be plugged in later (clearly comment where the real model call would go)



3. SEVERITY HEATMAP (VISUAL)

- After analysis, overlay simple red/yellow highlighted zones on the uploaded 

  image to simulate disease-affected area detection (use canvas/CSS overlay, 

  doesn't need real image processing for demo)



4. VOICE INPUT/OUTPUT (MARATHI)

- Add a microphone button using Web Speech API for voice input in Marathi

- Add a "speak result" button that reads out the diagnosis and treatment in 

  Marathi using speech synthesis

- Include a "Voice-Only Mode" toggle in settings for low-literacy users - when 

  enabled, show large icon-based navigation with minimal text



5. WEATHER-BASED ALERTS

- Integrate Open-Meteo API for 3-day weather forecast based on farmer's location

- Show alert banner if rain/drought expected, with spraying recommendation 

  ("पाऊस येण्याची शक्यता आहे, फवारणी टाळा")



6. CROP HEALTH HISTORY / "फसल डायरी" (Auto Crop Journal)

- Auto-save every scan with date, photo thumbnail, disease detected, weather 

  at time of scan into a timeline view

- At end of a season (or on demand), generate a summary card: total scans, 

  diseases encountered, estimated total cost spent on treatments



7. MULTI-CROP DASHBOARD

- If farmer has multiple crops registered, show a dashboard with health status 

  cards for each crop (color-coded: green=healthy, yellow=minor issue, red=urgent)



8. COST ESTIMATOR

- For each suggested treatment, show estimated cost range in INR for the 

  recommended pesticide/fertilizer quantity



9. COMMUNITY OUTBREAK ALERT ("शेजारी अलर्ट")

- Mock a community feed: if 5+ farmers in the same village/area have logged 

  the same disease within a time window, show a banner alert to other farmers 

  in that area: "तुमच्या भागात [disease name] पसरत आहे, काळजी घ्या"

- Use a shared Supabase table for this (real-time-ish using polling or Supabase realtime)



10. EXPERT VERIFICATION LOOP

- If mock confidence score is below 60%, show "Low confidence - Send to Expert" 

  button that adds the case to a "pending expert review" queue (mock with a 

  simple status table, no need for real expert backend)



11. GOVERNMENT SCHEME MATCHER

- Based on crop type and detected issue, suggest relevant Indian government 

  schemes (PM-Kisan, PM Fasal Bima Yojana, Soil Health Card Scheme) with a 

  short description and official scheme link

- Use a static curated dataset of 5-6 schemes with matching logic based on crop/issue type



12. SIDE-INCOME SUGGESTIONS ("बोनस उत्पन्न")

- Based on the farmer's main crop, suggest 2-3 intercropping or side-income 

  ideas (beekeeping, vegetable intercropping) from a static curated dataset



13. REMINDER SYSTEM

- Allow farmer to set reminders for next spraying/fertilizing date

- Show upcoming reminders on dashboard, with browser notification if possible



14. FARMER Q&A FORUM (MINI)

- Simple community forum: farmers can post questions, others can reply

- Basic upvote feature, sorted by recent/popular



## NEW MODULES (additional features)



15. KHETBAZAAR MODULE — Live Mandi Price + Direct Selling

- Show live/mock mandi prices per crop (structure code so it could later call 

  Government Agmarknet API; for demo use a realistic mock dataset with price 

  trends over the last 7 days as a graph)

- Farmers can list their crop for direct sale (photo, quantity, expected price)

- Buyers can view listings and "contact seller" via a mock chat/call button 

  (simple in-app message thread is enough for demo)



16. PAANIBUDGET MODULE — Smart Irrigation Scheduler

- Based on crop type + soil type (dropdown selection) + weather data (reuse 

  Open-Meteo integration), generate a simple irrigation schedule: how much 

  water (liters/acre) and when to water next

- Show an estimated "water saved %" compared to traditional flood irrigation, 

  with a friendly sustainability message



17. KRISHIKARZ MODULE — Loan & Subsidy Navigator (Chatbot)

- Simple guided chatbot/form: ask crop type, land size, state

- Based on answers, match and display relevant government schemes/loans/subsidies 

  from a static curated dataset (can reuse/extend the scheme dataset from feature 11)

- Show a step-by-step "how to apply" guide for each matched scheme



18. BEEJ TRACKER MODULE — Seed Authenticity Checker

- Input a seed packet code (manual text entry, or QR scan using device camera 

  if feasible) 

- Check against a mock "verified seed codes" database table and show 

  Genuine/Suspicious/Not Found result with guidance on what to do if seed 

  seems fake



19. MANDI MITRA MODULE — Crop Demand Forecasting

- Using a mock historical dataset (last 3-5 years of crop prices/demand), 

  show a simple forecast/trend graph predicting which crops may have higher 

  demand/price next season

- Display as a ranked list with a simple trend icon (up/down/stable)



## ADDITIONAL HIGH-PRIORITY MODULES — CURRENT REAL-WORLD FARMER NEEDS (20–24)



20. PRICE CRASH PROTECTION ALERT

- Using the mock 7-day mandi price dataset (from KhetBazaar/Mandi Mitra), detect 

  when a crop's price has dropped beyond a defined threshold over a recent window

- Show a proactive warning banner/notification suggesting the farmer hold off 

  selling or consider alternate markets, with a simple Marathi+English message

- Structure logic so a real Agmarknet price-feed could later replace the mock dataset



21. INPUT COST TRACKER ("खर्च वही")

- Simple ledger UI where farmers log expenses (seeds, fertilizer, pesticide, 

  labour) per crop/season with date and amount

- Auto-calculate total seasonal expenditure and show a basic profit/loss 

  estimate against expected selling price (can pull from KhetBazaar mock prices)

- Display as a simple card + table view, exportable as a summary



22. NEAREST KRISHI KENDRA / SOIL TESTING CENTER FINDER

- Static curated dataset of agri service centers, seed shops, and soil testing 

  centers (name, type, mock distance/area, contact info)

- Simple filterable list view (by type/village) - no real maps API required, 

  mock "distance" field is sufficient for demo



23. CLIMATE-RESILIENT CROP SUGGESTION

- Using existing Open-Meteo weather data (with mock fallback) for the farmer's 

  region, plus a static lookup table mapping rainfall/temperature patterns to 

  suitable resilient crop alternatives

- Show 2-3 suggested alternative/companion crops for the next season with a 

  short explanation of why they suit the changing climate pattern



24. DEBT-FREE FARMING TIPS / MICRO-SAVINGS NUDGE

- A simple educational content module/card carousel covering basic savings 

  habits, SHG (Self Help Group) options, and tips to reduce dependency on 

  high-interest informal loans

- Static curated content, bilingual, presented in a friendly, non-preachy tone 

  with icons



25. SOIL HEALTH SCANNER

- Static questionnaire (soil color, texture, past crop grown) generates an 

  estimated NPK/pH profile and fertilizer recommendation from a curated 

  lookup table - no real lab integration needed for demo



26. FARM LABOUR & EQUIPMENT SHARING ("शेत मदत")

- Farmers can post/request shared labour or equipment (tractor, sprayer) 

  availability for their village

- Simple mock booking/contact thread, listed by village/area



27. CARBON CREDIT ESTIMATOR

- Based on crop type, area, and farming practice (organic vs chemical) 

  selected by the farmer, show an estimated carbon credit/sustainability 

  score with a simple educational explainer



28. MULTI-LANGUAGE EXPANSION READY FLAG

- Translation context structured so additional regional languages (Hindi, 

  Telugu, etc.) can be added later without refactoring - architecture-level 

  requirement, not a separate visible page



## TECH REQUIREMENTS

- React + TypeScript + Tailwind CSS

- Supabase for auth, database (tables: users, scans, crops, community_posts, 

  reminders, expert_queue, mandi_listings, seed_codes, schemes, demand_forecast, 

  expense_logs, service_centers, labour_listings, soil_profiles), and image storage

- All UI text available in Marathi and English via a translation object/context

- Mobile-first, touch-friendly large buttons (target audience: farmers, often 

  on basic smartphones)

- Use lucide-react icons, keep design clean, warm, and trustworthy - avoid 

  overly "techy" aesthetics, this should feel approachable for rural users



## RELIABILITY & ZERO-ERROR ARCHITECTURE (CRITICAL)

- Every feature that would normally depend on an external API or AI model 

  (disease detection, weather, mandi prices, demand forecast) MUST run on 

  local/mock data structures (JSON datasets, Supabase tables) so the app 

  NEVER throws rate-limit, quota, or network errors, no matter how many users 

  or how many times any feature is used.

- Wrap any real external call (e.g. Open-Meteo) in try/catch with automatic 

  fallback to cached/mock data, so the UI always renders a result instantly 

  and never shows a blank/error state.

- No feature should ever show a loading failure, "limit exceeded," or blank 

  screen - always render a graceful fallback (skeleton → mock data) so the 

  experience feels instant and reliable for every user/device simultaneously.

- Use local state/Supabase tables (not paid third-party rate-limited APIs) as 

  the primary data source for every demo feature, structured so real APIs can 

  be swapped in later without UI changes.

- Translation context should be structured so additional regional languages 

  (Hindi, Telugu, etc.) can be added later without refactoring.



## PAGES NEEDED

1. Landing page (with seedling/sprout hero image)

2. Login/Onboarding (language + farmer details)

3. Home Dashboard (multi-crop cards, weather alert banner, reminders, price crash alerts)

4. Scan/Upload page (camera capture or upload)

5. Result page (disease info, heatmap, treatment, cost estimate, voice playback)

6. Crop Journal/History (timeline view)

7. Community Alerts feed

8. Government Schemes page

9. Side-Income Suggestions page

10. Q&A Forum

11. KhetBazaar (mandi prices + sell listings + price crash alerts)

12. PaaniBudget (irrigation scheduler)

13. KrishiKarz (loan/subsidy chatbot)

14. Beej Tracker (seed checker)

15. Mandi Mitra (demand forecast)

16. Input Cost Tracker ("खर्च वही")

17. Nearest Krishi Kendra / Soil Testing Center Finder

18. Climate-Resilient Crop Suggestions

19. Debt-Free Farming Tips / Micro-Savings

20. Soil Health Scanner

21. Farm Labour & Equipment Sharing ("शेत मदत")

22. Carbon Credit Estimator

23. Settings (language, voice-only mode toggle)



Make the database schema sensible and create all necessary Supabase tables with 

proper relationships. Start with mock/seed data for diseases, schemes, mandi 

prices, seed codes, demand forecast, service centers, climate-crop mappings, 

soil profiles, and labour/equipment listings so the demo looks complete immediately.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shhet-mitra-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8106f8eb-0b8b-4796-bfb9-39afdd0ae0d7).



tirthesh1104/shhet-mitra-connect

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
