import Foundation
import SwiftData

@Model
public final class WorkoutSession {
    public var startedAt: Date
    /// Duration in seconds.
    public var durationSeconds: Double
    public var title: String
    public var category: String
    /// Calories burned for this session (user-entered or estimated).
    public var caloriesBurned: Double

    public init(
        startedAt: Date = .now,
        durationSeconds: Double = 0,
        title: String = "",
        category: String = "",
        caloriesBurned: Double = 0
    ) {
        self.startedAt = startedAt
        self.durationSeconds = durationSeconds
        self.title = title
        self.category = category
        self.caloriesBurned = caloriesBurned
    }
}
