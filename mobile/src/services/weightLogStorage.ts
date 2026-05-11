import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import type { WeightEntry } from "../types/weightEntry";
import { kgToLb } from "../utils/imperialUnits";
import { requireUserId } from "./storage";
import { weightLogKey } from "./storageScope";

function sortByDateAsc(a: WeightEntry, b: WeightEntry): number {
  return a.dateISO.localeCompare(b.dateISO);
}

function normalizeWeightEntry(raw: unknown): WeightEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.dateISO !== "string") return null;
  const loggedAt = typeof o.loggedAt === "string" ? o.loggedAt : new Date().toISOString();
  if (typeof o.weightLb === "number" && Number.isFinite(o.weightLb)) {
    return { id: o.id, dateISO: o.dateISO, weightLb: o.weightLb, loggedAt };
  }
  const legacyKg = (o as { weightKg?: unknown }).weightKg;
  if (typeof legacyKg === "number" && Number.isFinite(legacyKg)) {
    return { id: o.id, dateISO: o.dateISO, weightLb: kgToLb(legacyKg), loggedAt };
  }
  return null;
}

export async function getWeightEntries(): Promise<WeightEntry[]> {
  const uid = await requireUserId();
  if (!uid) return [];
  const raw = await AsyncStorage.getItem(weightLogKey(uid));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const entries = parsed.map(normalizeWeightEntry).filter((e): e is WeightEntry => e != null);
    return [...entries].sort(sortByDateAsc);
  } catch {
    return [];
  }
}

export async function saveWeightEntries(entries: WeightEntry[]): Promise<void> {
  const uid = await requireUserId();
  if (!uid) return;
  await AsyncStorage.setItem(weightLogKey(uid), JSON.stringify([...entries].sort(sortByDateAsc)));
}

/**
 * One entry per calendar day (local). Same `dateISO` replaces existing.
 */
export async function upsertWeightForDate(dateISO: string, weightLb: number): Promise<void> {
  const uid = await requireUserId();
  if (!uid) return;
  const all = await getWeightEntries();
  const idx = all.findIndex((e) => e.dateISO === dateISO);
  const next: WeightEntry = {
    id: idx >= 0 ? all[idx].id : randomUUID(),
    dateISO,
    weightLb,
    loggedAt: new Date().toISOString(),
  };
  const merged = idx >= 0 ? all.map((e, i) => (i === idx ? next : e)) : [...all, next];
  await saveWeightEntries(merged);
}
