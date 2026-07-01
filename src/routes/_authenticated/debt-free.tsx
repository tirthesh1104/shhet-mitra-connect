import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank, ShieldCheck, Ban, CreditCard, Landmark, Smartphone, TrendingDown, Wallet, Users, Gift, ExternalLink } from "lucide-react";
import { ModulePage, Card } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { DEBT_TIPS } from "@/data/content";

const ICONS = [PiggyBank, CreditCard, ShieldCheck, Ban, Landmark, Smartphone, TrendingDown, Wallet, Users, Gift];

export const Route = createFileRoute("/_authenticated/debt-free")({ component: Page });

function Page() {
  const { t, lang } = useI18n();
  return (
    <ModulePage title={t("modDebtFree")} subtitle={lang === "mr" ? "आर्थिक स्वास्थ्यासाठी टिप्स" : "Financial wellness tips"}>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {DEBT_TIPS.map((tip, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Card key={i} className="w-64 shrink-0 snap-start">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
              <div className="mt-2 font-medium">{tip.title[lang]}</div>
              <div className="text-xs text-muted-foreground">{tip.title[lang === "mr" ? "en" : "mr"]}</div>
              <p className="mt-2 text-sm">{tip.desc[lang]}</p>
            </Card>
          );
        })}
      </div>
      <Card className="mt-4">
        <div className="text-sm font-medium">{lang === "mr" ? "उपयोगी लिंक्स" : "Useful links"}</div>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><a target="_blank" rel="noreferrer" href="https://www.nabard.org" className="inline-flex items-center gap-1 text-primary">NABARD <ExternalLink className="h-3 w-3" /></a></li>
          <li><a target="_blank" rel="noreferrer" href="https://pmjdy.gov.in" className="inline-flex items-center gap-1 text-primary">PM Jan Dhan Yojana <ExternalLink className="h-3 w-3" /></a></li>
          <li><a target="_blank" rel="noreferrer" href="https://pmkisan.gov.in" className="inline-flex items-center gap-1 text-primary">PM-Kisan <ExternalLink className="h-3 w-3" /></a></li>
        </ul>
      </Card>
    </ModulePage>
  );
}
