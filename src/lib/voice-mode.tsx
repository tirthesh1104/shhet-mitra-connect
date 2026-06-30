import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { voiceOnly: boolean; setVoiceOnly: (v: boolean) => void };
const VoiceCtx = createContext<Ctx | null>(null);

export function VoiceModeProvider({ children }: { children: ReactNode }) {
  const [voiceOnly, setState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("fm:voice") === "1";
  });
  useEffect(() => {
    try { localStorage.setItem("fm:voice", voiceOnly ? "1" : "0"); } catch {}
  }, [voiceOnly]);
  return <VoiceCtx.Provider value={{ voiceOnly, setVoiceOnly: setState }}>{children}</VoiceCtx.Provider>;
}

export function useVoiceMode() {
  const ctx = useContext(VoiceCtx);
  if (!ctx) throw new Error("useVoiceMode must be inside VoiceModeProvider");
  return ctx;
}

/** Speak text in given language. Safe no-op if Web Speech unavailable. */
export function speak(text: string, lang: "mr" | "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "mr" ? "mr-IN" : "en-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch {}
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}
