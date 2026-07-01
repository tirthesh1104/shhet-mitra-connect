import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, ChevronDown, IndianRupee } from "lucide-react";
import { ModulePage, Card, Chip } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/krishikarz")({ component: Page });

const OPTIONS = [
  { name: { mr: "किसान क्रेडिट कार्ड", en: "Kisan Credit Card" }, max: "₹3,00,000", rate: "4%", subsidy: "2%", purpose: "crop",
    howto: { mr: "बँकेत आधार, सातबारा, फोटो द्या. १५ दिवसांत मंजुरी.", en: "Submit Aadhaar, land record, photo at bank. Approval in 15 days." } },
  { name: { mr: "मुद्रा कर्ज (कृषी उपकरण)", en: "Mudra Loan (Farm Equipment)" }, max: "₹10,00,000", rate: "8–12%", subsidy: "—", purpose: "equipment",
    howto: { mr: "बँकेच्या शाखेत Mudra अर्ज. उपकरण कोटेशन जोडा.", en: "Apply for Mudra at bank branch. Attach equipment quotation." } },
  { name: { mr: "PMKSY (सिंचन कर्ज)", en: "PMKSY (Irrigation)" }, max: "₹1,50,000/acre", rate: "6%", subsidy: "55–80%", purpose: "irrigation",
    howto: { mr: "mahadbt.maharashtra.gov.in वर अर्ज. मान्यताप्राप्त vendor कडून बसवा.", en: "Apply at mahadbt.maharashtra.gov.in. Install via empanelled vendor." } },
  { name: { mr: "NABARD Agri Term Loan", en: "NABARD Agri Term Loan" }, max: "₹10,00,000+", rate: "7–9%", subsidy: "10–25%", purpose: "equipment",
    howto: { mr: "सहकारी/RRB बँकेत DPR सोबत अर्ज. NABARD refinance घेतो.", en: "Apply with DPR at co-op/RRB bank. NABARD refinances." } },
];

function Page() {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({ crop: "", acres: "", state: "Maharashtra", purpose: "" });
  const [open, setOpen] = useState<number | null>(null);

  const steps = [
    { q: lang === "mr" ? "तुमचे मुख्य पीक?" : "Your main crop?", key: "crop", opts: ["Wheat", "Cotton", "Sugarcane", "Soybean", "Tomato", "Onion"] },
    { q: lang === "mr" ? "जमीन (एकर)?" : "Land (acres)?", key: "acres", opts: ["<1", "1–3", "3–10", "10+"] },
    { q: lang === "mr" ? "राज्य?" : "State?", key: "state", opts: ["Maharashtra", "Gujarat", "MP", "Karnataka"] },
    { q: lang === "mr" ? "कर्जाचा उद्देश?" : "Loan purpose?", key: "purpose", opts: [
      lang === "mr" ? "पीक कर्ज" : "Crop loan",
      lang === "mr" ? "उपकरण" : "Equipment",
      lang === "mr" ? "सिंचन" : "Irrigation",
    ] },
  ];
  const purposeMap: Record<string, string> = { "Crop loan": "crop", "पीक कर्ज": "crop", "Equipment": "equipment", "उपकरण": "equipment", "Irrigation": "irrigation", "सिंचन": "irrigation" };
  const matched = OPTIONS.filter((o) => !ans.purpose || o.purpose === purposeMap[ans.purpose]);

  return (
    <ModulePage title={t("modKrishiKarz")} subtitle={lang === "mr" ? "पायरी-पायरीने योग्य कर्ज शोधा" : "Find the right loan step-by-step"}>
      {step < steps.length ? (
        <Card>
          <div className="text-sm font-medium">{steps[step].q}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {steps[step].opts.map((o) => (
              <button key={o} onClick={() => { setAns({ ...ans, [steps[step].key]: o }); setStep(step + 1); }}
                className="chip hover:bg-secondary">{o} <ChevronRight className="h-3 w-3" /></button>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{step + 1} / {steps.length}</div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="text-sm font-medium">{lang === "mr" ? "तुमचे उत्तर" : "Your inputs"}</div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
              <Chip>{ans.crop}</Chip><Chip>{ans.acres} acre</Chip><Chip>{ans.state}</Chip><Chip>{ans.purpose}</Chip>
              <button onClick={() => { setStep(0); setAns({ crop: "", acres: "", state: "Maharashtra", purpose: "" }); }} className="text-xs text-primary underline">{lang === "mr" ? "पुन्हा" : "Restart"}</button>
            </div>
          </Card>
          <div className="mt-3 space-y-3">
            {matched.map((o, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{o.name[lang]}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                      <Chip tone="info"><IndianRupee className="h-3 w-3" /> {o.max}</Chip>
                      <Chip>{lang === "mr" ? "व्याज" : "Rate"}: {o.rate}</Chip>
                      <Chip tone="success">{lang === "mr" ? "अनुदान" : "Subsidy"}: {o.subsidy}</Chip>
                    </div>
                  </div>
                </div>
                <button onClick={() => setOpen(open === i ? null : i)} className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
                  {lang === "mr" ? "अर्ज कसा करावा" : "How to apply"} <ChevronDown className={`h-4 w-4 ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && <div className="mt-2 rounded-xl bg-secondary/60 p-3 text-sm">{o.howto[lang]}</div>}
              </Card>
            ))}
          </div>
        </>
      )}
    </ModulePage>
  );
}
