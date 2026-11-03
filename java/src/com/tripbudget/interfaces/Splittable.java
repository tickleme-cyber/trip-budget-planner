package com.tripbudget.interfaces;

/**
 * Splittable Interface - Defines the contract for expenses that can be divided among companions
 */
public interface Splittable {
    /**
     * Calculates the fair share amount per person for a given number of travelers
     * @param numberOfParticipants Count of travelers splitting the cost (must be > 0)
     * @return Per-person fair share amount
     */
    double calculateFairShare(int numberOfParticipants);

    /**
     * Determines if this item is eligible for group cost division
     * @return True if eligible for splitting, false if personal
     */
    boolean isEligibleForSplit();
}

