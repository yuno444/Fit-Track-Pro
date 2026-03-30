import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addMeal } from "../services/storage";
import type { MainStackParamList } from "../navigation/types";
import type { MealEntry } from "../types/meal";
import { caloriesFromMacros } from "../types/meal";

type Props = NativeStackScreenProps<MainStackParamList, "LogMeal">;

function parseMacro(text: string): number {
  const n = parseFloat(text.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export function LogMealScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [proteinText, setProteinText] = useState("");
  const [carbsText, setCarbsText] = useState("");
  const [fatText, setFatText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const previewCalories = useMemo(() => {
    const p = parseMacro(proteinText);
    const c = parseMacro(carbsText);
    const f = parseMacro(fatText);
    if ([p, c, f].some((x) => Number.isNaN(x)) || p < 0 || c < 0 || f < 0) {
      return null;
    }
    return caloriesFromMacros(p, c, f);
  }, [proteinText, carbsText, fatText]);

  async function handleSave() {
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a meal name.");
      return;
    }

    const proteinG = parseMacro(proteinText);
    const carbsG = parseMacro(carbsText);
    const fatG = parseMacro(fatText);

    if (Number.isNaN(proteinG) || proteinG < 0) {
      setError("Enter protein (grams), 0 or more.");
      return;
    }
    if (Number.isNaN(carbsG) || carbsG < 0) {
      setError("Enter carbs (grams), 0 or more.");
      return;
    }
    if (Number.isNaN(fatG) || fatG < 0) {
      setError("Enter fat (grams), 0 or more.");
      return;
    }
    if (proteinG + carbsG + fatG <= 0) {
      setError("Enter at least one macro greater than 0.");
      return;
    }

    const calories = caloriesFromMacros(proteinG, carbsG, fatG);
    const entry: MealEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmedName,
      ingredientsAndWeight: ingredients.trim(),
      proteinG,
      carbsG,
      fatG,
      calories,
      loggedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await addMeal(entry);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save meal. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Meal name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chicken bowl"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Ingredients and weight</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="e.g. Chicken breast 200g, jasmine rice 150g, broccoli 100g"
          placeholderTextColor="#9CA3AF"
          value={ingredients}
          onChangeText={setIngredients}
          multiline
        />

        <Text style={styles.label}>Protein (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          value={proteinText}
          onChangeText={setProteinText}
        />

        <Text style={styles.label}>Carbs (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          value={carbsText}
          onChangeText={setCarbsText}
        />

        <Text style={styles.label}>Fat (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          value={fatText}
          onChangeText={setFatText}
        />

        {previewCalories != null ? (
          <Text style={styles.caloriesPreview}>Estimated calories: {previewCalories} kcal (4·P + 4·C + 9·F)</Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primary, saving && styles.primaryDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryText}>{saving ? "Saving..." : "Save meal"}</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  caloriesPreview: {
    color: "#374151",
    marginBottom: 10,
    fontWeight: "600",
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
  },
  primary: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondary: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "700",
  },
});
