import type { WeightEntry } from "../types/weightEntry";
import { addDaysLocal, localDateISO, parseLocalDateISO } from "./localDateIso";

/** ~1 month sliding window for the dashboard sparkline. */
const CHART_DAYS = 30;

/**
 * Entries in the last `CHART_DAYS` days ending at max(today, latest entry date), so logs for
 * future calendar days still appear with the rest (string YYYY-MM-DD order is chronological).
 */
export function weightEntriesForChart(entries: WeightEntry[], now: Date = new Date()): WeightEntry[] {
  if (entries.length === 0) return [];
  const today = localDateISO(now);
  const maxEntryISO = entries.reduce((m, e) => (e.dateISO > m ? e.dateISO : m), entries[0]!.dateISO);
  const endISO = maxEntryISO > today ? maxEntryISO : today;

  const endDt = parseLocalDateISO(endISO);
  if (!endDt) return [];
  const cutoffDt = new Date(endDt.getTime());
  cutoffDt.setDate(cutoffDt.getDate() - CHART_DAYS);
  const cutoffISO = localDateISO(cutoffDt);

  return entries
    .filter((e) => e.dateISO >= cutoffISO && e.dateISO <= endISO)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export function weightSeriesLb(entries: WeightEntry[]): number[] {
  return entries.map((e) => e.weightLb);
}

/** Latest − earliest in the chart series (same order as `series`). */
export function deltaFirstLastLb(series: number[]): number | null {
  if (series.length < 2) return null;
  return series[series.length - 1] - series[0];
}

/** Latest weight minus weight on or before (today − 7 days); null if not enough data. */
export function deltaVsSevenDaysAgo(entries: WeightEntry[], now: Date = new Date()): number | null {
  const sorted = [...entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  if (sorted.length === 0) return null;
  const todayISO = localDateISO(now);
  const targetISO = addDaysLocal(todayISO, -7);
  let anchor: WeightEntry | null = null;
  for (const e of sorted) {
    if (e.dateISO <= targetISO) anchor = e;
  }
  const latest = sorted[sorted.length - 1];
  if (!anchor || anchor.dateISO === latest.dateISO) return null;
  return latest.weightLb - anchor.weightLb;
}

export function formatDeltaLb(d: number | null): string {
  if (d == null || Number.isNaN(d)) return "—";
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(1)} lb`;
}
