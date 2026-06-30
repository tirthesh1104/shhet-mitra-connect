import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, Leaf, CloudRain, Mic, IndianRupee, Languages } from "lucide-react";
import seedling from "@/assets/seedling-hero.png";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FasalMitra · शेतकऱ्याचा डिजिटल मित्र" },
      { name: "description", content: "Bilingual AI crop-health & advisory for Indian farmers. Disease detection, weather alerts, mandi prices and government schemes." },
      { property: "og:title", content: "FasalMitra · शेतकऱ्याचा डिजिटल मित्र" },
      { property: "og:description", content: "Your Digital Farming Companion — in Marathi & English." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, setLang, lang } = useI18n();

  const features = [
    { icon: Leaf, mr: "रोग ओळख", en: "Disease scan" },
    { icon: CloudRain, mr: "हवामान सूचना", en: "Weather alerts" },
    { icon: Mic, mr: "आवाज सहाय्य", en: "Voice support" },
    { icon: IndianRupee, mr: "बाजारभाव", en: "Mandi prices" },
  ];

  return (
    <main className="surface-warm min-h-screen">
      {/* top bar */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">{t("appName")}</span>
        </div>
        <button
          onClick={() => setLang(lang === "mr" ? "en" : "mr")}
          className="chip"
          aria-label="Toggle language"
        >
          <Languages className="h-4 w-4" />
          {lang === "mr" ? "English" : "मराठी"}
        </button>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center md:gap-12 md:pt-10">
        <div className="order-1 flex justify-center md:order-none">
          {/* Fixed-position seedling hero illustration */}
          <div className="relative aspect-square w-56 sm:w-72 md:w-full md:max-w-sm">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 60%, oklch(0.9 0.1 80 / 0.55), transparent 65%)",
              }}
            />
            <img
              src={seedling}
              alt="A small green sprout emerging from a brown seed planted in soil, with a water droplet on its leaf"
              width={1024}
              height={1024}
              className="h-full w-full select-none object-contain"
              draggable={false}
            />
          </div>
        </div>

        <div className="order-2 text-center md:text-left">
          <span className="chip mb-4">
            <Sprout className="h-3.5 w-3.5" /> {t("appName")}
          </span>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            <span className="deva block text-[var(--color-soil)]">शेतकऱ्याचा डिजिटल मित्र</span>
            <span className="mt-2 block text-primary">Your Digital Farming Companion</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:mx-0 md:text-lg">
            {t("heroSubtext")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link
              to="/auth"
              className="big-tap inline-flex items-center justify-center rounded-full bg-primary px-7 text-base font-medium text-primary-foreground shadow-[var(--shadow-warm)] transition hover:opacity-95"
            >
              {t("getStarted")} →
            </Link>
            <Link
              to="/auth"
              className="big-tap inline-flex items-center justify-center rounded-full border border-border bg-card px-7 text-base font-medium hover:bg-secondary"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* features strip */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.en}
              className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
            >
              <f.icon className="mb-2 h-5 w-5 text-[var(--color-leaf)]" />
              <div className="deva text-sm font-medium">{f.mr}</div>
              <div className="text-xs text-muted-foreground">{f.en}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FasalMitra · Built with ❤ for भारतीय शेतकरी
      </footer>
    </main>
  );
}
