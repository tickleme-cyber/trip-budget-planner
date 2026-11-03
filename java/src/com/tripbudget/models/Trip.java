package com.tripbudget.models;

import com.tripbudget.exceptions.BudgetExceededException;
import com.tripbudget.exceptions.ValidationException;
import com.tripbudget.interfaces.Reportable;
import com.tripbudget.interfaces.Searchable;
import com.tripbudget.interfaces.Validatable;
import com.tripbudget.util.ReceiptFormatter;
import com.tripbudget.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Trip Entity Class - Demonstrates Composition (Trip contains Travelers and Expenses),
 * and implements core domain interfaces (Validatable, Reportable, Searchable).
 */
public class Trip implements Validatable, Reportable, Searchable {
    private int tripId;
    private int userId;
    private String title;
    private String destination;
    private String startDate;
    private String endDate;
    private double totalBudget;
    private String currency;
    private String status;

    // Composition: Trip owns and coordinates a list of Travelers & Expenses
    private List<Traveler> travelers = new ArrayList<>();
    private List<Expense> expenses = new ArrayList<>();

    public Trip(int tripId, int userId, String title, String destination, String startDate,
                String endDate, double totalBudget, String currency, String status) {
        if (totalBudget <= 0) {
            throw new IllegalArgumentException("Total budget must be greater than 0: $" + totalBudget);
        }
        this.tripId = tripId;
        this.userId = userId;
        this.title = title != null ? title.trim() : "Untitled Trip";
        this.destination = destination != null ? destination.trim() : "";
        this.startDate = startDate != null ? startDate : "";
        this.endDate = endDate != null ? endDate : "";
        this.totalBudget = totalBudget;
        this.currency = currency != null ? currency : "USD";
        this.status = status != null ? status : "ACTIVE";
    }

    public void addTraveler(Traveler traveler) {
        if (traveler != null) {
            travelers.add(traveler);
        }
    }

    public void addExpense(Expense expense) {
        if (expense != null) {
            expenses.add(expense);
        }
    }

    /**
     * Checks if adding an expense will exceed the trip's budget threshold.
     * Throws BudgetExceededException if overrun occurs.
     */
    public void checkBudgetThreshold(Expense newExpense) throws BudgetExceededException {
        if (newExpense == null) return;
        double projected = getTotalSpent() + newExpense.calculateTotalAmount();
        if (projected > this.totalBudget) {
            throw new BudgetExceededException(this.totalBudget, projected);
        }
    }

    /**
     * Calculates total spent across all expenses using Polymorphic dispatch
     * @return Sum of all calculated expense amounts
     */
    public double getTotalSpent() {
        double total = 0.0;
        for (Expense exp : expenses) {
            total += exp.calculateTotalAmount();
        }
        return total;
    }

    public double getRemainingBudget() {
        return this.totalBudget - getTotalSpent();
    }

    public double getBudgetUsagePercentage() {
        if (totalBudget == 0) return 0.0;
        return (getTotalSpent() / totalBudget) * 100.0;
    }

    /**
     * Implements Validatable.validate()
     * @throws ValidationException if title, budget, or destination fail domain constraints
     */
    @Override
    public void validate() throws ValidationException {
        if (StringUtils.isBlank(this.title)) {
            throw new ValidationException("title", "Trip title cannot be blank or empty.");
        }
        if (this.totalBudget <= 0) {
            throw new ValidationException("totalBudget", "Total budget must be positive: $" + this.totalBudget);
        }
        if (StringUtils.isBlank(this.destination)) {
            throw new ValidationException("destination", "Trip destination must be specified.");
        }
    }

    /**
     * Implements Reportable.generateSummaryReport() using ReceiptFormatter & StringBuilder
     */
    @Override
    public String generateSummaryReport() {
        return ReceiptFormatter.formatTripSummary(this);
    }

    /**
     * Implements Searchable.matchesQuery()
     */
    @Override
    public boolean matchesQuery(String query) {
        return StringUtils.containsIgnoreCase(this.title, query)
                || StringUtils.containsIgnoreCase(this.destination, query);
    }

    // Encapsulated Getters and Setters
    public int getTripId() { return tripId; }
    public void setTripId(int tripId) { this.tripId = tripId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Traveler> getTravelers() { return travelers; }
    public void setTravelers(List<Traveler> travelers) { this.travelers = travelers; }

    public List<Expense> getExpenses() { return expenses; }
    public void setExpenses(List<Expense> expenses) { this.expenses = expenses; }

    @Override
    public String toString() {
        return title + " (" + destination + ")";
    }
}
