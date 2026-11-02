package com.tripbudget.models;

/**
 * Base Expense Class - Demonstrates Abstraction, Encapsulation, and Polymorphism
 */
public class Expense {
    private int expenseId;
    private int tripId;
    private int payerId;
    private String payerName;
    private String title;
    private String category;
    protected double baseAmount;
    protected double taxOrFees;
    private String expenseDate;
    private String notes;

    public Expense(int expenseId, int tripId, int payerId, String payerName, String title, 
                   String category, double baseAmount, double taxOrFees, String expenseDate, String notes) {
        if (baseAmount < 0) {
            throw new IllegalArgumentException("Base amount cannot be negative");
        }
        this.expenseId = expenseId;
        this.tripId = tripId;
        this.payerId = payerId;
        this.payerName = payerName != null ? payerName : "Unknown";
        this.title = title != null ? title : "Expense";
        this.category = category != null ? category : "GENERAL";
        this.baseAmount = baseAmount;
        this.taxOrFees = Math.max(0, taxOrFees);
        this.expenseDate = expenseDate != null ? expenseDate : "";
        this.notes = notes != null ? notes : "";
    }

    /**
     * Polymorphic method to calculate total cost including specific category calculations
     * Can be overridden by subclasses (Polymorphism)
     * @return Total calculated amount
     */
    public double calculateTotalAmount() {
        return this.baseAmount + this.taxOrFees;
    }

    // Getters and Setters
    public int getExpenseId() { return expenseId; }
    public void setExpenseId(int expenseId) { this.expenseId = expenseId; }

    public int getTripId() { return tripId; }
    public void setTripId(int tripId) { this.tripId = tripId; }

    public int getPayerId() { return payerId; }
    public void setPayerId(int payerId) { this.payerId = payerId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getBaseAmount() { return baseAmount; }
    public void setBaseAmount(double baseAmount) { this.baseAmount = baseAmount; }

    public double getTaxOrFees() { return taxOrFees; }
    public void setTaxOrFees(double taxOrFees) { this.taxOrFees = taxOrFees; }

    public String getExpenseDate() { return expenseDate; }
    public void setExpenseDate(String expenseDate) { this.expenseDate = expenseDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
