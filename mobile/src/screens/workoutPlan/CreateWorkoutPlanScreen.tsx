import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/types";
import { addWorkoutPlan } from "../../services/workoutPlanStorage";
import {
  createEmptyDraft,
  defaultPlanName,
  draftToEntry,
  type WorkoutPlanDraft,
} from "../../types/workoutPlan";
import { StepGoals } from "./steps/StepGoals";
import { StepSessionFrequency } from "./steps/StepSessionFrequency";
import { StepStart } from "./steps/StepStart";
import { StepContext } from "./steps/StepContext";
import { StepInjuriesTypes } from "./steps/StepInjuriesTypes";
import { StepGymSplit } from "./steps/StepGymSplit";
import { StepNamePreview } from "./steps/StepNamePreview";
import { StepReview } from "./steps/StepReview";

type Props = NativeStackScreenProps<MainStackParamList, "CreateWorkoutPlan">;

const STEP_TITLES = [
  "Your goals",
  "Session length & frequency",
  "Start date",
  "Experience & equipment",
  "Injuries & workout types",
  "Gym split",
  "Plan name",
  "Review",
];

const STEP_COUNT = STEP_TITLES.length;

function validateAll(draft: WorkoutPlanDraft): string | null {
  for (let i = 0; i <= 6; i++) {
    const err = validateStep(i, draft);
    if (err) {
      return err;
    }
  }
  return null;
}

function validateStep(step: number, draft: WorkoutPlanDraft): string | null {
  switch (step) {
    case 0:
      if (draft.goals.length < 1) {
        return "Pick at least one goal.";
      }
      if (draft.goals.length > 1) {
        const p = draft.primaryGoal;
        if (!p || !draft.goals.includes(p)) {
          return "Choose a primary goal.";
        }
      }
      return null;
    case 1:
      if (draft.sessionMinMinutes > draft.sessionMaxMinutes) {
        return "Session minimum cannot be greater than maximum.";
      }
      return null;
    case 2:
      if (!draft.startThisWeek && !draft.startDateIso) {
        return "Pick a start date, or choose “Start this week”.";
      }
      return null;
    case 3:
      return null;
    case 4:
      if (draft.preferredTypes.length < 1) {
        return "Pick at least one preferred workout type.";
      }
      return null;
    case 5:
      if (draft.gymSplit === "Custom" && !draft.gymSplitCustom.trim()) {
        return "Describe your custom split.";
      }
      return null;
    case 6:
      if (!draft.planName.trim()) {
        return "Enter a plan name.";
      }
      return null;
    default:
      return null;
  }
}

export function CreateWorkoutPlanScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [saving, setSaving] = useState(false);

  const steps = [
    StepGoals,
    StepSessionFrequency,
    StepStart,
    StepContext,
    StepInjuriesTypes,
    StepGymSplit,
    StepNamePreview,
    StepReview,
  ];
  const StepBody = steps[step];

  function goNext() {
    const err = validateStep(step, draft);
    if (err) {
      Alert.alert("Check this step", err);
      return;
    }
    if (step === 5) {
      setDraft((d) => ({ ...d, planName: d.planName.trim() ? d.planName : defaultPlanName(d) }));
    }
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }

  async function save() {
    const err = validateAll(draft);
    if (err) {
      Alert.alert("Check your plan", err);
      return;
    }
    setSaving(true);
    try {
      await addWorkoutPlan(draftToEntry(draft));
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save your plan. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          Step {step + 1} of {STEP_COUNT}
        </Text>
        <Text style={styles.title}>{STEP_TITLES[step]}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <StepBody draft={draft} setDraft={setDraft} />
      </ScrollView>
      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.footerSpacer} />
        )}
        {step < STEP_COUNT - 1 ? (
          <Pressable style={styles.primaryBtn} onPress={goNext}>
            <Text style={styles.primaryText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.primaryBtn, saving && styles.primaryDisabled]} onPress={save} disabled={saving}>
            <Text style={styles.primaryText}>{saving ? "Saving..." : "Save plan"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  stepLabel: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 13,
  },
  title: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
  },
  footerSpacer: {
    width: 80,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  backText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
