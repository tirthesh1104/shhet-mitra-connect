/**
 * Weather utility — Open-Meteo with graceful fallback. Never throws.
 */
export type WeatherDay = { date: string; tempMax: number; tempMin: number; rainMm: number };
export type WeatherHour = { time: string; temp: number; rain: number };
export type WeatherForecast = {
  source: "live" | "mock";
  rainExpected: boolean;
  summary: { mr: string; en: string };
  days: WeatherDay[]; // 7 days
  hours: WeatherHour[]; // next 24h
};
export type WeatherHistory = {
  source: "live" | "mock";
  days: WeatherDay[]; // last 30 days
};

function mockDays(n: number, past = false): WeatherDay[] {
  const out: WeatherDay[] = [];
  for (let i = 0; i < n; i++) {
    const t = past ? Date.now() - (n - i) * 86400000 : Date.now() + i * 86400000;
    out.push({
      date: new Date(t).toISOString().slice(0, 10),
      tempMax: 30 + Math.round(Math.sin(i / 2) * 4),
      tempMin: 22 + Math.round(Math.cos(i / 3) * 3),
      rainMm: i % 4 === 0 ? Math.round(Math.random() * 8) : 0,
    });
  }
  return out;
}

const MOCK_FORECAST: WeatherForecast = {
  source: "mock",
  rainExpected: false,
  summary: { mr: "पुढील ७ दिवस बहुतांशी स्वच्छ हवामान", en: "Mostly clear weather for next 7 days" },
  days: mockDays(7),
  hours: Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() + i * 3600000).toISOString(),
    temp: 26 + Math.round(Math.sin(i / 3) * 5),
    rain: 0,
  })),
};

export async function getForecast(lat = 19.075, lon = 72.877): Promise<WeatherForecast> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&hourly=temperature_2m,precipitation&timezone=auto&forecast_days=7`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    const days: WeatherDay[] = (data.daily?.time ?? []).map((date: string, i: number) => ({
      date,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      rainMm: Math.round(data.daily.precipitation_sum[i] ?? 0),
    }));
    const hours: WeatherHour[] = (data.hourly?.time ?? []).slice(0, 24).map((time: string, i: number) => ({
      time,
      temp: Math.round(data.hourly.temperature_2m[i]),
      rain: Number(data.hourly.precipitation[i] ?? 0),
    }));
    const rainExpected = days.slice(0, 3).some((d) => d.rainMm >= 3);
    return {
      source: "live",
      rainExpected,
      summary: rainExpected
        ? { mr: "पुढील ३ दिवसात पाऊस — फवारणी टाळा", en: "Rain expected in next 3 days — avoid spraying" }
        : { mr: "पुढील ३ दिवस स्वच्छ — फवारणी सुरक्षित", en: "Clear next 3 days — safe to spray" },
      days, hours,
    };
  } catch {
    return MOCK_FORECAST;
  }
}

export async function getHistory(lat = 19.075, lon = 72.877): Promise<WeatherHistory> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&past_days=30&forecast_days=1`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    const days: WeatherDay[] = (data.daily?.time ?? []).slice(0, 30).map((date: string, i: number) => ({
      date,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      rainMm: Math.round(data.daily.precipitation_sum[i] ?? 0),
    }));
    return { source: "live", days };
  } catch {
    return { source: "mock", days: mockDays(30, true) };
  }
}
