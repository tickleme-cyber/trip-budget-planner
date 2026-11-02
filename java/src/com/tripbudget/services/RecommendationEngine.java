package com.tripbudget.services;

import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.dao.TravelerDAO;
import com.tripbudget.dao.TripDAO;
import com.tripbudget.models.Destination;
import com.tripbudget.models.Expense;
import com.tripbudget.models.ExpenseFactory;
import com.tripbudget.models.TravelStrategy;
import com.tripbudget.models.TravelStrategyFactory;
import com.tripbudget.models.Traveler;
import com.tripbudget.models.Trip;
import com.tripbudget.models.User;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * ============================================================================
 * RecommendationEngine Service — Demonstrates Business Logic & Filtering
 * Evaluates destinations matching a user's budget, party size, travel strategy,
 * vibes, and regions. Provides 1-click Trip and Expense generation.
 * ============================================================================
 */
public class RecommendationEngine {
    private final List<Destination> catalog = new ArrayList<>();

    public RecommendationEngine() {
        initCatalog();
    }

    private void initCatalog() {
        // ── DOMESTIC / INDIA GEMS (Budget to Moderate) ─────────────────────────
        catalog.add(new Destination(
                "dest_goa", "Goa", "India", "Domestic",
                "Sun, sand, coastal spice, and Portuguese colonial charm",
                "Golden beaches, 17th-century Latin quarters, beach shacks, and vibrant night markets.",
                Arrays.asList("Beach", "Nightlife", "Foodie", "Culture"),
                Arrays.asList("Anjuna Beach", "Fontainhas Latin Quarter", "Dudhsagar Waterfalls"),
                80, 45, 20, 15, 3, 6, "Nov – Mar", 4.8, "Budget"
        ));

        catalog.add(new Destination(
                "dest_manali", "Manali", "India", "Domestic",
                "Snow-capped Himalayan peaks, pine forests, and alpine adventure",
                "Scenic mountain passes, paragliding over Solang, apple orchards, and river-side cafes.",
                Arrays.asList("Mountain", "Adventure", "Nature"),
                Arrays.asList("Solang Valley Paragliding", "Atal Tunnel & Rohtang Pass", "Old Manali Cafes"),
                90, 40, 18, 25, 4, 7, "Oct – Jun", 4.7, "Budget"
        ));

        catalog.add(new Destination(
                "dest_jaipur", "Jaipur & Udaipur", "India", "Domestic",
                "Pink City and Lake City royal heritage odyssey",
                "Amber sandstone forts, gleaming lake palaces, and rich Rajasthani royal feasts.",
                Arrays.asList("Heritage", "Culture", "Foodie"),
                Arrays.asList("Amber Fort & Hawa Mahal", "Lake Pichola Boat Cruise", "City Palace"),
                75, 50, 22, 18, 4, 7, "Oct – Mar", 4.9, "Budget"
        ));

        catalog.add(new Destination(
                "dest_kerala", "Kerala (Munnar & Alleppey)", "India", "Domestic",
                "God's Own Country: emerald tea hills & backwaters",
                "Cruise emerald backwaters in a traditional houseboat, and walk through mist-covered tea estates.",
                Arrays.asList("Nature", "Wellness", "Relaxation"),
                Arrays.asList("Alleppey Houseboat Stay", "Munnar Tea Estates", "Kathakali & Ayurveda"),
                85, 55, 20, 15, 4, 8, "Sep – Mar", 4.9, "Budget"
        ));

        catalog.add(new Destination(
                "dest_rishikesh", "Rishikesh", "India", "Domestic",
                "White water rapids, yoga sanctuaries, and evening Ganga Aarti",
                "Raft the thrilling rapids of the Ganges and practice yoga along the holy riverbanks.",
                Arrays.asList("Adventure", "Wellness", "Mountain"),
                Arrays.asList("Ganges River Rafting", "Triveni Ghat Aarti", "Beatles Ashram"),
                65, 35, 16, 22, 3, 5, "Sep – May", 4.7, "Budget"
        ));

        catalog.add(new Destination(
                "dest_pondicherry", "Pondicherry", "India", "Domestic",
                "French colonial boulevards, pastel villas, and serene seaside promenades",
                "Cobblestone streets with French cafes, vibrant bougainvillea, and Auroville spiritual community.",
                Arrays.asList("Beach", "Culture", "Relaxation"),
                Arrays.asList("White Town French Quarter", "Rock Beach Promenade", "Auroville Matrimandir"),
                70, 40, 20, 12, 2, 4, "Oct – Mar", 4.6, "Budget"
        ));

        catalog.add(new Destination(
                "dest_ladakh", "Ladakh & Leh", "India", "Domestic",
                "Land of High Mountain Passes, azure lakes, and ancient gompas",
                "Highest motorable passes, crystal-blue Pangong Tso, and serene Tibetan Buddhist monasteries.",
                Arrays.asList("Mountain", "Adventure", "Nature"),
                Arrays.asList("Pangong Tso & Nubra Valley", "Khardung La Pass", "Thiksey Monastery"),
                160, 55, 24, 30, 6, 10, "May – Sep", 4.9, "Moderate"
        ));

        // ── SOUTHEAST ASIA & BUDGET INTERNATIONAL ($600 – $1,500) ──────────────
        catalog.add(new Destination(
                "dest_bali", "Bali", "Indonesia", "Southeast Asia",
                "Island of the Gods: rice terraces, surf breaks & cliff temples",
                "Tropical paradise of jungle swings, cliffside Hindu temples, and turquoise surf breaks.",
                Arrays.asList("Beach", "Wellness", "Culture", "Adventure"),
                Arrays.asList("Ubud Monkey Forest", "Nusa Penida Kelingking Beach", "Uluwatu Sunset Temple"),
                320, 65, 25, 25, 5, 9, "Apr – Oct", 4.9, "Moderate"
        ));

        catalog.add(new Destination(
                "dest_phuket", "Phuket & Krabi", "Thailand", "Southeast Asia",
                "Limestone karsts rising from turquoise Andaman waters",
                "Island hop through Maya Bay, kayak sea caves, and enjoy vibrant street night markets.",
                Arrays.asList("Beach", "Nightlife", "Adventure"),
                Arrays.asList("Phi Phi Islands Cruise", "Railay Beach", "Old Phuket Town"),
                280, 60, 22, 30, 5, 8, "Nov – Apr", 4.8, "Moderate"
        ));

        catalog.add(new Destination(
                "dest_vietnam", "Hanoi & Ha Long Bay", "Vietnam", "Southeast Asia",
                "UNESCO limestone karst wonderland & legendary street pho",
                "Cruise limestone pinnacles in emerald waters and wander Hanoi's buzzing French-colonial Old Quarter.",
                Arrays.asList("Culture", "Nature", "Foodie"),
                Arrays.asList("Ha Long Bay Cruise", "Hanoi Old Quarter & Egg Coffee", "Trang An River Caves"),
                260, 45, 18, 25, 5, 8, "Oct – Apr", 4.8, "Budget"
        ));

        catalog.add(new Destination(
                "dest_singapore", "Singapore", "Singapore", "Southeast Asia",
                "Futuristic Garden City of Supertrees and Michelin hawkers",
                "World-famous botanical domes, stunning Marina Bay skyline, and clean vibrant street food culture.",
                Arrays.asList("City", "Foodie", "Culture"),
                Arrays.asList("Gardens by the Bay", "Marina Bay Sands SkyPark", "Chinatown Hawker Food"),
                260, 110, 35, 35, 3, 5, "Year-round", 4.8, "Moderate"
        ));

        // ── MID-TIER & MODERN INTERNATIONAL ($1,200 – $2,800) ───────────────────
        catalog.add(new Destination(
                "dest_dubai", "Dubai", "UAE", "Middle East",
                "Desert metropolis of sky-high architecture and golden dunes",
                "Ascend the world's tallest tower, experience desert safaris, and shop opulent gold souks.",
                Arrays.asList("City", "Adventure", "Nightlife"),
                Arrays.asList("Burj Khalifa Observatory", "Desert Safari & Dune Bashing", "Sheikh Zayed Mosque"),
                290, 110, 45, 50, 4, 7, "Nov – Mar", 4.8, "Moderate"
        ));

        catalog.add(new Destination(
                "dest_turkey", "Istanbul & Cappadocia", "Turkey", "Europe",
                "Where continents collide: fairy chimneys, hot air balloons & spice bazaars",
                "Sunrise hot air balloon rides over fairy chimneys, Bosphorus ferry cruises, and Hagia Sophia.",
                Arrays.asList("Heritage", "Culture", "Adventure"),
                Arrays.asList("Cappadocia Hot Air Balloon", "Hagia Sophia & Blue Mosque", "Bosphorus Cruise"),
                420, 75, 28, 45, 6, 9, "Apr – Jun, Sep – Nov", 4.9, "Moderate"
        ));

        catalog.add(new Destination(
                "dest_prague", "Prague & Budapest", "Czech Republic", "Europe",
                "Historic castles, thermal baths, and gothic bridges",
                "Cross the Charles Bridge, soak in historic Roman thermal bathhouses, and explore fairytale alleys.",
                Arrays.asList("Heritage", "Culture", "Nightlife"),
                Arrays.asList("Prague Castle & Charles Bridge", "Széchenyi Thermal Baths", "Danube Night Cruise"),
                550, 75, 32, 25, 6, 10, "May – Sep", 4.8, "Moderate"
        ));

        // ── LUXURY & ICONIC DREAM DESTINATIONS ($2,500 – $5,000+) ───────────────
        catalog.add(new Destination(
                "dest_japan", "Tokyo & Kyoto", "Japan", "East Asia",
                "Neon cyber-metropolis meets serene zen gardens and shrines",
                "Walk Shibuya crossing, ride the 320 km/h Shinkansen, and admire thousands of scarlet torii gates.",
                Arrays.asList("City", "Culture", "Foodie"),
                Arrays.asList("Fushimi Inari Torii Shrine", "Shibuya & Shinjuku Nightlife", "Mt. Fuji Day Excursion"),
                650, 120, 45, 40, 7, 12, "Mar – May, Oct – Nov", 4.95, "Luxury"
        ));

        catalog.add(new Destination(
                "dest_swiss", "Swiss Alps", "Switzerland", "Europe",
                "Top of Europe: glacier peaks, alpine lakes & cogwheel trains",
                "Ride railways to Jungfraujoch, gaze at the iconic Matterhorn, and cruise crystal alpine lakes.",
                Arrays.asList("Mountain", "Nature", "Adventure"),
                Arrays.asList("Jungfraujoch Glacier", "Matterhorn Viewpoint Zermatt", "Lauterbrunnen Waterfalls"),
                720, 160, 60, 65, 6, 10, "Jun – Sep", 4.96, "Luxury"
        ));

        catalog.add(new Destination(
                "dest_paris", "Paris", "France", "Europe",
                "City of Light: art, romance, haute cuisine and fashion",
                "Gaze at the sparkling Eiffel Tower, view the Louvre masterpieces, and stroll along the Seine.",
                Arrays.asList("Culture", "Heritage", "Foodie"),
                Arrays.asList("Eiffel Tower & Seine Cruise", "Louvre Museum", "Montmartre & Sacré-Cœur"),
                680, 140, 55, 45, 6, 10, "Apr – Oct", 4.85, "Luxury"
        ));

        catalog.add(new Destination(
                "dest_maldives", "Maldives", "Maldives", "Middle East",
                "Overwater villas, turquoise lagoons, and coral reefs",
                "Wake above crystal-clear waters, snorkel alongside sea turtles and manta rays, and enjoy pure seclusion.",
                Arrays.asList("Beach", "Wellness", "Relaxation"),
                Arrays.asList("Overwater Bungalow Stay", "Manta Ray Snorkeling", "Sunset Dolphin Speedboat"),
                450, 260, 75, 55, 4, 7, "Nov – Apr", 4.95, "Luxury"
        ));
    }

