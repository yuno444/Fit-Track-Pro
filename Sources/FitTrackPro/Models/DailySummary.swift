import Foundation
import SwiftData

/// Optional stored rollup per calendar day; can also be computed from workouts and meals.
@Model
public final class DailySummary {
    /// Start-of-day timestamp in local timezone (normalize when writing).
    public var day: Date
    public var caloriesConsumed: Double
    public var caloriesBurnedFromWorkouts: Double
    public var workoutCount: Int
    public var totalWorkoutMinutes: Double

    public init(
        day: Date,
        caloriesConsumed: Double = 0,
        caloriesBurnedFromWorkouts: Double = 0,
        workoutCount: Int = 0,
        totalWorkoutMinutes: Double = 0
    ) {
        self.day = day
        self.caloriesConsumed = caloriesConsumed
        self.caloriesBurnedFromWorkouts = caloriesBurnedFromWorkouts
        self.workoutCount = workoutCount
        self.totalWorkoutMinutes = totalWorkoutMinutes
    }

    public var netCalories: Double {
        caloriesConsumed - caloriesBurnedFromWorkouts
    }
}
