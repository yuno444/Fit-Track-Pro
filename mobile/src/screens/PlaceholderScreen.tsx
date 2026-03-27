import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 16,
  },
});
