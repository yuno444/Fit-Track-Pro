import Foundation

/// Stored on `UserProfile` as a String raw value for SwiftData compatibility.
public enum ActivityLevel: String, CaseIterable, Codable, Sendable {
    case sedentary = "sedentary"
    case light = "light"
    case moderate = "moderate"
    case active = "active"
    case veryActive = "veryActive"

    public var displayName: String {
        switch self {
        case .sedentary: "Sedentary (little or no exercise)"
        case .light: "Light (1–3 days/week)"
        case .moderate: "Moderate (3–5 days/week)"
        case .active: "Active (6–7 days/week)"
        case .veryActive: "Very active (physical job or training 2×/day)"
        }
    }
}
