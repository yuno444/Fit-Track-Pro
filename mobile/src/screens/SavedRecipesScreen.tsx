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
import type { MainStackParamList, MainTabsParamList } from "../navigation/types";
import type { SavedRecipe } from "../types/savedRecipe";
import { effectiveMacros } from "../types/savedRecipe";
import { deleteSavedRecipe, getSavedRecipes, upsertSavedRecipe } from "../services/savedRecipeStorage";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Recipes">,
  NativeStackNavigationProp<MainStackParamList>
>;

export function SavedRecipesScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<SavedRecipe[]>([]);

  const load = useCallback(async () => {
    setItems(await getSavedRecipes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleFavorite(r: SavedRecipe) {
    await upsertSavedRecipe({ ...r, favorite: !r.favorite });
    await load();
  }

  function confirmDelete(r: SavedRecipe) {
    Alert.alert("Delete saved recipe?", `Remove “${r.title}”?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSavedRecipe(r.id);
          await load();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved recipes</Text>
        <Text style={styles.subtitle}>Available offline. Tap to open; star to favorite.</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(r) => r.id}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No saved recipes yet. Save one from Discover or recipe detail.</Text>}
        renderItem={({ item }) => {
          const m = effectiveMacros(item);
          return (
            <View style={styles.row}>
              <Pressable
                style={styles.card}
                onPress={() => navigation.navigate("RecipeDetail", { source: "saved", savedRecipeId: item.id })}
              >
                <Text style={styles.cardTitle}>{item.favorite ? "★ " : ""}{item.title}</Text>
                <Text style={styles.meta}>
                  {m.calories > 0 ? `${Math.round(m.calories)} calories` : "— calories"} · P {Math.round(m.proteinG)}g · C{" "}
                  {Math.round(m.carbsG)}g · F {Math.round(m.fatG)}g
                </Text>
                <Text style={styles.src}>{item.source}</Text>
              </Pressable>
              <View style={styles.side}>
                <Pressable style={styles.iconBtn} onPress={() => toggleFavorite(item)} accessibilityLabel="Toggle favorite">
                  <Text style={styles.iconText}>{item.favorite ? "★" : "☆"}</Text>
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate("EditSavedRecipe", { savedRecipeId: item.id })}
                  accessibilityLabel="Edit"
                >
                  <Text style={styles.iconText}>✎</Text>
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => confirmDelete(item)} accessibilityLabel="Delete">
                  <Text style={styles.iconText}>🗑</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E5E7EB" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyList: { flexGrow: 1, paddingHorizontal: 16, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#6B7280", fontSize: 16, lineHeight: 22 },
  row: { flexDirection: "row", marginBottom: 12, gap: 8, alignItems: "stretch" },
  card: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1E3A8A" },
  meta: { marginTop: 6, color: "#1D4ED8", fontWeight: "600", fontSize: 13 },
  src: { marginTop: 4, color: "#64748B", fontSize: 12 },
  side: { justifyContent: "center", gap: 4 },
  iconBtn: { padding: 8, minWidth: 40, alignItems: "center" },
  iconText: { fontSize: 18 },
});
