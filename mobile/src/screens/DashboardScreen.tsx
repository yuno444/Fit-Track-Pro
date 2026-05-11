import React, { useCallback, useMemo, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getMeals, getWorkouts } from "../services/storage";
import { getWeightEntries, upsertWeightForDate } from "../services/weightLogStorage";
import type { MainStackParamList, MainTabsParamList } from "../navigation/types";
import { computeWeekStats } from "../utils/workoutStats";
import { nutritionRollupWeekMonSun } from "../utils/dashboardNutrition";
import { weeklyTrainingVolumeSeries } from "../utils/dashboardTrainingVolume";
import { localDateISO } from "../utils/localDateIso";
import {
  deltaFirstLastLb,
  deltaVsSevenDaysAgo,
  formatDeltaLb,
  weightEntriesForChart,
  weightSeriesLb,
} from "../utils/weightChartHelpers";
import { SvgBarChart, SvgSparkline } from "../components/dashboard/SimpleSvgCharts";

type DashboardNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Dashboard">,
  NativeStackNavigationProp<MainStackParamList>
>;

const CHART_HEIGHT = 140;

function formatPickDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseWeightLb(text: string): number | null {
  const n = parseFloat(text.replace(",", ".").trim());
  if (!Number.isFinite(n) || n <= 0 || n > 1100) return null;
  return n;
}

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const [workoutsThisWeekCount, setWorkoutsThisWeekCount] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [avgPerWorkout, setAvgPerWorkout] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const [weightInput, setWeightInput] = useState("");
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightLogDate, setWeightLogDate] = useState(() => new Date());
  const [showWeightDatePicker, setShowWeightDatePicker] = useState(false);
  const [chartWidth, setChartWidth] = useState(() => Math.max(160, Dimensions.get("window").width - 60));
  const [allWeights, setAllWeights] = useState<Awaited<ReturnType<typeof getWeightEntries>>>([]);
  const [nutrition, setNutrition] = useState(() => nutritionRollupWeekMonSun([]));
  const [volumeWeeks, setVolumeWeeks] = useState<ReturnType<typeof weeklyTrainingVolumeSeries>>([]);

  const refreshStats = useCallback(async () => {
    const [all, meals, weights] = await Promise.all([getWorkouts(), getMeals(), getWeightEntries()]);
    const s = computeWeekStats(all);
    setWorkoutsThisWeekCount(s.count);
    setTotalCalories(Math.round(s.totalCalories));
    setAvgPerWorkout(s.avgCaloriesPerWorkout);
    setTotalMinutes(Math.round(s.totalMinutes));
    setNutrition(nutritionRollupWeekMonSun(meals));
    setVolumeWeeks(weeklyTrainingVolumeSeries(all, 4));
    setAllWeights(weights);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );

  const chartWeights = useMemo(() => weightEntriesForChart(allWeights), [allWeights]);
  const seriesLb = useMemo(() => weightSeriesLb(chartWeights), [chartWeights]);
  const deltaRange = useMemo(() => deltaFirstLastLb(seriesLb), [seriesLb]);
  const delta7 = useMemo(() => deltaVsSevenDaysAgo(allWeights), [allWeights]);

  const lastWeight = useMemo(() => {
    if (allWeights.length === 0) return null;
    return [...allWeights].sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];
  }, [allWeights]);

  const cards = [
    { label: "Workouts this week", value: String(workoutsThisWeekCount), color: "#2563EB" },
    { label: "Calories burned", value: String(totalCalories), color: "#EA580C" },
    { label: "Avg per workout", value: String(avgPerWorkout), color: "#16A34A" },
    { label: "Total minutes", value: String(totalMinutes), color: "#9333EA" },
  ];

  function onWeightDateChange(event: { type?: string }, selected?: Date) {
    if (Platform.OS === "android") {
      setShowWeightDatePicker(false);
      if (event.type === "dismissed") return;
    }
    if (selected) setWeightLogDate(selected);
  }

  async function handleSaveWeight() {
    const lb = parseWeightLb(weightInput);
    if (lb == null) {
      Alert.alert("Invalid weight", "Enter your weight in pounds (e.g. 175), between 0 and 1100.");
      return;
    }
    setWeightSaving(true);
    try {
      await upsertWeightForDate(localDateISO(weightLogDate), lb);
      setWeightInput("");
      await refreshStats();
    } finally {
      setWeightSaving(false);
    }
  }

  function openLogWorkout() {
    navigation.navigate("LogWorkout");
  }

  function openLogMeal() {
    navigation.navigate("LogMeal", {});
  }

  const measureChartWidth = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    if (w <= 0) return;
    setChartWidth((prev) => (Math.abs(w - prev) > 2 ? w : prev));
  }, []);

  const calBarValues = nutrition?.days.map((d) => d.calories) ?? [];
  const volMinutes = volumeWeeks.map((w) => w.totalMinutes);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>FitTrack Pro</Text>
          <Text style={styles.tagline}>Your fitness companion</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Here&apos;s your fitness summary</Text>
        </View>

        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.label} style={[styles.card, { backgroundColor: card.color }]}>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Log weight (lb)</Text>
          <Text style={styles.panelHint}>
            One entry per calendar day. Saving again for the same day overwrites that day.
          </Text>
          <Text style={styles.subLabel}>Weight date</Text>
          <Pressable
            style={styles.datePickBtn}
            onPress={() => setShowWeightDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose weight log date"
          >
            <Text style={styles.datePickBtnText}>{formatPickDate(weightLogDate)}</Text>
          </Pressable>
          {showWeightDatePicker ? (
            <DateTimePicker
              value={weightLogDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onWeightDateChange}
            />
          ) : null}
          {Platform.OS === "ios" && showWeightDatePicker ? (
            <Pressable style={styles.datePickDone} onPress={() => setShowWeightDatePicker(false)}>
              <Text style={styles.datePickDoneText}>Done</Text>
            </Pressable>
          ) : null}
          <View style={styles.weightRow}>
            <TextInput
              style={styles.weightInput}
              placeholder="e.g. 175"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <Pressable
              style={[styles.weightSave, weightSaving && styles.weightSaveDisabled]}
              onPress={handleSaveWeight}
              disabled={weightSaving}
            >
              <Text style={styles.weightSaveText}>{weightSaving ? "…" : "Save"}</Text>
            </Pressable>
          </View>
          {lastWeight ? (
            <Text style={styles.lastWeight}>
              Last logged: {lastWeight.weightLb.toFixed(1)} lb on {lastWeight.dateISO}
            </Text>
          ) : (
            <Text style={styles.lastWeightMuted}>No weight entries yet.</Text>
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Weight trend</Text>
          <Text style={styles.panelHint}>
            Last ~30 days. <Text style={styles.bold}>In chart range:</Text> {formatDeltaLb(deltaRange)} ·{" "}
            <Text style={styles.bold}>vs ~7 days ago:</Text> {formatDeltaLb(delta7)}
          </Text>
          <View style={styles.chartSlot} onLayout={measureChartWidth}>
            <SvgSparkline series={seriesLb} width={chartWidth} height={CHART_HEIGHT} />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Nutrition this week</Text>
          <Text style={styles.panelHint}>
            Totals for <Text style={styles.bold}>Mon–Sun</Text>, week starting {nutrition.weekStartISO}.
          </Text>
          <View style={styles.nutGrid}>
            <Text style={styles.nutItem}>Total calories: {Math.round(nutrition.totals.calories)}</Text>
            <Text style={styles.nutItem}>Protein: {Math.round(nutrition.totals.proteinG)} g</Text>
            <Text style={styles.nutItem}>Carbs: {Math.round(nutrition.totals.carbsG)} g</Text>
            <Text style={styles.nutItem}>Fat: {Math.round(nutrition.totals.fatG)} g</Text>
          </View>
          <View style={styles.chartSlot} onLayout={measureChartWidth}>
            <SvgBarChart values={calBarValues} width={chartWidth} height={CHART_HEIGHT} barColor="#EA580C" />
          </View>
          <View style={styles.dayLabels}>
            {nutrition.days.map((d) => (
              <Text key={d.dateISO} style={styles.dayLabel}>
                {d.dayLabel}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Training volume by week</Text>
          <Text style={styles.panelHint}>
            Last 4 weeks (Mon–Sun). Bar height = total minutes; range is Mon–Sun.
          </Text>
          <View style={styles.chartSlot} onLayout={measureChartWidth}>
            <SvgBarChart values={volMinutes} width={chartWidth} height={CHART_HEIGHT} barColor="#2563EB" />
          </View>
          <View style={styles.volLabels}>
            {volumeWeeks.map((w) => (
              <Text key={w.weekStartISO} style={styles.volLabel} numberOfLines={2}>
                {w.label}
                {"\n"}
                {w.workoutCount}×
              </Text>
            ))}
          </View>
        </View>

        <Pressable style={styles.actionButton} onPress={openLogWorkout}>
          <Text style={styles.actionText}>+ Log New Workout</Text>
        </Pressable>

        <Pressable style={styles.mealButton} onPress={openLogMeal}>
          <Text style={styles.mealButtonText}>+ Add a Meal</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  tagline: {
    color: "#BFDBFE",
    marginTop: 3,
  },
  section: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: "#6B7280",
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 14,
    minHeight: 140,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
  },
  cardLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  panel: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  panelHint: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
  },
  bold: { fontWeight: "800", color: "#374151" },
  subLabel: {
    marginTop: 10,
    fontWeight: "700",
    color: "#374151",
    fontSize: 13,
  },
  datePickBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  datePickBtnText: { fontSize: 16, fontWeight: "600", color: "#111827" },
  datePickDone: { alignSelf: "flex-start", marginBottom: 10, paddingVertical: 8 },
  datePickDoneText: { color: "#1D4ED8", fontWeight: "700" },
  chartSlot: { alignSelf: "stretch", marginTop: 4 },
  weightRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    alignItems: "center",
  },
  weightInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  weightSave: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  weightSaveDisabled: { opacity: 0.6 },
  weightSaveText: { color: "#FFFFFF", fontWeight: "700" },
  lastWeight: { marginTop: 10, color: "#111827", fontWeight: "600" },
  lastWeightMuted: { marginTop: 10, color: "#9CA3AF", fontStyle: "italic" },
  nutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  nutItem: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontWeight: "700",
    color: "#111827",
  },
  avgLine: { marginTop: 8, color: "#374151", fontWeight: "600" },
  subChartLabel: { marginTop: 12, fontWeight: "700", color: "#374151", fontSize: 13 },
  dayLabels: {
    flexDirection: "row",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  dayLabel: { flex: 1, fontSize: 10, color: "#6B7280", textAlign: "center" },
  volLabels: {
    flexDirection: "row",
    marginTop: 4,
  },
  volLabel: {
    flex: 1,
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    minWidth: 0,
  },
  actionButton: {
    marginTop: 6,
    marginHorizontal: 16,
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  mealButton: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1D4ED8",
  },
  mealButtonText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 18,
  },
});
