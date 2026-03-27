import Foundation
import SwiftData

/// A saved recipe or a logged meal instance; `lineItems` define ingredients.
@Model
public final class MealRecipe {
    public var name: String
    public var createdAt: Date
    /// When loggedOn contains a Date, this meal counts toward intake on that calendar day (local timezone).
    public var loggedOn: Date?
    @Relationship(deleteRule: .cascade, inverse: \MealLineItem.meal)
    public var lineItems: [MealLineItem]

    public init(
        name: String,
        createdAt: Date = .now,
        loggedOn: Date? = nil,
        lineItems: [MealLineItem] = []
    ) {
        self.name = name
        self.createdAt = createdAt
        self.loggedOn = loggedOn
        self.lineItems = lineItems
    }

    /// Sum of line item calories; ignores lines with missing food.
    public var totalCalories: Double {
        lineItems.compactMap(\.calories).reduce(0, +)
    }
}