    public List<Destination> getCatalog() {
        return Collections.unmodifiableList(catalog);
    }

    /**
     * Represents a recommendation match with detailed cost breakdown and scores.
     */
    public static class RecommendationMatch {
        private final Destination destination;
        private final Destination.CostBreakdown costBreakdown;
        private final double targetBudget;
        private final double surplusOrDeficit;
        private final String fitStatus; // "WITHIN_BUDGET", "BUDGET_SAVER", "STRETCH", "OVER_BUDGET"
        private final String statusLabel;
        private final int matchPercentage;

        public RecommendationMatch(Destination destination, Destination.CostBreakdown costBreakdown,
                                   double targetBudget, double surplusOrDeficit, String fitStatus,
                                   String statusLabel, int matchPercentage) {
            this.destination = destination;
            this.costBreakdown = costBreakdown;
            this.targetBudget = targetBudget;
            this.surplusOrDeficit = surplusOrDeficit;
            this.fitStatus = fitStatus;
            this.statusLabel = statusLabel;
            this.matchPercentage = matchPercentage;
        }

        public Destination getDestination() { return destination; }
        public Destination.CostBreakdown getCostBreakdown() { return costBreakdown; }
        public double getTargetBudget() { return targetBudget; }
        public double getEstimatedCost() { return costBreakdown.total; }
        public double getSurplusOrDeficit() { return surplusOrDeficit; }
        public String getFitStatus() { return fitStatus; }
        public String getStatusLabel() { return statusLabel; }
        public int getMatchPercentage() { return matchPercentage; }
        public boolean isWithinBudget() {
            return "WITHIN_BUDGET".equals(fitStatus) || "BUDGET_SAVER".equals(fitStatus);
        }

