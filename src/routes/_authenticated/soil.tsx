import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { analyseSoil } from "@/data/content";

export const Route = createFileRoute("/_authenticated/soil")({ component: Page });

const COLOURS = [
  { key: "dark", mr: "गडद काळी", en: "Dark black" },
  { key: "red", mr: "लालसर", en: "Reddish" },
  { key: "sandy", mr: "फिकट वालुकामय", en: "Light sandy" },
  { key: "grey", mr: "करडी", en: "Grey" },
];
const TEXTURES = [
  { key: "sticky", mr: "चिकट चिकणमाती", en: "Sticky clay" },
  { key: "sandy", mr: "दाणेदार वालुकामय", en: "Grainy sandy" },
  { key: "loamy", mr: "मऊ गाळाची", en: "Soft loamy" },
];
const IRR = [
  { key: "rain", mr: "पावसाळी", en: "Rain-fed" },
  { key: "drip", mr: "ठिबक", en: "Drip" },
  { key: "flood", mr: "पूर", en: "Flood" },
];
const CROPS = ["Wheat", "Cotton", "Sugarcane", "Soybean", "Tomato", "Onion", "Jowar", "Tur"];

function Page() {
  const { t, lang } = useI18n();
  const [colour, setColour] = useState("dark");
  const [texture, setTexture] = useState("loamy");
  const [irrigation, setIrrigation] = useState("drip");
  const [past, setPast] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof analyseSoil> | null>(null);

  function toggle(c: string) { setPast((p) => (p.includes(c) ? p.filter((x) => x !== c) : p.length < 3 ? [...p, c] : p)); }
  return (
    <ModulePage title={t("modSoil")} subtitle={lang === "mr" ? "४ प्रश्नांतून मातीचे आरोग्य" : "Soil health in 4 quick steps"}>
      <Card>
        <Group label={lang === "mr" ? "मातीचा रंग" : "Soil colour"}>
          {COLOURS.map((o) => <Pill key={o.key} active={colour === o.key} onClick={() => setColour(o.key)}>{o[lang]}</Pill>)}
        </Group>
        <Group label={lang === "mr" ? "मातीचा पोत" : "Soil texture"}>
          {TEXTURES.map((o) => <Pill key={o.key} active={texture === o.key} onClick={() => setTexture(o.key)}>{o[lang]}</Pill>)}
        </Group>
        <Group label={lang === "mr" ? "मागील ३ पिके" : "Last 3 crops"}>
          {CROPS.map((c) => <Pill key={c} active={past.includes(c)} onClick={() => toggle(c)}>{c}</Pill>)}
        </Group>
        <Group label={lang === "mr" ? "सिंचन" : "Irrigation"}>
          {IRR.map((o) => <Pill key={o.key} active={irrigation === o.key} onClick={() => setIrrigation(o.key)}>{o[lang]}</Pill>)}
        </Group>
        <button onClick={() => setResult(analyseSoil({ colour, texture, irrigation }))} className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground"><FlaskConical className="mr-1 inline h-4 w-4" /> {lang === "mr" ? "तपासा" : "Analyse"}</button>
      </Card>
      {result && (
        <Card className="mt-3">
          <div className="text-sm font-medium">{lang === "mr" ? "अंदाजित मूल्ये" : "Estimated values"}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Chip tone="info">N: {result.n}</Chip>
            <Chip tone="info">P: {result.p}</Chip>
            <Chip tone="info">K: {result.k}</Chip>
            <Chip>pH: {result.ph}</Chip>
          </div>
          <div className="mt-3 text-sm font-medium">{lang === "mr" ? "खत शिफारसी" : "Fertilizer recommendations"}</div>
          <ul className="mt-1 space-y-1 text-sm">
            {result.recs.map((r) => <li key={r.brand}>• <b>{r.brand}</b> — {r.dose}</li>)}
          </ul>
          <div className="mt-3 rounded-xl bg-secondary/60 p-2 text-xs">{result.summary[lang]}</div>
        </Card>
      )}
    </ModulePage>
  );
}
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mt-3"><div className="text-xs font-medium text-muted-foreground">{label}</div><div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div></div>;
}
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full border px-3 py-1 text-xs ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary"}`}>{children}</button>;
}
