import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PlaceholderScreen } from "../screens/PlaceholderScreen";

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="Workouts"
        children={() => <PlaceholderScreen title="Workouts" subtitle="Coming soon in the next iteration." />}
      />
      <Tab.Screen
        name="Recipes"
        children={() => <PlaceholderScreen title="Recipes" subtitle="Coming soon in the next iteration." />}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
