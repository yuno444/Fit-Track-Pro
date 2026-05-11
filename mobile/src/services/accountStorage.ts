import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { randomUUID } from "expo-crypto";
import { ACCOUNTS_KEY } from "./storageScope";

/** Class prototype only: SHA-256 + salts, not production-grade auth. */
const APP_PEPPER = "fittrack-pro-local-v2";

export type AccountRecord = {
  userId: string;
  passwordSalt: string;
  passwordHash: string;
};

export type AccountsIndex = Record<string, AccountRecord>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function loadAccounts(): Promise<AccountsIndex> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as AccountsIndex;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function saveAccounts(accounts: AccountsIndex): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function hashPassword(email: string, password: string, salt: string): Promise<string> {
  const input = `${APP_PEPPER}|${email}|${salt}|${password}`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

async function randomSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerAccount(email: string, password: string): Promise<{ userId: string }> {
  const key = normalizeEmail(email);
  if (!key || !password) {
    throw new Error("Email and password are required.");
  }
  const accounts = await loadAccounts();
  if (accounts[key]) {
    throw new Error("An account with this email already exists.");
  }
  const userId = randomUUID();
  const passwordSalt = await randomSalt();
  const passwordHash = await hashPassword(key, password, passwordSalt);
  accounts[key] = { userId, passwordSalt, passwordHash };
  await saveAccounts(accounts);
  return { userId };
}

export async function verifyLogin(email: string, password: string): Promise<{ userId: string }> {
  const key = normalizeEmail(email);
  const accounts = await loadAccounts();
  const record = accounts[key];
  if (!record) {
    throw new Error("No account found for this email.");
  }
  const hash = await hashPassword(key, password, record.passwordSalt);
  if (hash !== record.passwordHash) {
    throw new Error("Incorrect password.");
  }
  return { userId: record.userId };
}
