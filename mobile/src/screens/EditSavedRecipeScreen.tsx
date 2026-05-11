import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/types";
import type { SavedRecipe } from "../types/savedRecipe";
import { caloriesFromMacros } from "../types/meal";
import { getSavedRecipeById, upsertSavedRecipe } from "../services/savedRecipeStorage";

type Props = NativeStackScreenProps<MainStackParamList, "EditSavedRecipe">;

function parseNum(s: string): number {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export function EditSavedRecipeScreen({ navigation, route }: Props) {
  const { savedRecipeId } = route.params;
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [yieldText, setYieldText] = useState("1");
  const [manualP, setManualP] = useState("");
  const [manualC, setManualC] = useState("");
  const [manualF, setManualF] = useState("");
  const [manualKcal, setManualKcal] = useState("");

  const load = useCallback(async () => {
    const r = await getSavedRecipeById(savedRecipeId);
    setRecipe(r);
    if (r) {
      setTitle(r.title);
      setNotes(r.notes);
      setIngredientsText(r.ingredientLines.join("\n"));
      setYieldText(String(r.yieldServings));
      const hasManual =
        r.manualProteinG != null &&
        r.manualCarbsG != null &&
        r.manualFatG != null &&
        r.manualCalories != null;
      if (hasManual) {
        setManualP(String(r.manualProteinG));
        setManualC(String(r.manualCarbsG));
        setManualF(String(r.manualFatG));
        setManualKcal(String(r.manualCalories));
      } else {
        setManualP(r.cachedProteinG != null ? String(r.cachedProteinG) : "");
        setManualC(r.cachedCarbsG != null ? String(r.cachedCarbsG) : "");
        setManualF(r.cachedFatG != null ? String(r.cachedFatG) : "");
        setManualKcal(r.cachedCalories != null ? String(r.cachedCalories) : "");
      }
    }
  }, [savedRecipeId]);

  /** Auto-fill calories from macros whenever P/C/F parse as numbers. */
  useEffect(() => {
    const p = parseNum(manualP);
    const c = parseNum(manualC);
    const f = parseNum(manualF);
    if ([p, c, f].every((x) => !Number.isNaN(x)) && p >= 0 && c >= 0 && f >= 0) {
      setManualKcal(String(caloriesFromMacros(p, c, f)));
    }
  }, [manualP, manualC, manualF]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSave() {
    if (!recipe) return;
    const t = title.trim();
    if (!t) {
      Alert.alert("Validation", "Title is required.");
      return;
    }
    const y = parseNum(yieldText);
    if (Number.isNaN(y) || y <= 0) {
      Alert.alert("Validation", "Servings must be a positive number.");
      return;
    }
    const lines = ingredientsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const p = parseNum(manualP);
    const c = parseNum(manualC);
    const f = parseNum(manualF);
    const k = parseNum(manualKcal);
    if ([p, c, f, k].some((x) => Number.isNaN(x)) || p < 0 || c < 0 || f < 0 || k < 0) {
      Alert.alert("Validation", "Enter valid numbers for protein, carbs, fat, and calories.");
      return;
    }
    const next: SavedRecipe = {
      ...recipe,
      title: t,
      notes: notes.trim(),
      ingredientLines: lines.length > 0 ? lines : recipe.ingredientLines,
      yieldServings: y,
      manualProteinG: p,
      manualCarbsG: c,
      manualFatG: f,
      manualCalories: k,
    };
    await upsertSavedRecipe(next);
    Alert.alert("Saved", "Recipe updated.", [{ text: "OK", onPress: () => navigation.goBack() }]);
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Recipe name" />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Your notes"
        multiline
      />

      <Text style={styles.label}>Ingredients (one per line)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={ingredientsText}
        onChangeText={setIngredientsText}
        multiline
      />

      <Text style={styles.label}>Servings (yield)</Text>
      <TextInput style={styles.input} value={yieldText} onChangeText={setYieldText} keyboardType="decimal-pad" />

      <Text style={styles.label}>Protein (g)</Text>
      <TextInput style={styles.input} value={manualP} onChangeText={setManualP} keyboardType="decimal-pad" />
      <Text style={styles.label}>Carbs (g)</Text>
      <TextInput style={styles.input} value={manualC} onChangeText={setManualC} keyboardType="decimal-pad" />
      <Text style={styles.label}>Fat (g)</Text>
      <TextInput style={styles.input} value={manualF} onChangeText={setManualF} keyboardType="decimal-pad" />
      <Text style={styles.label}>Calories</Text>
      <TextInput style={styles.input} value={manualKcal} onChangeText={setManualKcal} keyboardType="decimal-pad" />
      <Text style={styles.hint}>Filled automatically from protein, carbs, and fat using 4·P + 4·C + 9·F (you can still edit).</Text>

      <Pressable style={styles.primary} onPress={handleSave}>
        <Text style={styles.primaryText}>Save changes</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#E5E7EB" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E5E7EB" },
  muted: { color: "#6B7280" },
  label: { fontWeight: "700", color: "#111827", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  hint: { color: "#6B7280", marginTop: 8, fontSize: 13 },
  primary: {
    marginTop: 24,
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
