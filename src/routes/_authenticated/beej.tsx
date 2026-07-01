import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/beej")({ component: Page });

type Result = { status: "genuine" | "suspicious" | "not_found"; brand?: string; crop?: string; variety?: string; notes?: string | null };

function Page() {
  const { t, lang } = useI18n();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [scanning, setScanning] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  async function verify(c: string) {
    if (!c.trim()) return;
    const { data } = await supabase.from("seed_codes").select("*").eq("code", c.trim().toUpperCase()).maybeSingle();
    if (!data) return setResult({ status: "not_found" });
    setResult({ status: data.status as Result["status"], brand: data.brand, crop: data.crop, variety: data.variety, notes: data.notes });
  }

  useEffect(() => {
    if (!scanning || !readerRef.current) return;
    let scanner: { clear: () => Promise<void> } | null = null;
    (async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 220 }, false);
      scanner.render(
        (text: string) => { setCode(text); verify(text); setScanning(false); scanner?.clear(); },
        () => { /* ignore per-frame errors */ }
      );
    })();
    return () => { scanner?.clear().catch(() => {}); };
  }, [scanning]);

  return (
    <ModulePage title={t("modBeej")} subtitle={lang === "mr" ? "बीजाची सत्यता तपासा" : "Verify seed packet authenticity"}>
      <Card>
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={lang === "mr" ? "बीज कोड (उदा. WHT-101)" : "Seed code (e.g. WHT-101)"} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          <button onClick={() => verify(code)} className="chip bg-primary text-primary-foreground">{lang === "mr" ? "तपासा" : "Verify"}</button>
        </div>
        <button onClick={() => setScanning(!scanning)} className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary">
          <QrCode className="h-4 w-4" /> {scanning ? (lang === "mr" ? "बंद करा" : "Cancel scan") : (lang === "mr" ? "QR स्कॅन" : "Scan QR")}
        </button>
        {scanning && <div id="qr-reader" ref={readerRef} className="mt-3 overflow-hidden rounded-xl" />}
      </Card>

      {result && (
        <Card className={`mt-3 border ${result.status === "genuine" ? "border-success/40 bg-success/10" : result.status === "suspicious" ? "border-warning/40 bg-warning/15" : "border-destructive/40 bg-destructive/10"}`}>
          <div className="flex items-start gap-3">
            {result.status === "genuine" ? <CheckCircle2 className="h-6 w-6 text-success-foreground" />
              : result.status === "suspicious" ? <AlertTriangle className="h-6 w-6 text-warning-foreground" />
              : <XCircle className="h-6 w-6 text-destructive" />}
            <div>
              <div className="font-semibold">
                {result.status === "genuine" ? (lang === "mr" ? "✅ अस्सल" : "GENUINE")
                  : result.status === "suspicious" ? (lang === "mr" ? "⚠️ संशयास्पद" : "SUSPICIOUS")
                  : (lang === "mr" ? "❌ आढळले नाही" : "NOT FOUND")}
              </div>
              {result.status !== "not_found" && (
                <div className="mt-1 text-sm">{result.brand} · {result.crop} ({result.variety})</div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {result.status === "genuine" && (lang === "mr" ? "पेरणीसाठी सुरक्षित." : "Safe to sow.")}
                {result.status === "suspicious" && (lang === "mr" ? "खरेदी करू नका. कृषी अधिकाऱ्याला कळवा." : "Do not use. Report to Agri officer.")}
                {result.status === "not_found" && (lang === "mr" ? "हा कोड आमच्या डेटामध्ये नाही. विक्रेत्याकडे तपासा." : "Code not in database. Verify with vendor.")}
              </div>
              {result.status !== "genuine" && (
                <a href="tel:1800-180-1551" className="chip mt-2 bg-primary text-primary-foreground"><Phone className="h-3.5 w-3.5" /> Kisan Call Centre 1800-180-1551</a>
              )}
            </div>
          </div>
        </Card>
      )}
    </ModulePage>
  );
}
