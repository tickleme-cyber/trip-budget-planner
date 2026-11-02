/**
 * TravelStrategy.js — Demonstrates the Strategy Pattern (OOP Principle)
 * Allows polymorphic cost estimation models based on the traveler's preferred style.
 */

export class TravelStrategy {
    #name;
    #description;
    #icon;

    constructor(name, description, icon) {
        if (new.target === TravelStrategy) {
            throw new Error('Abstract class TravelStrategy cannot be instantiated directly.');
        }
        this.#name = name;
        this.#description = description;
        this.#icon = icon;
    }

    get name() { return this.#name; }
    get description() { return this.#description; }
    get icon() { return this.#icon; }

    getFlightMultiplier() { return 1.0; }
    getStayMultiplier() { return 1.0; }
    getFoodMultiplier() { return 1.0; }
    getActivityMultiplier() { return 1.0; }
    getBufferPercent() { return 0.05; }
}

/**
 * Backpacker / Budget Style
 * Hostels, local transit, street eats, national parks & free sights.
 */
export class BackpackerStrategy extends TravelStrategy {
    constructor() {
        super(
            'Backpacker',
            'Budget hostels & guesthouses, public transport, authentic street dining, and self-guided exploration.',
            '🎒'
        );
    }

    getFlightMultiplier() { return 0.82; } // Advance booking, budget carriers, trains
    getStayMultiplier() { return 0.48; }   // Hostels, shared dorms, budget homestays
    getFoodMultiplier() { return 0.52; }   // Local markets, street food, budget cafes
    getActivityMultiplier() { return 0.55; } // Free sights, public beaches, DIY walking tours
    getBufferPercent() { return 0.05; }   // 5% emergency buffer
}

/**
 * Moderate / Balanced Comfort Style
 * Standard 3-star to 4-star hotels, comfortable flights/cabs, varied dining, and popular ticketed attractions.
 */
export class ModerateStrategy extends TravelStrategy {
    constructor() {
        super(
            'Moderate',
            'Comfortable 3–4★ hotels, mixed transport, casual & nice dining, and all top ticketed attractions.',
            '🧳'
        );
    }

    getFlightMultiplier() { return 1.0; }
    getStayMultiplier() { return 1.0; }
    getFoodMultiplier() { return 1.0; }
    getActivityMultiplier() { return 1.0; }
    getBufferPercent() { return 0.08; } // 8% contingency buffer
}

/**
 * Luxury / Premium Style
 * 4–5 star resorts & boutique villas, private airport transfers, fine dining & tasting menus, and private excursions.
 */
export class LuxuryStrategy extends TravelStrategy {
    constructor() {
        super(
            'Luxury',
            '5★ luxury resorts & boutique villas, private transfers, gourmet fine dining, and VIP skip-the-line tours.',
            '🥂'
        );
    }

    getFlightMultiplier() { return 1.35; } // Comfort seats, flexible fares, private cabs
    getStayMultiplier() { return 2.25; }   // Luxury resorts, ocean views, suite upgrades
    getFoodMultiplier() { return 2.10; }   // Fine dining, cocktails, tasting menus
    getActivityMultiplier() { return 1.85; } // Private guides, boat charters, premium passes
    getBufferPercent() { return 0.12; }   // 12% buffer for spontaneous luxury
}

/**
 * Factory for Travel Strategies (Factory Pattern)
 */
export class TravelStrategyFactory {
    static #strategies = {
        backpacker: new BackpackerStrategy(),
        moderate: new ModerateStrategy(),
        luxury: new LuxuryStrategy()
    };

    /**
     * @param {string} style - 'backpacker' | 'moderate' | 'luxury'
     * @returns {TravelStrategy}
     */
    static getStrategy(style = 'moderate') {
        const key = (style || 'moderate').toLowerCase();
        return this.#strategies[key] || this.#strategies.moderate;
    }
}

