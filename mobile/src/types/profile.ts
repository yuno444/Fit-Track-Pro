export const FITNESS_GOALS = ["Lose Weight", "Maintain Weight", "Gain Muscle"] as const;
export const ACTIVITY_LEVELS = [
  "Sedentary (little or no exercise)",
  "Light (1-3 days/week)",
  "Moderate (3-5 days/week)",
  "Active (6-7 days/week)",
  "Very active (physical job or training 2x/day)",
] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export type ProfileData = {
  fullName: string;
  age: string;
  weightKg: string;
  heightCm: string;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
};

export const defaultProfile: ProfileData = {
  fullName: "",
  age: "",
  weightKg: "",
  heightCm: "",
  fitnessGoal: "Lose Weight",
  activityLevel: "Sedentary (little or no exercise)",
};
