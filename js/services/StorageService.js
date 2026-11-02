/**
 * StorageService Class - Manages Data Persistence and Sample Data Seeding
 * Demonstrates Service Layer abstraction and OOP Data Mapping
 */
import { Trip } from '../models/Trip.js';
import { Traveler } from '../models/Traveler.js';
import { FlightExpense, HotelExpense, FoodExpense, TransportExpense, ActivitiesExpense, ShoppingExpense } from '../models/ExpenseSubclasses.js';

const STORAGE_KEY = 'aoop_trip_budget_planner_trips';
const ACTIVE_TRIP_KEY = 'aoop_active_trip_id';

export class StorageService {
    /**
     * Loads all trips from localStorage
     * @returns {Trip[]}
     */
    static loadTrips() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const sampleTrips = this.#createSeedData();
                this.saveTrips(sampleTrips);
                this.setActiveTripId(sampleTrips[0].id);
                return sampleTrips;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                const sampleTrips = this.#createSeedData();
                this.saveTrips(sampleTrips);
                this.setActiveTripId(sampleTrips[0].id);
                return sampleTrips;
            }
            return parsed.map(tripData => Trip.fromJSON(tripData));
        } catch (err) {
            console.error('Failed to load trips from storage:', err);
            const sampleTrips = this.#createSeedData();
            return sampleTrips;
        }
    }

    /**
     * Saves trips array to localStorage
     * @param {Trip[]} trips
     */
    static saveTrips(trips) {
        try {
            const serialized = trips.map(t => t.toJSON());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
        } catch (err) {
            console.error('Failed to save trips to storage:', err);
        }
    }

    /**
     * Gets current active trip ID
     * @returns {string|null}
     */
    static getActiveTripId() {
        return localStorage.getItem(ACTIVE_TRIP_KEY) || null;
    }

    /**
     * Sets current active trip ID
     * @param {string} id
     */
    static setActiveTripId(id) {
        if (id) {
            localStorage.setItem(ACTIVE_TRIP_KEY, id);
        } else {
            localStorage.removeItem(ACTIVE_TRIP_KEY);
        }
    }

    /**
     * Seeds initial realistic demo data showcasing all OOP expense subclasses and travelers
     * @returns {Trip[]}
     */
    static #createSeedData() {
        const alex = new Traveler('trv_1', 'Alex Rivera', 'alex@example.com', '#4F46E5');
        const sarah = new Traveler('trv_2', 'Sarah Chen', 'sarah@example.com', '#10B981');
        const david = new Traveler('trv_3', 'David Kim', 'david@example.com', '#F59E0B');
        const priya = new Traveler('trv_4', 'Priya Patel', 'priya@example.com', '#EC4899');

        const trip1 = new Trip({
            id: 'trip_demo_1',
            name: 'Goa Coastal Getaway',
            destination: 'Goa, India',
            startDate: '2026-11-10',
            endDate: '2026-11-16',
            totalBudget: 2400,
            travelers: [alex, sarah, david, priya]
        });

        // 1. Flight Expense (Ticket + Baggage + Airport Tax)
        trip1.addExpense(new FlightExpense({
            id: 'exp_1',
            title: 'Roundtrip Flight Tickets',
            baseAmount: 650,
            baggageFee: 60,
            airportTax: 40,
            date: '2026-11-10',
            paidById: alex.id,
            participantIds: [alex.id, sarah.id, david.id, priya.id],
            notes: 'Group airfare booked via IndiGo'
        }));

        // 2. Hotel Expense (Nights * Base + Service Tax)
        trip1.addExpense(new HotelExpense({
            id: 'exp_2',
            title: 'Beachside Villa Resort',
            baseAmount: 180,
            nights: 4,
            serviceTaxPercent: 12,
            date: '2026-11-11',
            paidById: sarah.id,
            participantIds: [alex.id, sarah.id, david.id, priya.id],
            notes: '4 nights stay with sea view'
        }));

        // 3. Food Expense (Base + Tip + Tax)
        trip1.addExpense(new FoodExpense({
            id: 'exp_3',
            title: 'Seafood Shack Dinner',
            baseAmount: 140,
            tipAmount: 20,
            taxAmount: 15,
            date: '2026-11-12',
            paidById: david.id,
            participantIds: [alex.id, sarah.id, david.id, priya.id],
            notes: 'Candlelight beach dining'
        }));

        // 4. Transport Expense (Base + Tolls + Parking)
        trip1.addExpense(new TransportExpense({
            id: 'exp_4',
            title: 'Car Rental & Fuel',
            baseAmount: 120,
            tollCharges: 15,
            parkingFee: 10,
            date: '2026-11-13',
            paidById: priya.id,
            participantIds: [alex.id, sarah.id, david.id, priya.id],
            notes: 'Self-drive SUV for local sightseeing'
        }));

        // 5. Activity Expense (Base + Equipment/Guide)
        trip1.addExpense(new ActivitiesExpense({
            id: 'exp_5',
            title: 'Scuba Diving & Coral Tour',
            baseAmount: 220,
            equipmentRentalFee: 40,
            date: '2026-11-14',
            paidById: alex.id,
            participantIds: [alex.id, sarah.id, david.id],
            notes: 'Diving gear and guide included'
        }));

        // 6. Shopping Expense (Base + Tax - Discount)
        trip1.addExpense(new ShoppingExpense({
            id: 'exp_6',
            title: 'Flea Market Souvenirs',
            baseAmount: 95,
            salesTax: 5,
            discount: 10,
            date: '2026-11-15',
            paidById: sarah.id,
            participantIds: [sarah.id, priya.id],
            notes: 'Spices, tea, and handmade crafts'
        }));

        return [trip1];
    }

    /**
     * Restores sample data
     */
    static resetToSampleData() {
        const sampleTrips = this.#createSeedData();
        this.saveTrips(sampleTrips);
        this.setActiveTripId(sampleTrips[0].id);
        return sampleTrips;
    }
}
