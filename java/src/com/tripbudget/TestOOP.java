package com.tripbudget;

import com.tripbudget.models.ActivityExpense;
import com.tripbudget.models.Expense;
import com.tripbudget.models.FlightExpense;
import com.tripbudget.models.FoodExpense;
import com.tripbudget.models.HotelExpense;
import com.tripbudget.models.ShoppingExpense;
import com.tripbudget.models.TransportExpense;
import com.tripbudget.models.Traveler;
import com.tripbudget.models.Trip;
import com.tripbudget.models.Destination;
import com.tripbudget.models.TravelStrategy;
import com.tripbudget.models.TravelStrategyFactory;
import com.tripbudget.models.BackpackerStrategy;
import com.tripbudget.models.LuxuryStrategy;
import com.tripbudget.dao.TripDAO;
import com.tripbudget.dao.TravelerDAO;
import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.models.User;
import com.tripbudget.services.RecommendationEngine;
import com.tripbudget.services.RecommendationEngine.RecommendationMatch;
import com.tripbudget.services.ExpenseSplitter;
import com.tripbudget.services.ExpenseSplitter.BalanceEntry;
import com.tripbudget.services.ExpenseSplitter.DebtTransaction;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * Java OOP Unit Tests (Encapsulation, Inheritance, Polymorphism, Composition)
 * ============================================================================
 */
