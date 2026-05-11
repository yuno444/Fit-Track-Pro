import type { WorkoutEntry } from "../types/workout";
import { localDateISO } from "./localDateIso";
import { startOfWeekMonday } from "./workoutStats";

export type WeekVolume = {
  /** Monday of that week (local) */
  weekStartISO: string;
  /** Mon–Sun range, e.g. "5/4–5/10" */
  label: string;
  totalMinutes: number;
  workoutCount: number;
  totalCaloriesBurned: number;
};

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday–Sunday as "m/d–m/d" (local), e.g. "5/4–5/10". */
export function weekRangeShortLabel(monday: Date): string {
  const sun = addDays(monday, 6);
  const sm = `${monday.getMonth() + 1}/${monday.getDate()}`;
  const em = `${sun.getMonth() + 1}/${sun.getDate()}`;
  return `${sm}–${em}`;
}

/** Oldest week first, current week last — `numWeeks` weeks including current. */
export function weeklyTrainingVolumeSeries(
  workouts: WorkoutEntry[],
  numWeeks: number = 4,
  now: Date = new Date()
): WeekVolume[] {
  const currentMonday = startOfWeekMonday(now);
  const series: WeekVolume[] = [];

  for (let w = numWeeks - 1; w >= 0; w--) {
    const weekStart = addDays(currentMonday, -7 * w);
    const weekEnd = addDays(weekStart, 7);
    const startMs = weekStart.getTime();
    const endMs = weekEnd.getTime();

    let totalMinutes = 0;
    let totalCaloriesBurned = 0;
    let workoutCount = 0;

    for (const wo of workouts) {
      const t = new Date(wo.startedAt).getTime();
      if (Number.isNaN(t) || t < startMs || t >= endMs) continue;
      workoutCount += 1;
      totalMinutes += Number.isFinite(wo.durationMinutes) ? wo.durationMinutes : 0;
      totalCaloriesBurned += Number.isFinite(wo.caloriesBurned) ? wo.caloriesBurned : 0;
    }

    series.push({
      weekStartISO: localDateISO(weekStart),
      label: weekRangeShortLabel(weekStart),
      totalMinutes,
      workoutCount,
      totalCaloriesBurned,
    });
  }

  return series;
}
