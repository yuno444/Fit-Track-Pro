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
import { getWorkouts } from "../services/storage";
import type { MainStackParamList, MainTabsParamList } from "../navigation/types";
import type { WorkoutEntry } from "../types/workout";

type WorkoutsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Workouts">,
  NativeStackNavigationProp<MainStackParamList>
>;
// Formats the workout date to a readable string
function formatWorkoutDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest > 0 ? `${h}h ${rest}m` : `${h}h`;
}
// Displays the list of workouts from the "Log New Workout" button on the dashboard
export function WorkoutsScreen() {
  const navigation = useNavigation<WorkoutsNav>();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  const load = useCallback(async () => {
    setWorkouts(await getWorkouts());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function openLogWorkout() {
    navigation.navigate("LogWorkout");
  }

  function renderItem({ item }: { item: WorkoutEntry }) {
    return (
      <View style={styles.card}>
        <Text style={styles.workoutTitle}>{item.title}</Text>
        <Text style={styles.type}>{item.workoutType}</Text>
        <Text style={styles.meta}>
          {formatDuration(item.durationMinutes)} · {Math.round(item.caloriesBurned)} kcal burned
        </Text>
        <Text style={styles.date}>{formatWorkoutDate(item.startedAt)}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>Sessions you have logged</Text>
        <Pressable style={styles.addButton} onPress={openLogWorkout}>
          <Text style={styles.addButtonText}>+ Log workout</Text>
        </Pressable>
      </View>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={workouts.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No workouts yet. Tap “Log workout” or use “Log New Workout” on the dashboard.
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
  workoutTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  type: {
    marginTop: 4,
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
  meta: {
    marginTop: 8,
    color: "#374151",
    fontWeight: "600",
  },
  date: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 22,
  },
});
