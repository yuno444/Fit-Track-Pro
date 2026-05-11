import { cmToFeetInches, kgToLb } from "./imperialUnits";
import { defaultProfile, type ProfileData } from "../types/profile";

type Legacy = Partial<ProfileData> & {
  weightKg?: string;
  heightCm?: string;
};

/**
 * Merge stored JSON into ProfileData and migrate legacy metric strings if present.
 */
export function migrateProfileFromStorage(raw: unknown): ProfileData {
  const o = { ...defaultProfile, ...(raw as Legacy) };
  const out: ProfileData = {
    fullName: o.fullName ?? "",
    age: o.age ?? "",
    weightLb: o.weightLb ?? "",
    heightFeet: o.heightFeet ?? "",
    heightInches: o.heightInches ?? "",
    fitnessGoal: o.fitnessGoal ?? defaultProfile.fitnessGoal,
    activityLevel: o.activityLevel ?? defaultProfile.activityLevel,
  };

  const legacy = raw as Legacy;
  if ((!out.weightLb || out.weightLb.trim() === "") && legacy.weightKg != null && String(legacy.weightKg).trim() !== "") {
    const kg = parseFloat(String(legacy.weightKg).replace(",", "."));
    if (Number.isFinite(kg) && kg > 0) {
      out.weightLb = String(Math.round(kgToLb(kg) * 10) / 10);
    }
  }

  if (
    (!out.heightFeet || out.heightFeet.trim() === "") &&
    (!out.heightInches || out.heightInches.trim() === "") &&
    legacy.heightCm != null &&
    String(legacy.heightCm).trim() !== ""
  ) {
    const cm = parseFloat(String(legacy.heightCm).replace(",", "."));
    if (Number.isFinite(cm) && cm > 0) {
      const { feet, inches } = cmToFeetInches(cm);
      out.heightFeet = String(feet);
      out.heightInches = String(inches);
    }
  }

  return out;
}
