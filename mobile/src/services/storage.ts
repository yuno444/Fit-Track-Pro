import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSession } from "./sessionStorage";
import { mealsKey, profileKey, workoutsKey } from "./storageScope";
import { ProfileData, defaultProfile } from "../types/profile";
import { migrateProfileFromStorage } from "../utils/profileImperialMigration";
import type { WorkoutEntry, WorkoutType } from "../types/workout";
import type { MealEntry } from "../types/meal";

export { runStorageMigrationV2 } from "./storageScope";

export async function requireUserId(): Promise<string | null> {
  const s = await getSession();
  return s?.userId ?? null;
}

export const getActiveUserId = requireUserId;

function normalizeWorkout(raw: WorkoutEntry & { workoutType?: string }): WorkoutEntry {
  const workoutType: WorkoutType =
    raw.workoutType === "Cardio" || raw.workoutType === "Calisthenics" || raw.workoutType === "Weightlifting"
      ? raw.workoutType
      : "Cardio";
  return { ...raw, workoutType };
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  const uid = await requireUserId();
  if (!uid) {
    return;
  }
  await AsyncStorage.setItem(profileKey(uid), JSON.stringify(profile));
}

export async function getProfile(): Promise<ProfileData> {
  const uid = await requireUserId();
  if (!uid) {
    return defaultProfile;
  }
  const raw = await AsyncStorage.getItem(profileKey(uid));
  if (!raw) {
    return defaultProfile;
  }
  try {
    return migrateProfileFromStorage(JSON.parse(raw));
  } catch {
    return defaultProfile;
  }
}

export async function getWorkouts(): Promise<WorkoutEntry[]> {
  const uid = await requireUserId();
  if (!uid) {
    return [];
  }
  const raw = await AsyncStorage.getItem(workoutsKey(uid));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as WorkoutEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((w) => normalizeWorkout(w));
  } catch {
    return [];
  }
}

export async function saveWorkouts(workouts: WorkoutEntry[]): Promise<void> {
  const uid = await requireUserId();
  if (!uid) {
    return;
  }
  await AsyncStorage.setItem(workoutsKey(uid), JSON.stringify(workouts));
}

export async function addWorkout(entry: WorkoutEntry): Promise<void> {
  const existing = await getWorkouts();
  await saveWorkouts([entry, ...existing]);
}

export async function deleteWorkout(id: string): Promise<void> {
  const existing = await getWorkouts();
  await saveWorkouts(existing.filter((w) => w.id !== id));
}

export async function getMeals(): Promise<MealEntry[]> {
  const uid = await requireUserId();
  if (!uid) {
    return [];
  }
  const raw = await AsyncStorage.getItem(mealsKey(uid));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as MealEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMeals(meals: MealEntry[]): Promise<void> {
  const uid = await requireUserId();
  if (!uid) {
    return;
  }
  await AsyncStorage.setItem(mealsKey(uid), JSON.stringify(meals));
}

export async function addMeal(entry: MealEntry): Promise<void> {
  const existing = await getMeals();
  await saveMeals([entry, ...existing]);
}

export async function updateMeal(entry: MealEntry): Promise<void> {
  const existing = await getMeals();
  await saveMeals(existing.map((m) => (m.id === entry.id ? entry : m)));
}

export async function deleteMeal(id: string): Promise<void> {
  const existing = await getMeals();
  await saveMeals(existing.filter((m) => m.id !== id));
}
