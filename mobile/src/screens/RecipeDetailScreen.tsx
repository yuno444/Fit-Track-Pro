import { randomUUID } from "expo-crypto";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/types";
import type { LogMealPreset } from "../types/logMealPreset";
import { takeStashedRecipe } from "../navigation/recipeNavigationCache";
import { fetchRecipeBySelfHref } from "../services/theMealDbRecipeClient";
import type { EdamamNormalizedRecipe } from "../types/edamamRecipe";
import type { SavedRecipe } from "../types/savedRecipe";
import { effectiveMacros } from "../types/savedRecipe";
import { getSavedRecipeById, getSavedRecipes, upsertSavedRecipe } from "../services/savedRecipeStorage";
import { caloriesFromMacros } from "../types/meal";

type Props = NativeStackScreenProps<MainStackParamList, "RecipeDetail">;

/** When API returns calories but missing macros, split roughly for logging (rough estimate). */
function deriveMacrosForLog(r: EdamamNormalizedRecipe): { p: number; c: number; f: number } {
  let p = r.proteinG ?? 0;
  let c = r.carbsG ?? 0;
  let f = r.fatG ?? 0;
  const cal = r.calories;
  if (p + c + f > 0) return { p, c, f };
  if (cal != null && cal > 0) {
    const proteinCal = cal * 0.25;
    const carbCal = cal * 0.45;
    const fatCal = cal * 0.3;
    return { p: proteinCal / 4, c: carbCal / 4, f: fatCal / 9 };
  }
  return { p: 0, c: 0, f: 0 };
}

/** If this remote recipe exists on device, return it with macros merged onto `base` for display/logging. */
async function mergeLinkedSavedRow(base: EdamamNormalizedRecipe): Promise<{ recipe: EdamamNormalizedRecipe; saved: SavedRecipe | null }> {
  const uri = base.uri?.trim();
  if (!uri) {
    return { recipe: base, saved: null };
  }
  const list = await getSavedRecipes();
  const hit = list.find((x) => x.edamamUri === uri);
  if (!hit) {
    return { recipe: base, saved: null };
  }
  const row = await getSavedRecipeById(hit.id);
  if (!row) {
    return { recipe: base, saved: null };
  }
  const m = effectiveMacros(row);
  return {
    saved: row,
    recipe: {
      ...base,
      calories: m.calories,
      proteinG: m.proteinG,
      carbsG: m.carbsG,
      fatG: m.fatG,
    },
  };
}

function recipeToSaved(r: EdamamNormalizedRecipe): SavedRecipe {
  return {
    id: randomUUID(),
    edamamUri: r.uri,
    selfHref: r.selfHref,
    title: r.label,
    source: r.source,
    sourceUrl: r.url,
    imageUrl: r.image,
    ingredientLines: r.ingredientLines,
    yieldServings: r.yieldServings,
    notes: "",
    favorite: false,
    cachedCalories: r.calories,
    cachedProteinG: r.proteinG,
    cachedCarbsG: r.carbsG,
    cachedFatG: r.fatG,
    savedAt: new Date().toISOString(),
  };
}

