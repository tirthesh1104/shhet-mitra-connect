
-- Extend crops
ALTER TABLE public.crops
  ADD COLUMN IF NOT EXISTS soil_type text,
  ADD COLUMN IF NOT EXISTS notes text;

-- seed_codes (public genuine/suspicious registry)
CREATE TABLE IF NOT EXISTS public.seed_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  crop text NOT NULL,
  variety text NOT NULL,
  brand text NOT NULL,
  status text NOT NULL DEFAULT 'genuine',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seed_codes TO anon, authenticated;
GRANT ALL ON public.seed_codes TO service_role;
ALTER TABLE public.seed_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seed_codes readable" ON public.seed_codes FOR SELECT USING (true);

-- marketplace_listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name text NOT NULL DEFAULT '',
  village text,
  crop_name text NOT NULL,
  quantity_qtl numeric NOT NULL,
  price_per_qtl numeric NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all listings" ON public.marketplace_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own listings" ON public.marketplace_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own listings" ON public.marketplace_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "delete own listings" ON public.marketplace_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- labour_listings
CREATE TABLE IF NOT EXISTS public.labour_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poster_name text NOT NULL DEFAULT '',
  kind text NOT NULL,
  offer_or_need text NOT NULL,
  village text,
  date_needed date,
  rate_per_day numeric,
  phone text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.labour_listings TO authenticated;
