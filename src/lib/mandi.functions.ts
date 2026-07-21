import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  district: z.string().default(""),
  commodity: z.string().default(""),
  forceRefresh: z.boolean().default(false),
});

export type MandiRow = {
  commodity: string;
  market: string;
  district: string;
  state: string;
  min_price: number | null;
  max_price: number | null;
  modal_price: number | null;
  arrival_date: string;
  fetched_at: string;
};

const CACHE_HOURS = 4;

export const fetchMandiPrices = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Try cache first (unless forced)
    if (!data.forceRefresh) {
      let q = supabaseAdmin
        .from("mandi_prices")
        .select("*")
        .eq("state", "Maharashtra")
        .gte("fetched_at", new Date(Date.now() - CACHE_HOURS * 3600 * 1000).toISOString())
        .order("arrival_date", { ascending: false })
        .limit(200);
      if (data.district) q = q.eq("district", data.district);
      if (data.commodity) q = q.eq("commodity", data.commodity);
      const cached = await q;
      if (cached.data && cached.data.length > 0) {
        return { rows: cached.data as MandiRow[], source: "cache" as const, error: null };
      }
    }

    // Live fetch
    const apiKey = process.env.DATA_GOV_API_KEY || process.env.AGMARKNET_API_KEY;
    if (!apiKey) {
      return { rows: [] as MandiRow[], source: "none" as const, error: "API key missing" };
    }
    const params = new URLSearchParams({
      "api-key": apiKey,
      format: "json",
      "filters[state]": "Maharashtra",
      limit: "200",
    });
    if (data.district) params.set("filters[district]", data.district);
    if (data.commodity) params.set("filters[commodity]", data.commodity);

    try {
      const res = await fetch(
        `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = (await res.json()) as { records?: Array<Record<string, string>> };
      const records = json.records ?? [];
      const rows: MandiRow[] = records.map((r) => {
        // arrival_date "12/07/2026" -> "2026-07-12"
        const raw = r.arrival_date ?? r.Arrival_Date ?? "";
        let iso = raw;
        const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) iso = `${m[3]}-${m[2]}-${m[1]}`;
        const num = (v: string | undefined) => {
          const n = v ? Number(v) : NaN;
          return Number.isFinite(n) ? n : null;
        };
        return {
          commodity: r.commodity ?? r.Commodity ?? "",
          market: r.market ?? r.Market ?? "",
          district: r.district ?? r.District ?? "",
          state: r.state ?? r.State ?? "Maharashtra",
          min_price: num(r.min_price ?? r.Min_Price),
          max_price: num(r.max_price ?? r.Max_Price),
          modal_price: num(r.modal_price ?? r.Modal_Price),
          arrival_date: iso || new Date().toISOString().slice(0, 10),
          fetched_at: new Date().toISOString(),
        };
      });

      if (rows.length > 0) {
        // upsert cache (ignore conflict errors)
        await supabaseAdmin
          .from("mandi_prices")
          .upsert(rows, { onConflict: "commodity,market,district,arrival_date" });
      }
      return { rows, source: "live" as const, error: null };
    } catch (e) {
      // fallback to older cache
      let q = supabaseAdmin
        .from("mandi_prices")
        .select("*")
        .eq("state", "Maharashtra")
        .order("arrival_date", { ascending: false })
        .limit(200);
      if (data.district) q = q.eq("district", data.district);
      if (data.commodity) q = q.eq("commodity", data.commodity);
      const cached = await q;
      return {
        rows: (cached.data ?? []) as MandiRow[],
        source: "stale" as const,
        error: (e as Error).message,
      };
    }
  });
