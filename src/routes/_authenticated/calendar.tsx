import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/calendar")({ component: Page });

type Ev = { id: string; event_date: string; event_type: string; note: string | null; crop_id: string | null };

const TYPE_COLOR: Record<string, string> = {
  sowing: "bg-blue-500",
  fertilizing: "bg-green-500",
  spraying: "bg-orange-500",
  deadline: "bg-red-500",
  note: "bg-muted-foreground",
};

const MR_MONTHS = ["जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून","जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Format Date → "YYYY-MM-DD" in LOCAL timezone (toISOString is UTC and shifts in IST).
function toLocalIso(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Page() {
  const { t, lang } = useI18n(); const { user } = useAuth(); const qc = useQueryClient();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<{ type: string; note: string }>({ type: "note", note: "" });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  // Correct day count per month — new Date(y, m+1, 0) is the last day of month m (handles leap Feb).
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  const monthStart = toLocalIso(new Date(year, month, 1));
  const monthEnd = toLocalIso(new Date(year, month, daysInMonth));

  const q = useQuery({
    queryKey: ["cal", user?.id, monthStart],
    enabled: !!user,
    queryFn: async () => ((await supabase.from("fasal_calendar_events").select("*").eq("user_id", user!.id).gte("event_date", monthStart).lte("event_date", monthEnd)).data ?? []) as Ev[],
  });

  const days = useMemo(() => {
    const cells: { d: Date | null }[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ d: null });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(year, month, i) });
    return cells;
  }, [year, month, daysInMonth, firstWeekday]);

  const eventsByDate = useMemo(() => {
    const m: Record<string, Ev[]> = {};
    (q.data ?? []).forEach((e) => { (m[e.event_date] ||= []).push(e); });
    return m;
  }, [q.data]);

  async function addEvent() {
    if (!selected) return;
    const { error } = await supabase.from("fasal_calendar_events").insert({
      user_id: user!.id, event_date: selected, event_type: newEvent.type, note: newEvent.note || null,
    });
    if (error) return toast.error(error.message);
    setNewEvent({ type: "note", note: "" });
    qc.invalidateQueries({ queryKey: ["cal", user?.id, monthStart] });
  }

  const monthLabel = `${MR_MONTHS[month]} ${year} / ${EN_MONTHS[month]} ${year}`;

  return (
    <ModulePage title={t("modCalendar")} subtitle={lang === "mr" ? "पेरणी, फवारणी व अंतिम तारखा" : "Sowing, spraying & scheme deadlines"}>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="chip" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
          <div className="text-center text-sm font-medium">{monthLabel}</div>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="chip" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((c, i) => {
            if (!c.d) return <div key={i} />;
            const iso = toLocalIso(c.d);
            const evs = eventsByDate[iso] ?? [];
            const isSel = selected === iso;
            return (
              <button key={i} onClick={() => setSelected(iso)} className={`aspect-square rounded-lg border p-1 text-xs ${isSel ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
                <div>{c.d.getDate()}</div>
                <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                  {evs.slice(0, 3).map((e) => <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${TYPE_COLOR[e.event_type] ?? "bg-muted-foreground"}`} />)}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {Object.entries(TYPE_COLOR).map(([k, c]) => (
            <span key={k} className="inline-flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${c}`} />{k}</span>
          ))}
        </div>
      </Card>

      {selected && (
        <Card className="mt-3">
          <div className="text-sm font-medium">{selected}</div>
          <ul className="mt-2 space-y-1 text-sm">
            {(eventsByDate[selected] ?? []).map((e) => (
              <li key={e.id} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${TYPE_COLOR[e.event_type]}`} /> <b>{e.event_type}</b> — {e.note ?? ""}</li>
            ))}
            {!eventsByDate[selected]?.length && <li className="text-xs text-muted-foreground">{lang === "mr" ? "काही नाही" : "No events"}</li>}
          </ul>
          <div className="mt-3 flex gap-2 text-sm">
            <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-1.5">
              {Object.keys(TYPE_COLOR).map((k) => <option key={k}>{k}</option>)}
            </select>
            <input value={newEvent.note} onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })} placeholder={lang === "mr" ? "नोंद" : "Note"} className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5" />
            <button onClick={addEvent} className="chip bg-primary text-primary-foreground"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        </Card>
      )}
    </ModulePage>
  );
}
