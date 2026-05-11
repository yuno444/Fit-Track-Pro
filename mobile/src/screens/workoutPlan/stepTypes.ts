import type { Dispatch, SetStateAction } from "react";
import type { WorkoutPlanDraft } from "../../types/workoutPlan";

export type SetDraft = Dispatch<SetStateAction<WorkoutPlanDraft>>;

export type StepProps = {
  draft: WorkoutPlanDraft;
  setDraft: SetDraft;
};
