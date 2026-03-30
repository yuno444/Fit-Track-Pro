export type MealEntry = {
  id: string;
  name: string;
  //Free-text ingredients with amounts/weights, e.g. "Chicken breast 200g, rice 150g"
  ingredientsAndWeight: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  // Total kcal, typically 4P + 4C + 9F.
  calories: number;
  loggedAt: string;
};
// Calculates the total calories backwards from the protein, carbs, and fat macros
export function caloriesFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round(proteinG * 4 + carbsG * 4 + fatG * 9);
}
