package com.tripbudget.models;

/**
 * TransportExpense Subclass - Demonstrates Inheritance & Polymorphism
 * Represents local transit, taxis, car rentals, tolls, and parking fees.
 */
public class TransportExpense extends Expense {
    private double tollCharges;
    private double parkingFee;
    private double fuelSurcharge;

    public TransportExpense(int expenseId, int tripId, int payerId, String payerName, String title,
                            double baseFare, double tollCharges, double parkingFee, double fuelSurcharge,
                            String expenseDate, String notes) {
        super(expenseId, tripId, payerId, payerName, title, "TRANSPORT", baseFare, 0.0, expenseDate, notes);
        this.tollCharges = Math.max(0, tollCharges);
        this.parkingFee = Math.max(0, parkingFee);
        this.fuelSurcharge = Math.max(0, fuelSurcharge);
        this.taxOrFees = this.tollCharges + this.parkingFee + this.fuelSurcharge;
    }

    /**
     * Polymorphic method overriding calculateTotalAmount()
     */
    @Override
    public double calculateTotalAmount() {
        return this.baseAmount + this.tollCharges + this.parkingFee + this.fuelSurcharge;
    }

    public double getTollCharges() { return tollCharges; }
    public double getParkingFee() { return parkingFee; }
    public double getFuelSurcharge() { return fuelSurcharge; }
}
