
CREATE TABLE public.mandi_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity TEXT NOT NULL,
  market TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  min_price NUMERIC,
  max_price NUMERIC,
  modal_price NUMERIC,
  arrival_date DATE NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commodity, market, district, arrival_date)
);
GRANT SELECT ON public.mandi_prices TO authenticated, anon;
GRANT ALL ON public.mandi_prices TO service_role;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read mandi prices" ON public.mandi_prices FOR SELECT USING (true);
CREATE INDEX idx_mandi_prices_lookup ON public.mandi_prices (district, commodity, arrival_date DESC);

ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
