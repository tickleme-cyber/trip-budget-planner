package com.tripbudget.models;

/**
 * Luxury / Premium Travel Strategy
 * 5-star luxury resorts, private airport transfers, fine dining, and VIP passes.
 */
public class LuxuryStrategy extends TravelStrategy {
    public LuxuryStrategy() {
        super("Luxury", "5★ luxury resorts, private transfers, fine dining, and VIP passes", "🥂");
    }

    @Override
    public double getFlightMultiplier() { return 1.35; }

    @Override
    public double getStayMultiplier() { return 2.25; }

    @Override
    public double getFoodMultiplier() { return 2.10; }

    @Override
    public double getActivityMultiplier() { return 1.85; }

    @Override
    public double getBufferPercent() { return 0.12; }
}

