import { createFileRoute } from "@tanstack/react-router";
import { Bug, Sprout, Leaf, Milk, Carrot, Tent } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { SIDE_INCOMES } from "@/data/content";

const ICONS = { Bug, Sprout, Leaf, Milk, Carrot, Tent } as const;

export const Route = createFileRoute("/_authenticated/side-income")({ component: Page });

function Page() {
  const { t, lang } = useI18n();
  return (
    <ModulePage title={t("modSideIncome")} subtitle={lang === "mr" ? "शेतीसोबत अतिरिक्त उत्पन्नाच्या कल्पना" : "Extra income ideas alongside farming"}>
      <div className="grid gap-3 sm:grid-cols-2">
        {SIDE_INCOMES.map((it) => {
          const Icon = ICONS[it.icon as keyof typeof ICONS] ?? Sprout;
          return (
            <Card key={it.id}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{it.name[lang]}</div>
                  <div className="text-xs text-muted-foreground">{it.name[lang === "mr" ? "en" : "mr"]}</div>
                </div>
                <Chip tone={it.difficulty.en === "Easy" ? "success" : it.difficulty.en === "Medium" ? "warn" : "danger"}>{it.difficulty[lang]}</Chip>
              </div>
              <p className="mt-2 text-sm">{it.desc[lang]}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Chip tone="info">💰 {it.earn}</Chip>
                <Chip>🪙 {lang === "mr" ? "गुंतवणूक" : "Invest"}: {it.invest}</Chip>
              </div>
            </Card>
          );
        })}
      </div>
    </ModulePage>
  );
}
