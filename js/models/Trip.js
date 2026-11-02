/**
 * Trip Class - Demonstrates Composition and Encapsulation
 * A Trip *has-a* list of Traveler objects and *has-a* list of Expense objects.
 */
import { Traveler } from './Traveler.js';
import { ExpenseFactory } from './ExpenseSubclasses.js';

export class Trip {
    // Encapsulated private attributes
    #id;
    #name;
    #destination;
    #startDate;
    #endDate;
    #totalBudget;
    #travelers; // Composition: Trip contains Traveler objects
    #expenses;  // Composition: Trip contains Expense objects

    constructor({
        id = null,
        name,
        destination,
        startDate,
        endDate,
        totalBudget,
        travelers = [],
        expenses = []
    }) {
        this.#validateInputs(name, destination, totalBudget, startDate, endDate);

        this.#id = id || `trip_${Date.now()}`;
        this.#name = name.trim();
        this.#destination = destination.trim();
        this.#startDate = startDate;
        this.#endDate = endDate;
        this.#totalBudget = Number(totalBudget);
        this.#travelers = [];
        this.#expenses = [];

        // Populate travelers
        travelers.forEach(trv => this.addTraveler(trv));

        // Populate expenses
        expenses.forEach(exp => this.addExpense(exp));
    }

    #validateInputs(name, destination, totalBudget, startDate, endDate) {
        if (!name || name.trim() === '') {
            throw new Error('Trip name cannot be empty.');
        }
        if (!destination || destination.trim() === '') {
            throw new Error('Destination cannot be empty.');
        }
        const budget = Number(totalBudget);
        if (isNaN(budget) || budget < 0) {
            throw new Error('Total budget must be a non-negative number.');
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('Start date cannot be after end date.');
        }
    }

    // Getters
    get id() { return this.#id; }
    get name() { return this.#name; }
    get destination() { return this.#destination; }
    get startDate() { return this.#startDate; }
    get endDate() { return this.#endDate; }
    get totalBudget() { return this.#totalBudget; }
    get travelers() { return [...this.#travelers]; }
    get expenses() { return [...this.#expenses]; }

    // Mutators with Validation
    setName(name) {
        if (!name || !name.trim()) throw new Error('Trip name is required.');
        this.#name = name.trim();
    }

    setDestination(destination) {
        if (!destination || !destination.trim()) throw new Error('Destination is required.');
        this.#destination = destination.trim();
    }

    setTotalBudget(amount) {
        const val = Number(amount);
        if (isNaN(val) || val < 0) throw new Error('Budget must be a non-negative number.');
        this.#totalBudget = val;
    }

    setDates(startDate, endDate) {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('Start date cannot be after end date.');
        }
        this.#startDate = startDate;
        this.#endDate = endDate;
    }

    // Composition Methods: Traveler Management
    addTraveler(traveler) {
        const instance = traveler instanceof Traveler ? traveler : Traveler.fromJSON(traveler);
        // Avoid duplicate ID
        const exists = this.#travelers.some(t => t.id === instance.id);
        if (!exists) {
            this.#travelers.push(instance);
        }
        return instance;
    }

    removeTraveler(travelerId) {
        // Prevent removal if traveler has recorded expenses or is tied to splits
        const hasPaidExpenses = this.#expenses.some(e => e.paidById === travelerId);
        if (hasPaidExpenses) {
            throw new Error('Cannot remove traveler who has recorded paid expenses. Reassign or delete expenses first.');
        }
        this.#travelers = this.#travelers.filter(t => t.id !== travelerId);
        
        // Remove traveler from participant lists
        this.#expenses.forEach(exp => {
            const currentParts = exp.participantIds.filter(id => id !== travelerId);
            if (currentParts.length > 0) {
                exp.setParticipantIds(currentParts);
            }
        });
    }

    findTravelerById(id) {
        return this.#travelers.find(t => t.id === id) || null;
    }

    // Composition Methods: Expense Management
    addExpense(expense) {
        const instance = expense.calculateTotalCost ? expense : ExpenseFactory.createExpense(expense);
        this.#expenses.push(instance);
        return instance;
    }

    editExpense(expenseId, updatedData) {
        const index = this.#expenses.findIndex(e => e.id === expenseId);
        if (index === -1) {
            throw new Error(`Expense with ID ${expenseId} not found.`);
        }
        const updatedInstance = ExpenseFactory.createExpense({
            ...updatedData,
            id: expenseId
        });
        this.#expenses[index] = updatedInstance;
        return updatedInstance;
    }

    deleteExpense(expenseId) {
        const initialCount = this.#expenses.length;
        this.#expenses = this.#expenses.filter(e => e.id !== expenseId);
        return this.#expenses.length < initialCount;
    }

    findExpenseById(expenseId) {
        return this.#expenses.find(e => e.id === expenseId) || null;
    }

    /**
     * Polymorphic aggregation: calls calculateTotalCost() on each polymorphic subclass
     */
    getTotalSpent() {
        const total = this.#expenses.reduce((sum, exp) => sum + exp.calculateTotalCost(), 0);
        return Math.round(total * 100) / 100;
    }

    getRemainingBudget() {
        const remaining = this.#totalBudget - this.getTotalSpent();
        return Math.round(remaining * 100) / 100;
    }

    getBudgetUsagePercentage() {
        if (this.#totalBudget <= 0) return this.getTotalSpent() > 0 ? 100 : 0;
        const pct = (this.getTotalSpent() / this.#totalBudget) * 100;
        return Math.round(pct * 10) / 10;
    }

    /**
     * Determine budget warning status:
     * - 'safe' (< 80%)
     * - 'warning' (>= 80% and <= 100%)
     * - 'exceeded' (> 100%)
     */
    getBudgetStatus() {
        const pct = this.getBudgetUsagePercentage();
        if (pct > 100) {
            return {
                level: 'exceeded',
                message: `Budget Exceeded! You are $${Math.abs(this.getRemainingBudget()).toFixed(2)} over budget.`,
                percentage: pct
            };
        } else if (pct >= 80) {
            return {
                level: 'warning',
                message: `Budget Warning: You have used ${pct}% of your total budget.`,
                percentage: pct
            };
        }
        return {
            level: 'safe',
            message: `Budget on track (${pct}% utilized).`,
            percentage: pct
        };
    }

    /**
     * Group expenses by category with totals and percentages
     */
    getCategoryBreakdown() {
        const categories = ['Flight', 'Hotel', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'];
        const breakdown = {};
        
        categories.forEach(cat => {
            breakdown[cat] = {
                category: cat,
                count: 0,
                total: 0,
                percentage: 0
            };
        });

        const grandTotal = this.getTotalSpent();

        this.#expenses.forEach(exp => {
            const cat = exp.category;
            if (!breakdown[cat]) {
                breakdown[cat] = { category: cat, count: 0, total: 0, percentage: 0 };
            }
            breakdown[cat].count += 1;
            breakdown[cat].total += exp.calculateTotalCost();
        });

        Object.keys(breakdown).forEach(key => {
            const item = breakdown[key];
            item.total = Math.round(item.total * 100) / 100;
            item.percentage = grandTotal > 0 ? Math.round((item.total / grandTotal) * 1000) / 10 : 0;
        });

        return breakdown;
    }

    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            destination: this.#destination,
            startDate: this.#startDate,
            endDate: this.#endDate,
            totalBudget: this.#totalBudget,
            travelers: this.#travelers.map(t => t.toJSON()),
            expenses: this.#expenses.map(e => e.toJSON())
        };
    }

    static fromJSON(data) {
        const trip = new Trip({
            id: data.id,
            name: data.name,
            destination: data.destination,
            startDate: data.startDate,
            endDate: data.endDate,
            totalBudget: data.totalBudget,
            travelers: data.travelers || []
        });

        if (Array.isArray(data.expenses)) {
            data.expenses.forEach(expData => {
                const exp = ExpenseFactory.createExpense(expData);
                trip.addExpense(exp);
            });
        }

        return trip;
    }
}