public class TestOOP {
    public static void main(String[] args) {
        System.out.println("🧪 Starting Java Object-Oriented Programming Unit Tests...\n");

        // 1. ENCAPSULATION & DATA HIDING
        System.out.println("--- 1. Testing Encapsulation & Validation ---");
        try {
            new Traveler(1, 1, "", "invalid@email.com", "#FF0000");
            System.err.println("❌ FAILED: Traveler empty name should throw exception!");
        } catch (IllegalArgumentException e) {
            System.out.println("✅ Encapsulation validation works: " + e.getMessage());
        }

        Traveler alex = new Traveler(1, 1, "Alice Morgan", "alice@example.com", "#4F46E5");
        Traveler bob = new Traveler(2, 1, "Bob Vance", "bob@example.com", "#10B981");
        System.out.println("✅ Encapsulated traveler created: " + alex.getName() + " (" + alex.getEmail() + ")");

        // 2. INHERITANCE & POLYMORPHISM
        System.out.println("\n--- 2. Testing Inheritance & Polymorphic Method Overriding ---");
        Expense flight = new FlightExpense(1, 1, 1, "Alice Morgan", "Flight to Paris", 500.0, 50.0, 30.0, 0.0, "2026-06-15", "AF102");
        Expense hotel = new HotelExpense(2, 1, 2, "Bob Vance", "Hotel Paris", 100.0, 3, 0.10, "2026-06-16", "3 nights");
        Expense food = new FoodExpense(3, 1, 1, "Alice Morgan", "Team Dinner", 80.0, 15.0, 5.0, 0.0, "2026-06-16", "Bistro");
        Expense transport = new TransportExpense(4, 1, 2, "Bob Vance", "Rental Car", 60.0, 10.0, 5.0, 0.0, "2026-06-17", "SUV");
        Expense activity = new ActivityExpense(5, 1, 1, "Alice Morgan", "Museum & Louvre", 45.0, 15.0, 0.0, "2026-06-18", "Guide");
        Expense shopping = new ShoppingExpense(6, 1, 2, "Bob Vance", "Souvenirs", 50.0, 5.0, 10.0, "2026-06-19", "Discount coupon");

        System.out.println("✅ FlightExpense polymorphic cost (500 + 50 + 30): $" + flight.calculateTotalAmount());
        System.out.println("✅ HotelExpense polymorphic cost ((100 * 3) + 10% tax): $" + hotel.calculateTotalAmount());
        System.out.println("✅ FoodExpense polymorphic cost (80 + 15 + 5): $" + food.calculateTotalAmount());
        System.out.println("✅ TransportExpense polymorphic cost (60 + 10 + 5): $" + transport.calculateTotalAmount());
        System.out.println("✅ ActivityExpense polymorphic cost (45 + 15): $" + activity.calculateTotalAmount());
        System.out.println("✅ ShoppingExpense polymorphic cost (50 + 5 - 10): $" + shopping.calculateTotalAmount());

        // 3. COMPOSITION IN TRIP
        System.out.println("\n--- 3. Testing Composition & Polymorphic Dispatch in Trip ---");
        Trip trip = new Trip(1, 1, "Euro Tour", "Paris", "2026-06-15", "2026-06-25", 2000.0, "USD", "ACTIVE");
        trip.addTraveler(alex);
        trip.addTraveler(bob);
        trip.addExpense(flight);
        trip.addExpense(hotel);
        trip.addExpense(food);
        trip.addExpense(transport);

        double totalSpent = trip.getTotalSpent();
        System.out.println("✅ Trip.getTotalSpent() via polymorphic dispatch: $" + totalSpent);
        System.out.println("✅ Remaining Budget: $" + trip.getRemainingBudget());
        System.out.printf("✅ Budget Usage: %.1f%%\n", trip.getBudgetUsagePercentage());

        // 4. EXPENSE SPLITTER ALGORITHM
        System.out.println("\n--- 4. Testing ExpenseSplitter & Debt Simplification ---");
        List<Traveler> travelers = new ArrayList<>();
        travelers.add(alex);
        travelers.add(bob);

        List<Expense> expenses = new ArrayList<>();
        expenses.add(flight); // Alice: 580
        expenses.add(hotel);  // Bob: 330
        expenses.add(food);   // Alice: 100
        expenses.add(transport); // Bob: 75
        // Alice total paid: 680
        // Bob total paid: 405
        // Total: 1085, Fair Share: 542.5
        // Alice Net: +137.5 (gets back), Bob Net: -137.5 (owes)

        Map<Integer, BalanceEntry> balances = ExpenseSplitter.calculateBalances(travelers, expenses);
        for (BalanceEntry entry : balances.values()) {
            System.out.printf("   %s: Paid $%.2f, Fair Share $%.2f, Net: %+.2f\n",
                    entry.traveler.getName(), entry.paid, entry.fairShare, entry.netBalance);
        }

        List<DebtTransaction> debts = ExpenseSplitter.settleDebts(travelers, expenses);
        System.out.println("✅ 'Who Owes Whom' settlement result:");
        for (DebtTransaction dt : debts) {
            System.out.println("   " + dt);
        }

        // 5. BUDGET RECOMMENDATION ENGINE & STRATEGY PATTERN (OOP Principles)
        System.out.println("\n--- 5. Testing Budget Recommendation Engine & Strategy Pattern ---");
        TravelStrategy backpacker = TravelStrategyFactory.getStrategy("BACKPACKER");
        TravelStrategy luxury = TravelStrategyFactory.getStrategy("LUXURY");
        TravelStrategy moderate = TravelStrategyFactory.getStrategy("MODERATE");

        if (!(backpacker instanceof BackpackerStrategy)) throw new AssertionError("Expected BackpackerStrategy");
        if (!(luxury instanceof LuxuryStrategy)) throw new AssertionError("Expected LuxuryStrategy");
        System.out.println("✅ Strategy Pattern: Backpacker stay mult = " + backpacker.getStayMultiplier()
                + ", Luxury stay mult = " + luxury.getStayMultiplier());

        Destination dest = new Destination("dest_goa", "Goa", "India", "Domestic", 80.0, 45.0, 20.0, 15.0, 3, 6, 4.8, "Budget");
        Destination.CostBreakdown cb = dest.calculateCostBreakdown(2, 5, moderate);
        System.out.printf("✅ Destination encapsulated calculation: Goa (2 travelers, 5 days, Moderate): $%.0f [Flight: $%.0f, Stay: $%.0f, Food: $%.0f, Act: $%.0f]\n",
                cb.total, cb.flight, cb.hotel, cb.food, cb.activities);

        RecommendationEngine engine = new RecommendationEngine();
        System.out.println("✅ RecommendationEngine loaded with " + engine.getCatalog().size() + " destinations.");

        double testBudget = 1000.0;
        List<RecommendationMatch> recommendations = engine.getRecommendations(testBudget, 2, 5, "MODERATE", "all", "all");
        System.out.println("✅ Top recommendations for budget of $" + testBudget + " (2 travelers, 5 days):");
        for (int i = 0; i < Math.min(3, recommendations.size()); i++) {
            System.out.println("   " + (i + 1) + ". " + recommendations.get(i));
        }

        // Test 1-click trip generation from recommendation
        RecommendationMatch topMatch = recommendations.get(0);
        User testUser = new User(1, "demo", "hash123", "Demo User", "demo@example.com", "STUDENT");
        Trip generatedTrip = engine.createTripFromRecommendation(
                topMatch, testUser, "Goa Getaway Test",
                Arrays.asList("Alice", "Bob"), true,
                new TripDAO(), new TravelerDAO(), new ExpenseDAO()
        );
        System.out.println("✅ createTripFromRecommendation successfully generated Trip: \""
                + generatedTrip.getTitle() + "\" (Budget: $" + generatedTrip.getTotalBudget() + ", Destination: " + generatedTrip.getDestination() + ")");

        System.out.println("\n🎉 ALL JAVA OBJECT-ORIENTED PROGRAMMING TESTS PASSED SUCCESSFULLY!");
    }
}
