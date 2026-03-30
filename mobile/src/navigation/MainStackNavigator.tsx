import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainTabNavigator } from "./MainTabNavigator";
import { LogWorkoutScreen } from "../screens/LogWorkoutScreen";
import { LogMealScreen } from "../screens/LogMealScreen";
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
    </Stack.Navigator>
  );
}
