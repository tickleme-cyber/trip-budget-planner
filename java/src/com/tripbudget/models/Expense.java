package com.tripbudget.models;

import com.tripbudget.exceptions.InvalidExpenseException;
import com.tripbudget.exceptions.ValidationException;
import com.tripbudget.interfaces.Billable;
import com.tripbudget.interfaces.Searchable;
import com.tripbudget.interfaces.Splittable;
import com.tripbudget.interfaces.Validatable;
import com.tripbudget.util.ReceiptFormatter;
import com.tripbudget.util.StringUtils;

/**
 * Base Expense Class - Demonstrates Abstraction, Encapsulation, Polymorphism,
 * and implements core domain interfaces (Billable, Splittable, Validatable, Searchable).
 */
public class Expense implements Billable, Splittable, Validatable, Searchable {
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
            throw new IllegalArgumentException("Base amount cannot be negative: $" + baseAmount);
        }
        this.expenseId = expenseId;
        this.tripId = tripId;
        this.payerId = payerId;
        this.payerName = payerName != null ? payerName : "Unknown";
        this.title = title != null ? title.trim() : "Expense";
        this.category = category != null ? category.trim() : "GENERAL";
        this.baseAmount = baseAmount;
        this.taxOrFees = Math.max(0, taxOrFees);
        this.expenseDate = expenseDate != null ? expenseDate : "";
        this.notes = notes != null ? notes : "";
    }

    /**
     * Polymorphic method to calculate total cost including specific category calculations.
     * Implements Billable.calculateTotalAmount()
     * @return Total calculated amount
     */
    @Override
    public double calculateTotalAmount() {
        return this.baseAmount + this.taxOrFees;
    }

    /**
     * Implements Billable.getFormattedReceipt() using ReceiptFormatter & StringBuilder
     */
    @Override
    public String getFormattedReceipt() {
        return ReceiptFormatter.formatReceipt(this);
    }

    /**
     * Implements Splittable.calculateFairShare()
     */
    @Override
    public double calculateFairShare(int numberOfParticipants) {
        int count = Math.max(1, numberOfParticipants);
        return calculateTotalAmount() / count;
    }

    /**
     * Implements Splittable.isEligibleForSplit()
     */
    @Override
    public boolean isEligibleForSplit() {
        return true;
    }

    /**
     * Implements Validatable.validate()
     * @throws ValidationException If required string fields are blank
     * @throws InvalidExpenseException If financial amounts are invalid
     */
    @Override
    public void validate() throws ValidationException, InvalidExpenseException {
        if (StringUtils.isBlank(this.title)) {
            throw new ValidationException("title", "Expense title cannot be empty or whitespace.");
        }
        if (this.baseAmount < 0) {
            throw new InvalidExpenseException("Base amount cannot be negative: $" + this.baseAmount, this.baseAmount);
        }
        if (StringUtils.isBlank(this.payerName) && this.payerId <= 0) {
            throw new ValidationException("payer", "Valid payer information must be specified.");
        }
    }

    /**
     * Implements Searchable.matchesQuery()
     */
    @Override
    public boolean matchesQuery(String query) {
        return StringUtils.containsIgnoreCase(this.title, query)
                || StringUtils.containsIgnoreCase(this.category, query)
                || StringUtils.containsIgnoreCase(this.payerName, query);
    }

    // Encapsulated Getters and Setters
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

    @Override
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

    @Override
    public String toString() {
        return String.format("[%s] %s: $%.2f", category, title, calculateTotalAmount());
    }
}
