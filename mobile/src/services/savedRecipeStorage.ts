import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedRecipe } from "../types/savedRecipe";
import { requireUserId } from "./storage";
import { savedRecipesKey } from "./storageScope";

export async function getSavedRecipes(): Promise<SavedRecipe[]> {
  const uid = await requireUserId();
  if (!uid) return [];
  const raw = await AsyncStorage.getItem(savedRecipesKey(uid));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedRecipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSavedRecipes(recipes: SavedRecipe[]): Promise<void> {
  const uid = await requireUserId();
  if (!uid) return;
  await AsyncStorage.setItem(savedRecipesKey(uid), JSON.stringify(recipes));
}

export async function getSavedRecipeById(id: string): Promise<SavedRecipe | null> {
  const all = await getSavedRecipes();
  return all.find((r) => r.id === id) ?? null;
}

export async function upsertSavedRecipe(recipe: SavedRecipe): Promise<void> {
  const all = await getSavedRecipes();
  const idx = all.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    all[idx] = recipe;
  } else {
    all.unshift(recipe);
  }
  await saveSavedRecipes(all);
}

export async function deleteSavedRecipe(id: string): Promise<void> {
  const all = await getSavedRecipes();
  await saveSavedRecipes(all.filter((r) => r.id !== id));
}
