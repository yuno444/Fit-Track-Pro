import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileData, defaultProfile } from "../types/profile";
import type { WorkoutEntry, WorkoutType } from "../types/workout";
import type { MealEntry } from "../types/meal";

const SESSION_KEY = "@fittrack/session";
const PROFILE_KEY = "@fittrack/profile";
const WORKOUTS_KEY = "@fittrack/workouts"; // The identifier for the list of workouts in the device's local storage
const MEALS_KEY = "@fittrack/meals";

export type SessionData = {
  isLoggedIn: boolean;
  email: string;
};

export async function saveSession(session: SessionData): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<SessionData | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<ProfileData> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return defaultProfile;
  try {
    return { ...defaultProfile, ...(JSON.parse(raw) as ProfileData) };
  } catch {
    return defaultProfile;
  }
}

// Normalizes the workout type to ensure it's one of the valid types (Cardio, Calisthenics, Weightlifting)
function normalizeWorkout(raw: WorkoutEntry & { workoutType?: string }): WorkoutEntry {
  const workoutType: WorkoutType =
    raw.workoutType === "Cardio" || raw.workoutType === "Calisthenics" || raw.workoutType === "Weightlifting"
      ? raw.workoutType
      : "Cardio";
  return { ...raw, workoutType };
}

// Gets the list of workouts from the device's local storage associated with WORKOUTS_KEY and parses the JSON string back into a JS array
export async function getWorkouts(): Promise<WorkoutEntry[]> {
  const raw = await AsyncStorage.getItem(WORKOUTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WorkoutEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((w) => normalizeWorkout(w));
  } catch {
    return [];
  }
}


// Saves the list of workouts to the device's local storage associated with WORKOUTS_KEY and converts the JS array into a JSON string
export async function saveWorkouts(workouts: WorkoutEntry[]): Promise<void> {
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export async function addWorkout(entry: WorkoutEntry): Promise<void> {
  const existing = await getWorkouts();
  await saveWorkouts([entry, ...existing]);
}

export async function getMeals(): Promise<MealEntry[]> {
  const raw = await AsyncStorage.getItem(MEALS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MealEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMeals(meals: MealEntry[]): Promise<void> {
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));
}

export async function addMeal(entry: MealEntry): Promise<void> {
  const existing = await getMeals();
  await saveMeals([entry, ...existing]);
}
