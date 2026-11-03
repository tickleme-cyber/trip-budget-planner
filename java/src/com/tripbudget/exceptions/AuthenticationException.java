package com.tripbudget.exceptions;

/**
 * Thrown when user credentials or authorization checks fail
 */
public class AuthenticationException extends TripBudgetException {
    private final String username;

    public AuthenticationException(String username, String message) {
        super("ERR_AUTH_FAILED", String.format("Authentication failed for user '%s': %s", username, message));
        this.username = username;
    }

    public String getUsername() {
        return username;
    }
}

