
DROP POLICY "insert own outbreaks" ON public.outbreak_signals;
CREATE POLICY "insert own outbreaks" ON public.outbreak_signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
