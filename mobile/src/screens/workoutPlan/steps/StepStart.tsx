import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { stepStyles } from "../stepStyles";
import type { StepProps } from "../stepTypes";

function parseIso(iso: string | null): Date {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function StepStart({ draft, setDraft }: StepProps) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = parseIso(draft.startDateIso);

  function onDateChange(event: { type?: string }, selected?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "dismissed") return;
    }
    if (selected) {
      const d = new Date(selected);
      d.setHours(12, 0, 0, 0);
      setDraft((prev) => ({ ...prev, startDateIso: d.toISOString() }));
    }
  }

  return (
    <View>
      <Text style={stepStyles.label}>When do you want to start?</Text>
      <Text style={stepStyles.hint}>Start this week, or pick a specific start date.</Text>

      <View style={stepStyles.row}>
        <Pressable
          style={[stepStyles.toggle, draft.startThisWeek && stepStyles.toggleOn]}
          onPress={() => setDraft((d) => ({ ...d, startThisWeek: true }))}
        >
          <Text style={stepStyles.toggleText}>Start this week</Text>
        </Pressable>
        <Pressable
          style={[stepStyles.toggle, !draft.startThisWeek && stepStyles.toggleOn]}
          onPress={() =>
            setDraft((d) => ({
              ...d,
              startThisWeek: false,
              startDateIso: d.startDateIso ?? new Date().toISOString(),
            }))
          }
        >
          <Text style={stepStyles.toggleText}>Pick a date</Text>
        </Pressable>
      </View>

      {!draft.startThisWeek ? (
        <View style={{ marginTop: 12 }}>
          <Text style={stepStyles.label}>Start date</Text>
          <Pressable style={stepStyles.input} onPress={() => setShowPicker(true)}>
            <Text style={{ fontWeight: "600", color: "#111827" }}>
              {dateValue.toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Pressable>
          {showPicker ? (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
            />
          ) : null}
          {Platform.OS === "ios" && showPicker ? (
            <Pressable style={[stepStyles.toggle, { marginTop: 10 }]} onPress={() => setShowPicker(false)}>
              <Text style={stepStyles.toggleText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