        @Override
        public String toString() {
            return destination.getName() + ", " + destination.getCountry()
                    + " -> Estimated Cost: $" + Math.round(costBreakdown.total)
                    + " (" + matchPercentage + "% Match · " + statusLabel + ")";
        }
    }

    /**
     * Evaluates all destinations matching user budget, travelers, duration, travel style, vibe, and region.
     */
    public List<RecommendationMatch> getRecommendations(double budget, int travelers, int days,
                                                         String travelStyle, String vibe, String region) {
        int t = Math.max(1, travelers);
        int d = Math.max(1, days);
        double userBudget = Math.max(10, budget);

        TravelStrategy strategy = TravelStrategyFactory.getStrategy(travelStyle);
        List<RecommendationMatch> results = new ArrayList<>();

        for (Destination dest : catalog) {
            if (!dest.matchesVibe(vibe)) continue;
            if (!dest.matchesRegion(region)) continue;

            Destination.CostBreakdown breakdown = dest.calculateCostBreakdown(t, d, strategy);
            double total = breakdown.total;
            double delta = userBudget - total;

            String fitStatus;
            String statusLabel;
            if (total <= userBudget * 0.70) {
                fitStatus = "BUDGET_SAVER";
                statusLabel = "💰 Budget Saver ($" + Math.round(delta) + " Left)";
            } else if (total <= userBudget) {
                fitStatus = "WITHIN_BUDGET";
                statusLabel = "✨ Within Budget";
            } else if (total <= userBudget * 1.15) {
                fitStatus = "STRETCH";
                statusLabel = "⚡ Stretch Goal (+$" + Math.round(Math.abs(delta)) + ")";
            } else {
                fitStatus = "OVER_BUDGET";
                statusLabel = "⚠️ Exceeds Budget";
            }

            // Calculate comprehensive score (0 - 100)
            double score = 50.0;
            if (total <= userBudget) {
                double util = total / userBudget;
                score += 45.0 * Math.min(1.0, util >= 0.65 ? 1.0 : 0.75 + (util * 0.25));
            } else if (total <= userBudget * 1.15) {
                score += 20.0;
            } else {
                score -= 30.0;
            }

            if (d >= dest.getIdealDaysMin() && d <= dest.getIdealDaysMax()) {
                score += 25.0;
            } else {
                int diff = Math.min(Math.abs(d - dest.getIdealDaysMin()), Math.abs(d - dest.getIdealDaysMax()));
                score += Math.max(5.0, 25.0 - (diff * 5.0));
            }

            if (vibe != null && !vibe.equalsIgnoreCase("all") && !vibe.isEmpty()) {
                score += dest.matchesVibe(vibe) ? 15.0 : 0.0;
            } else {
                score += 10.0;
            }

            score += Math.min(15.0, (dest.getRating() - 4.5) * 30.0);
            int matchPercentage = (int) Math.max(25, Math.min(99, Math.round(score)));

            results.add(new RecommendationMatch(dest, breakdown, userBudget, delta, fitStatus, statusLabel, matchPercentage));
        }

        // Sort: Match percentage descending, then by lowest total cost
        results.sort((a, b) -> {
            if (b.getMatchPercentage() != a.getMatchPercentage()) {
                return Integer.compare(b.getMatchPercentage(), a.getMatchPercentage());
            }
            return Double.compare(a.getEstimatedCost(), b.getEstimatedCost());
        });

        return results;
    }

