import type { EdamamNormalizedRecipe } from "../types/edamamRecipe";

let stash: EdamamNormalizedRecipe | null = null;

export function stashRecipeForDetail(recipe: EdamamNormalizedRecipe): void {
  stash = recipe;
}

export function takeStashedRecipe(): EdamamNormalizedRecipe | null {
  const next = stash;
  stash = null;
  return next;
}
