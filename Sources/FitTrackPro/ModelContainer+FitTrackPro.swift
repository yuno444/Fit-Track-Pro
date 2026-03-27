import SwiftData

public enum FitTrackProModelContainer {
    /// Schema used by the app target at launch.
    public static func makeContainer(inMemory: Bool = false) throws -> ModelContainer {
        let schema = Schema([
            UserProfile.self,
            WorkoutSession.self,
            FoodItem.self,
            MealLineItem.self,
            MealRecipe.self,
            DailySummary.self,
        ])
        let configuration = ModelConfiguration(isStoredInMemoryOnly: inMemory)
        return try ModelContainer(for: schema, configurations: [configuration])
    }
}
