import React from "react";
import { Text, TextInput, View } from "react-native";
import { buildPlanSummary, defaultPlanName } from "../../../types/workoutPlan";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

export function StepNamePreview({ draft, setDraft }: StepProps) {
  const summary = buildPlanSummary(draft);

  return (
    <View>
      <Text style={stepStyles.label}>Plan name</Text>
      <Text style={stepStyles.hint}>We filled in a default — edit it if you like.</Text>
      <TextInput
        style={stepStyles.input}
        value={draft.planName}
        onChangeText={(planName) => setDraft((d) => ({ ...d, planName }))}
        placeholder={defaultPlanName(draft)}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={[stepStyles.label, { marginTop: 20 }]}>Summary preview</Text>
      <View style={stepStyles.summaryBox}>
        <Text style={stepStyles.summaryText}>{summary}</Text>
      </View>
    </View>
  );
}
