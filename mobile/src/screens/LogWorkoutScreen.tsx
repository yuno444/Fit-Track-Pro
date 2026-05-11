import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addWorkout } from "../services/storage";
import type { MainStackParamList } from "../navigation/types";
import { WORKOUT_TYPES, type WorkoutEntry, type WorkoutType } from "../types/workout";
import { noonLocalStoredIso } from "../utils/localDateIso";

type Props = NativeStackScreenProps<MainStackParamList, "LogWorkout">;

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LogWorkoutScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [durationText, setDurationText] = useState("");
  const [caloriesText, setCaloriesText] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("Cardio");
  const [workoutDate, setWorkoutDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Handles date selection on Android and iOS
  function onDateChange(event: { type?: string }, selected?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "dismissed") {
        return;
      }
    }
    if (selected) {
      setWorkoutDate(selected);
    }
  }

  async function handleSave() {
    setError("");

    // Converts string inputs to numbers, and if users use commas instead of periods for decimals (1,0 vs 1.0) it'll replace it.
    const durationMinutes = parseFloat(durationText.replace(",", "."));
    const caloriesBurned = parseFloat(caloriesText.replace(",", "."));

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setError("Enter a valid duration in minutes (greater than 0).");
      return;
    }
    if (!Number.isFinite(caloriesBurned) || caloriesBurned < 0) {
      setError("Enter calories burned (0 or more).");
      return;
    }

    // WorkoutEntry is a type that represents a workout session in the app
    const entry: WorkoutEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim() || "Workout",
      startedAt: noonLocalStoredIso(workoutDate),
      durationMinutes,
      caloriesBurned,
      workoutType,
    };

    setSaving(true);
    try {
      await addWorkout(entry);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save workout. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Workout type</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={workoutType} onValueChange={(v) => setWorkoutType(v as WorkoutType)}>
            {WORKOUT_TYPES.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Date</Text>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose workout date"
        >
          <Text style={styles.dateButtonText}>{formatDate(workoutDate)}</Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={workoutDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        ) : null}
        {Platform.OS === "ios" && showDatePicker ? (
          <Pressable style={styles.secondary} onPress={() => setShowDatePicker(false)}>
            <Text style={styles.secondaryText}>Done</Text>
          </Pressable>
        ) : null}

        <Text style={styles.label}>Workout name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Morning run"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="30"
          placeholderTextColor="#9CA3AF"
          value={durationText}
          onChangeText={setDurationText}
        />

        <Text style={styles.label}>Calories burned</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="250"
          placeholderTextColor="#9CA3AF"
          value={caloriesText}
          onChangeText={setCaloriesText}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primary, saving && styles.primaryDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryText}>{saving ? "Saving..." : "Save workout"}</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  pickerWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 14,
    overflow: "hidden",
  },
  dateButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
  },
  primary: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondary: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "700",
  },
});
