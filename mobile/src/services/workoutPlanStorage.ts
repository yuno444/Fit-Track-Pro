import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutPlanEntry } from "../types/workoutPlan";
import { requireUserId } from "./storage";
import { workoutPlansKey } from "./storageScope";

export async function getWorkoutPlans(): Promise<WorkoutPlanEntry[]> {
  const uid = await requireUserId();
  if (!uid) {
    return [];
  }
  const raw = await AsyncStorage.getItem(workoutPlansKey(uid));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as WorkoutPlanEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveWorkoutPlans(plans: WorkoutPlanEntry[]): Promise<void> {
  const uid = await requireUserId();
  if (!uid) {
    return;
  }
  await AsyncStorage.setItem(workoutPlansKey(uid), JSON.stringify(plans));
}

export async function addWorkoutPlan(entry: WorkoutPlanEntry): Promise<void> {
  const existing = await getWorkoutPlans();
  await saveWorkoutPlans([entry, ...existing]);
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  const existing = await getWorkoutPlans();
  await saveWorkoutPlans(existing.filter((p) => p.id !== id));
}
