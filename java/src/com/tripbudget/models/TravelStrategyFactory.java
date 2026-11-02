package com.tripbudget.models;

import java.util.HashMap;
import java.util.Map;

/**
 * TravelStrategyFactory — Demonstrates Factory Pattern
 */
public class TravelStrategyFactory {
    private static final Map<String, TravelStrategy> strategies = new HashMap<>();

    static {
        strategies.put("BACKPACKER", new BackpackerStrategy());
        strategies.put("MODERATE", new ModerateStrategy());
        strategies.put("LUXURY", new LuxuryStrategy());
    }

    public static TravelStrategy getStrategy(String style) {
        if (style == null) return strategies.get("MODERATE");
        TravelStrategy strategy = strategies.get(style.toUpperCase().trim());
        return strategy != null ? strategy : strategies.get("MODERATE");
    }
}

