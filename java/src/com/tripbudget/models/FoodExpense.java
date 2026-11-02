package com.tripbudget.models;

/**
 * FoodExpense Subclass - Demonstrates Inheritance & Polymorphism
 */
public class FoodExpense extends Expense {
    private double tipAmount;
    private double serviceCharge;

    public FoodExpense(int expenseId, int tripId, int payerId, String payerName, String title,
                       double billAmount, double tax, double tipAmount, double serviceCharge,
                       String expenseDate, String notes) {
        super(expenseId, tripId, payerId, payerName, title, "FOOD", billAmount, tax, expenseDate, notes);
        this.tipAmount = Math.max(0, tipAmount);
        this.serviceCharge = Math.max(0, serviceCharge);
    }

    @Override
    public double calculateTotalAmount() {
        return super.calculateTotalAmount() + this.tipAmount + this.serviceCharge;
    }

    public double getTipAmount() { return tipAmount; }
    public double getServiceCharge() { return serviceCharge; }
}
