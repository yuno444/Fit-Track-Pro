/** Reserved for future diet tagging in saved recipes. */
export type EdamamDietLabel = "balanced" | "high-fiber" | "high-protein" | "low-carb" | "low-fat" | "low-sodium";

export type SavedRecipe = {
  id: string;
  /** Stable id from remote (e.g. `themealdb:52772`). */
  edamamUri?: string;
  /** Last known self URL from search hits (may be used to refetch). */
  selfHref?: string;
  title: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  ingredientLines: string[];
  /** Typical servings / yield from API or user override. */
  yieldServings: number;
  notes: string;
  favorite: boolean;
  /** Snapshot from API when saved; used offline. */
  cachedCalories?: number;
  cachedProteinG?: number;
  cachedCarbsG?: number;
  cachedFatG?: number;
  /** When set, overrides cached macros for display and logging. */
  manualProteinG?: number;
  manualCarbsG?: number;
  manualFatG?: number;
  manualCalories?: number;
  savedAt: string;
};

export function effectiveMacros(recipe: SavedRecipe): {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
} {
  if (
    recipe.manualProteinG != null &&
    recipe.manualCarbsG != null &&
    recipe.manualFatG != null &&
    recipe.manualCalories != null
  ) {
    return {
      proteinG: recipe.manualProteinG,
      carbsG: recipe.manualCarbsG,
      fatG: recipe.manualFatG,
      calories: recipe.manualCalories,
    };
  }
  return {
    proteinG: recipe.cachedProteinG ?? 0,
    carbsG: recipe.cachedCarbsG ?? 0,
    fatG: recipe.cachedFatG ?? 0,
    calories: recipe.cachedCalories ?? 0,
  };
}
