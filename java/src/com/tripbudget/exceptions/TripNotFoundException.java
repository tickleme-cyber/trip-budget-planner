package com.tripbudget.exceptions;

/**
 * Thrown when a queried Trip ID cannot be located
 */
public class TripNotFoundException extends TripBudgetException {
    private final int tripId;

    public TripNotFoundException(int tripId) {
        super("ERR_TRIP_NOT_FOUND", "Trip with ID #" + tripId + " does not exist in the database.");
        this.tripId = tripId;
    }

    public int getTripId() {
        return tripId;
    }
}

