import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const cards = [
  { label: "Workouts this week", value: "0", color: "#2563EB" },
  { label: "Calories burned", value: "0", color: "#EA580C" },
  { label: "Avg per workout", value: "0", color: "#16A34A" },
  { label: "Total minutes", value: "0", color: "#9333EA" },
];

export function DashboardScreen() {
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

        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>+ Log New Workout</Text>
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
});
