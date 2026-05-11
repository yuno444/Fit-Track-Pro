import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainTabNavigator } from "./MainTabNavigator";
import { LogWorkoutScreen } from "../screens/LogWorkoutScreen";
import { LogMealScreen } from "../screens/LogMealScreen";
import { CreateWorkoutPlanScreen } from "../screens/workoutPlan/CreateWorkoutPlanScreen";
import { WorkoutPlanDetailScreen } from "../screens/WorkoutPlanDetailScreen";
import { PantryScreen } from "../screens/PantryScreen";
import { RecipeSearchScreen } from "../screens/RecipeSearchScreen";
import { SavedRecipesScreen } from "../screens/SavedRecipesScreen";
import { RecipeDetailScreen } from "../screens/RecipeDetailScreen";
import { EditSavedRecipeScreen } from "../screens/EditSavedRecipeScreen";
import type { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={{
          title: "Log workout",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="LogMeal"
        component={LogMealScreen}
        options={{
          title: "Add meal",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="CreateWorkoutPlan"
        component={CreateWorkoutPlanScreen}
        options={{
          title: "Create plan",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="WorkoutPlanDetail"
        component={WorkoutPlanDetailScreen}
        options={{
          title: "Workout plan",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          title: "My pantry",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="RecipeSearch"
        component={RecipeSearchScreen}
        options={{
          title: "Discover recipes",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="SavedRecipes"
        component={SavedRecipesScreen}
        options={{
          title: "Saved recipes",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={({ route }) => ({
          title: route.params.source === "remote" ? route.params.title ?? "Recipe" : "Saved recipe",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        })}
      />
      <Stack.Screen
        name="EditSavedRecipe"
        component={EditSavedRecipeScreen}
        options={{
          title: "Edit recipe",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#1D4ED8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700", color: "#FFFFFF" },
        }}
      />
    </Stack.Navigator>
  );
}
