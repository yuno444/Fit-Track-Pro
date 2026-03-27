import Foundation
import SwiftData

@Model
public final class UserProfile {
    public var fullName: String
    public var age: Int
    /// Canonical weight in kilograms.
    public var weightKg: Double
    /// Canonical height in centimeters.
    public var heightCm: Double
    /// Backing storage for `FitnessGoal`.
    public var fitnessGoalRaw: String
    /// Backing storage for `ActivityLevel`.
    public var activityLevelRaw: String

    public var fitnessGoal: FitnessGoal {
        get { FitnessGoal(rawValue: fitnessGoalRaw) ?? .maintainWeight }
        set { fitnessGoalRaw = newValue.rawValue }
    }

    public var activityLevel: ActivityLevel {
        get { ActivityLevel(rawValue: activityLevelRaw) ?? .sedentary }
        set { activityLevelRaw = newValue.rawValue }
    }

    public init(
        fullName: String = "",
        age: Int = 0,
        weightKg: Double = 0,
        heightCm: Double = 0,
        fitnessGoal: FitnessGoal = .maintainWeight,
        activityLevel: ActivityLevel = .sedentary
    ) {
        self.fullName = fullName
        self.age = age
        self.weightKg = weightKg
        self.heightCm = heightCm
        self.fitnessGoalRaw = fitnessGoal.rawValue
        self.activityLevelRaw = activityLevel.rawValue
    }
}
