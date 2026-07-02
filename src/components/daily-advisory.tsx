import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, RefreshCw } from "lucide-react";
import { getDailyAdvisory } from "@/lib/advisory.functions";
import { useI18n } from "@/lib/i18n";

export function DailyAdvisory({ village, crop, weather }: { village: string; crop: string; weather: string }) {
  const { lang } = useI18n();
  const call = useServerFn(getDailyAdvisory);
  const q = useQuery({
    queryKey: ["daily-advisory", village, crop, lang, weather],
    queryFn: () => call({ data: { village, crop, lang, weather } }),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const text = q.data?.text ?? "";
  return (
    <div className="mb-3 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-[var(--color-sun)]/10 p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">
            {lang === "mr" ? "आजचा AI सल्ला" : "Today's AI advisory"}
          </div>
        </div>
        <button onClick={() => q.refetch()} className="rounded-full p-1.5 hover:bg-secondary" aria-label="Refresh">
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>
      {q.isLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-secondary/50" />
      ) : (
        <div className={`whitespace-pre-line text-sm leading-relaxed ${lang === "mr" ? "deva" : ""}`}>
          {text || (lang === "mr" ? "सल्ला उपलब्ध नाही" : "Advisory unavailable")}
        </div>
      )}
    </div>
  );
}
