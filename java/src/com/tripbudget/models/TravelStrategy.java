package com.tripbudget.models;

/**
 * ============================================================================
 * TravelStrategy.java — Demonstrates Strategy Pattern (OOP Principle)
 * Allows pluggable, polymorphic cost estimation models based on travel style.
 * ============================================================================
 */
public abstract class TravelStrategy {
    private final String name;
    private final String description;
    private final String icon;

    public TravelStrategy(String name, String description, String icon) {
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }

    public abstract double getFlightMultiplier();
    public abstract double getStayMultiplier();
    public abstract double getFoodMultiplier();
    public abstract double getActivityMultiplier();
    public abstract double getBufferPercent();

    @Override
    public String toString() {
        return icon + " " + name;
    }
}

