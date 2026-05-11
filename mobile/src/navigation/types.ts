import type { LogMealPreset } from "../types/logMealPreset";

export type MainTabsParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Recipes: undefined;
  Profile: undefined;
};

export type RecipeDetailParams =
  | { source: "remote"; selfHref: string; title?: string }
  | { source: "saved"; savedRecipeId: string };

export type MainStackParamList = {
  MainTabs: undefined;
  LogWorkout: undefined;
  LogMeal: { preset?: LogMealPreset; editMealId?: string };
  CreateWorkoutPlan: undefined;
  WorkoutPlanDetail: { planId: string };
  Pantry: undefined;
  RecipeSearch: undefined;
  SavedRecipes: undefined;
  RecipeDetail: RecipeDetailParams;
  EditSavedRecipe: { savedRecipeId: string };
};
