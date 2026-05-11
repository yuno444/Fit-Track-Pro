import React from "react";
import { Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

const SESSION_OPTIONS = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120];

export function StepSessionFrequency({ draft, setDraft }: StepProps) {
  return (
    <View>
      <Text style={stepStyles.label}>Session length (minutes)</Text>
      <Text style={stepStyles.hint}>Pick a typical range for one workout (min and max).</Text>

      <Text style={[stepStyles.label, { marginTop: 8 }]}>Minimum</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.sessionMinMinutes}
          onValueChange={(v) => {
            const n = Number(v);
            setDraft((d) => ({
              ...d,
              sessionMinMinutes: n,
              sessionMaxMinutes: Math.max(n, d.sessionMaxMinutes),
            }));
          }}
        >
          {SESSION_OPTIONS.map((m) => (
            <Picker.Item key={`min-${m}`} label={`${m} min`} value={m} />
          ))}
        </Picker>
      </View>

      <Text style={stepStyles.label}>Maximum</Text>
      <View style={stepStyles.pickerWrap}>
        <Picker
          selectedValue={draft.sessionMaxMinutes}
          onValueChange={(v) => {
            const n = Number(v);
            setDraft((d) => ({
              ...d,
              sessionMaxMinutes: n,
              sessionMinMinutes: Math.min(n, d.sessionMinMinutes),
            }));
          }}
        >
          {SESSION_OPTIONS.filter((m) => m >= draft.sessionMinMinutes).map((m) => (
            <Picker.Item key={`max-${m}`} label={`${m} min`} value={m} />
          ))}
        </Picker>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={stepStyles.label}>Workouts per week</Text>
        <View style={stepStyles.pickerWrap}>
          <Picker
            selectedValue={draft.workoutsPerWeek}
            onValueChange={(v) => setDraft((d) => ({ ...d, workoutsPerWeek: Number(v) }))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Picker.Item key={n} label={`${n} per week`} value={n} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}
