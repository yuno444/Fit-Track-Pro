import React, { useCallback, useEffect, useMemo, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { addMeal, getMeals, updateMeal } from "../services/storage";
import type { MainStackParamList } from "../navigation/types";
import type { MealEntry } from "../types/meal";
import { caloriesFromMacros } from "../types/meal";
import { noonLocalStoredIso } from "../utils/localDateIso";
import { getSavedRecipes } from "../services/savedRecipeStorage";
import type { SavedRecipe } from "../types/savedRecipe";
import { effectiveMacros } from "../types/savedRecipe";

type Props = NativeStackScreenProps<MainStackParamList, "LogMeal">;

function formatMealDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseMacro(text: string): number {
  const n = parseFloat(text.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export function LogMealScreen({ navigation, route }: Props) {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [proteinText, setProteinText] = useState("");
  const [carbsText, setCarbsText] = useState("");
  const [fatText, setFatText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [estimateBanner, setEstimateBanner] = useState(false);
  const [mealDate, setMealDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [savedPickerKey, setSavedPickerKey] = useState("__manual__");

  const loadSavedList = useCallback(async () => {
    setSavedRecipes(await getSavedRecipes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedList();
    }, [loadSavedList])
  );

  function onMealDateChange(event: { type?: string }, selected?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "dismissed") return;
    }
    if (selected) setMealDate(selected);
  }

  function applySavedRecipe(recipeId: string) {
    const r = savedRecipes.find((x) => x.id === recipeId);
    if (!r) return;
    const m = effectiveMacros(r);
    setSavedPickerKey(recipeId);
    setName(r.title);
    setIngredients(r.ingredientLines.join("\n"));
    setProteinText(Number.isFinite(m.proteinG) ? String(Math.round(m.proteinG * 10) / 10) : "");
    setCarbsText(Number.isFinite(m.carbsG) ? String(Math.round(m.carbsG * 10) / 10) : "");
    setFatText(Number.isFinite(m.fatG) ? String(Math.round(m.fatG * 10) / 10) : "");
    setEstimateBanner(true);
    setMealDate(new Date());
  }

  function onSavedPickerChange(value: string) {
    setSavedPickerKey(value);
    if (value === "__manual__") {
      setEstimateBanner(false);
      return;
    }
    applySavedRecipe(value);
  }

  useEffect(() => {
    const editId = route.params?.editMealId;
    const preset = route.params?.preset;

    async function hydrate() {
      if (editId) {
        const meals = await getMeals();
        const m = meals.find((x) => x.id === editId);
        if (m) {
          setName(m.name);
          setIngredients(m.ingredientsAndWeight);
          setProteinText(String(m.proteinG));
          setCarbsText(String(m.carbsG));
          setFatText(String(m.fatG));
          setMealDate(new Date(m.loggedAt));
          setEstimateBanner(false);
          setSavedPickerKey("__manual__");
        }
        return;
      }

      if (preset) {
        setSavedPickerKey("__manual__");
        setName(preset.name);
        setIngredients(preset.ingredientsAndWeight);
        setProteinText(String(preset.proteinG));
        setCarbsText(String(preset.carbsG));
        setFatText(String(preset.fatG));
        setEstimateBanner(preset.isEstimate);
        setMealDate(new Date());
        return;
      }

      setSavedPickerKey("__manual__");
      setName("");
      setIngredients("");
      setProteinText("");
      setCarbsText("");
      setFatText("");
      setEstimateBanner(false);
      setMealDate(new Date());
    }

    void hydrate();
  }, [route.params?.editMealId, route.params?.preset]);

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
      setError("Enter protein (g), 0 or more.");
      return;
    }
    if (Number.isNaN(carbsG) || carbsG < 0) {
      setError("Enter carbs (g), 0 or more.");
      return;
    }
    if (Number.isNaN(fatG) || fatG < 0) {
      setError("Enter fat (g), 0 or more.");
      return;
    }
    if (proteinG + carbsG + fatG <= 0) {
      setError("Enter at least one macro greater than 0.");
      return;
    }

    const calories = caloriesFromMacros(proteinG, carbsG, fatG);
    const editId = route.params?.editMealId;
    const entry: MealEntry = {
      id: editId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmedName,
      ingredientsAndWeight: ingredients.trim(),
      proteinG,
      carbsG,
      fatG,
      calories,
      loggedAt: noonLocalStoredIso(mealDate),
    };

    setSaving(true);
    try {
      if (editId) {
        await updateMeal(entry);
      } else {
        await addMeal(entry);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save meal. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const editMealId = route.params?.editMealId;
  const saveLabel = saving ? "Saving..." : editMealId ? "Save changes" : "Save meal";

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {estimateBanner ? (
          <Text style={styles.estimateBanner}>
            Macros are estimates (e.g. from a recipe or your own split). Adjust before saving if needed.
          </Text>
        ) : null}
        {!editMealId ? (
          <>
            <Text style={styles.label}>Start from saved recipe (optional)</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={savedPickerKey} onValueChange={onSavedPickerChange} mode="dropdown">
                <Picker.Item label="— Enter macros manually —" value="__manual__" />
                {savedRecipes.map((r) => (
                  <Picker.Item key={r.id} label={r.title} value={r.id} />
                ))}
              </Picker>
            </View>
          </>
        ) : null}

        <Text style={styles.label}>Meal name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chicken bowl"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Date (local)</Text>
        <Text style={styles.dateHint}>Used for the nutrition week on the dashboard.</Text>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose meal date"
        >
          <Text style={styles.dateButtonText}>{formatMealDate(mealDate)}</Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={mealDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onMealDateChange}
          />
        ) : null}
        {Platform.OS === "ios" && showDatePicker ? (
          <Pressable style={styles.secondary} onPress={() => setShowDatePicker(false)}>
            <Text style={styles.secondaryText}>Done choosing date</Text>
          </Pressable>
        ) : null}

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
          <Text style={styles.caloriesPreview}>Estimated calories: {previewCalories} (4·P + 4·C + 9·F)</Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primary, saving && styles.primaryDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryText}>{saveLabel}</Text>
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
  estimateBanner: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    color: "#92400E",
    fontWeight: "600",
    fontSize: 14,
  },
  pickerWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 14,
    overflow: "hidden",
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
  dateHint: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
});
