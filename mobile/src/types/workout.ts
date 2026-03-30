export const WORKOUT_TYPES = ["Cardio", "Calisthenics", "Weightlifting"] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export type WorkoutEntry = {
  id: string;
  title: string;
  // Timestamp for when the workout occurred (date chosen by user + stored time).
  startedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  workoutType: WorkoutType;
};
