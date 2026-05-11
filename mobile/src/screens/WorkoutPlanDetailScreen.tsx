import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/types";
import { getWorkoutPlans } from "../services/workoutPlanStorage";
import type { WorkoutPlanEntry } from "../types/workoutPlan";

type Props = NativeStackScreenProps<MainStackParamList, "WorkoutPlanDetail">;

function formatCreated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function row(label: string, value: string) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function WorkoutPlanDetailScreen({ route }: Props) {
  const { planId } = route.params;
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<WorkoutPlanEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const plans = await getWorkoutPlans();
    setPlan(plans.find((p) => p.id === planId) ?? null);
    setLoading(false);
  }, [planId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>This plan could not be found.</Text>
      </View>
    );
  }

  const goalsText =
    plan.goals.length > 1 && plan.primaryGoal
      ? `${plan.goals.join(", ")} (primary: ${plan.primaryGoal})`
      : plan.goals.join(", ");
  const sessionText =
    plan.sessionMinMinutes === plan.sessionMaxMinutes
      ? `${plan.sessionMinMinutes} min`
      : `${plan.sessionMinMinutes}–${plan.sessionMaxMinutes} min`;
  const startText = plan.startThisWeek ? "Start this week" : plan.startDateIso ? new Date(plan.startDateIso).toLocaleDateString() : "—";
  const injuriesText = plan.injuryNone
    ? "None"
    : [plan.injuries.join(", "), plan.injuryOther].filter(Boolean).join(" · ") || "—";
  const splitText = plan.gymSplit === "Custom" ? `Custom — ${plan.gymSplitCustom || "—"}` : plan.gymSplit;

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.root}>
      <Text style={styles.title}>{plan.planName}</Text>
      <Text style={styles.summary}>{plan.summary}</Text>
      <Text style={styles.created}>Created {formatCreated(plan.createdAt)}</Text>

      <View style={styles.card}>
        {row("Goals", goalsText)}
        {row("Session length", sessionText)}
        {row("Frequency", `${plan.workoutsPerWeek}× per week`)}
        {row("Start", startText)}
        {row("Experience", plan.experienceLevel)}
        {row("Equipment", plan.equipment)}
        {row("Schedule preference", plan.restPreference)}
        {row("Time of day", plan.timeOfDay)}
        {row("Injuries / constraints", injuriesText)}
        {row("Preferred types", plan.preferredTypes.join(", "))}
        {row("Gym split", splitText)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    padding: 24,
  },
  muted: {
    color: "#6B7280",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  summary: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  created: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
  },
  card: {
    marginTop: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 16,
  },
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
  rowValue: {
    marginTop: 4,
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
});
