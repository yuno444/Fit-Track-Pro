import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteWorkout, getWorkouts } from "../services/storage";
import { deleteWorkoutPlan, getWorkoutPlans } from "../services/workoutPlanStorage";
import type { MainStackParamList, MainTabsParamList } from "../navigation/types";
import type { WorkoutEntry } from "../types/workout";
import type { WorkoutPlanEntry } from "../types/workoutPlan";

type WorkoutsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Workouts">,
  NativeStackNavigationProp<MainStackParamList>
>;

type PlanRow = { kind: "plan"; plan: WorkoutPlanEntry };
type WorkoutRow = { kind: "workout"; workout: WorkoutEntry };
type ListRow = PlanRow | WorkoutRow;

type Section = {
  title: string;
  key: "plans" | "workouts";
  data: ListRow[];
};

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

function formatPlanCreated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function WorkoutsScreen() {
  const navigation = useNavigation<WorkoutsNav>();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [plans, setPlans] = useState<WorkoutPlanEntry[]>([]);

  const load = useCallback(async () => {
    const [w, p] = await Promise.all([getWorkouts(), getWorkoutPlans()]);
    setWorkouts(w);
    setPlans(p);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sections: Section[] = [
    {
      title: "Workout plans",
      key: "plans",
      data: plans.map((plan) => ({ kind: "plan" as const, plan })),
    },
    {
      title: "Logged sessions",
      key: "workouts",
      data: workouts.map((workout) => ({ kind: "workout" as const, workout })),
    },
  ];

  function openLogWorkout() {
    navigation.navigate("LogWorkout");
  }

  function openCreatePlan() {
    navigation.navigate("CreateWorkoutPlan");
  }

  function openPlanDetail(planId: string) {
    navigation.navigate("WorkoutPlanDetail", { planId });
  }

  function confirmDeletePlan(plan: WorkoutPlanEntry) {
    Alert.alert("Delete this workout plan?", `Remove “${plan.planName}”? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteWorkoutPlan(plan.id);
          await load();
        },
      },
    ]);
  }

  function confirmDeleteWorkout(workout: WorkoutEntry) {
    Alert.alert("Delete this workout?", `Remove “${workout.title}”? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteWorkout(workout.id);
          await load();
        },
      },
    ]);
  }

  function renderItem({ item }: { item: ListRow }) {
    if (item.kind === "plan") {
      const { plan } = item;
      return (
        <View style={styles.rowCard}>
          <Pressable style={styles.planCard} onPress={() => openPlanDetail(plan.id)}>
            <Text style={styles.planTitle}>{plan.planName}</Text>
            <Text style={styles.planSummary}>{plan.summary}</Text>
            <Text style={styles.planDate}>{formatPlanCreated(plan.createdAt)}</Text>
          </Pressable>
          <Pressable
            style={styles.trashBtn}
            onPress={() => confirmDeletePlan(plan)}
            accessibilityRole="button"
            accessibilityLabel="Delete workout plan"
          >
            <Text style={styles.trashIcon} accessibilityElementsHidden>
              🗑
            </Text>
          </Pressable>
        </View>
      );
    }
    const { workout } = item;
    return (
      <View style={styles.rowCard}>
        <View style={styles.card}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.type}>{workout.workoutType}</Text>
          <Text style={styles.meta}>
            {formatDuration(workout.durationMinutes)} · {Math.round(workout.caloriesBurned)} calories burned
          </Text>
          <Text style={styles.date}>{formatWorkoutDate(workout.startedAt)}</Text>
        </View>
        <Pressable
          style={styles.trashBtn}
          onPress={() => confirmDeleteWorkout(workout)}
          accessibilityRole="button"
          accessibilityLabel="Delete logged workout"
        >
          <Text style={styles.trashIcon} accessibilityElementsHidden>
            🗑
          </Text>
        </Pressable>
      </View>
    );
  }

  const listEmpty = plans.length === 0 && workouts.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>Plans and sessions</Text>
        <View style={styles.actions}>
          <Pressable style={styles.secondaryBtn} onPress={openCreatePlan}>
            <Text style={styles.secondaryBtnText}>Create workout plan</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={openLogWorkout}>
            <Text style={styles.primaryBtnText}>+ Log workout</Text>
          </Pressable>
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => (item.kind === "plan" ? `plan-${item.plan.id}` : `w-${item.workout.id}`)}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        contentContainerStyle={listEmpty ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No plans or logged workouts yet. Create a plan or log a session to get started.
          </Text>
        }
        stickySectionHeadersEnabled={false}
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
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1D4ED8",
  },
  secondaryBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
    marginTop: 8,
    marginBottom: 8,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 10,
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
  planCard: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  planSummary: {
    marginTop: 6,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  planDate: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
  },
  card: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
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