export function RecipeDetailScreen({ navigation, route }: Props) {
  const { source } = route.params;
  const [recipe, setRecipe] = useState<EdamamNormalizedRecipe | null>(null);
  const [saved, setSaved] = useState<SavedRecipe | null>(null);
  const [loading, setLoading] = useState(source === "remote");
  const [offlineBanner, setOfflineBanner] = useState<string | null>(null);

  const loadRemote = useCallback(async () => {
    if (route.params.source !== "remote") return;
    const { selfHref, title } = route.params;
    const stashed = takeStashedRecipe();
    const initial = stashed ?? null;
    if (initial) {
      setRecipe(initial);
      setOfflineBanner(null);
    } else if (title) {
      setRecipe({
        uri: "",
        label: title,
        source: "",
        url: "",
        yieldServings: 1,
        ingredientLines: [],
        selfHref,
      });
    }
    setLoading(true);
    const fresh = await fetchRecipeBySelfHref(selfHref);
    setLoading(false);

    let base: EdamamNormalizedRecipe | null = null;
    if (fresh) {
      setOfflineBanner(null);
      base = fresh;
    } else if (initial) {
      setOfflineBanner("Could not refresh — showing data from your last search (offline-friendly).");
      base = initial;
    } else {
      setOfflineBanner("Could not load recipe. Check your network connection.");
      return;
    }

    const { recipe: merged, saved: linked } = await mergeLinkedSavedRow(base);
    setRecipe(merged);
    setSaved(linked);
  }, [route.params]);

  const loadSaved = useCallback(async () => {
    if (route.params.source !== "saved") return;
    const r = await getSavedRecipeById(route.params.savedRecipeId);
    setSaved(r);
    if (r) {
      const m = effectiveMacros(r);
      setRecipe({
        uri: r.edamamUri ?? "",
        label: r.title,
        image: r.imageUrl,
        source: r.source,
        url: r.sourceUrl,
        yieldServings: r.yieldServings,
        ingredientLines: r.ingredientLines,
        calories: m.calories,
        proteinG: m.proteinG,
        carbsG: m.carbsG,
        fatG: m.fatG,
        selfHref: r.selfHref ?? "",
      });
    }
    setLoading(false);
    setOfflineBanner("Saved on this device — full detail available without network.");
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      if (source === "remote") {
        void loadRemote();
      } else {
        void loadSaved();
      }
    }, [source, loadRemote, loadSaved])
  );

  useEffect(() => {
    if (source !== "remote" || !recipe?.uri) return;
    let cancelled = false;
    (async () => {
      const list = await getSavedRecipes();
      const hit = list.find((x) => x.edamamUri === recipe.uri);
      if (!cancelled && hit) setSaved(hit);
    })();
    return () => {
      cancelled = true;
    };
  }, [source, recipe?.uri]);

  async function handleSaveRecipe() {
    if (!recipe || saved != null) return;
    const list = await getSavedRecipes();
    const dup = list.find((x) => x.edamamUri && x.edamamUri === recipe.uri);
    if (dup) {
      Alert.alert("Already saved", "This recipe is in your saved list.");
      return;
    }
    const entry = recipeToSaved(recipe);
    await upsertSavedRecipe(entry);
    setSaved(entry);
    Alert.alert("Saved", "Recipe stored on this device.");
  }

  async function toggleFavorite() {
    if (!saved) return;
    const next = { ...saved, favorite: !saved.favorite };
    await upsertSavedRecipe(next);
    setSaved(next);
  }

  function openLogMeal() {
    if (!recipe) return;
    const { p, c, f } = deriveMacrosForLog(recipe);
    const totalCalories = recipe.calories ?? caloriesFromMacros(p, c, f);
    const preset: LogMealPreset = {
      name: recipe.label,
      ingredientsAndWeight: recipe.ingredientLines.join("\n"),
      proteinG: Math.round(p * 10) / 10,
      carbsG: Math.round(c * 10) / 10,
      fatG: Math.round(f * 10) / 10,
      isEstimate: true,
    };
    if (p + c + f <= 0 && (!Number.isFinite(totalCalories) || totalCalories <= 0)) {
      Alert.alert("Macros unavailable", "Edit the saved recipe to add manual macros, then log.");
      return;
    }
    navigation.navigate("LogMeal", { preset });
  }

  if (loading && !recipe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.muted}>Loading recipe…</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Recipe not found.</Text>
        <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const macrosLine =
    recipe.proteinG != null && recipe.carbsG != null && recipe.fatG != null
      ? `P ${Math.round(recipe.proteinG)}g · C ${Math.round(recipe.carbsG)}g · F ${Math.round(recipe.fatG)}g`
      : null;
  const caloriesLine =
    recipe.calories != null
      ? `${Math.round(recipe.calories)} calories / serving`
      : recipe.proteinG != null
        ? `${caloriesFromMacros(recipe.proteinG ?? 0, recipe.carbsG ?? 0, recipe.fatG ?? 0)} calories (from macros)`
        : "Energy estimate n/a";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {offlineBanner ? <Text style={styles.banner}>{offlineBanner}</Text> : null}

      <Text style={styles.title}>{recipe.label}</Text>
      {recipe.source ? (
        <Pressable onPress={() => recipe.url && Linking.openURL(recipe.url)}>
          <Text style={styles.link}>Source: {recipe.source}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.section}>Servings (yield)</Text>
      <Text style={styles.body}>{recipe.yieldServings}</Text>

      <Text style={styles.section}>Nutrition (estimate)</Text>
      <Text style={styles.body}>{caloriesLine}</Text>
      {macrosLine ? <Text style={styles.body}>{macrosLine}</Text> : null}
      <Text style={styles.estimate}>
        TheMealDB does not provide per-recipe macros in the free API. Use “Log as meal” only after adding estimates, or
        save and edit the recipe with manual macros.
      </Text>

      <Text style={styles.section}>Ingredients</Text>
      {recipe.ingredientLines.map((line, i) => (
        <Text key={`${i}-${line.slice(0, 24)}`} style={styles.ingredientLine}>
          · {line}
        </Text>
      ))}

      <View style={styles.actions}>
        {source === "remote" && saved == null ? (
          <Pressable style={styles.primary} onPress={handleSaveRecipe}>
            <Text style={styles.primaryText}>Save recipe on device</Text>
          </Pressable>
        ) : null}
        {saved ? (
          <Pressable style={styles.secondary} onPress={toggleFavorite}>
            <Text style={styles.secondaryText}>{saved.favorite ? "★ Favorited" : "☆ Mark favorite"}</Text>
          </Pressable>
        ) : null}
        {saved ? (
          <Pressable style={styles.secondary} onPress={() => navigation.navigate("EditSavedRecipe", { savedRecipeId: saved.id })}>
            <Text style={styles.secondaryText}>Edit saved copy</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.primary} onPress={openLogMeal}>
          <Text style={styles.primaryText}>Log as meal (estimate)</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Meal data from TheMealDB (themealdb.com). Content is contributed by users; verify important details at the
        source link when provided.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#E5E7EB" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E5E7EB", padding: 24 },
  muted: { marginTop: 8, color: "#6B7280" },
  error: { color: "#DC2626", fontWeight: "700", marginBottom: 16 },
  banner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    color: "#92400E",
    fontWeight: "600",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#111827" },
  link: { color: "#1D4ED8", fontWeight: "700", marginTop: 8, textDecorationLine: "underline" },
  section: { marginTop: 18, fontWeight: "800", color: "#374151", fontSize: 15 },
  body: { marginTop: 6, color: "#111827", fontSize: 16, fontWeight: "600" },
  estimate: { marginTop: 4, color: "#6B7280", fontSize: 12, fontStyle: "italic" },
  ingredientLine: { marginTop: 6, color: "#1F2937", lineHeight: 22 },
  actions: { marginTop: 24, gap: 12 },
  primary: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondary: {
    borderWidth: 2,
    borderColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#1D4ED8", fontWeight: "700" },
  footer: { marginTop: 28, fontSize: 11, color: "#6B7280", lineHeight: 16 },
  btn: { backgroundColor: "#1D4ED8", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
});
