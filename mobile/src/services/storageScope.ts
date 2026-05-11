import AsyncStorage from "@react-native-async-storage/async-storage";

/** Session payload (no password). */
export const SESSION_KEY = "@fittrack/session";

/** Local account directory (email → credentials + userId). */
export const ACCOUNTS_KEY = "@fittrack/accounts";


export const MIGRATION_V2_FLAG = "@fittrack/migration_v2_scoped";

const LEGACY_KEYS = [
  SESSION_KEY,
  "@fittrack/profile",
  "@fittrack/workouts",
  "@fittrack/meals",
  "@fittrack/workout_plans",
];

export function profileKey(userId: string): string {
  return `@fittrack/profile:${userId}`;
}

export function workoutsKey(userId: string): string {
  return `@fittrack/workouts:${userId}`;
}

export function mealsKey(userId: string): string {
  return `@fittrack/meals:${userId}`;
}

export function workoutPlansKey(userId: string): string {
  return `@fittrack/workout_plans:${userId}`;
}

export function pantryKey(userId: string): string {
  return `@fittrack/pantry:${userId}`;
}

export function savedRecipesKey(userId: string): string {
  return `@fittrack/saved_recipes:${userId}`;
}

export function weightLogKey(userId: string): string {
  return `@fittrack/weight_log:${userId}`;
}


export async function runStorageMigrationV2(): Promise<void> {
  const done = await AsyncStorage.getItem(MIGRATION_V2_FLAG);
  if (done) {
    return;
  }
  await AsyncStorage.multiRemove(LEGACY_KEYS);
  await AsyncStorage.setItem(MIGRATION_V2_FLAG, "1");
}
