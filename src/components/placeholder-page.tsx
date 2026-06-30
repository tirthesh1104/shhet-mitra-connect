import { Construction } from "lucide-react";
import { useI18n, type dict } from "@/lib/i18n";
import { AppShell } from "./app-shell";

export function PlaceholderPage({ titleKey }: { titleKey: keyof typeof dict }) {
  const { t, tBoth } = useI18n();
  const both = tBoth(titleKey);
  return (
    <AppShell>
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
          <Construction className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-semibold">
          <span className="deva block">{both.mr}</span>
          <span className="text-primary">{both.en}</span>
        </h1>
        <p className="mt-3 text-muted-foreground">{t("comingSoonDesc")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("comingSoon")}</p>
      </div>
    </AppShell>
  );
}
