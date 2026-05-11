import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteMeal, getMeals } from "../services/storage";
import type { MainStackParamList, MainTabsParamList } from "../navigation/types";
import type { MealEntry } from "../types/meal";

type RecipesNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Recipes">,
  NativeStackNavigationProp<MainStackParamList>
>;

function formatLoggedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function RecipesScreen() {
  const navigation = useNavigation<RecipesNav>();
  const [meals, setMeals] = useState<MealEntry[]>([]);

  const load = useCallback(async () => {
    setMeals(await getMeals());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function openAddMeal() {
    navigation.navigate("LogMeal", {});
  }

  function confirmDeleteMeal(meal: MealEntry) {
    Alert.alert("Delete this meal?", `Remove “${meal.name}”? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMeal(meal.id);
          await load();
        },
      },
    ]);
  }

  function editMeal(item: MealEntry) {
    navigation.navigate("LogMeal", { editMealId: item.id });
  }

  function renderItem({ item }: { item: MealEntry }) {
    return (
      <View style={styles.rowCard}>
        <Pressable
          style={styles.card}
          onPress={() => editMeal(item)}
          accessibilityRole="button"
          accessibilityHint="Opens meal editor"
        >
          <Text style={styles.mealName}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.calories} calories · P {Math.round(item.proteinG)}g · C {Math.round(item.carbsG)}g · F{" "}
            {Math.round(item.fatG)}g
          </Text>
          <Text style={styles.tapHint}>Tap to edit</Text>
          <Text style={styles.date}>{formatLoggedAt(item.loggedAt)}</Text>
          {item.ingredientsAndWeight ? (
            <Text style={styles.ingredients} numberOfLines={4}>
              {item.ingredientsAndWeight}
            </Text>
          ) : null}
        </Pressable>
        <Pressable
          style={styles.trashBtn}
          onPress={() => confirmDeleteMeal(item)}
          accessibilityRole="button"
          accessibilityLabel="Delete meal"
        >
          <Text style={styles.trashIcon} accessibilityElementsHidden>
            🗑
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
        <Text style={styles.subtitle}>Pantry, discovery, saved recipes, and logged meals</Text>
        <View style={styles.quickRow}>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("Pantry")}>
            <Text style={styles.secondaryBtnText}>My pantry</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("RecipeSearch")}>
            <Text style={styles.secondaryBtnText}>Discover</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("SavedRecipes")}>
            <Text style={styles.secondaryBtnText}>Saved</Text>
          </Pressable>
        </View>
        <Pressable style={styles.addButton} onPress={openAddMeal}>
          <Text style={styles.addButtonText}>+ Add meal</Text>
        </Pressable>
      </View>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={meals.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No logged meals yet. Use Discover with your pantry, save a recipe, then “Log as meal”, or tap “Add meal”.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    color: "#6B7280",
    marginBottom: 12,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1D4ED8",
  },
  secondaryBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13,
  },
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 12,
    gap: 8,
  },
  trashBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    minWidth: 44,
  },
  trashIcon: {
    fontSize: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    marginTop: 6,
    color: "#374151",
    fontWeight: "600",
  },
  tapHint: {
    marginTop: 4,
    color: "#1D4ED8",
    fontWeight: "600",
    fontSize: 13,
  },
  date: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  ingredients: {
    marginTop: 10,
    color: "#4B5563",
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 22,
  },
});
