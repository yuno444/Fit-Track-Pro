# User profile: fields and enums

Aligned with the Profile screen mockup (name, age, weight, height, fitness goal, activity level).

## Fields

| Field | Type | Notes |
|-------|------|--------|
| `fullName` | `String` | Display and identity in UI. |
| `age` | `Int` | Years; validate range (e.g. 13–120) in UI layer. |
| `weightKg` | `Double` | Canonical storage in kilograms; UI may show lb via conversion. |
| `heightCm` | `Double` | Canonical storage in centimeters; UI may show ft/in via conversion. |
| `fitnessGoal` | `FitnessGoal` | Enum; persisted as stable raw value (see below). |
| `activityLevel` | `ActivityLevel` | Enum; used for TDEE/BMR-style targets when that feature is added. |

Optional future fields (not required for v1 UI): unit preferences, sex at birth for certain BMR formulas, target weight.

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
