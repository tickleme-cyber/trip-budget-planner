/**
 * Expense Subclasses - Demonstrates Inheritance & Polymorphism
 * Each subclass extends the base Expense class and overrides calculateTotalCost()
 * and getDetails() to showcase method overriding and polymorphic calculation.
 */
import { Expense } from './Expense.js';

/**
 * FlightExpense
 * Polymorphism: Adds baggage fee and airport tax to base ticket price.
 */
export class FlightExpense extends Expense {
    #baggageFee;
    #airportTax;

    constructor(params) {
        super({ ...params, category: 'Flight' });
        const baggage = Number(params.baggageFee || 0);
        const tax = Number(params.airportTax || 0);
        if (baggage < 0 || tax < 0) {
            throw new Error('Flight baggage and tax fees cannot be negative.');
        }
        this.#baggageFee = baggage;
        this.#airportTax = tax;
    }

    get baggageFee() { return this.#baggageFee; }
    get airportTax() { return this.#airportTax; }

    // Method Overriding (Polymorphism)
    calculateTotalCost() {
        const total = this.baseAmount + this.#baggageFee + this.#airportTax;
        return Math.round(total * 100) / 100;
    }

    getDetails() {
        return {
            type: 'Flight Ticket',
            baseAmount: this.baseAmount,
            baggageFee: this.#baggageFee,
            airportTax: this.#airportTax,
            totalCost: this.calculateTotalCost(),
            extraDetails: `Airfare + Baggage ($${this.#baggageFee}) + Taxes ($${this.#airportTax})`
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'FlightExpense',
            baggageFee: this.#baggageFee,
            airportTax: this.#airportTax
        };
    }
}

/**
 * HotelExpense
 * Polymorphism: Multiplies base rate by number of nights, adds service/city tax percentage.
 */
export class HotelExpense extends Expense {
    #nights;
    #serviceTaxPercent;

    constructor(params) {
        super({ ...params, category: 'Hotel' });
        const nights = Math.max(1, parseInt(params.nights || 1, 10));
        const tax = Number(params.serviceTaxPercent || 0);
        if (tax < 0) {
            throw new Error('Hotel tax percentage cannot be negative.');
        }
        this.#nights = nights;
        this.#serviceTaxPercent = tax;
    }

    get nights() { return this.#nights; }
    get serviceTaxPercent() { return this.#serviceTaxPercent; }

    // Method Overriding (Polymorphism)
    calculateTotalCost() {
        const roomTotal = this.baseAmount * this.#nights;
        const taxAmount = roomTotal * (this.#serviceTaxPercent / 100);
        const total = roomTotal + taxAmount;
        return Math.round(total * 100) / 100;
    }

    getDetails() {
        return {
            type: 'Hotel Accommodation',
            baseAmount: this.baseAmount,
            nights: this.#nights,
            serviceTaxPercent: this.#serviceTaxPercent,
            totalCost: this.calculateTotalCost(),
            extraDetails: `${this.#nights} night(s) @ $${this.baseAmount}/night (+${this.#serviceTaxPercent}% tax)`
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'HotelExpense',
            nights: this.#nights,
            serviceTaxPercent: this.#serviceTaxPercent
        };
    }
}

/**
 * FoodExpense
 * Polymorphism: Base food bill + tip amount + tax amount.
 */
export class FoodExpense extends Expense {
    #tipAmount;
    #taxAmount;

    constructor(params) {
        super({ ...params, category: 'Food' });
        const tip = Number(params.tipAmount || 0);
        const tax = Number(params.taxAmount || 0);
        if (tip < 0 || tax < 0) {
            throw new Error('Food tips and taxes cannot be negative.');
        }
        this.#tipAmount = tip;
        this.#taxAmount = tax;
    }

    get tipAmount() { return this.#tipAmount; }
    get taxAmount() { return this.#taxAmount; }

    // Method Overriding (Polymorphism)
    calculateTotalCost() {
        const total = this.baseAmount + this.#tipAmount + this.#taxAmount;
        return Math.round(total * 100) / 100;
    }

    getDetails() {
        return {
            type: 'Food & Dining',
            baseAmount: this.baseAmount,
            tipAmount: this.#tipAmount,
            taxAmount: this.#taxAmount,
            totalCost: this.calculateTotalCost(),
            extraDetails: `Meal ($${this.baseAmount}) + Tip ($${this.#tipAmount}) + Tax ($${this.#taxAmount})`
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'FoodExpense',
            tipAmount: this.#tipAmount,
            taxAmount: this.#taxAmount
        };
    }
}

/**
 * TransportExpense
 * Polymorphism: Base fare + toll charges + parking/surcharge.
 */
export class TransportExpense extends Expense {
    #tollCharges;
    #parkingFee;

    constructor(params) {
        super({ ...params, category: 'Transport' });
        const toll = Number(params.tollCharges || 0);
        const parking = Number(params.parkingFee || 0);
        if (toll < 0 || parking < 0) {
            throw new Error('Transport toll/parking charges cannot be negative.');
        }
        this.#tollCharges = toll;
        this.#parkingFee = parking;
    }

    get tollCharges() { return this.#tollCharges; }
    get parkingFee() { return this.#parkingFee; }

    // Method Overriding (Polymorphism)
    calculateTotalCost() {
        const total = this.baseAmount + this.#tollCharges + this.#parkingFee;
        return Math.round(total * 100) / 100;
    }

    getDetails() {
        return {
            type: 'Local Transport',
            baseAmount: this.baseAmount,
            tollCharges: this.#tollCharges,
            parkingFee: this.#parkingFee,
            totalCost: this.calculateTotalCost(),
            extraDetails: `Transit Fare + Tolls ($${this.#tollCharges}) + Parking ($${this.#parkingFee})`
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'TransportExpense',
            tollCharges: this.#tollCharges,
            parkingFee: this.#parkingFee
        };
    }
}

/**
 * ActivitiesExpense
 * Polymorphism: Entry ticket + equipment / guide fee.
 */
export class ActivitiesExpense extends Expense {
    #equipmentRentalFee;

    constructor(params) {
        super({ ...params, category: 'Activities' });
        const rental = Number(params.equipmentRentalFee || 0);
        if (rental < 0) {
            throw new Error('Equipment fee cannot be negative.');
        }
        this.#equipmentRentalFee = rental;
    }

    get equipmentRentalFee() { return this.#equipmentRentalFee; }

    calculateTotalCost() {
        const total = this.baseAmount + this.#equipmentRentalFee;
        return Math.round(total * 100) / 100;
    }

    getDetails() {
        return {
            type: 'Activity / Excursion',
            baseAmount: this.baseAmount,
            equipmentRentalFee: this.#equipmentRentalFee,
            totalCost: this.calculateTotalCost(),
            extraDetails: `Ticket + Rental / Guide ($${this.#equipmentRentalFee})`
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'ActivitiesExpense',
            equipmentRentalFee: this.#equipmentRentalFee
        };
    }
}

/**
 * ShoppingExpense
 * Polymorphism: Base retail + sales tax - discount.
 */
export class ShoppingExpense extends Expense {
    #salesTax;
    #discount;

    constructor(params) {
        super({ ...params, category: 'Shopping' });
        const tax = Number(params.salesTax || 0);
        const discount = Number(params.discount || 0);
        if (tax < 0 || discount < 0) {
            throw new Error('Shopping tax and discount cannot be negative.');
        }
        this.#salesTax = tax;
        this.#discount = discount;
    }

    get salesTax() { return this.#salesTax; }
    get discount() { return this.#discount; }

    calculateTotalCost() {
        const total = Math.max(0, this.baseAmount + this.#salesTax - this.#discount);
        return Math.round(total * 100) / 100;
    }

    getDetails() {
        return {
            type: 'Shopping',
            baseAmount: this.baseAmount,
            salesTax: this.#salesTax,
            discount: this.#discount,
            totalCost: this.calculateTotalCost(),
            extraDetails: `Items ($${this.baseAmount}) + Tax ($${this.#salesTax}) - Discount ($${this.#discount})`
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'ShoppingExpense',
            salesTax: this.#salesTax,
            discount: this.#discount
        };
    }
}

/**
 * OtherExpense
 * Generic category expense
 */
export class OtherExpense extends Expense {
    constructor(params) {
        super({ ...params, category: 'Other' });
    }

    calculateTotalCost() {
        return super.calculateTotalCost();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            type: 'OtherExpense'
        };
    }
}

/**
 * ExpenseFactory - Factory pattern to demonstrate OOP Object Instantiation
 */
export class ExpenseFactory {
    static createExpense(data) {
        const cat = (data.category || '').toLowerCase();
        switch (cat) {
            case 'flight':
                return new FlightExpense(data);
            case 'hotel':
                return new HotelExpense(data);
            case 'food':
                return new FoodExpense(data);
            case 'transport':
                return new TransportExpense(data);
            case 'activities':
                return new ActivitiesExpense(data);
            case 'shopping':
                return new ShoppingExpense(data);
            default:
                return new OtherExpense(data);
        }
    }
}
