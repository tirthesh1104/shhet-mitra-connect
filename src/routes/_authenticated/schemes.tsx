import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { SCHEMES } from "@/data/content";

export const Route = createFileRoute("/_authenticated/schemes")({ component: Page });

function Page() {
  const { t, lang } = useI18n();
  const [state, setState] = useState<string>("Maharashtra");
  const [open, setOpen] = useState<string | null>(null);
  const filtered = SCHEMES.filter((s) => s.states.includes("*") || s.states.includes(state));
  return (
    <ModulePage title={t("modSchemes")} subtitle={lang === "mr" ? "अर्ज कसा करावा हे स्टेप-बाय-स्टेप" : "Step-by-step application help"}>
      <div className="mb-3 flex items-center gap-2 text-sm">
        <label className="text-muted-foreground">{lang === "mr" ? "राज्य" : "State"}:</label>
        <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-full border border-border bg-card px-3 py-1.5">
          {["Maharashtra", "Gujarat", "Karnataka", "MP", "UP"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{s.name[lang]}</div>
                <div className="text-xs text-muted-foreground">{s.name[lang === "mr" ? "en" : "mr"]}</div>
              </div>
              <a href={s.url} target="_blank" rel="noreferrer" className="chip"><ExternalLink className="h-3.5 w-3.5" /> {lang === "mr" ? "अधिकृत" : "Official"}</a>
            </div>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-xs text-muted-foreground">{lang === "mr" ? "लाभ" : "Benefit"}</span><div>{s.benefit[lang]}</div></div>
              <div><span className="text-xs text-muted-foreground">{lang === "mr" ? "पात्रता" : "Eligibility"}</span><div>{s.eligibility[lang]}</div></div>
            </div>
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {lang === "mr" ? "अर्ज कसा करावा" : "How to apply"} <ChevronDown className={`h-4 w-4 transition ${open === s.id ? "rotate-180" : ""}`} />
            </button>
            {open === s.id && (
              <div className="mt-2 whitespace-pre-wrap rounded-xl bg-secondary/60 p-3 text-sm">{s.howto[lang]}</div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">{s.crops.map((c) => <Chip key={c}>{c === "*" ? (lang === "mr" ? "सर्व पिके" : "All crops") : c}</Chip>)}</div>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
