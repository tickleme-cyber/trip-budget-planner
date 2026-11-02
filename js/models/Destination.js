/**
 * Destination.js — Demonstrates Encapsulation & Polymorphic Estimation
 * Models a travel destination with cost benchmarks, duration guidelines, and vibe categories.
 */
import { TravelStrategyFactory } from './TravelStrategy.js';

export class Destination {
    #id;
    #name;
    #country;
    #region;
    #tagline;
    #description;
    #vibes;
    #baseFlightCost;   // Baseline roundtrip travel / flight cost per person in USD
    #dailyStayCost;    // Standard hotel room per night in USD (assumes 2 persons per room)
    #dailyFoodCost;    // Food, drinks & dining per person per day in USD
    #dailyActivityCost;// Sightseeing, tickets & experiences per person per day in USD
    #idealDaysMin;
    #idealDaysMax;
    #bestSeason;
    #highlights;
    #rating;
    #imageUrl;
    #tier;             // 'Budget' | 'Moderate' | 'Luxury'

    constructor({
        id,
        name,
        country,
        region,
        tagline = '',
        description = '',
        vibes = [],
        baseFlightCost = 150,
        dailyStayCost = 60,
        dailyFoodCost = 30,
        dailyActivityCost = 20,
        idealDaysMin = 3,
        idealDaysMax = 7,
        bestSeason = 'Year-round',
        highlights = [],
        rating = 4.8,
        imageUrl = '',
        tier = 'Moderate'
    }) {
        if (!name || name.trim() === '') {
            throw new Error('Destination name cannot be empty.');
        }
        if (!country || country.trim() === '') {
            throw new Error('Country cannot be empty.');
        }

        this.#id = id || `dest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        this.#name = name.trim();
        this.#country = country.trim();
        this.#region = region || 'Global';
        this.#tagline = tagline.trim();
        this.#description = description.trim();
        this.#vibes = Array.isArray(vibes) ? [...vibes] : [];
        this.#baseFlightCost = Math.max(0, Number(baseFlightCost) || 0);
        this.#dailyStayCost = Math.max(0, Number(dailyStayCost) || 0);
        this.#dailyFoodCost = Math.max(0, Number(dailyFoodCost) || 0);
        this.#dailyActivityCost = Math.max(0, Number(dailyActivityCost) || 0);
        this.#idealDaysMin = Math.max(1, Number(idealDaysMin) || 3);
        this.#idealDaysMax = Math.max(this.#idealDaysMin, Number(idealDaysMax) || 7);
        this.#bestSeason = bestSeason;
        this.#highlights = Array.isArray(highlights) ? [...highlights] : [];
        this.#rating = Number(rating) || 4.8;
        this.#imageUrl = imageUrl || '';
        this.#tier = tier;
    }

    // Encapsulated Getters
    get id() { return this.#id; }
    get name() { return this.#name; }
    get country() { return this.#country; }
    get region() { return this.#region; }
    get tagline() { return this.#tagline; }
    get description() { return this.#description; }
    get vibes() { return [...this.#vibes]; }
    get baseFlightCost() { return this.#baseFlightCost; }
    get dailyStayCost() { return this.#dailyStayCost; }
    get dailyFoodCost() { return this.#dailyFoodCost; }
    get dailyActivityCost() { return this.#dailyActivityCost; }
    get idealDaysMin() { return this.#idealDaysMin; }
    get idealDaysMax() { return this.#idealDaysMax; }
    get bestSeason() { return this.#bestSeason; }
    get highlights() { return [...this.#highlights]; }
    get rating() { return this.#rating; }
    get imageUrl() { return this.#imageUrl; }
    get tier() { return this.#tier; }

    /**
     * Polymorphic cost calculation based on number of travelers, duration, and chosen TravelStrategy.
     * @param {number} travelers - Number of people traveling
     * @param {number} days - Duration in days
     * @param {string|TravelStrategy} styleOrStrategy - Strategy instance or key ('backpacker' | 'moderate' | 'luxury')
     * @returns {Object} Detailed cost breakdown
     */
    calculateEstimatedCost(travelers = 1, days = 5, styleOrStrategy = 'moderate') {
        const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
        const numDays = Math.max(1, parseInt(days, 10) || 1);
        const nights = Math.max(1, numDays - 1);
        const rooms = Math.ceil(numTravelers / 2); // 2 persons per hotel room standard

        const strategy = typeof styleOrStrategy === 'object' && styleOrStrategy !== null
            ? styleOrStrategy
            : TravelStrategyFactory.getStrategy(styleOrStrategy);

        const flightSubtotal = this.#baseFlightCost * numTravelers * strategy.getFlightMultiplier();
        const staySubtotal = this.#dailyStayCost * nights * rooms * strategy.getStayMultiplier();
        const foodSubtotal = this.#dailyFoodCost * numDays * numTravelers * strategy.getFoodMultiplier();
        const activitySubtotal = this.#dailyActivityCost * numDays * numTravelers * strategy.getActivityMultiplier();

        const preBufferTotal = flightSubtotal + staySubtotal + foodSubtotal + activitySubtotal;
        const bufferAmount = preBufferTotal * strategy.getBufferPercent();
        const grandTotal = Math.round(preBufferTotal + bufferAmount);

        return {
            destinationId: this.#id,
            destinationName: this.#name,
            country: this.#country,
            travelers: numTravelers,
            days: numDays,
            nights,
            rooms,
            strategyName: strategy.name,
            strategyIcon: strategy.icon,
            categories: {
                flight: Math.round(flightSubtotal),
                hotel: Math.round(staySubtotal),
                food: Math.round(foodSubtotal),
                activities: Math.round(activitySubtotal),
                contingency: Math.round(bufferAmount)
            },
            total: grandTotal,
            perPerson: Math.round(grandTotal / numTravelers),
            perPersonPerDay: Math.round(grandTotal / numTravelers / numDays)
        };
    }

    /**
     * Checks if this destination matches a requested vibe.
     * @param {string} requestedVibe 
     * @returns {boolean}
     */
    hasVibe(requestedVibe) {
        if (!requestedVibe || requestedVibe.toLowerCase() === 'all') return true;
        const target = requestedVibe.toLowerCase();
        return this.#vibes.some(v => v.toLowerCase().includes(target) || target.includes(v.toLowerCase()));
    }

    /**
     * Checks if this destination matches a requested region.
     * @param {string} requestedRegion
     * @returns {boolean}
     */
    matchesRegion(requestedRegion) {
        if (!requestedRegion || requestedRegion.toLowerCase() === 'all') return true;
        const target = requestedRegion.toLowerCase();
        return this.#region.toLowerCase().includes(target) || this.#country.toLowerCase().includes(target);
    }
}

