package com.tripbudget.models;

/**
 * ExpenseFactory - Demonstrates Factory Pattern & Polymorphic Instantiation
 */
public class ExpenseFactory {

    public static Expense createExpense(String category, int expenseId, int tripId, int payerId, 
                                        String payerName, String title, double baseAmount, double extra1, 
                                        double extra2, double extra3, String date, String notes) {
        if (category == null) category = "GENERAL";

        switch (category.toUpperCase()) {
            case "FLIGHT":
                return new FlightExpense(expenseId, tripId, payerId, payerName, title, baseAmount, extra1, extra2, extra3, date, notes);
            case "HOTEL":
                return new HotelExpense(expenseId, tripId, payerId, payerName, title, baseAmount, (int) Math.max(1, extra1), extra2, date, notes);
            case "FOOD":
                return new FoodExpense(expenseId, tripId, payerId, payerName, title, baseAmount, extra1, extra2, extra3, date, notes);
            case "TRANSPORT":
                return new TransportExpense(expenseId, tripId, payerId, payerName, title, baseAmount, extra1, extra2, extra3, date, notes);
            case "ACTIVITIES":
                return new ActivityExpense(expenseId, tripId, payerId, payerName, title, baseAmount, extra1, extra2, date, notes);
            case "SHOPPING":
                return new ShoppingExpense(expenseId, tripId, payerId, payerName, title, baseAmount, extra1, extra2, date, notes);
            default:
                return new Expense(expenseId, tripId, payerId, payerName, title, category, baseAmount, extra1, date, notes);
        }
    }

    /**
     * Convenience factory method for dialogs and DAOs storing a flat tax/fee amount.
     */
    public static Expense createExpenseWithFlatTax(String category, int expenseId, int tripId, int payerId,
                                                   String payerName, String title, double baseAmount, double flatTax,
                                                   String date, String notes) {
        if ("HOTEL".equalsIgnoreCase(category)) {
            double taxRate = baseAmount > 0 ? (flatTax / baseAmount) : 0.0;
            return createExpense("HOTEL", expenseId, tripId, payerId, payerName, title, baseAmount, 1, taxRate, 0, date, notes);
        }
        return createExpense(category, expenseId, tripId, payerId, payerName, title, baseAmount, flatTax, 0, 0, date, notes);
    }
}
