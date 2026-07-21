import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  district: z.string().default(""),
  commodity: z.string().default(""),
  forceRefresh: z.boolean().default(false),
});

export const MANDI_COMMODITIES = [
  "Onion", "Tomato", "Potato", "Wheat", "Rice", "Soybean", "Cotton",
  "Sugarcane", "Turmeric", "Chilli", "Cabbage", "Cauliflower", "Brinjal",
  "Grapes", "Pomegranate", "Banana", "Mango", "Bajra", "Jowar", "Maize",
  "Tur", "Gram", "Groundnut", "Sunflower",
] as const;

const DISTRICT_ALIASES: Record<string, string> = {
  Osmanabad: "Dharashiv",
  Dharashiv: "Osmanabad",
  Ahmednagar: "Ahilyanagar",
  Ahilyanagar: "Ahmednagar",
  Aurangabad: "Chhatrapati Sambhajinagar",
  "Chhatrapati Sambhajinagar": "Aurangabad",
};

type ApiRecord = Record<string, string | undefined>;

type MandiDebug = {
  requestedDistrict: string;
  requestedCommodity: string;
  cacheDistricts: string[];
  cacheCount: number;
  attempts: Array<{ district: string; recordCount: number; status?: number; error?: string }>;
};

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

const CACHE_HOURS = 24;

function districtCandidates(district: string) {
  if (!district) return [];
  const alternate = DISTRICT_ALIASES[district];
  return alternate ? [district, alternate] : [district];
}

function toRows(records: ApiRecord[]): MandiRow[] {
  return records.map((r) => {
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
}

export const fetchMandiPrices = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const debug: MandiDebug = {
      requestedDistrict: data.district,
      requestedCommodity: data.commodity,
      cacheDistricts: districtCandidates(data.district),
      cacheCount: 0,
      attempts: [],
    };

    // Try cache first (unless forced)
    if (!data.forceRefresh) {
      let q = supabaseAdmin
        .from("mandi_prices")
        .select("*")
        .eq("state", "Maharashtra")
        .gte("fetched_at", new Date(Date.now() - CACHE_HOURS * 3600 * 1000).toISOString())
        .order("arrival_date", { ascending: false })
        .limit(200);
      const districts = districtCandidates(data.district);
      if (districts.length > 0) q = q.in("district", districts);
      if (data.commodity) q = q.eq("commodity", data.commodity);
      const cached = await q;
      debug.cacheCount = cached.data?.length ?? 0;
      if (cached.data && cached.data.length > 0) {
        return { rows: cached.data as MandiRow[], source: "cache" as const, error: null, debug };
      }
    }

    // Live fetch
    const apiKey = process.env.DATA_GOV_API_KEY || process.env.AGMARKNET_API_KEY;
    if (!apiKey) {
      return { rows: [] as MandiRow[], source: "none" as const, error: "API key missing", debug };
    }

    try {
      const districts = districtCandidates(data.district);
      const attempts = districts.length > 0 ? districts : [""];
      let rows: MandiRow[] = [];

      for (const attemptDistrict of attempts) {
        const params = new URLSearchParams({
          "api-key": apiKey,
          format: "json",
          "filters[state]": "Maharashtra",
          limit: data.district && data.commodity ? "20" : "200",
        });
        if (attemptDistrict) params.set("filters[district]", attemptDistrict);
        if (data.commodity) params.set("filters[commodity]", data.commodity);

        const res = await fetch(
          `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`,
        );
        if (!res.ok) {
          debug.attempts.push({ district: attemptDistrict, recordCount: 0, status: res.status, error: `API ${res.status}` });
          throw new Error(`API ${res.status}`);
        }
        const json = (await res.json()) as { records?: ApiRecord[]; count?: number; total?: number };
        const records = json.records ?? [];
        debug.attempts.push({ district: attemptDistrict, recordCount: records.length, status: res.status });
        rows = toRows(records);
        if (rows.length > 0) break;
      }

      if (rows.length > 0) {
        // upsert cache (ignore conflict errors)
        await supabaseAdmin
          .from("mandi_prices")
          .upsert(rows, { onConflict: "commodity,market,district,arrival_date" });
      }
      return { rows, source: "live" as const, error: null, debug };
    } catch (e) {
      // fallback to older cache
      let q = supabaseAdmin
        .from("mandi_prices")
        .select("*")
        .eq("state", "Maharashtra")
        .order("arrival_date", { ascending: false })
        .limit(200);
      const districts = districtCandidates(data.district);
      if (districts.length > 0) q = q.in("district", districts);
      if (data.commodity) q = q.eq("commodity", data.commodity);
      const cached = await q;
      return {
        rows: (cached.data ?? []) as MandiRow[],
        source: "stale" as const,
        error: (e as Error).message,
        debug,
      };
    }
  });
