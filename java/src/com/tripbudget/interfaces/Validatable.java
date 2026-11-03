package com.tripbudget.interfaces;

import com.tripbudget.exceptions.TripBudgetException;

/**
 * Validatable Interface - Defines domain contract for structural integrity checks
 */
public interface Validatable {
    /**
     * Validates internal entity fields and states
     * @throws TripBudgetException If any attribute is invalid, empty, or out of acceptable bounds
     */
    void validate() throws TripBudgetException;
}
