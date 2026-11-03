package com.tripbudget.exceptions;

/**
 * Thrown when an expense pushes spending beyond the maximum allocated trip budget
 */
public class BudgetExceededException extends TripBudgetException {
    private final double totalBudget;
    private final double attemptedTotal;
    private final double excessAmount;

    public BudgetExceededException(double totalBudget, double attemptedTotal) {
        super("ERR_BUDGET_EXCEEDED", String.format(
                "Trip budget limit of $%.2f exceeded! Projected total spending: $%.2f (Overrun: $%.2f)",
                totalBudget, attemptedTotal, Math.max(0.0, attemptedTotal - totalBudget)
        ));
        this.totalBudget = totalBudget;
        this.attemptedTotal = attemptedTotal;
        this.excessAmount = Math.max(0.0, attemptedTotal - totalBudget);
    }

    public double getTotalBudget() {
        return totalBudget;
    }

    public double getAttemptedTotal() {
        return attemptedTotal;
    }

    public double getExcessAmount() {
        return excessAmount;
    }
}
