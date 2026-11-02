package com.tripbudget.models;

/**
 * Backpacker / Budget Travel Strategy
 * Hostels, local transit, street dining, and self-guided exploration.
 */
public class BackpackerStrategy extends TravelStrategy {
    public BackpackerStrategy() {
        super("Backpacker", "Hostels, street eats, local transit and self-guided exploration", "🎒");
    }

    @Override
    public double getFlightMultiplier() { return 0.82; }

    @Override
    public double getStayMultiplier() { return 0.48; }

    @Override
    public double getFoodMultiplier() { return 0.52; }

    @Override
    public double getActivityMultiplier() { return 0.55; }

    @Override
    public double getBufferPercent() { return 0.05; }
}

