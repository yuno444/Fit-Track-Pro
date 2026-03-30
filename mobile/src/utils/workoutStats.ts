import type { WorkoutEntry } from "../types/workout";

// Monday 00:00:00 local time for the week containing "now".
// This function filters workouts so only the current week's data is shown on the dashboard
export function startOfWeekMonday(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function workoutsThisWeek(workouts: WorkoutEntry[], now: Date = new Date()): WorkoutEntry[] {
  const start = startOfWeekMonday(now);
  return workouts.filter((w) => {
    const t = new Date(w.startedAt);
    return !Number.isNaN(t.getTime()) && t >= start;
  });
}

export type WeekWorkoutStats = {
  count: number;
  totalCalories: number;
  totalMinutes: number;
  avgCaloriesPerWorkout: number;
};

// Computes the dashboard metrics. Calculates sums for calories burned and minutes exercised for the current week
export function computeWeekStats(workouts: WorkoutEntry[], now?: Date): WeekWorkoutStats {
  const week = workoutsThisWeek(workouts, now);
  const count = week.length;
  const totalCalories = week.reduce((sum, w) => sum + (Number.isFinite(w.caloriesBurned) ? w.caloriesBurned : 0), 0);
  const totalMinutes = week.reduce((sum, w) => sum + (Number.isFinite(w.durationMinutes) ? w.durationMinutes : 0), 0);
  const avgCaloriesPerWorkout = count > 0 ? Math.round(totalCalories / count) : 0;
  return { count, totalCalories, totalMinutes, avgCaloriesPerWorkout };
}
