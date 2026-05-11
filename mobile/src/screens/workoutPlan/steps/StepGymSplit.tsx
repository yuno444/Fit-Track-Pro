import React from "react";
import { Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { GYM_SPLIT_TYPES, type GymSplitType } from "../../../types/workoutPlan";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

export function StepGymSplit({ draft, setDraft }: StepProps) {
  return (
    <View>
      <Text style={stepStyles.label}>Gym split</Text>
      <Text style={stepStyles.hint}>How you want to structure training across the week.</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.gymSplit}
          onValueChange={(v) => setDraft((d) => ({ ...d, gymSplit: v as GymSplitType }))}
        >
          {GYM_SPLIT_TYPES.map((x) => (
            <Picker.Item key={x} label={x} value={x} />
          ))}
        </Picker>
      </View>

      {draft.gymSplit === "Custom" ? (
        <View style={{ marginTop: 12 }}>
          <Text style={stepStyles.label}>Describe your split</Text>
          <TextInput
            style={stepStyles.input}
            placeholder="e.g. Legs 2×/week, upper 2×/week"
            placeholderTextColor="#9CA3AF"
            value={draft.gymSplitCustom}
            onChangeText={(gymSplitCustom) => setDraft((d) => ({ ...d, gymSplitCustom }))}
            multiline
          />
        </View>
      ) : null}
    </View>
  );
}
