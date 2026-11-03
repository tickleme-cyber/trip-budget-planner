package com.tripbudget.exceptions;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Base checked exception for the Trip Budget Planner domain.
 * Encapsulates domain error codes, human-readable messages, and timestamps.
 */
public class TripBudgetException extends Exception {
    private final String errorCode;
    private final LocalDateTime timestamp;

    public TripBudgetException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode != null ? errorCode : "ERR_GENERAL";
        this.timestamp = LocalDateTime.now();
    }

    public TripBudgetException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode != null ? errorCode : "ERR_GENERAL";
        this.timestamp = LocalDateTime.now();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        String formattedTime = timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        return String.format("[%s @ %s] %s", errorCode, formattedTime, getMessage());
    }
}

