import Foundation
import SwiftData

/// A food or ingredient with a defined serving and calorie density.
@Model
public final class FoodItem {
    public var name: String
    /// Label for the serving (e.g. "100 g", "1 cup").
    public var servingDescription: String
    /// Kilocalories per `servingAmount` (e.g. per 1 serving).
    public var caloriesPerServing: Double
    public var servingAmount: Double

    public init(
        name: String,
        servingDescription: String = "1 serving",
        caloriesPerServing: Double = 0,
        servingAmount: Double = 1
    ) {
        self.name = name
        self.servingDescription = servingDescription
        self.caloriesPerServing = caloriesPerServing
        self.servingAmount = servingAmount
    }
}
