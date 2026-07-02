import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function OfflineBanner() {
  const { lang } = useI18n();
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!mounted || online) return null;
  return (
    <div className="mb-3 flex items-center gap-2 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      <WifiOff className="h-4 w-4" />
      <span>{lang === "mr" ? "इंटरनेट नाही — काही माहिती जुनी असू शकते" : "You're offline — some data may be stale"}</span>
    </div>
  );
}
