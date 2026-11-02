package com.tripbudget.models;

/**
 * ActivityExpense Subclass - Demonstrates Inheritance & Polymorphism
 * Represents sightseeing, tours, adventures, equipment rentals, and guide charges.
 */
public class ActivityExpense extends Expense {
    private double equipmentRental;
    private double guideFee;

    public ActivityExpense(int expenseId, int tripId, int payerId, String payerName, String title,
                           double ticketPrice, double equipmentRental, double guideFee,
                           String expenseDate, String notes) {
        super(expenseId, tripId, payerId, payerName, title, "ACTIVITIES", ticketPrice, 0.0, expenseDate, notes);
        this.equipmentRental = Math.max(0, equipmentRental);
        this.guideFee = Math.max(0, guideFee);
        this.taxOrFees = this.equipmentRental + this.guideFee;
    }

    @Override
    public double calculateTotalAmount() {
        return this.baseAmount + this.equipmentRental + this.guideFee;
    }

    public double getEquipmentRental() { return equipmentRental; }
    public double getGuideFee() { return guideFee; }
}
