package com.tripbudget.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ============================================================================
 * Destination Model — Demonstrates Encapsulation & Domain Modeling
 * Represents a travel destination with cost benchmarks, duration guidelines,
 * and polymorphic cost estimation via the Strategy Pattern.
 * ============================================================================
 */
public class Destination {
    private String id;
    private String name;
    private String country;
    private String region;
    private String tagline;
    private String description;
    private List<String> vibes;
    private List<String> highlights;
    private double baseFlightCost;
    private double dailyStayCost;
    private double dailyFoodCost;
    private double dailyActivityCost;
    private int idealDaysMin;
    private int idealDaysMax;
    private String bestSeason;
    private double rating;
    private String tier;

    public Destination(String id, String name, String country, String region,
                       String tagline, String description, List<String> vibes, List<String> highlights,
                       double baseFlightCost, double dailyStayCost, double dailyFoodCost,
                       double dailyActivityCost, int idealDaysMin, int idealDaysMax,
                       String bestSeason, double rating, String tier) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Destination name cannot be empty.");
        }
        if (country == null || country.trim().isEmpty()) {
            throw new IllegalArgumentException("Country cannot be empty.");
        }
        this.id = id != null ? id : "dest_" + System.currentTimeMillis();
        this.name = name.trim();
        this.country = country.trim();
        this.region = region != null ? region : "Global";
        this.tagline = tagline != null ? tagline.trim() : "";
        this.description = description != null ? description.trim() : "";
        this.vibes = vibes != null ? new ArrayList<>(vibes) : new ArrayList<>();
        this.highlights = highlights != null ? new ArrayList<>(highlights) : new ArrayList<>();
        this.baseFlightCost = Math.max(0, baseFlightCost);
        this.dailyStayCost = Math.max(0, dailyStayCost);
        this.dailyFoodCost = Math.max(0, dailyFoodCost);
        this.dailyActivityCost = Math.max(0, dailyActivityCost);
        this.idealDaysMin = Math.max(1, idealDaysMin);
        this.idealDaysMax = Math.max(this.idealDaysMin, idealDaysMax);
        this.bestSeason = bestSeason != null ? bestSeason : "Year-round";
        this.rating = rating > 0 ? rating : 4.8;
        this.tier = tier != null ? tier : "Moderate";
    }

    // Simplified constructor for backwards compatibility
    public Destination(String id, String name, String country, String region,
                       double baseFlightCost, double dailyStayCost, double dailyFoodCost,
                       double dailyActivityCost, int idealDaysMin, int idealDaysMax,
                       double rating, String tier) {
        this(id, name, country, region, "Scenic getaway in " + country,
             "Explore culture, attractions and local cuisine in " + name + ".",
             Collections.singletonList("Adventure"),
             Collections.singletonList("Historic landmarks & city tour"),
             baseFlightCost, dailyStayCost, dailyFoodCost, dailyActivityCost,
             idealDaysMin, idealDaysMax, "Oct - Apr", rating, tier);
    }

    // Encapsulated Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    public String getRegion() { return region; }
    public String getTagline() { return tagline; }
    public String getDescription() { return description; }
    public List<String> getVibes() { return Collections.unmodifiableList(vibes); }
    public List<String> getHighlights() { return Collections.unmodifiableList(highlights); }
    public double getBaseFlightCost() { return baseFlightCost; }
    public double getDailyStayCost() { return dailyStayCost; }
    public double getDailyFoodCost() { return dailyFoodCost; }
    public double getDailyActivityCost() { return dailyActivityCost; }
    public int getIdealDaysMin() { return idealDaysMin; }
    public int getIdealDaysMax() { return idealDaysMax; }
    public String getBestSeason() { return bestSeason; }
    public double getRating() { return rating; }
    public String getTier() { return tier; }

    /**
     * Nested class representing itemized cost calculation results.
     */
    public static class CostBreakdown {
        public final double flight;
        public final double hotel;
        public final double food;
        public final double activities;
        public final double contingency;
        public final double total;
        public final double perPerson;
        public final double dailyPerPerson;
        public final int travelers;
        public final int days;
        public final int nights;
        public final int rooms;
        public final String strategyName;

        public CostBreakdown(double flight, double hotel, double food, double activities,
                             double contingency, double total, double perPerson, double dailyPerPerson,
                             int travelers, int days, int nights, int rooms, String strategyName) {
            this.flight = flight;
            this.hotel = hotel;
            this.food = food;
            this.activities = activities;
            this.contingency = contingency;
            this.total = total;
            this.perPerson = perPerson;
            this.dailyPerPerson = dailyPerPerson;
            this.travelers = travelers;
            this.days = days;
            this.nights = nights;
            this.rooms = rooms;
            this.strategyName = strategyName;
        }
    }

    /**
     * Polymorphic cost estimation via Strategy Pattern.
     */
    public CostBreakdown calculateCostBreakdown(int travelers, int days, TravelStrategy strategy) {
        int t = Math.max(1, travelers);
        int d = Math.max(1, days);
        int nights = Math.max(1, d - 1);
        int rooms = (int) Math.ceil((double) t / 2.0);

        TravelStrategy strat = strategy != null ? strategy : new ModerateStrategy();

        double flightSubtotal = baseFlightCost * t * strat.getFlightMultiplier();
        double staySubtotal = dailyStayCost * nights * rooms * strat.getStayMultiplier();
        double foodSubtotal = dailyFoodCost * d * t * strat.getFoodMultiplier();
        double actSubtotal = dailyActivityCost * d * t * strat.getActivityMultiplier();

        double subtotal = flightSubtotal + staySubtotal + foodSubtotal + actSubtotal;
        double buffer = subtotal * strat.getBufferPercent();
        double grandTotal = Math.round(subtotal + buffer);

        double perPerson = Math.round(grandTotal / t);
        double daily = Math.round(perPerson / d);

        return new CostBreakdown(
                Math.round(flightSubtotal),
                Math.round(staySubtotal),
                Math.round(foodSubtotal),
                Math.round(actSubtotal),
                Math.round(buffer),
                grandTotal,
                perPerson,
                daily,
                t, d, nights, rooms,
                strat.getName()
        );
    }

    public double calculateEstimatedCost(int travelers, int days) {
        return calculateCostBreakdown(travelers, days, new ModerateStrategy()).total;
    }

    public double calculateEstimatedCost(int travelers, int days, TravelStrategy strategy) {
        return calculateCostBreakdown(travelers, days, strategy).total;
    }

    public boolean matchesVibe(String vibe) {
        if (vibe == null || vibe.equalsIgnoreCase("all") || vibe.isEmpty()) return true;
        String target = vibe.toLowerCase();
        for (String v : vibes) {
            if (v.toLowerCase().contains(target) || target.contains(v.toLowerCase())) return true;
        }
        return false;
    }

    public boolean matchesRegion(String targetRegion) {
        if (targetRegion == null || targetRegion.equalsIgnoreCase("all") || targetRegion.isEmpty()) return true;
        String target = targetRegion.toLowerCase();
        return region.toLowerCase().contains(target) || country.toLowerCase().contains(target);
    }

    @Override
    public String toString() {
        return name + ", " + country + " (" + tier + " - Rating: " + rating + ")";
    }
}
