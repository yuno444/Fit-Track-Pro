/** Optional preset when opening Log meal from a recipe. */
export type LogMealPreset = {
  name: string;
  ingredientsAndWeight: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** When true, UI should say that macros are estimates (e.g. from a recipe API). */
  isEstimate: boolean;
};
