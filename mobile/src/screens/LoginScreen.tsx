import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";

type AuthMode = "signin" | "signup";

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password]);

  async function handleSubmit() {
    if (!canSubmit) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>FitTrack Pro</Text>
        <Text style={styles.tagline}>Your fitness companion</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentBtn, mode === "signin" && styles.segmentBtnActive]}
            onPress={() => {
              setMode("signin");
              setError("");
            }}
          >
            <Text style={[styles.segmentText, mode === "signin" && styles.segmentTextActive]}>Sign in</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, mode === "signup" && styles.segmentBtnActive]}
            onPress={() => {
              setMode("signup");
              setError("");
            }}
          >
            <Text style={[styles.segmentText, mode === "signup" && styles.segmentTextActive]}>Create account</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{mode === "signin" ? "Welcome back" : "Create your account"}</Text>
        <Text style={styles.subtitle}>
          {mode === "signin" ? "Sign in to continue your progress" : "Data stays on this device per account"}
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{mode === "signin" ? "Sign in" : "Create account"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  header: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  tagline: {
    color: "#BFDBFE",
    marginTop: 4,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  segmentText: {
    fontWeight: "600",
    color: "#6B7280",
    fontSize: 15,
  },
  segmentTextActive: {
    color: "#1D4ED8",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    color: "#6B7280",
    marginBottom: 16,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  input: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
  },
  button: {
    marginTop: 4,
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
