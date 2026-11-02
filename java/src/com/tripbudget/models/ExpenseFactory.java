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
}
