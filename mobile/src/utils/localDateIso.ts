/** Local calendar date as YYYY-MM-DD (not UTC midnight shift). */
export function localDateISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loggedAtToLocalDateISO(loggedAt: string): string {
  const d = new Date(loggedAt);
  if (Number.isNaN(d.getTime())) return "";
  return localDateISO(d);
}

/** Parse YYYY-MM-DD to Date at local noon */
export function parseLocalDateISO(dateISO: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d, 12, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function addDaysLocal(dateISO: string, deltaDays: number): string {
  const d = parseLocalDateISO(dateISO);
  if (!d) return dateISO;
  d.setDate(d.getDate() + deltaDays);
  return localDateISO(d);
}

/** ISO timestamp at local noon for a picked calendar date (consistent with workouts / meal bucketing). */
export function noonLocalStoredIso(date: Date): string {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}