    public List<RecommendationMatch> getRecommendations(double budget, int travelers, int days) {
        return getRecommendations(budget, travelers, days, "MODERATE", "all", "all");
    }

    /**
     * Converts a recommendation into a real Trip in the database with travelers and starter expenses.
     */
    public Trip createTripFromRecommendation(RecommendationMatch match, User user, String tripTitle,
                                             List<String> travelerNames, boolean includeExpenses,
                                             TripDAO tripDAO, TravelerDAO travelerDAO, ExpenseDAO expenseDAO) {
        Destination dest = match.getDestination();
        String title = (tripTitle != null && !tripTitle.trim().isEmpty())
                ? tripTitle.trim()
                : dest.getName() + " Getaway";

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, 1);
        String startDate = sdf.format(cal.getTime());
        cal.add(Calendar.DAY_OF_YEAR, match.getCostBreakdown().days);
        String endDate = sdf.format(cal.getTime());

        double budget = Math.max(match.getTargetBudget(), match.getEstimatedCost());

        // 1. Create Trip via TripDAO
        Trip newTrip = new Trip(0, user.getUserId(), title, dest.getName() + ", " + dest.getCountry(),
                                startDate, endDate, budget, "USD", "ACTIVE");
        boolean tripOk = tripDAO.createTrip(newTrip);
        if (!tripOk) {
            throw new RuntimeException("Failed to persist recommended trip to database.");
        }

