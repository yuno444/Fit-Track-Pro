import Foundation
import SwiftData

/// One ingredient line on a meal or recipe (food × quantity).
@Model
public final class MealLineItem {
    public var food: FoodItem?
    /// Multiplier relative to food's serving (e.g. 1.5 servings).
    public var quantity: Double

    public var meal: MealRecipe?

    public init(food: FoodItem? = nil, quantity: Double = 1) {
        self.food = food
        self.quantity = quantity
    }

    /// Kilocalories for this line (nil if food is missing).
    public var calories: Double? {
        guard let food else { return nil }
        return food.caloriesPerServing * (quantity / max(food.servingAmount, .leastNonzeroMagnitude))
    }
}
