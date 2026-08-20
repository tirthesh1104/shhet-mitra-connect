// Optional live GPS capture. NEVER throws — always resolves, with nulls on failure.

export type ScanLocation = {
  latitude: number | null;
  longitude: number | null;
  district: string | null;
  taluka: string | null;
};

export const EMPTY_LOCATION: ScanLocation = {
  latitude: null,
  longitude: null,
  district: null,
  taluka: null,
};

function getPosition(timeoutMs: number): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    try {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
      let settled = false;
      const done = (v: GeolocationPosition | null) => {
        if (settled) return;
        settled = true;
        resolve(v);
      };
      const timer = setTimeout(() => done(null), timeoutMs);
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timer); done(pos); },
        () => { clearTimeout(timer); done(null); },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 },
      );
    } catch {
      resolve(null);
    }
  });
}

async function reverseGeocode(lat: number, lon: number): Promise<{ district: string | null; taluka: string | null }> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return { district: null, taluka: null };
    const j = (await res.json()) as {
      principalSubdivision?: string;
      city?: string;
      locality?: string;
      localityInfo?: { administrative?: Array<{ name?: string; adminLevel?: number }> };
    };
    const admin = j.localityInfo?.administrative ?? [];
    const district =
      admin.find((a) => a.adminLevel === 5)?.name ??
      j.city ??
      j.principalSubdivision ??
      null;
    const taluka = admin.find((a) => a.adminLevel === 6)?.name ?? j.locality ?? null;
    return { district: district || null, taluka: taluka || null };
  } catch {
    return { district: null, taluka: null };
  }
}

/** Best-effort location capture. Resolves within ~timeoutMs, never rejects. */
export async function captureLocation(timeoutMs = 5000): Promise<ScanLocation> {
  try {
    const pos = await getPosition(timeoutMs);
    if (!pos) return EMPTY_LOCATION;
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;
    const { district, taluka } = await reverseGeocode(latitude, longitude);
    return { latitude, longitude, district, taluka };
  } catch {
    return EMPTY_LOCATION;
  }
}

/** Human readable line used in the PDF report. */
export function formatLocation(
  loc: Partial<ScanLocation> | null | undefined,
  lang: "mr" | "en" = "en",
): string {
  const none = lang === "mr" ? "लोकेशन उपलब्ध नाही" : "Location not available";
  if (!loc) return none;
  const parts = [loc.taluka, loc.district].filter(Boolean) as string[];
  const coords =
    typeof loc.latitude === "number" && typeof loc.longitude === "number"
      ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`
      : "";
  if (parts.length === 0 && !coords) return none;
  return [parts.join(", "), coords ? `(${coords})` : ""].filter(Boolean).join(" ");
}
