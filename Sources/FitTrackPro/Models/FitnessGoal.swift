import Foundation

/// Stored on `UserProfile` as a String raw value for SwiftData compatibility.
public enum FitnessGoal: String, CaseIterable, Codable, Sendable {
    case loseWeight = "loseWeight"
    case maintainWeight = "maintainWeight"
    case gainMuscle = "gainMuscle"

    public var displayName: String {
        switch self {
        case .loseWeight: "Lose Weight"
        case .maintainWeight: "Maintain Weight"
        case .gainMuscle: "Gain Muscle"
        }
    }
}
