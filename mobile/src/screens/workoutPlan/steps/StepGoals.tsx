import React from "react";
import { Pressable, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { PLAN_GOALS, type PlanGoal } from "../../../types/workoutPlan";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

function toggleGoal(goals: PlanGoal[], g: PlanGoal): PlanGoal[] {
  if (goals.includes(g)) {
    return goals.filter((x) => x !== g);
  }
  return [...goals, g];
}

export function StepGoals({ draft, setDraft }: StepProps) {
  return (
    <View>
      <Text style={stepStyles.label}>What&apos;s your goal?</Text>
      <Text style={stepStyles.hint}>You can pick more than one. If you pick several, choose a primary goal below.</Text>
      <View style={stepStyles.chipRow}>
        {PLAN_GOALS.map((g) => {
          const on = draft.goals.includes(g);
          return (
            <Pressable
              key={g}
              style={[stepStyles.chip, on && stepStyles.chipOn]}
              onPress={() =>
                setDraft((d) => {
                  const goals = toggleGoal(d.goals, g);
                  let primaryGoal = d.primaryGoal;
                  if (goals.length <= 1) {
                    primaryGoal = null;
                  } else if (!primaryGoal || !goals.includes(primaryGoal)) {
                    primaryGoal = goals[0];
                  }
                  return { ...d, goals, primaryGoal };
                })
              }
            >
              <Text style={[stepStyles.chipText, on && stepStyles.chipTextOn]}>{g}</Text>
            </Pressable>
          );
        })}
      </View>

      {draft.goals.length > 1 ? (
        <View style={[stepStyles.block, { marginTop: 20 }]}>
          <Text style={stepStyles.label}>Primary goal</Text>
          <Text style={stepStyles.hint}>Used when goals conflict (e.g. muscle vs weight loss).</Text>
          <View style={stepStyles.pickerWrap}>
            <Picker
              selectedValue={draft.primaryGoal ?? draft.goals[0]}
              onValueChange={(v) => setDraft((d) => ({ ...d, primaryGoal: v as PlanGoal }))}
            >
              {draft.goals.map((g) => (
                <Picker.Item key={g} label={g} value={g} />
              ))}
            </Picker>
          </View>
        </View>
      ) : null}
    </View>
  );
}
