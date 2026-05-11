import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PantryItem } from "../types/pantry";
import { requireUserId } from "./storage";
import { pantryKey } from "./storageScope";

export async function getPantry(): Promise<PantryItem[]> {
  const uid = await requireUserId();
  if (!uid) return [];
  const raw = await AsyncStorage.getItem(pantryKey(uid));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PantryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePantry(items: PantryItem[]): Promise<void> {
  const uid = await requireUserId();
  if (!uid) return;
  await AsyncStorage.setItem(pantryKey(uid), JSON.stringify(items));
}
