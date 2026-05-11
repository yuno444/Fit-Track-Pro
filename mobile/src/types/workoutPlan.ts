import type { WorkoutType } from "./workout";

export const PLAN_GOALS = ["Gain muscle", "Lose weight", "Gain endurance"] as const;
export type PlanGoal = (typeof PLAN_GOALS)[number];

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Beginner", "Intermediate", "Advanced"];

export type Equipment = "Bodyweight only" | "Home dumbbells" | "Full gym";

export const EQUIPMENT_OPTIONS: Equipment[] = ["Bodyweight only", "Home dumbbells", "Full gym"];

export type RestPreference = "Mon–Fri" | "Weekends only" | "Flexible (any days)";

export const REST_PREFERENCES: RestPreference[] = ["Mon–Fri", "Weekends only", "Flexible (any days)"];

export type TimeOfDay = "Morning" | "Evening" | "No preference";

export const TIME_OF_DAY_OPTIONS: TimeOfDay[] = ["Morning", "Evening", "No preference"];

export const INJURY_OPTIONS = ["Knees", "Lower back", "Shoulders"] as const;
export type InjuryTag = (typeof INJURY_OPTIONS)[number];

export type GymSplitType = "Full body" | "Upper/Lower" | "Push/Pull/Legs" | "Bro split" | "Custom";

export const GYM_SPLIT_TYPES: GymSplitType[] = [
  "Full body",
  "Upper/Lower",
  "Push/Pull/Legs",
  "Bro split",
  "Custom",
];

/** Draft while building a plan in the wizard (before `id` / `createdAt` / `summary`). */
export type WorkoutPlanDraft = {
  goals: PlanGoal[];
  /** When `goals.length > 1`, user picks which goal is primary; otherwise null. */
  primaryGoal: PlanGoal | null;
  sessionMinMinutes: number;
  sessionMaxMinutes: number;
  workoutsPerWeek: number;
  startThisWeek: boolean;
  /** ISO date string when `startThisWeek` is false; ignored otherwise. */
  startDateIso: string | null;
  experienceLevel: ExperienceLevel;
  equipment: Equipment;
  restPreference: RestPreference;
  injuries: InjuryTag[];
  injuryOther: string;
  /** Explicit "no injuries" — clears checklist + other when true. */
  injuryNone: boolean;
  preferredTypes: WorkoutType[];
  timeOfDay: TimeOfDay;
  planName: string;
  gymSplit: GymSplitType;
  gymSplitCustom: string;
};

export type WorkoutPlanEntry = WorkoutPlanDraft & {
  id: string;
  createdAt: string;
  summary: string;
};

export function createEmptyDraft(): WorkoutPlanDraft {
  return {
    goals: [],
    primaryGoal: null,
    sessionMinMinutes: 30,
    sessionMaxMinutes: 45,
    workoutsPerWeek: 3,
    startThisWeek: true,
    startDateIso: null,
    experienceLevel: "Beginner",
    equipment: "Bodyweight only",
    restPreference: "Flexible (any days)",
    injuries: [],
    injuryOther: "",
    injuryNone: false,
    preferredTypes: [],
    timeOfDay: "No preference",
    planName: "",
    gymSplit: "Full body",
    gymSplitCustom: "",
  };
}

/** Short labels for summary (goals). */
function goalShort(g: PlanGoal): string {
  if (g === "Gain muscle") return "Muscle";
  if (g === "Lose weight") return "Weight";
  return "Endurance";
}

export function buildPlanSummary(d: WorkoutPlanDraft): string {
  const freq = `${d.workoutsPerWeek}×/week`;
  const session =
    d.sessionMinMinutes === d.sessionMaxMinutes
      ? `${d.sessionMinMinutes}m`
      : `${d.sessionMinMinutes}–${d.sessionMaxMinutes}m`;
  const goalPart =
    d.goals.length === 0 ? "—" : d.goals.map(goalShort).join(" + ");
  return `${freq} · ${session} · ${goalPart}`;
}

export function defaultPlanName(d: WorkoutPlanDraft): string {
  const g = d.goals.length ? d.goals.map(goalShort).join(" + ") : "My plan";
  return `${g} · ${d.workoutsPerWeek}×/wk`;
}

/** Normalizes draft before persisting (injuries none, custom split trim, plan name, dates). */
export function finalizePlanDraft(d: WorkoutPlanDraft): WorkoutPlanDraft {
  const injuryNone = d.injuryNone;
  const injuries = injuryNone ? [] : [...d.injuries];
  const injuryOther = injuryNone ? "" : d.injuryOther.trim();
  const gymSplitCustom = d.gymSplit === "Custom" ? d.gymSplitCustom.trim() : "";
  const planName = d.planName.trim() || defaultPlanName(d);
  const startDateIso = d.startThisWeek ? null : d.startDateIso;
  let primaryGoal = d.primaryGoal;
  if (d.goals.length <= 1) {
    primaryGoal = null;
  } else if (!primaryGoal || !d.goals.includes(primaryGoal)) {
    primaryGoal = d.goals[0];
  }
  return {
    ...d,
    injuries,
    injuryOther,
    injuryNone,
    primaryGoal,
    gymSplitCustom,
    planName,
    startDateIso,
  };
}

export function draftToEntry(d: WorkoutPlanDraft): WorkoutPlanEntry {
  const normalized = finalizePlanDraft(d);
  return {
    ...normalized,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    summary: buildPlanSummary(normalized),
  };
}
