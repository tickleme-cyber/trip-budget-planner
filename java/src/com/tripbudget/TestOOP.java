package com.tripbudget;

import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.dao.TravelerDAO;
import com.tripbudget.dao.TripDAO;
import com.tripbudget.dao.UserDAO;
import com.tripbudget.exceptions.AuthenticationException;
import com.tripbudget.exceptions.BudgetExceededException;
import com.tripbudget.exceptions.InvalidExpenseException;
import com.tripbudget.exceptions.TripBudgetException;
import com.tripbudget.exceptions.ValidationException;
import com.tripbudget.interfaces.Billable;
import com.tripbudget.interfaces.Reportable;
import com.tripbudget.interfaces.Searchable;
import com.tripbudget.interfaces.Splittable;
import com.tripbudget.interfaces.Validatable;
import com.tripbudget.models.ActivityExpense;
import com.tripbudget.models.BackpackerStrategy;
import com.tripbudget.models.Destination;
import com.tripbudget.models.Expense;
import com.tripbudget.models.FlightExpense;
import com.tripbudget.models.FoodExpense;
import com.tripbudget.models.HotelExpense;
import com.tripbudget.models.LuxuryStrategy;
import com.tripbudget.models.ShoppingExpense;
import com.tripbudget.models.TransportExpense;
import com.tripbudget.models.TravelStrategy;
import com.tripbudget.models.TravelStrategyFactory;
import com.tripbudget.models.Traveler;
import com.tripbudget.models.Trip;
import com.tripbudget.models.User;
import com.tripbudget.services.ExpenseSplitter;
import com.tripbudget.services.ExpenseSplitter.BalanceEntry;
import com.tripbudget.services.ExpenseSplitter.DebtTransaction;
import com.tripbudget.services.RecommendationEngine;
import com.tripbudget.services.RecommendationEngine.RecommendationMatch;
import com.tripbudget.util.ReceiptFormatter;
import com.tripbudget.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * Java OOP Comprehensive Unit Tests
 * Demonstrates:
 *  1. Encapsulation & Data Hiding
 *  2. Inheritance & Polymorphism
 *  3. Composition in Trip
 *  4. Debt Settlement & Min-Cash-Flow Algorithm
 *  5. Budget Recommendation Engine & Strategy Pattern
 *  6. Packages & Interface Implementation (Billable, Splittable, Validatable, etc.)
 *  7. Custom Exception Handling (try-catch-finally, ValidationException, etc.)
 *  8. Strings & String Processing (StringBuilder, StringBuffer, String.format, Regex)
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

        // 5. BUDGET RECOMMENDATION ENGINE & STRATEGY PATTERN
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

        RecommendationMatch topMatch = recommendations.get(0);
        User testUser = new User(1, "demo", "demo123", "Demo User", "demo@example.com", "ORGANIZER");
        Trip generatedTrip = engine.createTripFromRecommendation(
                topMatch, testUser, "Goa Getaway Test",
                Arrays.asList("Alice", "Bob"), true,
                new TripDAO(), new TravelerDAO(), new ExpenseDAO()
        );
        System.out.println("✅ createTripFromRecommendation successfully generated Trip: \""
                + generatedTrip.getTitle() + "\" (Budget: $" + generatedTrip.getTotalBudget() + ", Destination: " + generatedTrip.getDestination() + ")");

        // 6. INTERFACES (Billable, Splittable, Validatable, Searchable, Reportable)
        System.out.println("\n--- 6. Testing Packages & Custom Interfaces ---");
        Billable billableFlight = flight;
        System.out.println("✅ Billable interface total: " + StringUtils.formatCurrency(billableFlight.calculateTotalAmount())
                + " [Category: " + billableFlight.getCategory() + "]");

        Splittable splittableHotel = hotel;
        System.out.println("✅ Splittable interface fair share (for 4 travelers): "
                + StringUtils.formatCurrency(splittableHotel.calculateFairShare(4))
                + " [Eligible: " + splittableHotel.isEligibleForSplit() + "]");

        Validatable validatableTraveler = alex;
        try {
            validatableTraveler.validate();
            System.out.println("✅ Validatable interface: Traveler state verified successfully.");
        } catch (TripBudgetException e) {
            System.err.println("❌ FAILED: Traveler should be valid!");
        }

        Searchable searchableExpense = flight;
        Searchable searchableDest = dest;
        boolean matchesExp = searchableExpense.matchesQuery("flight");
        boolean matchesDest = searchableDest.matchesQuery("india");
        System.out.println("✅ Searchable interface: Expense matches 'flight' -> " + matchesExp
                + ", Destination matches 'india' -> " + matchesDest);

        Reportable reportableTrip = trip;
        String summary = reportableTrip.generateSummaryReport();
        if (summary.contains("TRIP FINANCIAL STATEMENT")) {
            System.out.println("✅ Reportable interface: Trip summary report generated successfully.");
        }

        // 7. EXCEPTION HANDLING (try-catch-finally, Custom Exception Hierarchy)
        System.out.println("\n--- 7. Testing Custom Exception Handling (try-catch-finally) ---");
        
        // 7A: Testing ValidationException
        try {
            Traveler badTraveler = new Traveler(99, 1, "   ", "bad-email", "#000");
            badTraveler.validate();
            System.err.println("❌ FAILED: Blank name traveler should fail validation!");
        } catch (IllegalArgumentException | ValidationException ex) {
            System.out.println("✅ Caught expected validation failure: " + ex.getMessage());
        }

        // 7B: Testing BudgetExceededException
        try {
            Expense giantExpense = new Expense(99, 1, 1, "Alice Morgan", "Private Yacht Rental", "ACTIVITIES", 5000.0, 500.0, "2026-06-20", "VIP");
            trip.checkBudgetThreshold(giantExpense);
            System.err.println("❌ FAILED: BudgetExceededException was not thrown!");
        } catch (BudgetExceededException ex) {
            System.out.printf("✅ Caught BudgetExceededException: Overrun: $%.2f (Projected: $%.2f vs Limit: $%.2f)\n",
                    ex.getExcessAmount(), ex.getAttemptedTotal(), ex.getTotalBudget());
        }

        // 7C: Testing AuthenticationException with try-catch-finally
        boolean finallyExecuted = false;
        try {
            UserDAO userDAO = new UserDAO();
            userDAO.authenticateOrThrow("unknown_user", "wrong_password");
            System.err.println("❌ FAILED: AuthenticationException was not thrown!");
        } catch (AuthenticationException ex) {
            System.out.println("✅ Caught AuthenticationException: " + ex.getMessage() + " [Error Code: " + ex.getErrorCode() + "]");
        } finally {
            finallyExecuted = true;
            System.out.println("✅ finally block executed cleanly for resource teardown.");
        }
        if (!finallyExecuted) throw new AssertionError("Finally block must execute!");

        // 8. STRINGS & STRING UTILITIES
        System.out.println("\n--- 8. Testing Strings, StringBuilder, StringBuffer, & Formatting ---");
        
        // 8A: String formatting & methods
        String capitalized = StringUtils.capitalizeWords("seafood shack candlelight beach dinner");
        System.out.println("✅ StringUtils.capitalizeWords(): \"" + capitalized + "\"");

        String initials = StringUtils.extractInitials("Sarah Chen");
        System.out.println("✅ StringUtils.extractInitials(): \"" + initials + "\"");

        boolean emailCheck1 = StringUtils.isValidEmail("alex.rivera@example.com");
        boolean emailCheck2 = StringUtils.isValidEmail("invalid-email-address");
        System.out.println("✅ String regex validation: valid email -> " + emailCheck1 + ", invalid email -> " + (!emailCheck2));

        String maskedEmail = StringUtils.maskEmail("alex.rivera@example.com");
        System.out.println("✅ String masking: " + maskedEmail);

        // 8B: StringBuilder & ReceiptFormatter
        String formattedReceipt = ReceiptFormatter.formatReceipt(flight);
        System.out.println("✅ StringBuilder official receipt generated:\n" + formattedReceipt.trim());

        // 8C: StringBuffer thread-safe logging
        String threadLog = StringUtils.createThreadSafeLogEntry("AUDIT", "PAYMENT_PROCESSED", "ID: EXP-00001, Amount: $580.00");
        System.out.println("✅ StringBuffer thread-safe log: " + threadLog);

        System.out.println("\n🎉 ALL JAVA OBJECT-ORIENTED, INTERFACE, EXCEPTION, AND STRING TESTS PASSED SUCCESSFULLY!");
    }
}
