# User profile: fields and enums

Aligned with the Profile screen diagram found in the example diagrams folder (name, age, weight, height, fitness goal, activity level).

## Fields

| Field | Type | Notes |
|-------|------|--------|
| `fullName` | `String` |
| `age` | `Int` |
| `weightKg` | `Double` |
| `heightCm` | `Double` |
| `fitnessGoal` | `FitnessGoal` |
| `activityLevel` | `ActivityLevel` |

## Enums

### `FitnessGoal`

| Case | Display string |
|------|----------------|
| `loseWeight` | Lose Weight |
| `maintainWeight` | Maintain Weight |
| `gainMuscle` | Gain Muscle |

### `ActivityLevel`

| Case | Display string |
|------|----------------|
| `sedentary` | Sedentary (little or no exercise) |
| `light` | Light (1–3 days/week) |
| `moderate` | Moderate (3–5 days/week) |
| `active` | Active (6–7 days/week) |
| `veryActive` | Very active (physical job or training 2×/day) |