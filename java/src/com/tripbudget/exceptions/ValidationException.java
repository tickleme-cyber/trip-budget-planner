package com.tripbudget.exceptions;

/**
 * Thrown when domain entities fail structural data integrity constraints
 */
public class ValidationException extends TripBudgetException {
    private final String fieldName;

    public ValidationException(String fieldName, String message) {
        super("ERR_VALIDATION_FAILED", String.format("Validation error on field '%s': %s", fieldName, message));
        this.fieldName = fieldName;
    }

    public String getFieldName() {
        return fieldName;
    }
}
