import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Droplet, Thermometer, Calendar as CalIcon } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { getForecast } from "@/lib/weather";
import { CLIMATE_CROPS } from "@/data/content";

export const Route = createFileRoute("/_authenticated/climate")({ component: Page });

function Page() {
  const { t, lang } = useI18n();
  const wx = useQuery({ queryKey: ["weather"], queryFn: () => getForecast(), staleTime: 10 * 60 * 1000 });
  const rainTotal = (wx.data?.days ?? []).reduce((s, d) => s + d.rainMm, 0);
  const trend = rainTotal > 30 ? (lang === "mr" ? "अधिक पाऊस" : "Above avg rain") : rainTotal < 5 ? (lang === "mr" ? "कमी पाऊस" : "Below avg rain") : (lang === "mr" ? "सामान्य पाऊस" : "Normal rain");
  return (
    <ModulePage title={t("modClimate")} subtitle={lang === "mr" ? "हवामान-अनुकूल पीक शिफारसी" : "Climate-smart crop picks"}>
      <Card>
        <div className="text-sm font-medium">{lang === "mr" ? "सद्य हवामान" : "Current weather"}</div>
        <div className="mt-1 text-sm text-muted-foreground">{wx.data?.summary[lang] ?? "..."}</div>
        <div className="mt-2 flex gap-2 text-xs"><Chip tone="info">{trend}</Chip><Chip>{lang === "mr" ? "एकूण पाऊस" : "Rain (5d)"}: {rainTotal.toFixed(1)}mm</Chip></div>
      </Card>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CLIMATE_CROPS.map((c) => (
          <Card key={c.name.en}>
            <div className="font-medium">{c.name[lang]}</div>
            <div className="text-xs text-muted-foreground">{c.name[lang === "mr" ? "en" : "mr"]}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <Chip tone="info"><Droplet className="h-3 w-3" /> {c.water[lang]}</Chip>
              <Chip tone="warn"><Thermometer className="h-3 w-3" /> {c.heat[lang]}</Chip>
              <Chip tone="success">{c.yield}</Chip>
              <Chip><CalIcon className="h-3 w-3" /> {c.sow[lang]}</Chip>
            </div>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
