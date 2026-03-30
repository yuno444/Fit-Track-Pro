import React, { useCallback, useState } from "react";
import {
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
import { getMeals } from "../services/storage";
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
    navigation.navigate("LogMeal");
  }

  function renderItem({ item }: { item: MealEntry }) {
    return (
      <View style={styles.card}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.calories} kcal · P {Math.round(item.proteinG)}g · C {Math.round(item.carbsG)}g · F{" "}
          {Math.round(item.fatG)}g
        </Text>
        <Text style={styles.date}>{formatLoggedAt(item.loggedAt)}</Text>
        {item.ingredientsAndWeight ? (
          <Text style={styles.ingredients} numberOfLines={4}>
            {item.ingredientsAndWeight}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
        <Text style={styles.subtitle}>Meals you have saved</Text>
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
          <Text style={styles.emptyText}>No meals yet. Tap “Add meal” or use “Add a Meal” on the dashboard.</Text>
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
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    marginBottom: 12,
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
