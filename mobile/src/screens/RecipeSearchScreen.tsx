import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList, MainTabsParamList } from "../navigation/types";
import { stashRecipeForDetail } from "../navigation/recipeNavigationCache";
import { getPantry } from "../services/pantryStorage";
import {
  DISCOVER_FALLBACK_TERM,
  discoverSearchTokensFromPantry,
  searchRecipesFromTokens,
} from "../services/theMealDbRecipeClient";
import type { EdamamNormalizedRecipe } from "../types/edamamRecipe";
import { computePantryMatch, compareRecipeMatches, type SortMode } from "../utils/recipeMatch";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Recipes">,
  NativeStackNavigationProp<MainStackParamList>
>;

type Row = { recipe: EdamamNormalizedRecipe; matchPercent: number; missingCount: number };

export function RecipeSearchScreen() {
  const navigation = useNavigation<Nav>();
  const [pantryNames, setPantryNames] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("best_match");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const loadPantry = useCallback(async () => {
    const p = await getPantry();
    setPantryNames(p.map((i) => i.name));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPantry();
    }, [loadPantry])
  );

  const searchTokens = useMemo(() => discoverSearchTokensFromPantry(pantryNames), [pantryNames]);
  const browsingOnly = pantryNames.length === 0;
  const pantryLabel = pantryNames.map((n) => n.trim()).filter(Boolean).join(" · ");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const { hits } = await searchRecipesFromTokens(searchTokens, {});
        if (cancelled) return;
        const namesForMatch = pantryNames;
        const enriched: Row[] = hits.map((recipe) => {
          const m = computePantryMatch(namesForMatch, recipe.ingredientLines);
          return { recipe, matchPercent: m.matchPercent, missingCount: m.missingCount };
        });
        enriched.sort((a, b) => {
          const ma = computePantryMatch(namesForMatch, a.recipe.ingredientLines);
          const mb = computePantryMatch(namesForMatch, b.recipe.ingredientLines);
          return compareRecipeMatches(ma, mb, sortMode);
        });
        setRows(enriched);
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setError(e instanceof Error ? e.message : "Search failed.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [searchTokens, sortMode, pantryNames]);

  function openPantry() {
    navigation.navigate("Pantry");
  }

  function openDetail(recipe: EdamamNormalizedRecipe) {
    stashRecipeForDetail(recipe);
    navigation.navigate("RecipeDetail", { source: "remote", selfHref: recipe.selfHref, title: recipe.label });
  }

  const header = (
    <View style={styles.headerBlock}>
      <Text style={styles.title}>Discover recipes</Text>
      <Text style={styles.subtitle}>
        Powered by TheMealDB. Add ingredients in My pantry — we search so results include your staples.
      </Text>

      <Pressable style={styles.pantryNavBtn} onPress={openPantry} accessibilityRole="button">
        <Text style={styles.pantryNavBtnText}>My pantry</Text>
        <Text style={styles.pantryNavHint}>Opens the full list to add or edit ingredients</Text>
      </Pressable>

      <Text style={styles.label}>Sort results</Text>
      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortChip, sortMode === "best_match" && styles.sortChipActive]}
          onPress={() => setSortMode("best_match")}
        >
          <Text style={[styles.sortChipText, sortMode === "best_match" && styles.sortChipTextActive]}>
            Best match %
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortChip, sortMode === "fewest_missing" && styles.sortChipActive]}
          onPress={() => setSortMode("fewest_missing")}
        >
          <Text style={[styles.sortChipText, sortMode === "fewest_missing" && styles.sortChipTextActive]}>
            Fewest missing
          </Text>
        </Pressable>
      </View>

      {browsingOnly ? (
        <Text style={styles.browseBanner}>
          No pantry yet — showing popular results for &quot;{DISCOVER_FALLBACK_TERM}&quot;. Open My pantry to add
          ingredients.
        </Text>
      ) : (
        <Text style={styles.pantryHint}>
          Ingredients: <Text style={styles.pantryBold}>{pantryLabel}</Text>
          {"\n"}
          <Text style={styles.pantryMuted}>
            The API matches each item; if no meal lists all of them exactly, we widen to your first ingredient.
          </Text>
        </Text>
      )}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#1D4ED8" />
          <Text style={styles.loadingText}>Searching…</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && rows.length === 0 && !error ? (
        <Text style={styles.empty}>
          No recipes returned. Try adjusting names in My pantry (e.g. Chicken, Mushrooms).
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.recipe.uri}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const m = computePantryMatch(pantryNames, item.recipe.ingredientLines);
          return (
            <Pressable style={styles.card} onPress={() => openDetail(item.recipe)}>
              <Text style={styles.cardTitle}>{item.recipe.label}</Text>
              <Text style={styles.cardMeta}>
                {item.recipe.source}
                {item.recipe.calories != null && ` · ${Math.round(item.recipe.calories)} calories/serving`}
              </Text>
              <Text style={styles.matchLine}>
                Pantry match: {m.matchPercent}% · Missing ~{m.missingCount} ingredient
                {m.missingCount === 1 ? "" : "s"}
              </Text>
              {m.missingSample.length > 0 ? (
                <Text style={styles.missingHint} numberOfLines={2}>
                  Try buying: {m.missingSample.slice(0, 3).join(" · ")}
                </Text>
              ) : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E5E7EB" },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  headerBlock: { paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280", marginBottom: 14, fontSize: 13, lineHeight: 18 },
  pantryNavBtn: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1D4ED8",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  pantryNavBtnText: { fontSize: 17, fontWeight: "800", color: "#1D4ED8" },
  pantryNavHint: { marginTop: 4, fontSize: 13, color: "#6B7280" },
  label: { fontWeight: "700", color: "#111827", marginBottom: 6, marginTop: 4 },
  sortRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  sortChipActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  sortChipText: { fontWeight: "700", color: "#374151", fontSize: 13 },
  sortChipTextActive: { color: "#FFFFFF" },
  pantryHint: { marginTop: 12, color: "#4B5563", fontSize: 13, lineHeight: 20 },
  pantryBold: { fontWeight: "800", color: "#111827" },
  pantryMuted: { color: "#6B7280", fontSize: 12, lineHeight: 17 },
  browseBanner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    color: "#0C4A6E",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  loadingText: { color: "#4B5563" },
  error: { color: "#DC2626", marginTop: 10, fontWeight: "600" },
  empty: { color: "#6B7280", marginTop: 12, lineHeight: 20 },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  cardMeta: { marginTop: 6, color: "#374151", fontWeight: "600", fontSize: 13 },
  matchLine: { marginTop: 8, color: "#1D4ED8", fontWeight: "700", fontSize: 13 },
  missingHint: { marginTop: 4, color: "#6B7280", fontSize: 12 },
});
