import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Clock, MapPin } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { KRISHI_KENDRAS, KENDRA_TYPES } from "@/data/content";

export const Route = createFileRoute("/_authenticated/kendra")({ component: Page });

function Page() {
  const { t, lang } = useI18n();
  const [type, setType] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const districts = [...new Set(KRISHI_KENDRAS.map((k) => k.district))];
  const filtered = KRISHI_KENDRAS.filter((k) => (!type || k.type === type) && (!district || k.district === district));
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
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((k) => {
          const tt = KENDRA_TYPES.find((x) => x.key === k.type);
          return (
            <Card key={k.name}>
              <div className="flex items-start justify-between">
                <div className="font-medium">{k.name}</div>
                <Chip tone="info">{lang === "mr" ? tt?.mr : tt?.en}</Chip>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {k.taluka}, {k.district} · <span className="text-foreground">{k.distance}</span></div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {k.hours}</div>
              </div>
              <a href={`tel:${k.phone}`} className="chip mt-2 bg-primary text-primary-foreground"><Phone className="h-3.5 w-3.5" /> {k.phone}</a>
            </Card>
          );
        })}
        {filtered.length === 0 && <Card><div className="text-sm text-muted-foreground">{lang === "mr" ? "काही नाही" : "None found"}</div></Card>}
      </div>
    </ModulePage>
  );
}
