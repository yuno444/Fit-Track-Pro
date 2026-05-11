import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, saveProfile } from "../services/storage";
import { ACTIVITY_LEVELS, FITNESS_GOALS, ProfileData, defaultProfile } from "../types/profile";

export function ProfileScreen() {
  const { signOut, email } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const loaded = await getProfile();
        setProfile(loaded);
      }
      load();
    }, [])
  );

  async function handleSave() {
    setIsSaving(true);
    await saveProfile(profile);
    setIsSaving(false);
    Alert.alert("Saved", "Your profile has been saved locally.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>FitTrack Pro</Text>
          <Text style={styles.tagline}>Your fitness companion</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your fitness profile and goals</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.email}>Signed in as: {email || "local user"}</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={profile.fullName}
            onChangeText={(value) => setProfile((prev) => ({ ...prev, fullName: value }))}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="30"
            value={profile.age}
            onChangeText={(value) => setProfile((prev) => ({ ...prev, age: value }))}
          />

          <Text style={styles.label}>Weight (lb)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="175"
            value={profile.weightLb}
            onChangeText={(value) => setProfile((prev) => ({ ...prev, weightLb: value }))}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Height (ft)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="5"
                value={profile.heightFeet}
                onChangeText={(value) => setProfile((prev) => ({ ...prev, heightFeet: value }))}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Height (in)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="10"
                value={profile.heightInches}
                onChangeText={(value) => setProfile((prev) => ({ ...prev, heightInches: value }))}
              />
            </View>
          </View>

          <Text style={styles.label}>Fitness Goal</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={profile.fitnessGoal}
              onValueChange={(value) => setProfile((prev) => ({ ...prev, fitnessGoal: value }))}
            >
              {FITNESS_GOALS.map((goal) => (
                <Picker.Item key={goal} label={goal} value={goal} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={profile.activityLevel}
              onValueChange={(value) => setProfile((prev) => ({ ...prev, activityLevel: value }))}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryText}>{isSaving ? "Saving..." : "Save Profile"}</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={signOut}>
            <Text style={styles.secondaryText}>Logout</Text>
          </Pressable>
        </View>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    color: "#6B7280",
    marginBottom: 12,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  input: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  half: {
    width: "48%",
  },
  pickerWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 12,
    overflow: "hidden",
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#020617",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    alignItems: "center",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "700",
  },
});
