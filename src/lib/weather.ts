/**
 * Weather utility — Open-Meteo with automatic fallback to mock data.
 * Never throws; always returns a usable shape so UI never breaks.
 */
export type WeatherForecast = {
  source: "live" | "mock";
  rainExpected: boolean;
  summary: { mr: string; en: string };
  days: Array<{ date: string; tempMax: number; tempMin: number; rainMm: number }>;
};

const MOCK: WeatherForecast = {
  source: "mock",
  rainExpected: false,
  summary: { mr: "पुढील ३ दिवस स्वच्छ हवामान", en: "Clear weather for next 3 days" },
  days: [
    { date: new Date().toISOString().slice(0, 10), tempMax: 33, tempMin: 23, rainMm: 0 },
    { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), tempMax: 34, tempMin: 24, rainMm: 0 },
    { date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), tempMax: 32, tempMin: 23, rainMm: 2 },
  ],
};

export async function getForecast(lat = 19.075, lon = 72.877): Promise<WeatherForecast> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    const days = (data.daily?.time ?? []).map((date: string, i: number) => ({
      date,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      rainMm: Math.round(data.daily.precipitation_sum[i] ?? 0),
    }));
    const rainExpected = days.some((d: { rainMm: number }) => d.rainMm >= 3);
    return {
      source: "live",
      rainExpected,
      summary: rainExpected
        ? { mr: "पुढील ३ दिवसात पाऊस — फवारणी टाळा", en: "Rain expected in next 3 days — avoid spraying" }
        : { mr: "पुढील ३ दिवस स्वच्छ — फवारणी सुरक्षित", en: "Clear next 3 days — safe to spray" },
      days,
    };
  } catch {
    return MOCK;
  }
}
