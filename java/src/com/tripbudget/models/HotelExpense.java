package com.tripbudget.models;

/**
 * HotelExpense Subclass - Demonstrates Inheritance & Polymorphism
 */
public class HotelExpense extends Expense {
    private int numberOfNights;
    private double tourismTaxRate; // e.g. 0.10 for 10%

    public HotelExpense(int expenseId, int tripId, int payerId, String payerName, String title,
                        double nightlyRate, int numberOfNights, double tourismTaxRate,
                        String expenseDate, String notes) {
        super(expenseId, tripId, payerId, payerName, title, "HOTEL", nightlyRate * Math.max(1, numberOfNights), 0.0, expenseDate, notes);
        this.numberOfNights = Math.max(1, numberOfNights);
        this.tourismTaxRate = Math.max(0.0, tourismTaxRate);
        // Calculate tax based on nightly total
        this.taxOrFees = (nightlyRate * this.numberOfNights) * this.tourismTaxRate;
    }

    @Override
    public double calculateTotalAmount() {
        return this.baseAmount + this.taxOrFees;
    }

    public int getNumberOfNights() { return numberOfNights; }
    public double getTourismTaxRate() { return tourismTaxRate; }
}
