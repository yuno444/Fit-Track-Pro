export type MealEntry = {
  id: string;
  name: string;
  /** Free-text ingredients with amounts, e.g. "Chicken breast 6 oz, rice 1 cup". */
  ingredientsAndWeight: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Total calories (4·P + 4·C + 9·F from macros when saved). */
  calories: number;
  loggedAt: string;
};
// Calculates the total calories backwards from the protein, carbs, and fat macros
export function caloriesFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round(proteinG * 4 + carbsG * 4 + fatG * 9);
}
