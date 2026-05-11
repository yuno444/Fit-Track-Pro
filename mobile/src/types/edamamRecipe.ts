/**
 * Normalized recipe for UI (TheMealDB + saved recipes).
 */
export type EdamamNormalizedRecipe = {
  uri: string;
  label: string;
  image?: string;
  source: string;
  url: string;
  yieldServings: number;
  ingredientLines: string[];
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  /** Detail refetch URL (e.g. TheMealDB `lookup.php?i=`). */
  selfHref: string;
};

/** Optional filters; TheMealDB client ignores these (reserved for UI / future). */
export type RecipeSearchFilters = {
  caloriesRange?: string;
  diet?: string;
};
