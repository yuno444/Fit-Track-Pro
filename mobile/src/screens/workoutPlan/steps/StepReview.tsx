import React from "react";
import { Text, View } from "react-native";
import { buildPlanSummary, defaultPlanName } from "../../../types/workoutPlan";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

function row(label: string, value: string) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600" }}>{label}</Text>
      <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600", marginTop: 2 }}>{value}</Text>
    </View>
  );
}

export function StepReview({ draft }: StepProps) {
  const goalsText =
    draft.goals.length === 0
      ? "—"
      : draft.goals.length > 1 && draft.primaryGoal
        ? `${draft.goals.join(", ")} (primary: ${draft.primaryGoal})`
        : draft.goals.join(", ");
  const sessionText =
    draft.sessionMinMinutes === draft.sessionMaxMinutes
      ? `${draft.sessionMinMinutes} min`
      : `${draft.sessionMinMinutes}–${draft.sessionMaxMinutes} min`;
  const startText = draft.startThisWeek ? "Start this week" : draft.startDateIso ? new Date(draft.startDateIso).toLocaleDateString() : "—";
  const injuriesText = draft.injuryNone
    ? "None"
    : [draft.injuries.join(", "), draft.injuryOther.trim()].filter(Boolean).join(" · ") || "—";
  const typesText = draft.preferredTypes.length ? draft.preferredTypes.join(", ") : "—";
  const splitText = draft.gymSplit === "Custom" ? `Custom — ${draft.gymSplitCustom.trim() || "—"}` : draft.gymSplit;

  return (
    <View>
      <Text style={stepStyles.label}>Review your plan</Text>
      <Text style={stepStyles.hint}>Check everything below, then tap Save in the bar at the bottom.</Text>

      <View style={[stepStyles.summaryBox, { marginBottom: 16 }]}>
        <Text style={{ color: "#1E40AF", fontSize: 13, fontWeight: "600" }}>Summary</Text>
        <Text style={[stepStyles.summaryText, { marginTop: 6 }]}>{buildPlanSummary(draft)}</Text>
      </View>

      {row("Plan name", draft.planName.trim() || defaultPlanName(draft))}
      {row("Goals", goalsText)}
      {row("Session length", sessionText)}
      {row("Frequency", `${draft.workoutsPerWeek}× per week`)}
      {row("Start", startText)}
      {row("Experience", draft.experienceLevel)}
      {row("Equipment", draft.equipment)}
      {row("Schedule preference", draft.restPreference)}
      {row("Time of day", draft.timeOfDay)}
      {row("Injuries / constraints", injuriesText)}
      {row("Preferred types", typesText)}
      {row("Gym split", splitText)}
    </View>
  );
}
