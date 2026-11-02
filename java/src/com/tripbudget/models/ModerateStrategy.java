package com.tripbudget.models;

/**
 * Moderate / Balanced Travel Strategy
 * Standard 3-4 star hotels, balanced dining, and top attractions.
 */
public class ModerateStrategy extends TravelStrategy {
    public ModerateStrategy() {
        super("Moderate", "Comfortable 3–4★ hotels, mixed transport, standard dining", "🧳");
    }

    @Override
    public double getFlightMultiplier() { return 1.0; }

    @Override
    public double getStayMultiplier() { return 1.0; }

    @Override
    public double getFoodMultiplier() { return 1.0; }

    @Override
    public double getActivityMultiplier() { return 1.0; }

    @Override
    public double getBufferPercent() { return 0.08; }
}

