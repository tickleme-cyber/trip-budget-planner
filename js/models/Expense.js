/**
 * Expense Base Class - Demonstrates Encapsulation & Polymorphic Base
 * Serves as the base class for specialized trip expense types.
 */
export class Expense {
    // Encapsulated private fields
    #id;
    #title;
    #baseAmount;
    #date;
    #category;
    #paidById;
    #participantIds;
    #notes;

    /**
     * @param {Object} params
     * @param {string} params.id
     * @param {string} params.title
     * @param {number} params.baseAmount
     * @param {string} params.date
     * @param {string} params.category
     * @param {string} params.paidById
     * @param {string[]} params.participantIds
     * @param {string} params.notes
     */
    constructor({
        id = null,
        title,
        baseAmount,
        date,
        category = 'Other',
        paidById,
        participantIds = [],
        notes = ''
    }) {
        this.#validateBaseInputs(title, baseAmount, date, paidById);

        this.#id = id || `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        this.#title = title.trim();
        this.#baseAmount = Number(baseAmount);
        this.#date = date;
        this.#category = category;
        this.#paidById = paidById;
        this.#participantIds = Array.isArray(participantIds) && participantIds.length > 0 
            ? [...participantIds] 
            : [paidById];
        this.#notes = (notes || '').trim();
    }

    #validateBaseInputs(title, baseAmount, date, paidById) {
        if (!title || title.trim() === '') {
            throw new Error('Expense title/description is required.');
        }
        const numAmount = Number(baseAmount);
        if (isNaN(numAmount) || numAmount < 0) {
            throw new Error('Expense amount must be a non-negative number.');
        }
        if (!date) {
            throw new Error('Expense date is required.');
        }
        if (!paidById) {
            throw new Error('Payer (who paid) is required.');
        }
    }

    // Encapsulated Getters
    get id() { return this.#id; }
    get title() { return this.#title; }
    get baseAmount() { return this.#baseAmount; }
    get date() { return this.#date; }
    get category() { return this.#category; }
    get paidById() { return this.#paidById; }
    get participantIds() { return [...this.#participantIds]; }
    get notes() { return this.#notes; }

    // Setters / Mutators
    setTitle(title) {
        if (!title || !title.trim()) throw new Error('Title cannot be empty');
        this.#title = title.trim();
    }

    setBaseAmount(amount) {
        const val = Number(amount);
        if (isNaN(val) || val < 0) throw new Error('Amount cannot be negative');
        this.#baseAmount = val;
    }

    setDate(date) {
        if (!date) throw new Error('Date is required');
        this.#date = date;
    }

    setPaidById(payerId) {
        if (!payerId) throw new Error('Payer is required');
        this.#paidById = payerId;
    }

    setParticipantIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('At least one traveler must be involved in the split');
        }
        this.#participantIds = [...ids];
    }

    setNotes(notes) {
        this.#notes = (notes || '').trim();
    }

    /**
     * Polymorphic method to calculate total cost.
     * In the base class, it returns baseAmount.
     * Subclasses (FlightExpense, HotelExpense, FoodExpense, etc.) override this method
     * to add taxes, fees, baggage, tips, or night multiplications.
     * @returns {number}
     */
    calculateTotalCost() {
        return Math.round(this.#baseAmount * 100) / 100;
    }

    /**
     * Polymorphic method returning specific detail breakdown
     * @returns {Object}
     */
    getDetails() {
        return {
            type: 'General Expense',
            baseAmount: this.#baseAmount,
            totalCost: this.calculateTotalCost(),
            extraDetails: this.#notes || 'Standard expense'
        };
    }

    /**
     * Return serialized object
     */
    toJSON() {
        return {
            id: this.#id,
            title: this.#title,
            baseAmount: this.#baseAmount,
            date: this.#date,
            category: this.#category,
            paidById: this.#paidById,
            participantIds: this.#participantIds,
            notes: this.#notes
        };
    }
}
