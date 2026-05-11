import React from "react";
import { Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  REST_PREFERENCES,
  TIME_OF_DAY_OPTIONS,
  type Equipment,
  type ExperienceLevel,
  type RestPreference,
  type TimeOfDay,
} from "../../../types/workoutPlan";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

export function StepContext({ draft, setDraft }: StepProps) {
  return (
    <View>
      <Text style={stepStyles.label}>Experience level</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.experienceLevel}
          onValueChange={(v) => setDraft((d) => ({ ...d, experienceLevel: v as ExperienceLevel }))}
        >
          {EXPERIENCE_LEVELS.map((x) => (
            <Picker.Item key={x} label={x} value={x} />
          ))}
        </Picker>
      </View>

      <Text style={[stepStyles.label, { marginTop: 16 }]}>Equipment</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.equipment}
          onValueChange={(v) => setDraft((d) => ({ ...d, equipment: v as Equipment }))}
        >
          {EQUIPMENT_OPTIONS.map((x) => (
            <Picker.Item key={x} label={x} value={x} />
          ))}
        </Picker>
      </View>

      <Text style={[stepStyles.label, { marginTop: 16 }]}>Rest / schedule preference</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.restPreference}
          onValueChange={(v) => setDraft((d) => ({ ...d, restPreference: v as RestPreference }))}
        >
          {REST_PREFERENCES.map((x) => (
            <Picker.Item key={x} label={x} value={x} />
          ))}
        </Picker>
      </View>

      <Text style={[stepStyles.label, { marginTop: 16 }]}>Preferred time of day</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.timeOfDay}
          onValueChange={(v) => setDraft((d) => ({ ...d, timeOfDay: v as TimeOfDay }))}
        >
          {TIME_OF_DAY_OPTIONS.map((x) => (
            <Picker.Item key={x} label={x} value={x} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
