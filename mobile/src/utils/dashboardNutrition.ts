import type { MealEntry } from "../types/meal";
import { addDaysLocal, localDateISO, loggedAtToLocalDateISO } from "./localDateIso";
import { startOfWeekMonday } from "./workoutStats";

export type DayNutrition = {
  dateISO: string;
  /** Short label e.g. "Mon" */
  dayLabel: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Calendar week **Monday → Sunday** (local), same convention as workout weekly stats.
 */
export function nutritionRollupWeekMonSun(meals: MealEntry[], now: Date = new Date()): {
  days: DayNutrition[];
  totals: { calories: number; proteinG: number; carbsG: number; fatG: number };
  avgCaloriesPerDayDiv7: number;
  weekStartISO: string;
} {
  const weekStart = startOfWeekMonday(now);
  const startISO = localDateISO(weekStart);

  const days: DayNutrition[] = [];
  for (let i = 0; i < 7; i++) {
    const dateISO = addDaysLocal(startISO, i);
    days.push({
      dateISO,
      dayLabel: DAY_LABELS[i] ?? "",
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    });
  }

  const dayMap = new Map(days.map((d) => [d.dateISO, d]));

  for (const m of meals) {
    const dIso = loggedAtToLocalDateISO(m.loggedAt);
    if (!dIso) continue;
    const bucket = dayMap.get(dIso);
    if (!bucket) continue;
    bucket.calories += Number.isFinite(m.calories) ? m.calories : 0;
    bucket.proteinG += Number.isFinite(m.proteinG) ? m.proteinG : 0;
    bucket.carbsG += Number.isFinite(m.carbsG) ? m.carbsG : 0;
    bucket.fatG += Number.isFinite(m.fatG) ? m.fatG : 0;
  }

  const totals = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      proteinG: acc.proteinG + d.proteinG,
      carbsG: acc.carbsG + d.carbsG,
      fatG: acc.fatG + d.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const avgCaloriesPerDayDiv7 = totals.calories / 7;

  return { days, totals, avgCaloriesPerDayDiv7, weekStartISO: startISO };
}
