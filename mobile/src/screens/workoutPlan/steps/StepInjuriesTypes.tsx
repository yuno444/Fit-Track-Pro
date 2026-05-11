import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { INJURY_OPTIONS, type InjuryTag } from "../../../types/workoutPlan";
import { WORKOUT_TYPES, type WorkoutType } from "../../../types/workout";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

function toggle<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function StepInjuriesTypes({ draft, setDraft }: StepProps) {
  return (
    <View>
      <Text style={stepStyles.label}>Injuries or constraints</Text>
      <Text style={stepStyles.hint}>Select any that apply. Use “None” if not applicable.</Text>
      <View style={stepStyles.chipRow}>
        {INJURY_OPTIONS.map((tag) => {
          const on = draft.injuries.includes(tag);
          return (
            <Pressable
              key={tag}
              style={[stepStyles.chip, on && stepStyles.chipOn]}
              disabled={draft.injuryNone}
              onPress={() =>
                setDraft((d) => ({
                  ...d,
                  injuries: toggle(d.injuries, tag as InjuryTag),
                  injuryNone: false,
                }))
              }
            >
              <Text style={[stepStyles.chipText, on && stepStyles.chipTextOn]}>{tag}</Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        style={[stepStyles.input, { marginTop: 10 }]}
        placeholder="Other notes (optional)"
        placeholderTextColor="#9CA3AF"
        value={draft.injuryOther}
        editable={!draft.injuryNone}
        onChangeText={(injuryOther) => setDraft((d) => ({ ...d, injuryOther, injuryNone: false }))}
      />
      <Pressable
        style={[stepStyles.toggle, { marginTop: 12 }, draft.injuryNone && stepStyles.toggleOn]}
        onPress={() =>
          setDraft((d) => {
            if (d.injuryNone) {
              return { ...d, injuryNone: false };
            }
            return { ...d, injuryNone: true, injuries: [], injuryOther: "" };
          })
        }
      >
        <Text style={stepStyles.toggleText}>None — no injuries or constraints</Text>
      </Pressable>

      <View style={{ marginTop: 24 }}>
        <Text style={stepStyles.label}>Preferred workout types</Text>
        <Text style={stepStyles.hint}>Pick at least one (matches how you log workouts).</Text>
        <View style={stepStyles.chipRow}>
          {WORKOUT_TYPES.map((t) => {
            const on = draft.preferredTypes.includes(t);
            return (
              <Pressable
                key={t}
                style={[stepStyles.chip, on && stepStyles.chipOn]}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    preferredTypes: toggle(d.preferredTypes, t as WorkoutType),
                  }))
                }
              >
                <Text style={[stepStyles.chipText, on && stepStyles.chipTextOn]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