        int tripId = newTrip.getTripId();

        // 2. Add Travelers via TravelerDAO
        List<Traveler> createdTravelers = new ArrayList<>();
        String[] colors = {"#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"};

        List<String> names = (travelerNames != null && !travelerNames.isEmpty())
                ? travelerNames
                : Arrays.asList(user.getFullName(), "Travel Companion");

        for (int i = 0; i < names.size(); i++) {
            String color = colors[i % colors.length];
            Traveler trv = new Traveler(0, tripId, names.get(i), "traveler" + (i + 1) + "@trip.org", color);
            travelerDAO.addTraveler(trv);
            createdTravelers.add(trv);
        }

        int primaryPayerId = createdTravelers.get(0).getTravelerId();
        String primaryPayerName = createdTravelers.get(0).getName();

        // 3. Pre-allocate starting polymorphic expenses via ExpenseFactory & ExpenseDAO
        if (includeExpenses && expenseDAO != null) {
            Destination.CostBreakdown costs = match.getCostBreakdown();

            if (costs.flight > 0) {
                Expense flight = ExpenseFactory.createExpense(
                        "FLIGHT", 0, tripId, primaryPayerId, primaryPayerName,
                        "Roundtrip Travel to " + dest.getName(),
                        costs.flight * 0.85, costs.flight * 0.10, costs.flight * 0.05, 0,
                        startDate, "Estimated flights/transit for group"
                );
                expenseDAO.addExpense(flight);
            }

            if (costs.hotel > 0) {
                Expense hotel = ExpenseFactory.createExpense(
                        "HOTEL", 0, tripId, primaryPayerId, primaryPayerName,
                        "Accommodations in " + dest.getName() + " (" + costs.nights + " Nights)",
                        costs.hotel / costs.nights / 1.10, costs.nights, 0.10, 0,
                        startDate, "Estimated hotel/resort stay"
                );
                expenseDAO.addExpense(hotel);
            }

            if (costs.food > 0) {
                Expense food = ExpenseFactory.createExpense(
                        "FOOD", 0, tripId, primaryPayerId, primaryPayerName,
                        "Food & Dining in " + dest.getName(),
                        costs.food * 0.85, costs.food * 0.10, costs.food * 0.05, 0,
                        startDate, "Daily meals and dining budget"
                );
                expenseDAO.addExpense(food);
            }

            if (costs.activities > 0) {
                Expense act = ExpenseFactory.createExpense(
                        "ACTIVITIES", 0, tripId, primaryPayerId, primaryPayerName,
                        "Sightseeing & Attractions in " + dest.getName(),
                        costs.activities * 0.90, costs.activities * 0.10, 0, 0,
                        startDate, "Excursions & attraction passes"
                );
                expenseDAO.addExpense(act);
            }
        }

        return newTrip;
    }
}
