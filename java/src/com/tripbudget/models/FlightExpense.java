package com.tripbudget.models;

/**
 * FlightExpense Subclass - Demonstrates Inheritance & Polymorphism
 */
public class FlightExpense extends Expense {
    private double baggageFee;
    private double seatSelectionFee;

    public FlightExpense(int expenseId, int tripId, int payerId, String payerName, String title,
                         double baseFare, double airportTaxes, double baggageFee, double seatSelectionFee,
                         String expenseDate, String notes) {
        super(expenseId, tripId, payerId, payerName, title, "FLIGHT", baseFare, airportTaxes, expenseDate, notes);
        this.baggageFee = Math.max(0, baggageFee);
        this.seatSelectionFee = Math.max(0, seatSelectionFee);
    }

    @Override
    public double calculateTotalAmount() {
        // Base fare + Airport Taxes + Baggage Fee + Seat Selection Fee
        return super.calculateTotalAmount() + this.baggageFee + this.seatSelectionFee;
    }

    public double getBaggageFee() { return baggageFee; }
    public double getSeatSelectionFee() { return seatSelectionFee; }
}
