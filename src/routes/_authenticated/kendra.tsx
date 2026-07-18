import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/kendra")({ component: Page });

const KENDRA_TYPES: Array<{ key: string; mr: string; en: string }> = [
  { key: "krishi_kendra", mr: "कृषी केंद्र", en: "Krishi Kendra" },
  { key: "seed_shop", mr: "बीज दुकान", en: "Seed Shop" },
  { key: "soil_lab", mr: "माती तपासणी", en: "Soil Testing" },
  { key: "fertilizer_dealer", mr: "खत विक्रेता", en: "Fertilizer Dealer" },
];

type Kendra = { id: string; name: string; type: string; taluka: string; district: string; phone: string | null; hours: string | null };

function Page() {
  const { t, lang } = useI18n();
  const [type, setType] = useState<string>("");
  const [district, setDistrict] = useState<string>("");

  const q = useQuery({
    queryKey: ["krishi-kendras"],
    queryFn: async () => ((await supabase.from("krishi_kendras").select("*").order("district")).data ?? []) as Kendra[],
    staleTime: 10 * 60 * 1000,
  });

  const rows = q.data ?? [];
  const districts = useMemo(() => [...new Set(rows.map((k) => k.district))].sort(), [rows]);
  const filtered = rows.filter((k) => (!type || k.type === type) && (!district || k.district === district));

  return (
    <ModulePage title={t("modKendra")} subtitle={lang === "mr" ? "जवळचे कृषी सेवा केंद्र" : "Nearest agri service centers"}>
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-full border border-border bg-card px-3 py-1.5">
          <option value="">{lang === "mr" ? "सर्व प्रकार" : "All types"}</option>
          {KENDRA_TYPES.map((tt) => <option key={tt.key} value={tt.key}>{lang === "mr" ? tt.mr : tt.en}</option>)}
        </select>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-full border border-border bg-card px-3 py-1.5">
          <option value="">{lang === "mr" ? "सर्व जिल्हे" : "All districts"}</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      {q.isLoading && <Card><div className="text-center text-sm text-muted-foreground">{lang === "mr" ? "लोड होत आहे…" : "Loading…"}</div></Card>}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((k) => {
          const tt = KENDRA_TYPES.find((x) => x.key === k.type);
          return (
            <Card key={k.id}>
              <div className="flex items-start justify-between">
                <div className="font-medium">{k.name}</div>
                <Chip tone="info">{lang === "mr" ? tt?.mr : tt?.en}</Chip>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {k.taluka}, {k.district}</div>
                {k.hours && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {k.hours}</div>}
              </div>
              {k.phone && <a href={`tel:${k.phone}`} className="chip mt-2 bg-primary text-primary-foreground"><Phone className="h-3.5 w-3.5" /> {k.phone}</a>}
            </Card>
          );
        })}
        {!q.isLoading && filtered.length === 0 && <Card><div className="text-sm text-muted-foreground">{lang === "mr" ? "काही नाही" : "None found"}</div></Card>}
      </div>
    </ModulePage>
  );
}
