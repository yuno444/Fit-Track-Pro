import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileData, defaultProfile } from "../types/profile";

const SESSION_KEY = "@fittrack/session";
const PROFILE_KEY = "@fittrack/profile";

export type SessionData = {
  isLoggedIn: boolean;
  email: string;
};

export async function saveSession(session: SessionData): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<SessionData | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<ProfileData> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return defaultProfile;
  try {
    return { ...defaultProfile, ...(JSON.parse(raw) as ProfileData) };
  } catch {
    return defaultProfile;
  }
}
