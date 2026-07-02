/**
 * Bilingual i18n context.
 * Structured so adding Hindi/Telugu later means only adding entries to `dict`
 * and an entry to `LANGUAGES` — no consumer refactor required.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "mr" | "en";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "mr", label: "मराठी" },
  { code: "en", label: "English" },
];

type Dict = Record<string, { mr: string; en: string }>;

export const dict: Dict = {
  appName: { mr: "फसलमित्र", en: "FasalMitra" },
  tagline: { mr: "शेतकऱ्याचा डिजिटल मित्र", en: "Your Digital Farming Companion" },
  heroSubtext: {
    mr: "रोग ओळख, हवामान सल्ला, बाजारभाव आणि सरकारी योजना — सर्व मराठीतून, एका जागी.",
    en: "Disease detection, weather advice, mandi prices and government schemes — all in one place.",
  },
  getStarted: { mr: "सुरुवात करा", en: "Get started" },
  signIn: { mr: "लॉगिन", en: "Sign in" },
  signUp: { mr: "नोंदणी", en: "Sign up" },
  continueGoogle: { mr: "Google ने सुरू ठेवा", en: "Continue with Google" },
  email: { mr: "ईमेल", en: "Email" },
  password: { mr: "पासवर्ड", en: "Password" },
  signOut: { mr: "बाहेर पडा", en: "Sign out" },

  onboardTitle: { mr: "थोडक्यात आपली ओळख", en: "Tell us about yourself" },
  fullName: { mr: "नाव", en: "Full name" },
  village: { mr: "गाव / तालुका", en: "Village / Taluka" },
  primaryCrop: { mr: "मुख्य पीक", en: "Primary crop" },
  finish: { mr: "पूर्ण करा", en: "Finish" },

  dashboard: { mr: "मुख्यपान", en: "Dashboard" },
  myCrops: { mr: "माझी पिके", en: "My crops" },
  healthy: { mr: "निरोगी", en: "Healthy" },
  minor: { mr: "किरकोळ", en: "Minor issue" },
  urgent: { mr: "त्वरित लक्ष", en: "Urgent" },
  weatherAlert: { mr: "हवामान सूचना", en: "Weather alert" },
  noRain: { mr: "पुढील ३ दिवस पाऊस नाही, फवारणी करू शकता", en: "No rain for next 3 days — safe to spray" },
  rainSoon: { mr: "पाऊस येण्याची शक्यता आहे, फवारणी टाळा", en: "Rain expected — avoid spraying today" },
  outbreakNearby: {
    mr: "तुमच्या भागात रोग पसरत आहे, काळजी घ्या",
    en: "Disease spreading in your area — take care",
  },
  reminders: { mr: "स्मरणपत्रे", en: "Reminders" },
  noReminders: { mr: "कोणतेही स्मरणपत्र नाही", en: "No reminders yet" },

  scanCrop: { mr: "पीक तपासा", en: "Scan crop" },
  uploadOrCapture: { mr: "फोटो काढा किंवा अपलोड करा", en: "Capture or upload a leaf photo" },
  analyzing: { mr: "तपासत आहे...", en: "Analyzing..." },
  result: { mr: "निकाल", en: "Result" },
  confidence: { mr: "विश्वास", en: "Confidence" },
  severity: { mr: "तीव्रता", en: "Severity" },
  cause: { mr: "कारण", en: "Cause" },
  organicTreatment: { mr: "सेंद्रिय उपचार", en: "Organic treatment" },
  chemicalTreatment: { mr: "रासायनिक उपचार", en: "Chemical treatment" },
  estimatedCost: { mr: "अंदाजित खर्च", en: "Estimated cost" },
  sendToExpert: { mr: "तज्ज्ञाकडे पाठवा", en: "Send to expert" },
  expertSent: { mr: "तज्ज्ञांच्या रांगेत जोडले", en: "Added to expert review queue" },
  speakResult: { mr: "वाचून दाखवा", en: "Speak result" },
  stop: { mr: "थांबा", en: "Stop" },
  saveJournal: { mr: "डायरीत जतन झाले", en: "Saved to journal" },

  journal: { mr: "फसल डायरी", en: "Crop Journal" },
  noScans: { mr: "अद्याप कोणतीही तपासणी नाही", en: "No scans yet" },
  community: { mr: "शेजारी अलर्ट", en: "Community Alerts" },
  noAlerts: { mr: "तुमच्या भागात सध्या काही अलर्ट नाहीत", en: "No alerts in your area right now" },

  settings: { mr: "सेटिंग्ज", en: "Settings" },
  language: { mr: "भाषा", en: "Language" },
  voiceOnly: { mr: "फक्त आवाज मोड", en: "Voice-only mode" },
  voiceOnlyDesc: {
    mr: "मोठे चिन्ह, कमी मजकूर — कमी वाचनासाठी",
    en: "Big icons, less text — for low-literacy users",
  },

  comingSoon: { mr: "लवकरच येत आहे", en: "Coming soon" },
  comingSoonDesc: {
    mr: "हे मॉड्यूल पुढील टप्प्यात तयार होत आहे.",
    en: "This module is being prepared in the next phase.",
  },

  // Module names
  modSchemes: { mr: "सरकारी योजना", en: "Govt. Schemes" },
  modSideIncome: { mr: "बोनस उत्पन्न", en: "Side Income" },
  modForum: { mr: "शेतकरी मंच", en: "Farmer Q&A" },
  modKhetBazaar: { mr: "खेतबाजार", en: "KhetBazaar" },
  modPaani: { mr: "पाणी बजेट", en: "PaaniBudget" },
  modKrishiKarz: { mr: "कृषीकर्ज", en: "KrishiKarz" },
  modBeej: { mr: "बीज तपासणी", en: "Beej Tracker" },
  modMandi: { mr: "मंडी मित्र", en: "Mandi Mitra" },
  modKharch: { mr: "खर्च वही", en: "Cost Tracker" },
  modKendra: { mr: "कृषी केंद्र", en: "Krishi Kendra" },
  modClimate: { mr: "हवामान-योग्य पिके", en: "Climate Crops" },
  modDebtFree: { mr: "बचत टिप्स", en: "Savings Tips" },
  modSoil: { mr: "माती तपासणी", en: "Soil Scanner" },
  modLabour: { mr: "शेत मदत", en: "Farm Help" },
  modCarbon: { mr: "कार्बन क्रेडिट", en: "Carbon Credit" },
  modScan: { mr: "रोग तपासणी", en: "Scan" },
  modJournal: { mr: "डायरी", en: "Journal" },
  modCommunity: { mr: "अलर्ट", en: "Alerts" },
  modCalendar: { mr: "पीक कॅलेंडर", en: "Fasal Calendar" },
  modYield: { mr: "उत्पन्न अंदाज", en: "Yield Estimate" },
  modWeatherHistory: { mr: "हवामान इतिहास", en: "Weather History" },

  // Phase 2 actions
  edit: { mr: "बदला", en: "Edit" },
  delete: { mr: "काढा", en: "Delete" },
  cancel: { mr: "रद्द", en: "Cancel" },
  save: { mr: "जतन", en: "Save" },
  confirmDelete: { mr: "काढून टाकायचे?", en: "Delete this?" },
  downloadPdf: { mr: "अहवाल डाउनलोड", en: "Download report" },
  share: { mr: "पाठवा", en: "Share" },
  addNew: { mr: "नवीन जोडा", en: "Add new" },
  submit: { mr: "पाठवा", en: "Submit" },
  loading: { mr: "लोड होत आहे...", en: "Loading..." },
};


type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  tBoth: (key: keyof typeof dict) => { mr: string; en: string };
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with "mr" so SSR and first client render match. Rehydrate from
  // localStorage after mount to avoid hydration mismatch on public routes.
  const [lang, setLangState] = useState<Lang>("mr");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fm:lang") as Lang | null;
      if (stored === "mr" || stored === "en") setLangState(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("fm:lang", l); } catch {}
  };

  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? String(key);
  const tBoth = (key: keyof typeof dict) => dict[key] ?? { mr: String(key), en: String(key) };

  return <I18nContext.Provider value={{ lang, setLang, t, tBoth }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