GRANT ALL ON public.labour_listings TO service_role;
ALTER TABLE public.labour_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all labour" ON public.labour_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own labour" ON public.labour_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own labour" ON public.labour_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "delete own labour" ON public.labour_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- fasal_calendar_events
CREATE TABLE IF NOT EXISTS public.fasal_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES public.crops(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fasal_calendar_events TO authenticated;
GRANT ALL ON public.fasal_calendar_events TO service_role;
ALTER TABLE public.fasal_calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own calendar" ON public.fasal_calendar_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- yield_estimates
CREATE TABLE IF NOT EXISTS public.yield_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  area_acres numeric NOT NULL,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  estimated_yield_qtl numeric NOT NULL,
  estimated_revenue_inr numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.yield_estimates TO authenticated;
GRANT ALL ON public.yield_estimates TO service_role;
ALTER TABLE public.yield_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own yield" ON public.yield_estimates FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.outbreak_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.labour_listings;

-- Seed outbreak signals across villages
INSERT INTO public.outbreak_signals (village, disease_key, created_at) VALUES
  ('Warana, Sangli', 'tomato_early_blight', now() - interval '1 day'),
  ('Warana, Sangli', 'tomato_early_blight', now() - interval '2 day'),
  ('Warana, Sangli', 'tomato_early_blight', now() - interval '3 day'),
  ('Warana, Sangli', 'tomato_early_blight', now() - interval '4 day'),
  ('Warana, Sangli', 'tomato_early_blight', now() - interval '5 day'),
  ('Warana, Sangli', 'tomato_early_blight', now() - interval '6 day'),
  ('Baramati, Pune', 'cotton_bollworm', now() - interval '1 day'),
  ('Baramati, Pune', 'cotton_bollworm', now() - interval '2 day'),
  ('Baramati, Pune', 'cotton_bollworm', now() - interval '3 day'),
  ('Baramati, Pune', 'cotton_bollworm', now() - interval '5 day'),
  ('Baramati, Pune', 'cotton_bollworm', now() - interval '6 day'),
  ('Nashik', 'grape_downy_mildew', now() - interval '1 day'),
  ('Nashik', 'grape_downy_mildew', now() - interval '2 day'),
  ('Nashik', 'grape_downy_mildew', now() - interval '4 day'),
  ('Nashik', 'grape_downy_mildew', now() - interval '5 day'),
  ('Nashik', 'grape_downy_mildew', now() - interval '6 day'),
  ('Solapur', 'sugarcane_rust', now() - interval '2 day'),
  ('Solapur', 'sugarcane_rust', now() - interval '3 day'),
  ('Solapur', 'sugarcane_rust', now() - interval '4 day'),
  ('Solapur', 'sugarcane_rust', now() - interval '6 day'),
  ('Solapur', 'sugarcane_rust', now() - interval '7 day'),
  ('Kolhapur', 'soybean_yellow_mosaic', now() - interval '1 day'),
  ('Kolhapur', 'soybean_yellow_mosaic', now() - interval '3 day'),
  ('Kolhapur', 'soybean_yellow_mosaic', now() - interval '5 day')
ON CONFLICT DO NOTHING;

-- Seed seed_codes (mix of genuine and suspicious)
INSERT INTO public.seed_codes (code, crop, variety, brand, status, notes) VALUES
  ('MH-COT-2024-001', 'Cotton', 'Bt Cotton MRC-7351', 'Mahyco', 'genuine', 'Certified 2024'),
  ('MH-COT-2024-002', 'Cotton', 'RCH-659', 'Rasi Seeds', 'genuine', 'Certified 2024'),
  ('MH-COT-2024-003', 'Cotton', 'Ankur-3028', 'Ankur Seeds', 'genuine', 'Certified 2024'),
  ('MH-TOM-2024-101', 'Tomato', 'Abhinav', 'Syngenta', 'genuine', 'Certified 2024'),
  ('MH-TOM-2024-102', 'Tomato', 'Namdhari NS-2535', 'Namdhari', 'genuine', 'Certified 2024'),
  ('MH-TOM-2024-103', 'Tomato', 'Sahoo', 'Nunhems', 'genuine', 'Certified 2024'),
  ('MH-SUG-2024-201', 'Sugarcane', 'Co-86032', 'MSSRDC', 'genuine', 'Certified 2024'),
  ('MH-SUG-2024-202', 'Sugarcane', 'Co-92005', 'MSSRDC', 'genuine', 'Certified 2024'),
  ('MH-SOY-2024-301', 'Soybean', 'JS-335', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-SOY-2024-302', 'Soybean', 'MACS-1188', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-WHT-2024-401', 'Wheat', 'Lok-1', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-WHT-2024-402', 'Wheat', 'HD-2967', 'IARI', 'genuine', 'Certified 2024'),
  ('MH-ONI-2024-501', 'Onion', 'N-53', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-ONI-2024-502', 'Onion', 'Phule Samarth', 'MPKV', 'genuine', 'Certified 2024'),
  ('MH-JOW-2024-601', 'Jowar', 'CSH-16', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-JOW-2024-602', 'Jowar', 'M-35-1', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-TUR-2024-701', 'Tur', 'BSMR-736', 'MAHABEEJ', 'genuine', 'Certified 2024'),
  ('MH-TUR-2024-702', 'Tur', 'ICPL-87', 'ICRISAT', 'genuine', 'Certified 2024'),
  ('MH-GRP-2024-801', 'Grape', 'Thompson Seedless', 'NRC Grapes', 'genuine', 'Certified 2024'),
  ('MH-GRP-2024-802', 'Grape', 'Sonaka', 'NRC Grapes', 'genuine', 'Certified 2024'),
  ('MH-POM-2024-901', 'Pomegranate', 'Bhagwa', 'NRCP', 'genuine', 'Certified 2024'),
  ('MH-POM-2024-902', 'Pomegranate', 'Ganesh', 'NRCP', 'genuine', 'Certified 2024'),
  ('FAKE-XYZ-001', 'Cotton', 'Unknown', 'Unbranded', 'suspicious', 'No trace in registry'),
  ('DUP-COT-9999', 'Cotton', 'Fake Bt', 'Unknown', 'suspicious', 'Reported duplicate code'),
  ('DUP-TOM-8888', 'Tomato', 'Fake Hybrid', 'Unknown', 'suspicious', 'Reported duplicate code'),
  ('LOOSE-01', 'Soybean', 'Loose Seed', 'Unlabelled', 'suspicious', 'Loose seed — verify at Krishi Kendra'),
  ('BLK-MKT-01', 'Sugarcane', 'Unmarked', 'Unknown', 'suspicious', 'Reported grey-market sale'),
  ('MH-COT-2023-999', 'Cotton', 'Expired Batch', 'Mahyco', 'suspicious', 'Batch expired — do not sow'),
  ('COPY-RCH-659', 'Cotton', 'Counterfeit RCH-659', 'Fake', 'suspicious', 'Counterfeit reported in Vidarbha'),
  ('NO-TAG-777', 'Onion', 'Untagged', 'Unbranded', 'suspicious', 'Missing certification tag')
ON CONFLICT (code) DO NOTHING;
