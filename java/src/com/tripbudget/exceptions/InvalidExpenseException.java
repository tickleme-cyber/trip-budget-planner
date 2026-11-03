package com.tripbudget.exceptions;

/**
 * Thrown when an expense fails financial validation (e.g. negative amount, missing title, invalid tax)
 */
public class InvalidExpenseException extends TripBudgetException {
    private final double attemptedAmount;

    public InvalidExpenseException(String message, double attemptedAmount) {
        super("ERR_EXPENSE_INVALID", message);
        this.attemptedAmount = attemptedAmount;
    }

    public double getAttemptedAmount() {
        return attemptedAmount;
    }
}

