package com.tripbudget.models;

/**
 * ShoppingExpense Subclass - Demonstrates Inheritance & Polymorphism
 * Represents souvenirs, crafts, gifts, applying taxes and promotional discounts.
 */
public class ShoppingExpense extends Expense {
    private double salesTax;
    private double discountAmount;

    public ShoppingExpense(int expenseId, int tripId, int payerId, String payerName, String title,
                           double itemsTotal, double salesTax, double discountAmount,
                           String expenseDate, String notes) {
        super(expenseId, tripId, payerId, payerName, title, "SHOPPING", itemsTotal, 0.0, expenseDate, notes);
        this.salesTax = Math.max(0, salesTax);
        this.discountAmount = Math.max(0, discountAmount);
        this.taxOrFees = this.salesTax - this.discountAmount;
    }

    @Override
    public double calculateTotalAmount() {
        return Math.max(0, this.baseAmount + this.salesTax - this.discountAmount);
    }

    public double getSalesTax() { return salesTax; }
    public double getDiscountAmount() { return discountAmount; }
}
