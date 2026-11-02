(() => {
  // js/models/Traveler.js
  var Traveler = class _Traveler {
    // Private fields (Encapsulation)
    #id;
    #name;
    #email;
    #color;
    /**
     * @param {string} id - Unique identifier
     * @param {string} name - Traveler name
     * @param {string} email - Traveler email / contact
     * @param {string} color - Avatar badge color
     */
    constructor(id, name, email = "", color = "") {
      if (!name || name.trim() === "") {
        throw new Error("Traveler name cannot be empty");
      }
      this.#id = id || `trv_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
      this.#name = name.trim();
      this.#email = (email || "").trim();
      this.#color = color || this.#generateColor(this.#name);
    }
    // Getters for encapsulated properties
    get id() {
      return this.#id;
    }
    get name() {
      return this.#name;
    }
    get email() {
      return this.#email;
    }
    get color() {
      return this.#color;
    }
    // Setters with validation
    setName(newName) {
      if (!newName || newName.trim() === "") {
        throw new Error("Traveler name cannot be empty");
      }
      this.#name = newName.trim();
    }
    setEmail(newEmail) {
      this.#email = (newEmail || "").trim();
    }
    getInitials() {
      return this.#name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "TR";
    }
    #generateColor(seed) {
      const palette = [
        "#4F46E5",
        "#06B6D4",
        "#10B981",
        "#F59E0B",
        "#EC4899",
        "#8B5CF6",
        "#14B8A6",
        "#F43F5E"
      ];
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % palette.length;
      return palette[index];
    }
    toJSON() {
      return {
        id: this.#id,
        name: this.#name,
        email: this.#email,
        color: this.#color
      };
    }
    static fromJSON(data) {
      return new _Traveler(data.id, data.name, data.email, data.color);
    }
  };

  // js/models/Expense.js
  var Expense = class {
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
      category = "Other",
      paidById,
      participantIds = [],
      notes = ""
    }) {
      this.#validateBaseInputs(title, baseAmount, date, paidById);
      this.#id = id || `exp_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
      this.#title = title.trim();
      this.#baseAmount = Number(baseAmount);
      this.#date = date;
      this.#category = category;
      this.#paidById = paidById;
      this.#participantIds = Array.isArray(participantIds) && participantIds.length > 0 ? [...participantIds] : [paidById];
      this.#notes = (notes || "").trim();
    }
    #validateBaseInputs(title, baseAmount, date, paidById) {
      if (!title || title.trim() === "") {
        throw new Error("Expense title/description is required.");
      }
      const numAmount = Number(baseAmount);
      if (isNaN(numAmount) || numAmount < 0) {
        throw new Error("Expense amount must be a non-negative number.");
      }
      if (!date) {
        throw new Error("Expense date is required.");
      }
      if (!paidById) {
        throw new Error("Payer (who paid) is required.");
      }
    }
    // Encapsulated Getters
    get id() {
      return this.#id;
    }
    get title() {
      return this.#title;
    }
    get baseAmount() {
      return this.#baseAmount;
    }
    get date() {
      return this.#date;
    }
    get category() {
      return this.#category;
    }
    get paidById() {
      return this.#paidById;
    }
    get participantIds() {
      return [...this.#participantIds];
    }
    get notes() {
      return this.#notes;
    }
    // Setters / Mutators
    setTitle(title) {
      if (!title || !title.trim()) throw new Error("Title cannot be empty");
      this.#title = title.trim();
    }
    setBaseAmount(amount) {
      const val = Number(amount);
      if (isNaN(val) || val < 0) throw new Error("Amount cannot be negative");
      this.#baseAmount = val;
    }
    setDate(date) {
      if (!date) throw new Error("Date is required");
      this.#date = date;
    }
    setPaidById(payerId) {
      if (!payerId) throw new Error("Payer is required");
      this.#paidById = payerId;
    }
    setParticipantIds(ids) {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("At least one traveler must be involved in the split");
      }
      this.#participantIds = [...ids];
    }
    setNotes(notes) {
      this.#notes = (notes || "").trim();
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
        type: "General Expense",
        baseAmount: this.#baseAmount,
        totalCost: this.calculateTotalCost(),
        extraDetails: this.#notes || "Standard expense"
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
  };

  // js/models/ExpenseSubclasses.js
  var FlightExpense = class extends Expense {
    #baggageFee;
    #airportTax;
    constructor(params) {
      super({ ...params, category: "Flight" });
      const baggage = Number(params.baggageFee || 0);
      const tax = Number(params.airportTax || 0);
      if (baggage < 0 || tax < 0) {
        throw new Error("Flight baggage and tax fees cannot be negative.");
      }
      this.#baggageFee = baggage;
      this.#airportTax = tax;
    }
    get baggageFee() {
      return this.#baggageFee;
    }
    get airportTax() {
      return this.#airportTax;
    }
    // Method Overriding (Polymorphism)
    calculateTotalCost() {
      const total = this.baseAmount + this.#baggageFee + this.#airportTax;
      return Math.round(total * 100) / 100;
    }
    getDetails() {
      return {
        type: "Flight Ticket",
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
        type: "FlightExpense",
        baggageFee: this.#baggageFee,
        airportTax: this.#airportTax
      };
    }
  };
  var HotelExpense = class extends Expense {
    #nights;
    #serviceTaxPercent;
    constructor(params) {
      super({ ...params, category: "Hotel" });
      const nights = Math.max(1, parseInt(params.nights || 1, 10));
      const tax = Number(params.serviceTaxPercent || 0);
      if (tax < 0) {
        throw new Error("Hotel tax percentage cannot be negative.");
      }
      this.#nights = nights;
      this.#serviceTaxPercent = tax;
    }
    get nights() {
      return this.#nights;
    }
    get serviceTaxPercent() {
      return this.#serviceTaxPercent;
    }
    // Method Overriding (Polymorphism)
    calculateTotalCost() {
      const roomTotal = this.baseAmount * this.#nights;
      const taxAmount = roomTotal * (this.#serviceTaxPercent / 100);
      const total = roomTotal + taxAmount;
      return Math.round(total * 100) / 100;
    }
    getDetails() {
      return {
        type: "Hotel Accommodation",
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
        type: "HotelExpense",
        nights: this.#nights,
        serviceTaxPercent: this.#serviceTaxPercent
      };
    }
  };
  var FoodExpense = class extends Expense {
    #tipAmount;
    #taxAmount;
    constructor(params) {
      super({ ...params, category: "Food" });
      const tip = Number(params.tipAmount || 0);
      const tax = Number(params.taxAmount || 0);
      if (tip < 0 || tax < 0) {
        throw new Error("Food tips and taxes cannot be negative.");
      }
      this.#tipAmount = tip;
      this.#taxAmount = tax;
    }
    get tipAmount() {
      return this.#tipAmount;
    }
    get taxAmount() {
      return this.#taxAmount;
    }
    // Method Overriding (Polymorphism)
    calculateTotalCost() {
      const total = this.baseAmount + this.#tipAmount + this.#taxAmount;
      return Math.round(total * 100) / 100;
    }
    getDetails() {
      return {
        type: "Food & Dining",
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
        type: "FoodExpense",
        tipAmount: this.#tipAmount,
        taxAmount: this.#taxAmount
      };
    }
  };
  var TransportExpense = class extends Expense {
    #tollCharges;
    #parkingFee;
    constructor(params) {
      super({ ...params, category: "Transport" });
      const toll = Number(params.tollCharges || 0);
      const parking = Number(params.parkingFee || 0);
      if (toll < 0 || parking < 0) {
        throw new Error("Transport toll/parking charges cannot be negative.");
      }
      this.#tollCharges = toll;
      this.#parkingFee = parking;
    }
    get tollCharges() {
      return this.#tollCharges;
    }
    get parkingFee() {
      return this.#parkingFee;
    }
    // Method Overriding (Polymorphism)
    calculateTotalCost() {
      const total = this.baseAmount + this.#tollCharges + this.#parkingFee;
      return Math.round(total * 100) / 100;
    }
    getDetails() {
      return {
        type: "Local Transport",
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
        type: "TransportExpense",
        tollCharges: this.#tollCharges,
        parkingFee: this.#parkingFee
      };
    }
  };
  var ActivitiesExpense = class extends Expense {
    #equipmentRentalFee;
    constructor(params) {
      super({ ...params, category: "Activities" });
      const rental = Number(params.equipmentRentalFee || 0);
      if (rental < 0) {
        throw new Error("Equipment fee cannot be negative.");
      }
      this.#equipmentRentalFee = rental;
    }
    get equipmentRentalFee() {
      return this.#equipmentRentalFee;
    }
    calculateTotalCost() {
      const total = this.baseAmount + this.#equipmentRentalFee;
      return Math.round(total * 100) / 100;
    }
    getDetails() {
      return {
        type: "Activity / Excursion",
        baseAmount: this.baseAmount,
        equipmentRentalFee: this.#equipmentRentalFee,
        totalCost: this.calculateTotalCost(),
        extraDetails: `Ticket + Rental / Guide ($${this.#equipmentRentalFee})`
      };
    }
    toJSON() {
      return {
        ...super.toJSON(),
        type: "ActivitiesExpense",
        equipmentRentalFee: this.#equipmentRentalFee
      };
    }
  };
  var ShoppingExpense = class extends Expense {
    #salesTax;
    #discount;
    constructor(params) {
      super({ ...params, category: "Shopping" });
      const tax = Number(params.salesTax || 0);
      const discount = Number(params.discount || 0);
      if (tax < 0 || discount < 0) {
        throw new Error("Shopping tax and discount cannot be negative.");
      }
      this.#salesTax = tax;
      this.#discount = discount;
    }
    get salesTax() {
      return this.#salesTax;
    }
    get discount() {
      return this.#discount;
    }
    calculateTotalCost() {
      const total = Math.max(0, this.baseAmount + this.#salesTax - this.#discount);
      return Math.round(total * 100) / 100;
    }
    getDetails() {
      return {
        type: "Shopping",
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
        type: "ShoppingExpense",
        salesTax: this.#salesTax,
        discount: this.#discount
      };
    }
  };
  var OtherExpense = class extends Expense {
    constructor(params) {
      super({ ...params, category: "Other" });
    }
    calculateTotalCost() {
      return super.calculateTotalCost();
    }
    toJSON() {
      return {
        ...super.toJSON(),
        type: "OtherExpense"
      };
    }
  };
  var ExpenseFactory = class {
    static createExpense(data) {
      const cat = (data.category || "").toLowerCase();
      switch (cat) {
        case "flight":
          return new FlightExpense(data);
        case "hotel":
          return new HotelExpense(data);
        case "food":
          return new FoodExpense(data);
        case "transport":
          return new TransportExpense(data);
        case "activities":
          return new ActivitiesExpense(data);
        case "shopping":
          return new ShoppingExpense(data);
        default:
          return new OtherExpense(data);
      }
    }
  };

  // js/models/Trip.js
  var Trip = class _Trip {
    // Encapsulated private attributes
    #id;
    #name;
    #destination;
    #startDate;
    #endDate;
    #totalBudget;
    #travelers;
    // Composition: Trip contains Traveler objects
    #expenses;
    // Composition: Trip contains Expense objects
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
      travelers.forEach((trv) => this.addTraveler(trv));
      expenses.forEach((exp) => this.addExpense(exp));
    }
    #validateInputs(name, destination, totalBudget, startDate, endDate) {
      if (!name || name.trim() === "") {
        throw new Error("Trip name cannot be empty.");
      }
      if (!destination || destination.trim() === "") {
        throw new Error("Destination cannot be empty.");
      }
      const budget = Number(totalBudget);
      if (isNaN(budget) || budget < 0) {
        throw new Error("Total budget must be a non-negative number.");
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error("Start date cannot be after end date.");
      }
    }
    // Getters
    get id() {
      return this.#id;
    }
    get name() {
      return this.#name;
    }
    get destination() {
      return this.#destination;
    }
    get startDate() {
      return this.#startDate;
    }
    get endDate() {
      return this.#endDate;
    }
    get totalBudget() {
      return this.#totalBudget;
    }
    get travelers() {
      return [...this.#travelers];
    }
    get expenses() {
      return [...this.#expenses];
    }
    // Mutators with Validation
    setName(name) {
      if (!name || !name.trim()) throw new Error("Trip name is required.");
      this.#name = name.trim();
    }
    setDestination(destination) {
      if (!destination || !destination.trim()) throw new Error("Destination is required.");
      this.#destination = destination.trim();
    }
    setTotalBudget(amount) {
      const val = Number(amount);
      if (isNaN(val) || val < 0) throw new Error("Budget must be a non-negative number.");
      this.#totalBudget = val;
    }
    setDates(startDate, endDate) {
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error("Start date cannot be after end date.");
      }
      this.#startDate = startDate;
      this.#endDate = endDate;
    }
    // Composition Methods: Traveler Management
    addTraveler(traveler) {
      const instance = traveler instanceof Traveler ? traveler : Traveler.fromJSON(traveler);
      const exists = this.#travelers.some((t) => t.id === instance.id);
      if (!exists) {
        this.#travelers.push(instance);
      }
      return instance;
    }
    removeTraveler(travelerId) {
      const hasPaidExpenses = this.#expenses.some((e) => e.paidById === travelerId);
      if (hasPaidExpenses) {
        throw new Error("Cannot remove traveler who has recorded paid expenses. Reassign or delete expenses first.");
      }
      this.#travelers = this.#travelers.filter((t) => t.id !== travelerId);
      this.#expenses.forEach((exp) => {
        const currentParts = exp.participantIds.filter((id) => id !== travelerId);
        if (currentParts.length > 0) {
          exp.setParticipantIds(currentParts);
        }
      });
    }
    findTravelerById(id) {
      return this.#travelers.find((t) => t.id === id) || null;
    }
    // Composition Methods: Expense Management
    addExpense(expense) {
      const instance = expense.calculateTotalCost ? expense : ExpenseFactory.createExpense(expense);
      this.#expenses.push(instance);
      return instance;
    }
    editExpense(expenseId, updatedData) {
      const index = this.#expenses.findIndex((e) => e.id === expenseId);
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
      this.#expenses = this.#expenses.filter((e) => e.id !== expenseId);
      return this.#expenses.length < initialCount;
    }
    findExpenseById(expenseId) {
      return this.#expenses.find((e) => e.id === expenseId) || null;
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
      const pct = this.getTotalSpent() / this.#totalBudget * 100;
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
          level: "exceeded",
          message: `Budget Exceeded! You are $${Math.abs(this.getRemainingBudget()).toFixed(2)} over budget.`,
          percentage: pct
        };
      } else if (pct >= 80) {
        return {
          level: "warning",
          message: `Budget Warning: You have used ${pct}% of your total budget.`,
          percentage: pct
        };
      }
      return {
        level: "safe",
        message: `Budget on track (${pct}% utilized).`,
        percentage: pct
      };
    }
    /**
     * Group expenses by category with totals and percentages
     */
    getCategoryBreakdown() {
      const categories = ["Flight", "Hotel", "Food", "Transport", "Activities", "Shopping", "Other"];
      const breakdown = {};
      categories.forEach((cat) => {
        breakdown[cat] = {
          category: cat,
          count: 0,
          total: 0,
          percentage: 0
        };
      });
      const grandTotal = this.getTotalSpent();
      this.#expenses.forEach((exp) => {
        const cat = exp.category;
        if (!breakdown[cat]) {
          breakdown[cat] = { category: cat, count: 0, total: 0, percentage: 0 };
        }
        breakdown[cat].count += 1;
        breakdown[cat].total += exp.calculateTotalCost();
      });
      Object.keys(breakdown).forEach((key) => {
        const item = breakdown[key];
        item.total = Math.round(item.total * 100) / 100;
        item.percentage = grandTotal > 0 ? Math.round(item.total / grandTotal * 1e3) / 10 : 0;
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
        travelers: this.#travelers.map((t) => t.toJSON()),
        expenses: this.#expenses.map((e) => e.toJSON())
      };
    }
    static fromJSON(data) {
      const trip = new _Trip({
        id: data.id,
        name: data.name,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        totalBudget: data.totalBudget,
        travelers: data.travelers || []
      });
      if (Array.isArray(data.expenses)) {
        data.expenses.forEach((expData) => {
          const exp = ExpenseFactory.createExpense(expData);
          trip.addExpense(exp);
        });
      }
      return trip;
    }
  };

  // js/services/ExpenseSplitter.js
  var ExpenseSplitter = class {
    /**
     * Splits a single expense equally among its participants.
     * @param {Expense} expense - Expense object
     * @param {Trip} trip - Trip object containing traveler details
     * @returns {Object} Split summary for the single expense
     */
    static splitSingleExpense(expense, trip) {
      const total = expense.calculateTotalCost();
      const participants = expense.participantIds;
      const payerId = expense.paidById;
      const payer = trip.findTravelerById(payerId);
      if (!participants || participants.length === 0) {
        return {
          expenseTitle: expense.title,
          totalCost: total,
          payerName: payer ? payer.name : "Unknown",
          perPersonCost: 0,
          breakdown: []
        };
      }
      const perPersonCost = Math.round(total / participants.length * 100) / 100;
      const breakdown = participants.map((partId) => {
        const traveler = trip.findTravelerById(partId);
        const isPayer = partId === payerId;
        return {
          travelerId: partId,
          travelerName: traveler ? traveler.name : "Traveler",
          share: perPersonCost,
          isPayer,
          owesToPayer: isPayer ? 0 : perPersonCost
        };
      });
      return {
        expenseId: expense.id,
        expenseTitle: expense.title,
        category: expense.category,
        totalCost: total,
        payerId,
        payerName: payer ? payer.name : "Unknown",
        participantCount: participants.length,
        perPersonCost,
        breakdown
      };
    }
    /**
     * Calculates net balances for all travelers in the trip.
     * Balance = Total Paid - Total Fair Share
     * If Balance > 0 : Traveler is owed money (creditor)
     * If Balance < 0 : Traveler owes money (debtor)
     * @param {Trip} trip
     * @returns {Array<Object>} List of traveler balance summaries
     */
    static calculateTravelerBalances(trip) {
      const travelers = trip.travelers;
      const expenses = trip.expenses;
      const balances = {};
      travelers.forEach((trv) => {
        balances[trv.id] = {
          traveler: trv,
          totalPaid: 0,
          totalShare: 0,
          netBalance: 0
        };
      });
      expenses.forEach((exp) => {
        const total = exp.calculateTotalCost();
        const payerId = exp.paidById;
        const participants = exp.participantIds;
        if (balances[payerId]) {
          balances[payerId].totalPaid += total;
        }
        if (participants && participants.length > 0) {
          const share = total / participants.length;
          participants.forEach((pId) => {
            if (balances[pId]) {
              balances[pId].totalShare += share;
            }
          });
        }
      });
      return Object.values(balances).map((record) => {
        const paid = Math.round(record.totalPaid * 100) / 100;
        const share = Math.round(record.totalShare * 100) / 100;
        const net = Math.round((paid - share) * 100) / 100;
        return {
          travelerId: record.traveler.id,
          name: record.traveler.name,
          email: record.traveler.email,
          color: record.traveler.color,
          totalPaid: paid,
          totalShare: share,
          netBalance: net,
          status: net > 0.01 ? "gets_back" : net < -0.01 ? "owes" : "settled"
        };
      });
    }
    /**
     * Computes the simplified "Who Owes Whom" settlement transactions
     * Uses the Greedy Debt Simplification Algorithm.
     * Minimizes the number of transactions needed to settle all trip debts.
     * @param {Trip} trip
     * @returns {Array<Object>} List of settlements { from, to, amount }
     */
    static calculateWhoOwesWhom(trip) {
      const balances = this.calculateTravelerBalances(trip);
      const creditors = [];
      const debtors = [];
      balances.forEach((b) => {
        if (b.netBalance > 0.01) {
          creditors.push({ ...b, balance: b.netBalance });
        } else if (b.netBalance < -0.01) {
          debtors.push({ ...b, balance: Math.abs(b.netBalance) });
        }
      });
      creditors.sort((a, b) => b.balance - a.balance);
      debtors.sort((a, b) => b.balance - a.balance);
      const settlements = [];
      let cIdx = 0;
      let dIdx = 0;
      while (cIdx < creditors.length && dIdx < debtors.length) {
        const creditor = creditors[cIdx];
        const debtor = debtors[dIdx];
        const amount = Math.min(creditor.balance, debtor.balance);
        const roundedAmount = Math.round(amount * 100) / 100;
        if (roundedAmount > 0) {
          settlements.push({
            fromId: debtor.travelerId,
            fromName: debtor.name,
            fromColor: debtor.color,
            toId: creditor.travelerId,
            toName: creditor.name,
            toColor: creditor.color,
            amount: roundedAmount,
            description: `${debtor.name} pays ${creditor.name} $${roundedAmount.toFixed(2)}`
          });
        }
        creditor.balance -= amount;
        debtor.balance -= amount;
        if (creditor.balance <= 0.01) {
          cIdx++;
        }
        if (debtor.balance <= 0.01) {
          dIdx++;
        }
      }
      return settlements;
    }
  };

  // js/services/StorageService.js
  var STORAGE_KEY = "aoop_trip_budget_planner_trips";
  var ACTIVE_TRIP_KEY = "aoop_active_trip_id";
  var StorageService = class {
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
        return parsed.map((tripData) => Trip.fromJSON(tripData));
      } catch (err) {
        console.error("Failed to load trips from storage:", err);
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
        const serialized = trips.map((t) => t.toJSON());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      } catch (err) {
        console.error("Failed to save trips to storage:", err);
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
      const alex = new Traveler("trv_1", "Alex Rivera", "alex@example.com", "#4F46E5");
      const sarah = new Traveler("trv_2", "Sarah Chen", "sarah@example.com", "#10B981");
      const david = new Traveler("trv_3", "David Kim", "david@example.com", "#F59E0B");
      const priya = new Traveler("trv_4", "Priya Patel", "priya@example.com", "#EC4899");
      const trip1 = new Trip({
        id: "trip_demo_1",
        name: "Goa Coastal Getaway",
        destination: "Goa, India",
        startDate: "2026-11-10",
        endDate: "2026-11-16",
        totalBudget: 2400,
        travelers: [alex, sarah, david, priya]
      });
      trip1.addExpense(new FlightExpense({
        id: "exp_1",
        title: "Roundtrip Flight Tickets",
        baseAmount: 650,
        baggageFee: 60,
        airportTax: 40,
        date: "2026-11-10",
        paidById: alex.id,
        participantIds: [alex.id, sarah.id, david.id, priya.id],
        notes: "Group airfare booked via IndiGo"
      }));
      trip1.addExpense(new HotelExpense({
        id: "exp_2",
        title: "Beachside Villa Resort",
        baseAmount: 180,
        nights: 4,
        serviceTaxPercent: 12,
        date: "2026-11-11",
        paidById: sarah.id,
        participantIds: [alex.id, sarah.id, david.id, priya.id],
        notes: "4 nights stay with sea view"
      }));
      trip1.addExpense(new FoodExpense({
        id: "exp_3",
        title: "Seafood Shack Dinner",
        baseAmount: 140,
        tipAmount: 20,
        taxAmount: 15,
        date: "2026-11-12",
        paidById: david.id,
        participantIds: [alex.id, sarah.id, david.id, priya.id],
        notes: "Candlelight beach dining"
      }));
      trip1.addExpense(new TransportExpense({
        id: "exp_4",
        title: "Car Rental & Fuel",
        baseAmount: 120,
        tollCharges: 15,
        parkingFee: 10,
        date: "2026-11-13",
        paidById: priya.id,
        participantIds: [alex.id, sarah.id, david.id, priya.id],
        notes: "Self-drive SUV for local sightseeing"
      }));
      trip1.addExpense(new ActivitiesExpense({
        id: "exp_5",
        title: "Scuba Diving & Coral Tour",
        baseAmount: 220,
        equipmentRentalFee: 40,
        date: "2026-11-14",
        paidById: alex.id,
        participantIds: [alex.id, sarah.id, david.id],
        notes: "Diving gear and guide included"
      }));
      trip1.addExpense(new ShoppingExpense({
        id: "exp_6",
        title: "Flea Market Souvenirs",
        baseAmount: 95,
        salesTax: 5,
        discount: 10,
        date: "2026-11-15",
        paidById: sarah.id,
        participantIds: [sarah.id, priya.id],
        notes: "Spices, tea, and handmade crafts"
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
  };

  // js/models/TravelStrategy.js
  var TravelStrategy = class _TravelStrategy {
    #name;
    #description;
    #icon;
    constructor(name, description, icon) {
      if (new.target === _TravelStrategy) {
        throw new Error("Abstract class TravelStrategy cannot be instantiated directly.");
      }
      this.#name = name;
      this.#description = description;
      this.#icon = icon;
    }
    get name() {
      return this.#name;
    }
    get description() {
      return this.#description;
    }
    get icon() {
      return this.#icon;
    }
    getFlightMultiplier() {
      return 1;
    }
    getStayMultiplier() {
      return 1;
    }
    getFoodMultiplier() {
      return 1;
    }
    getActivityMultiplier() {
      return 1;
    }
    getBufferPercent() {
      return 0.05;
    }
  };
  var BackpackerStrategy = class extends TravelStrategy {
    constructor() {
      super(
        "Backpacker",
        "Budget hostels & guesthouses, public transport, authentic street dining, and self-guided exploration.",
        "\u{1F392}"
      );
    }
    getFlightMultiplier() {
      return 0.82;
    }
    // Advance booking, budget carriers, trains
    getStayMultiplier() {
      return 0.48;
    }
    // Hostels, shared dorms, budget homestays
    getFoodMultiplier() {
      return 0.52;
    }
    // Local markets, street food, budget cafes
    getActivityMultiplier() {
      return 0.55;
    }
    // Free sights, public beaches, DIY walking tours
    getBufferPercent() {
      return 0.05;
    }
    // 5% emergency buffer
  };
  var ModerateStrategy = class extends TravelStrategy {
    constructor() {
      super(
        "Moderate",
        "Comfortable 3\u20134\u2605 hotels, mixed transport, casual & nice dining, and all top ticketed attractions.",
        "\u{1F9F3}"
      );
    }
    getFlightMultiplier() {
      return 1;
    }
    getStayMultiplier() {
      return 1;
    }
    getFoodMultiplier() {
      return 1;
    }
    getActivityMultiplier() {
      return 1;
    }
    getBufferPercent() {
      return 0.08;
    }
    // 8% contingency buffer
  };
  var LuxuryStrategy = class extends TravelStrategy {
    constructor() {
      super(
        "Luxury",
        "5\u2605 luxury resorts & boutique villas, private transfers, gourmet fine dining, and VIP skip-the-line tours.",
        "\u{1F942}"
      );
    }
    getFlightMultiplier() {
      return 1.35;
    }
    // Comfort seats, flexible fares, private cabs
    getStayMultiplier() {
      return 2.25;
    }
    // Luxury resorts, ocean views, suite upgrades
    getFoodMultiplier() {
      return 2.1;
    }
    // Fine dining, cocktails, tasting menus
    getActivityMultiplier() {
      return 1.85;
    }
    // Private guides, boat charters, premium passes
    getBufferPercent() {
      return 0.12;
    }
    // 12% buffer for spontaneous luxury
  };
  var TravelStrategyFactory = class {
    static #strategies = {
      backpacker: new BackpackerStrategy(),
      moderate: new ModerateStrategy(),
      luxury: new LuxuryStrategy()
    };
    /**
     * @param {string} style - 'backpacker' | 'moderate' | 'luxury'
     * @returns {TravelStrategy}
     */
    static getStrategy(style = "moderate") {
      const key = (style || "moderate").toLowerCase();
      return this.#strategies[key] || this.#strategies.moderate;
    }
  };

  // js/models/Destination.js
  var Destination = class {
    #id;
    #name;
    #country;
    #region;
    #tagline;
    #description;
    #vibes;
    #baseFlightCost;
    // Baseline roundtrip travel / flight cost per person in USD
    #dailyStayCost;
    // Standard hotel room per night in USD (assumes 2 persons per room)
    #dailyFoodCost;
    // Food, drinks & dining per person per day in USD
    #dailyActivityCost;
    // Sightseeing, tickets & experiences per person per day in USD
    #idealDaysMin;
    #idealDaysMax;
    #bestSeason;
    #highlights;
    #rating;
    #imageUrl;
    #tier;
    // 'Budget' | 'Moderate' | 'Luxury'
    constructor({
      id,
      name,
      country,
      region,
      tagline = "",
      description = "",
      vibes = [],
      baseFlightCost = 150,
      dailyStayCost = 60,
      dailyFoodCost = 30,
      dailyActivityCost = 20,
      idealDaysMin = 3,
      idealDaysMax = 7,
      bestSeason = "Year-round",
      highlights = [],
      rating = 4.8,
      imageUrl = "",
      tier = "Moderate"
    }) {
      if (!name || name.trim() === "") {
        throw new Error("Destination name cannot be empty.");
      }
      if (!country || country.trim() === "") {
        throw new Error("Country cannot be empty.");
      }
      this.#id = id || `dest_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
      this.#name = name.trim();
      this.#country = country.trim();
      this.#region = region || "Global";
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
      this.#imageUrl = imageUrl || "";
      this.#tier = tier;
    }
    // Encapsulated Getters
    get id() {
      return this.#id;
    }
    get name() {
      return this.#name;
    }
    get country() {
      return this.#country;
    }
    get region() {
      return this.#region;
    }
    get tagline() {
      return this.#tagline;
    }
    get description() {
      return this.#description;
    }
    get vibes() {
      return [...this.#vibes];
    }
    get baseFlightCost() {
      return this.#baseFlightCost;
    }
    get dailyStayCost() {
      return this.#dailyStayCost;
    }
    get dailyFoodCost() {
      return this.#dailyFoodCost;
    }
    get dailyActivityCost() {
      return this.#dailyActivityCost;
    }
    get idealDaysMin() {
      return this.#idealDaysMin;
    }
    get idealDaysMax() {
      return this.#idealDaysMax;
    }
    get bestSeason() {
      return this.#bestSeason;
    }
    get highlights() {
      return [...this.#highlights];
    }
    get rating() {
      return this.#rating;
    }
    get imageUrl() {
      return this.#imageUrl;
    }
    get tier() {
      return this.#tier;
    }
    /**
     * Polymorphic cost calculation based on number of travelers, duration, and chosen TravelStrategy.
     * @param {number} travelers - Number of people traveling
     * @param {number} days - Duration in days
     * @param {string|TravelStrategy} styleOrStrategy - Strategy instance or key ('backpacker' | 'moderate' | 'luxury')
     * @returns {Object} Detailed cost breakdown
     */
    calculateEstimatedCost(travelers = 1, days = 5, styleOrStrategy = "moderate") {
      const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
      const numDays = Math.max(1, parseInt(days, 10) || 1);
      const nights = Math.max(1, numDays - 1);
      const rooms = Math.ceil(numTravelers / 2);
      const strategy = typeof styleOrStrategy === "object" && styleOrStrategy !== null ? styleOrStrategy : TravelStrategyFactory.getStrategy(styleOrStrategy);
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
      if (!requestedVibe || requestedVibe.toLowerCase() === "all") return true;
      const target = requestedVibe.toLowerCase();
      return this.#vibes.some((v) => v.toLowerCase().includes(target) || target.includes(v.toLowerCase()));
    }
    /**
     * Checks if this destination matches a requested region.
     * @param {string} requestedRegion
     * @returns {boolean}
     */
    matchesRegion(requestedRegion) {
      if (!requestedRegion || requestedRegion.toLowerCase() === "all") return true;
      const target = requestedRegion.toLowerCase();
      return this.#region.toLowerCase().includes(target) || this.#country.toLowerCase().includes(target);
    }
  };

  // js/services/RecommendationEngine.js
  var RecommendationEngine = class {
    #destinations = [];
    constructor() {
      this.#initCatalog();
    }
    /**
     * Initializes a rich, diverse destination database.
     */
    #initCatalog() {
      const rawCatalog = [
        // ── DOMESTIC / INDIA GEMS (Low to Mid Budget) ─────────────────────────
        {
          id: "dest_goa",
          name: "Goa",
          country: "India",
          region: "Domestic / India",
          tagline: "Sun, sand, coastal spice, and Portuguese colonial charm",
          description: "Relax on golden beaches, explore 17th-century Latin quarters, enjoy lively beach shacks and vibrant night markets.",
          vibes: ["Beach", "Nightlife", "Foodie", "Culture"],
          baseFlightCost: 80,
          dailyStayCost: 45,
          dailyFoodCost: 20,
          dailyActivityCost: 15,
          idealDaysMin: 3,
          idealDaysMax: 6,
          bestSeason: "Nov \u2013 Mar",
          highlights: ["Anjuna & Palolem Beaches", "Fontainhas Latin Quarter", "Dudhsagar Waterfalls"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_manali",
          name: "Manali & Solang Valley",
          country: "India",
          region: "Domestic / India",
          tagline: "Snow-capped Himalayan peaks, pine forests, and alpine adventure",
          description: "Breathtaking mountain passes, paragliding over Solang, serene apple orchards, and cozy river-side cafes.",
          vibes: ["Mountain", "Adventure", "Nature", "Relaxation"],
          baseFlightCost: 90,
          dailyStayCost: 40,
          dailyFoodCost: 18,
          dailyActivityCost: 25,
          idealDaysMin: 4,
          idealDaysMax: 7,
          bestSeason: "Oct \u2013 Jun",
          highlights: ["Atal Tunnel & Rohtang Pass", "Solang Valley Paragliding", "Old Manali Cafes"],
          rating: 4.7,
          imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_jaipur",
          name: "Jaipur & Udaipur",
          country: "India",
          region: "Domestic / India",
          tagline: "The Pink City and Lake City royal heritage odyssey",
          description: "Magnificent amber sandstone forts, gleaming lake palaces, vibrant textiles, and rich Rajasthani royal culinary feasts.",
          vibes: ["Heritage", "Culture", "Foodie"],
          baseFlightCost: 75,
          dailyStayCost: 50,
          dailyFoodCost: 22,
          dailyActivityCost: 18,
          idealDaysMin: 4,
          idealDaysMax: 7,
          bestSeason: "Oct \u2013 Mar",
          highlights: ["Amber Fort & Hawa Mahal", "Lake Pichola Boat Cruise", "City Palace Udaipur"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_kerala",
          name: "Kerala (Munnar & Alleppey)",
          country: "India",
          region: "Domestic / India",
          tagline: "God's Own Country: emerald tea hills & tranquil backwaters",
          description: "Cruise emerald backwaters in a traditional houseboat, breathe mist over manicured tea estates, and savor authentic Ayurvedic hospitality.",
          vibes: ["Nature", "Relaxation", "Wellness", "Culture"],
          baseFlightCost: 85,
          dailyStayCost: 55,
          dailyFoodCost: 20,
          dailyActivityCost: 15,
          idealDaysMin: 4,
          idealDaysMax: 8,
          bestSeason: "Sep \u2013 Mar",
          highlights: ["Alleppey Houseboat Stay", "Munnar Tea Plantations", "Kathakali Dance & Ayurveda"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_rishikesh",
          name: "Rishikesh & Haridwar",
          country: "India",
          region: "Domestic / India",
          tagline: "White water rapids, yoga sanctuaries, and evening Ganga Aarti",
          description: "Raft the thrilling rapids of the Ganges, practice yoga by sacred riverbanks, and hear chiming temple bells at sunset.",
          vibes: ["Adventure", "Wellness", "Mountain", "Culture"],
          baseFlightCost: 65,
          dailyStayCost: 35,
          dailyFoodCost: 16,
          dailyActivityCost: 22,
          idealDaysMin: 3,
          idealDaysMax: 5,
          bestSeason: "Sep \u2013 May",
          highlights: ["Ganges River Rafting Grade III/IV", "Triveni Ghat Evening Aarti", "Beatles Ashram"],
          rating: 4.7,
          imageUrl: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_pondicherry",
          name: "Pondicherry",
          country: "India",
          region: "Domestic / India",
          tagline: "French colonial boulevards, pastel villas, and serene promenades",
          description: "Stroll cobblestone French Quarters with bright bougainvillea, sip espresso in chic bakeries, and discover Auroville's peaceful vibe.",
          vibes: ["Beach", "Culture", "Relaxation", "Foodie"],
          baseFlightCost: 70,
          dailyStayCost: 40,
          dailyFoodCost: 20,
          dailyActivityCost: 12,
          idealDaysMin: 2,
          idealDaysMax: 4,
          bestSeason: "Oct \u2013 Mar",
          highlights: ["White Town French Quarter", "Rock Beach Promenade", "Auroville Matrimandir"],
          rating: 4.6,
          imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_ladakh",
          name: "Ladakh & Leh",
          country: "India",
          region: "Domestic / India",
          tagline: "Land of High Mountain Passes, azure lakes, and ancient gompas",
          description: "Cross the world\u2019s highest motorable passes, marvel at the shifting blues of Pangong Tso, and experience Tibetan Buddhist culture.",
          vibes: ["Mountain", "Adventure", "Nature"],
          baseFlightCost: 160,
          dailyStayCost: 55,
          dailyFoodCost: 24,
          dailyActivityCost: 30,
          idealDaysMin: 6,
          idealDaysMax: 10,
          bestSeason: "May \u2013 Sep",
          highlights: ["Pangong Tso & Nubra Valley", "Khardung La Pass", "Thiksey & Hemis Monasteries"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        // ── SOUTHEAST ASIA & BUDGET INTERNATIONAL ($600 – $1,500) ──────────────
        {
          id: "dest_bali",
          name: "Bali & Nusa Penida",
          country: "Indonesia",
          region: "Southeast Asia",
          tagline: "Island of the Gods: emerald rice terraces, surf breaks & sunset temples",
          description: "Tropical paradise blending lush jungle swings, cliffside Hindu temples, turquoise surf breaks, and vibrant beach clubs.",
          vibes: ["Beach", "Wellness", "Culture", "Nightlife", "Adventure"],
          baseFlightCost: 320,
          dailyStayCost: 65,
          dailyFoodCost: 25,
          dailyActivityCost: 25,
          idealDaysMin: 5,
          idealDaysMax: 9,
          bestSeason: "Apr \u2013 Oct",
          highlights: ["Ubud Monkey Forest & Rice Terraces", "Nusa Penida Kelingking Beach", "Uluwatu Sunset Temple & Kecak Dance"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_phuket",
          name: "Phuket & Krabi",
          country: "Thailand",
          region: "Southeast Asia",
          tagline: "Limestone karsts rising from turquoise Andaman waters",
          description: "Island hop via longtail boat through Maya Bay, kayak towering limestone sea caves, and enjoy spicy street pad thai.",
          vibes: ["Beach", "Nightlife", "Adventure", "Foodie"],
          baseFlightCost: 280,
          dailyStayCost: 60,
          dailyFoodCost: 22,
          dailyActivityCost: 30,
          idealDaysMin: 5,
          idealDaysMax: 8,
          bestSeason: "Nov \u2013 Apr",
          highlights: ["Phi Phi Islands & Maya Bay", "Railay Beach Rock Climbing", "Old Phuket Town Night Market"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_vietnam",
          name: "Hanoi & Ha Long Bay",
          country: "Vietnam",
          region: "Southeast Asia",
          tagline: "UNESCO limestone karst wonderland & legendary street cuisine",
          description: "Cruise emerald waters amongst thousands of limestone peaks, sip egg coffee in historic alleys, and savor steaming bowls of pho.",
          vibes: ["Culture", "Nature", "Foodie", "Adventure"],
          baseFlightCost: 260,
          dailyStayCost: 45,
          dailyFoodCost: 18,
          dailyActivityCost: 25,
          idealDaysMin: 5,
          idealDaysMax: 8,
          bestSeason: "Oct \u2013 Apr",
          highlights: ["Overnight Ha Long Bay Cruise", "Hanoi Old Quarter & Beer Street", "Trang An River Caves Ninh Binh"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_danang",
          name: "Da Nang & Hoi An",
          country: "Vietnam",
          region: "Southeast Asia",
          tagline: "Yellow lantern town, ancient canals, and the Golden Hand Bridge",
          description: "Step into a lantern-lit fairytale in ancient Hoi An, walk high above the clouds on the Golden Hand Bridge, and enjoy coastal sands.",
          vibes: ["Culture", "Beach", "Foodie", "Relaxation"],
          baseFlightCost: 270,
          dailyStayCost: 48,
          dailyFoodCost: 19,
          dailyActivityCost: 22,
          idealDaysMin: 4,
          idealDaysMax: 7,
          bestSeason: "Feb \u2013 Aug",
          highlights: ["Hoi An Ancient Lantern Town", "Ba Na Hills Golden Bridge", "My Khe Beach"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_bangkok",
          name: "Bangkok & Chiang Mai",
          country: "Thailand",
          region: "Southeast Asia",
          tagline: "Golden Buddhist temples, bustling river ferries, and northern mountain mist",
          description: "Marvel at Wat Arun and the Grand Palace, bargain in Chatuchak Market, then travel north to Chiang Mai for elephant sanctuaries.",
          vibes: ["City", "Culture", "Foodie", "Nightlife"],
          baseFlightCost: 250,
          dailyStayCost: 50,
          dailyFoodCost: 20,
          dailyActivityCost: 25,
          idealDaysMin: 5,
          idealDaysMax: 9,
          bestSeason: "Nov \u2013 Feb",
          highlights: ["Wat Pho & Grand Palace", "Chiang Mai Ethical Elephant Sanctuary", "Chao Phraya River Cruise"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_srilanka",
          name: "Sri Lanka (Colombo, Kandy & Ella)",
          country: "Sri Lanka",
          region: "Southeast Asia",
          tagline: "The iconic blue train ride through tea hills & coastal surf",
          description: "Ride the world's most scenic blue train from Kandy to Ella, spot wild leopards in Yala, and surf clean peelers at Mirissa.",
          vibes: ["Nature", "Adventure", "Beach", "Culture"],
          baseFlightCost: 210,
          dailyStayCost: 45,
          dailyFoodCost: 18,
          dailyActivityCost: 22,
          idealDaysMin: 6,
          idealDaysMax: 9,
          bestSeason: "Dec \u2013 Apr",
          highlights: ["Kandy to Ella Blue Train Ride", "Nine Arches Bridge", "Sigiriya Lion Rock Fortress"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        {
          id: "dest_singapore",
          name: "Singapore",
          country: "Singapore",
          region: "Southeast Asia",
          tagline: "Futuristic Garden City: Supertrees, rooftop infinity pools & hawker cuisine",
          description: "Walk inside botanical glass biomes, watch nightly laser shows over Marina Bay, and taste Michelin-starred chicken rice for $4.",
          vibes: ["City", "Foodie", "Culture", "Nightlife"],
          baseFlightCost: 260,
          dailyStayCost: 110,
          dailyFoodCost: 35,
          dailyActivityCost: 35,
          idealDaysMin: 3,
          idealDaysMax: 5,
          bestSeason: "Year-round",
          highlights: ["Gardens by the Bay & Supertree Grove", "Marina Bay Sands SkyPark", "Chinatown & Maxwell Hawker Centres"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_nepal",
          name: "Kathmandu & Pokhara",
          country: "Nepal",
          region: "Southeast Asia",
          tagline: "Gateway to the Annapurnas, sacred stupas, and alpine lakes",
          description: "View the 8,000-meter peaks of the Annapurna massif reflected in Phewa Lake, spin prayer wheels at Boudhanath, and paraglide with eagles.",
          vibes: ["Mountain", "Adventure", "Culture", "Wellness"],
          baseFlightCost: 190,
          dailyStayCost: 35,
          dailyFoodCost: 16,
          dailyActivityCost: 20,
          idealDaysMin: 5,
          idealDaysMax: 9,
          bestSeason: "Sep \u2013 Nov",
          highlights: ["Phewa Lake & Sarangkot Sunrise", "Boudhanath & Swayambhunath Stupas", "Pokhara Paragliding"],
          rating: 4.7,
          imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80",
          tier: "Budget"
        },
        // ── MID-TIER & MODERN INTERNATIONAL ($1,200 – $2,800) ───────────────────
        {
          id: "dest_dubai",
          name: "Dubai & Abu Dhabi",
          country: "United Arab Emirates",
          region: "Middle East & Africa",
          tagline: "Futuristic desert metropolis of sky-high architecture and golden dunes",
          description: "Ascend the world's tallest skyscraper, dune bash in 4x4 safaris, explore the Louvre Abu Dhabi, and stroll glittering souks.",
          vibes: ["City", "Adventure", "Nightlife", "Culture"],
          baseFlightCost: 290,
          dailyStayCost: 110,
          dailyFoodCost: 45,
          dailyActivityCost: 50,
          idealDaysMin: 4,
          idealDaysMax: 7,
          bestSeason: "Nov \u2013 Mar",
          highlights: ["Burj Khalifa Level 148", "Red Dunes Desert Safari & BBQ", "Sheikh Zayed Grand Mosque"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_turkey",
          name: "Istanbul & Cappadocia",
          country: "Turkey",
          region: "Europe",
          tagline: "Where continents collide: fairy chimneys, hot air balloons & spice bazaars",
          description: "Float over fairy chimneys in a hot air balloon at sunrise, cruise the Bosphorus dividing Europe & Asia, and marvel at Hagia Sophia.",
          vibes: ["Heritage", "Culture", "Adventure", "Foodie"],
          baseFlightCost: 420,
          dailyStayCost: 75,
          dailyFoodCost: 28,
          dailyActivityCost: 45,
          idealDaysMin: 6,
          idealDaysMax: 9,
          bestSeason: "Apr \u2013 Jun, Sep \u2013 Nov",
          highlights: ["Cappadocia Sunrise Hot Air Balloon Flight", "Hagia Sophia & Blue Mosque", "Bosphorus Sunset Yacht Cruise"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_prague",
          name: "Prague & Budapest",
          country: "Czech Republic & Hungary",
          region: "Europe",
          tagline: "City of a Hundred Spires, historic castles, and thermal bathhouses",
          description: "Cross the gothic Charles Bridge, soak in ancient Roman-style thermal baths on the Danube, and explore fairytale cobblestone alleys.",
          vibes: ["Heritage", "Culture", "Nightlife", "Foodie"],
          baseFlightCost: 550,
          dailyStayCost: 75,
          dailyFoodCost: 32,
          dailyActivityCost: 25,
          idealDaysMin: 6,
          idealDaysMax: 10,
          bestSeason: "May \u2013 Sep",
          highlights: ["Prague Old Town Square & Astronomical Clock", "Sz\xE9chenyi Thermal Baths Budapest", "Danube River Night Cruise"],
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        {
          id: "dest_greece",
          name: "Athens & Santorini",
          country: "Greece",
          region: "Europe",
          tagline: "Ancient cradle of democracy and iconic whitewashed Aegean cliff towns",
          description: "Walk beneath the Parthenon on the Acropolis, sail the volcanic caldera of Santorini, and catch world-famous sunsets in Oia.",
          vibes: ["Heritage", "Beach", "Culture", "Foodie"],
          baseFlightCost: 580,
          dailyStayCost: 110,
          dailyFoodCost: 40,
          dailyActivityCost: 35,
          idealDaysMin: 6,
          idealDaysMax: 9,
          bestSeason: "May \u2013 Oct",
          highlights: ["Acropolis & Parthenon", "Oia Village Blue Dome Sunset", "Caldera Catamaran Sailing Cruise"],
          rating: 4.9,
          imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        },
        // ── LUXURY & ICONIC DREAM DESTINATIONS ($2,500 – $5,000+) ───────────────
        {
          id: "dest_japan",
          name: "Tokyo & Kyoto",
          country: "Japan",
          region: "East Asia",
          tagline: "Neon cyber-metropolis meets serene zen gardens and ancient shrines",
          description: "Cross the world\u2019s busiest pedestrian crossing in Shibuya, ride the 320 km/h Shinkansen bullet train, and walk through thousands of vermilion torii gates.",
          vibes: ["City", "Culture", "Foodie", "Heritage"],
          baseFlightCost: 650,
          dailyStayCost: 120,
          dailyFoodCost: 45,
          dailyActivityCost: 40,
          idealDaysMin: 7,
          idealDaysMax: 12,
          bestSeason: "Mar \u2013 May, Oct \u2013 Nov",
          highlights: ["Fushimi Inari Shrine & Arashiyama Bamboo Grove", "Shibuya & Shinjuku Tokyo Nightlife", "Mt. Fuji Day Tour & Bullet Train"],
          rating: 4.95,
          imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
          tier: "Luxury"
        },
        {
          id: "dest_swiss",
          name: "Swiss Alps (Interlaken & Zermatt)",
          country: "Switzerland",
          region: "Europe",
          tagline: "Top of Europe: jagged glacier peaks, alpine lakes & cogwheel trains",
          description: "Ride historic cogwheel railways to the Jungfraujoch glacier, gaze at the legendary Matterhorn in Zermatt, and cruise pristine turquoise lakes.",
          vibes: ["Mountain", "Nature", "Adventure", "Relaxation"],
          baseFlightCost: 720,
          dailyStayCost: 160,
          dailyFoodCost: 60,
          dailyActivityCost: 65,
          idealDaysMin: 6,
          idealDaysMax: 10,
          bestSeason: "Jun \u2013 Sep (Hiking) / Dec \u2013 Mar (Ski)",
          highlights: ["Jungfraujoch Top of Europe", "Matterhorn Viewpoint Zermatt", "Lake Brienz & Lauterbrunnen Waterfalls"],
          rating: 4.96,
          imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
          tier: "Luxury"
        },
        {
          id: "dest_paris",
          name: "Paris & C\xF4te d\u2019Azur",
          country: "France",
          region: "Europe",
          tagline: "The City of Light and glamorous French Riviera coastlines",
          description: "Admire the sparkling Eiffel Tower, view the Mona Lisa in the Louvre, stroll Mediterranean promenades in Nice, and savor warm croissants.",
          vibes: ["Culture", "Heritage", "Foodie", "Beach"],
          baseFlightCost: 680,
          dailyStayCost: 140,
          dailyFoodCost: 55,
          dailyActivityCost: 45,
          idealDaysMin: 6,
          idealDaysMax: 10,
          bestSeason: "Apr \u2013 Oct",
          highlights: ["Eiffel Tower & Seine River Cruise", "The Louvre Museum", "Nice Promenade des Anglais"],
          rating: 4.85,
          imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
          tier: "Luxury"
        },
        {
          id: "dest_italy",
          name: "Rome & Amalfi Coast",
          country: "Italy",
          region: "Europe",
          tagline: "Gladiator history, Positano pastel cliffs, and handmade pasta",
          description: "Stand in awe inside the Colosseum, marvel at Michelangelo\u2019s Sistine Chapel, then escape south to the dramatic coastal cliffs of Amalfi.",
          vibes: ["Heritage", "Beach", "Foodie", "Culture"],
          baseFlightCost: 690,
          dailyStayCost: 135,
          dailyFoodCost: 50,
          dailyActivityCost: 45,
          idealDaysMin: 7,
          idealDaysMax: 11,
          bestSeason: "Apr \u2013 Jun, Sep \u2013 Oct",
          highlights: ["Colosseum & Roman Forum", "Vatican Museums & St. Peter\u2019s", "Positano & Capri Boat Tour"],
          rating: 4.92,
          imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
          tier: "Luxury"
        },
        {
          id: "dest_maldives",
          name: "Maldives Overwater Resort",
          country: "Maldives",
          region: "Middle East & Africa",
          tagline: "Pure island seclusion, overwater villas & vibrant coral reefs",
          description: "Wake up above crystal-clear turquoise lagoons, step directly into coral gardens with manta rays, and enjoy sunset dolphin cruises.",
          vibes: ["Beach", "Relaxation", "Wellness", "Adventure"],
          baseFlightCost: 450,
          dailyStayCost: 260,
          dailyFoodCost: 75,
          dailyActivityCost: 55,
          idealDaysMin: 4,
          idealDaysMax: 7,
          bestSeason: "Nov \u2013 Apr",
          highlights: ["Overwater Bungalow Experience", "Snorkeling with Manta Rays & Sea Turtles", "Sunset Dolphin Speedboat Cruise"],
          rating: 4.95,
          imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80",
          tier: "Luxury"
        },
        {
          id: "dest_spain",
          name: "Barcelona & Costa Brava",
          country: "Spain",
          region: "Europe",
          tagline: "Gaud\xED\u2019s architectural marvels, lively tapas bars, and Mediterranean beaches",
          description: "Gaze up at the surreal spires of Sagrada Familia, eat tapas in bustling Gothic Quarter alleys, and sunbathe along the Mediterranean sea.",
          vibes: ["Culture", "Beach", "Foodie", "Nightlife", "City"],
          baseFlightCost: 620,
          dailyStayCost: 105,
          dailyFoodCost: 42,
          dailyActivityCost: 35,
          idealDaysMin: 5,
          idealDaysMax: 8,
          bestSeason: "May \u2013 Oct",
          highlights: ["Sagrada Fam\xEDlia & Park G\xFCell", "Gothic Quarter Tapas Crawl", "Barceloneta Beach Promenade"],
          rating: 4.88,
          imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80",
          tier: "Moderate"
        }
      ];
      this.#destinations = rawCatalog.map((item) => new Destination(item));
    }
    /**
     * All destinations in catalog
     * @returns {Destination[]}
     */
    get destinations() {
      return [...this.#destinations];
    }
    /**
     * Finds a single destination by its ID.
     * @param {string} id 
     * @returns {Destination|null}
     */
    findDestinationById(id) {
      return this.#destinations.find((d) => d.id === id) || null;
    }
    /**
     * Main Recommendation Engine Algorithm:
     * Evaluates budget, duration, party size, travel strategy, vibes and regions.
     * Computes multi-factor match score and returns ranked recommendations.
     * 
     * @param {Object} options
     * @param {number} options.budget - User target budget (in USD or normalized)
     * @param {number} [options.travelers=1] - Number of travelers
     * @param {number} [options.days=5] - Trip duration in days
     * @param {string} [options.travelStyle='moderate'] - 'backpacker' | 'moderate' | 'luxury'
     * @param {string} [options.vibe='all'] - Preferred vibe filter
     * @param {string} [options.region='all'] - Preferred region filter
     * @param {string} [options.fitFilter='all'] - 'all' | 'within' | 'saver' | 'stretch'
     * @param {number} [options.fxRate=1] - Multiplier from USD to target display currency
     * @param {string} [options.currencySymbol='$'] - Display currency symbol
     * @returns {Array<Object>} Sorted list of recommendation results
     */
    getRecommendations({
      budget,
      travelers = 1,
      days = 5,
      travelStyle = "moderate",
      vibe = "all",
      region = "all",
      fitFilter = "all",
      fxRate = 1,
      currencySymbol = "$"
    }) {
      const userBudgetUSD = Math.max(10, Number(budget) / (fxRate || 1));
      const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
      const numDays = Math.max(1, parseInt(days, 10) || 1);
      const strategy = TravelStrategyFactory.getStrategy(travelStyle);
      const candidates = this.#destinations.filter((dest) => {
        const matchesVibe = dest.hasVibe(vibe);
        const matchesReg = dest.matchesRegion(region);
        return matchesVibe && matchesReg;
      });
      const evaluated = candidates.map((dest) => {
        const costUSD = dest.calculateEstimatedCost(numTravelers, numDays, strategy);
        const totalUSD = costUSD.total;
        const deltaUSD = userBudgetUSD - totalUSD;
        let fitStatus = "within_budget";
        let statusLabel = "Perfect Fit";
        let statusClass = "status-fit";
        if (totalUSD <= userBudgetUSD * 0.7) {
          fitStatus = "budget_saver";
          statusLabel = "\u{1F4B0} Budget Saver";
          statusClass = "status-saver";
        } else if (totalUSD <= userBudgetUSD) {
          fitStatus = "within_budget";
          statusLabel = "\u2728 Within Budget";
          statusClass = "status-fit";
        } else if (totalUSD <= userBudgetUSD * 1.15) {
          fitStatus = "stretch";
          statusLabel = "\u26A1 Stretch Pick (+15%)";
          statusClass = "status-stretch";
        } else {
          fitStatus = "over_budget";
          statusLabel = "\u26A0\uFE0F Exceeds Budget";
          statusClass = "status-over";
        }
        let score = 50;
        if (totalUSD <= userBudgetUSD) {
          const utilizationRatio = totalUSD / userBudgetUSD;
          score += 45 * Math.min(1, utilizationRatio >= 0.65 ? 1 : 0.75 + utilizationRatio * 0.25);
        } else if (totalUSD <= userBudgetUSD * 1.15) {
          const overRatio = (totalUSD - userBudgetUSD) / (userBudgetUSD * 0.15);
          score += Math.max(10, 30 - overRatio * 20);
        } else {
          score -= 30;
        }
        if (numDays >= dest.idealDaysMin && numDays <= dest.idealDaysMax) {
          score += 25;
        } else {
          const diff = Math.min(
            Math.abs(numDays - dest.idealDaysMin),
            Math.abs(numDays - dest.idealDaysMax)
          );
          score += Math.max(5, 25 - diff * 5);
        }
        if (vibe && vibe.toLowerCase() !== "all") {
          score += dest.hasVibe(vibe) ? 15 : 0;
        } else {
          score += 10;
        }
        score += Math.min(15, (dest.rating - 4.5) * 30);
        const matchPercentage = Math.max(25, Math.min(99, Math.round(score)));
        const rate = fxRate || 1;
        const displayCosts = {
          flight: Math.round(costUSD.categories.flight * rate),
          hotel: Math.round(costUSD.categories.hotel * rate),
          food: Math.round(costUSD.categories.food * rate),
          activities: Math.round(costUSD.categories.activities * rate),
          contingency: Math.round(costUSD.categories.contingency * rate)
        };
        const displayTotal = Math.round(totalUSD * rate);
        const displayBudget = Math.round(userBudgetUSD * rate);
        const displayDelta = Math.round(deltaUSD * rate);
        const displayPerPerson = Math.round(costUSD.perPerson * rate);
        const displayDaily = Math.round(costUSD.perPersonPerDay * rate);
        return {
          destination: dest,
          costBreakdownUSD: costUSD,
          currencySymbol,
          displayCosts,
          displayTotal,
          displayBudget,
          displayDelta,
          displayPerPerson,
          displayDaily,
          fitStatus,
          statusLabel,
          statusClass,
          matchPercentage,
          strategyName: strategy.name,
          strategyIcon: strategy.icon
        };
      });
      let filtered = evaluated;
      if (fitFilter === "within") {
        filtered = evaluated.filter((r) => r.fitStatus === "within_budget" || r.fitStatus === "budget_saver");
      } else if (fitFilter === "saver") {
        filtered = evaluated.filter((r) => r.fitStatus === "budget_saver");
      } else if (fitFilter === "stretch") {
        filtered = evaluated.filter((r) => r.fitStatus === "stretch");
      }
      filtered.sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        return a.displayTotal - b.displayTotal;
      });
      return filtered;
    }
    /**
     * Converts a recommendation directly into a full Trip domain model
     * with pre-populated polymorphic Expense instances using the Factory pattern.
     * 
     * @param {Object} recommendation - Recommendation result from getRecommendations
     * @param {string} customTripName - User custom trip name (optional)
     * @param {Array<string>} travelerNames - Names of travelers
     * @param {boolean} includePreAllocatedExpenses - Whether to automatically generate starter expense objects
     * @returns {Trip} Created Trip instance
     */
    createTripFromRecommendation(recommendation, customTripName = "", travelerNames = ["You", "Travel Companion"], includePreAllocatedExpenses = true) {
      const dest = recommendation.destination;
      const tripName = customTripName.trim() || `${dest.name} Getaway`;
      const totalBudget = recommendation.displayBudget || recommendation.displayTotal;
      const today = /* @__PURE__ */ new Date();
      const start = new Date(today);
      start.setDate(today.getDate() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + recommendation.costBreakdownUSD.days);
      const startDateStr = start.toISOString().split("T")[0];
      const endDateStr = end.toISOString().split("T")[0];
      const travelers = travelerNames.map((name, idx) => {
        const cleanName = (name || `Traveler ${idx + 1}`).trim();
        return new Traveler(`trv_rec_${Date.now()}_${idx}`, cleanName);
      });
      if (travelers.length === 0) {
        travelers.push(new Traveler(`trv_rec_${Date.now()}_0`, "Explorer"));
      }
      const primaryTravelerId = travelers[0].id;
      const allParticipantIds = travelers.map((t) => t.id);
      const trip = new Trip({
        id: `trip_rec_${Date.now()}`,
        name: tripName,
        destination: `${dest.name}, ${dest.country}`,
        startDate: startDateStr,
        endDate: endDateStr,
        totalBudget,
        travelers,
        expenses: []
      });
      if (includePreAllocatedExpenses) {
        const costs = recommendation.displayCosts;
        if (costs.flight > 0) {
          const flightExpense = ExpenseFactory.createExpense({
            category: "Flight",
            title: `Roundtrip Travel to ${dest.name}`,
            baseAmount: Math.round(costs.flight * 0.85),
            baggageFee: Math.round(costs.flight * 0.1),
            airportTax: Math.round(costs.flight * 0.05),
            date: startDateStr,
            paidById: primaryTravelerId,
            participantIds: allParticipantIds,
            notes: `Estimated roundtrip flights/transit for ${travelers.length} traveler(s)`
          });
          trip.addExpense(flightExpense);
        }
        if (costs.hotel > 0) {
          const nights = recommendation.costBreakdownUSD.nights;
          const basePerNight = Math.round(costs.hotel / nights / 1.1);
          const hotelExpense = ExpenseFactory.createExpense({
            category: "Hotel",
            title: `Accommodations in ${dest.name} (${nights} Nights)`,
            baseAmount: basePerNight,
            nights,
            serviceTaxPercent: 10,
            date: startDateStr,
            paidById: primaryTravelerId,
            participantIds: allParticipantIds,
            notes: `Estimated lodging (${recommendation.costBreakdownUSD.rooms} room(s))`
          });
          trip.addExpense(hotelExpense);
        }
        if (costs.food > 0) {
          const foodExpense = ExpenseFactory.createExpense({
            category: "Food",
            title: `Food & Dining Budget in ${dest.name}`,
            baseAmount: Math.round(costs.food * 0.85),
            tipAmount: Math.round(costs.food * 0.1),
            taxAmount: Math.round(costs.food * 0.05),
            date: startDateStr,
            paidById: primaryTravelerId,
            participantIds: allParticipantIds,
            notes: `Meals, local dining and cafe budget for ${recommendation.costBreakdownUSD.days} days`
          });
          trip.addExpense(foodExpense);
        }
        if (costs.activities > 0) {
          const actExpense = ExpenseFactory.createExpense({
            category: "Activities",
            title: `Sightseeing & Excursions: ${dest.highlights.slice(0, 2).join(", ")}`,
            baseAmount: Math.round(costs.activities * 0.9),
            equipmentFee: Math.round(costs.activities * 0.1),
            date: startDateStr,
            paidById: primaryTravelerId,
            participantIds: allParticipantIds,
            notes: `Tickets, tours, and attraction passes`
          });
          trip.addExpense(actExpense);
        }
      }
      return trip;
    }
  };

  // js/app.js
  var FX_RATES_TO_USD = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 149.8,
    CAD: 1.36,
    AUD: 1.53,
    SGD: 1.34,
    AED: 3.67,
    THB: 35.1
  };
  var CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\xA3",
    INR: "\u20B9",
    JPY: "\xA5",
    CAD: "C$",
    AUD: "A$",
    SGD: "S$",
    AED: "\u062F.\u0625",
    THB: "\u0E3F"
  };
  var TripBudgetApp = class {
    #trips = [];
    #currentTrip = null;
    #activeView = "dashboard";
    #isDark = true;
    #sidebarCollapsed = false;
    // Recommendation System fields
    #recEngine = null;
    #recActiveCurrency = "USD";
    #recTravelStyle = "moderate";
    #recActiveVibe = "all";
    #recActiveRegion = "all";
    #recSelectedResult = null;
    constructor() {
      this.#init();
    }
    #init() {
      this.#recEngine = new RecommendationEngine();
      this.#trips = StorageService.loadTrips();
      const savedActiveId = StorageService.getActiveTripId();
      if (this.#trips.length > 0) {
        this.#currentTrip = this.#trips.find((t) => t.id === savedActiveId) || this.#trips[0];
        StorageService.setActiveTripId(this.#currentTrip.id);
      }
      const savedTheme = localStorage.getItem("tripbudget_theme") || "dark";
      this.#isDark = savedTheme === "dark";
      this.#applyTheme();
      const savedSidebarState = localStorage.getItem("tripbudget_sidebar") || "expanded";
      if (savedSidebarState === "collapsed") {
        this.#collapseSidebar(false);
      }
      this.#bindNavigationEvents();
      this.#bindModalEvents();
      this.#bindActionEvents();
      this.#bindFormEvents();
      this.#bindExtraFeatureEvents();
      this.#bindRecommendationEvents();
      this.#renderAll();
      this.#showProgressBar(100, 600);
      this.#initStarfieldCanvas();
      this.#initAstronomicalTelemetry();
      const savedUser = localStorage.getItem("tripbudget_user");
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          const lbl = document.getElementById("userProfileLabel");
          if (lbl && u.username) lbl.textContent = `${u.username} (${u.role || "User"})`;
        } catch (e) {
        }
      }
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* STATE HELPERS                                                           */
    /* ─────────────────────────────────────────────────────────────────────── */
    get currentTrip() {
      return this.#currentTrip;
    }
    get trips() {
      return [...this.#trips];
    }
    #saveState() {
      StorageService.saveTrips(this.#trips);
      if (this.#currentTrip) StorageService.setActiveTripId(this.#currentTrip.id);
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* TOP PROGRESS BAR                                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    #showProgressBar(targetPct = 100, durationMs = 500) {
      const bar = document.getElementById("topProgressBar");
      if (!bar) return;
      bar.style.opacity = "1";
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        bar.style.transition = `width ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        bar.style.width = `${targetPct}%`;
      });
      setTimeout(() => {
        bar.style.opacity = "0";
        setTimeout(() => {
          bar.style.width = "0%";
          bar.style.transition = "";
        }, 400);
      }, durationMs + 200);
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* THEME TOGGLE                                                            */
    /* ─────────────────────────────────────────────────────────────────────── */
    #applyTheme() {
      const btn = document.getElementById("themeToggleBtn");
      if (this.#isDark) {
        document.documentElement.removeAttribute("data-theme");
        if (btn) btn.textContent = "\u{1F319}";
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        if (btn) btn.textContent = "\u2600\uFE0F";
      }
      localStorage.setItem("tripbudget_theme", this.#isDark ? "dark" : "light");
    }
    #toggleTheme() {
      this.#isDark = !this.#isDark;
      this.#applyTheme();
      this.#showToast(`Switched to ${this.#isDark ? "Dark" : "Light"} theme`, "success");
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* SIDEBAR COLLAPSE                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    #collapseSidebar(animate = true) {
      this.#sidebarCollapsed = true;
      const sidebar = document.getElementById("sidebar");
      const wrapper = document.getElementById("mainWrapper");
      const toggleBtn = document.getElementById("sidebarToggleBtn");
      if (sidebar) sidebar.classList.add("collapsed");
      if (wrapper) wrapper.classList.add("sidebar-collapsed");
      if (toggleBtn) {
        toggleBtn.textContent = "\u203A";
        toggleBtn.title = "Expand sidebar";
        toggleBtn.setAttribute("aria-label", "Expand sidebar");
      }
      if (animate) localStorage.setItem("tripbudget_sidebar", "collapsed");
    }
    #expandSidebar(animate = true) {
      this.#sidebarCollapsed = false;
      const sidebar = document.getElementById("sidebar");
      const wrapper = document.getElementById("mainWrapper");
      const toggleBtn = document.getElementById("sidebarToggleBtn");
      if (sidebar) sidebar.classList.remove("collapsed");
      if (wrapper) wrapper.classList.remove("sidebar-collapsed");
      if (toggleBtn) {
        toggleBtn.textContent = "\u2039";
        toggleBtn.title = "Collapse sidebar";
        toggleBtn.setAttribute("aria-label", "Collapse sidebar");
      }
      if (animate) localStorage.setItem("tripbudget_sidebar", "expanded");
    }
    #toggleSidebar() {
      if (this.#sidebarCollapsed) {
        this.#expandSidebar();
      } else {
        this.#collapseSidebar();
      }
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* ANIMATED COUNTER                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    #animateCounter(elementId, targetValue, prefix = "$", suffix = "") {
      const el = document.getElementById(elementId);
      if (!el) return;
      const duration = 600;
      const start = performance.now();
      const startValue = parseFloat(el.dataset.currentValue || "0") || 0;
      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (targetValue - startValue) * eased;
        if (suffix === "%") {
          el.textContent = `${Math.round(current)}%`;
        } else {
          el.textContent = `${prefix}${current.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
        }
        if (progress < 1) requestAnimationFrame(update);
        else el.dataset.currentValue = targetValue;
      };
      requestAnimationFrame(update);
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* EVENT BINDINGS                                                          */
    /* ─────────────────────────────────────────────────────────────────────── */
    #bindNavigationEvents() {
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
          const viewName = item.getAttribute("data-view");
          if (viewName) this.#switchView(viewName);
        });
      });
      const viewAllBtn = document.getElementById("viewAllExpensesBtn");
      if (viewAllBtn) viewAllBtn.addEventListener("click", () => this.#switchView("expenses"));
    }
    #switchView(viewName) {
      this.#activeView = viewName;
      this.#showProgressBar(100, 300);
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.getAttribute("data-view") === viewName);
      });
      document.querySelectorAll(".view-section").forEach((sec) => {
        sec.classList.toggle("active", sec.id === `view-${viewName}`);
      });
      if (viewName === "dashboard") this.#renderDashboard();
      if (viewName === "trips") this.#renderTripsView();
      if (viewName === "expenses") this.#renderExpensesView();
      if (viewName === "travelers") this.#renderTravelersView();
      if (viewName === "split") this.#renderSplitView();
      if (viewName === "analytics") this.#renderAnalyticsView();
      if (viewName === "recommendations") this.#renderRecommendationsView();
    }
    #bindActionEvents() {
      const tripSelect = document.getElementById("activeTripSelect");
      tripSelect.addEventListener("change", (e) => {
        const selected = this.#trips.find((t) => t.id === e.target.value);
        if (selected) {
          this.#currentTrip = selected;
          StorageService.setActiveTripId(selected.id);
          this.#renderAll();
          this.#showToast(`Switched to "${selected.name}"`, "success");
        }
      });
      document.getElementById("resetDemoBtn").addEventListener("click", () => {
        if (confirm("Reset to initial sample trip and expenses data?")) {
          this.#trips = StorageService.resetToSampleData();
          this.#currentTrip = this.#trips[0];
          this.#renderAll();
          this.#showToast("Sample trip data restored!", "success");
        }
      });
      document.getElementById("quickAddExpenseBtn").addEventListener("click", () => this.#openExpenseModal());
      document.getElementById("fab").addEventListener("click", () => this.#openExpenseModal());
      document.getElementById("openAddExpenseModalBtn").addEventListener("click", () => this.#openExpenseModal());
      document.getElementById("openCreateTripModalBtn").addEventListener("click", () => this.#openTripModal());
      document.getElementById("editCurrentTripBtn").addEventListener("click", () => {
        if (this.#currentTrip) this.#openTripModal(this.#currentTrip);
      });
      document.getElementById("cloneCurrentTripBtn").addEventListener("click", () => {
        this.#handleCloneTrip();
      });
      document.getElementById("openAddTravelerModalBtn").addEventListener("click", () => this.#openTravelerModal());
      document.getElementById("openVivaBtn").addEventListener("click", () => this.#openModal("vivaModal"));
      document.getElementById("openLoginModalBtn")?.addEventListener("click", () => this.#openModal("loginModal"));
      document.getElementById("demoLoginSubmitBtn")?.addEventListener("click", () => {
        const user = document.getElementById("demoUsername").value || "demo";
        const role = document.getElementById("demoRole").value || "Student / Evaluator";
        document.getElementById("userProfileLabel").textContent = `${user} (${role})`;
        localStorage.setItem("tripbudget_user", JSON.stringify({ username: user, role }));
        this.#closeModal("loginModal");
        this.#showToast(`Logged in as "${user}" [${role}]`, "success");
      });
      document.getElementById("expenseSearchInput")?.addEventListener("input", () => this.#renderExpensesView());
      const catFilter = document.getElementById("expenseCategoryFilter");
      catFilter?.addEventListener("change", () => {
        const val = catFilter.value;
        document.querySelectorAll("#expenseCategoryChips .category-chip-btn").forEach((btn) => {
          btn.classList.toggle("active", btn.getAttribute("data-cat") === val);
        });
        this.#renderExpensesView();
      });
      document.querySelectorAll("#expenseCategoryChips .category-chip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const cat = btn.getAttribute("data-cat");
          if (catFilter) catFilter.value = cat;
          document.querySelectorAll("#expenseCategoryChips .category-chip-btn").forEach((b) => {
            b.classList.toggle("active", b === btn);
          });
          this.#renderExpensesView();
        });
      });
      document.getElementById("expenseSortFilter")?.addEventListener("change", () => this.#renderExpensesView());
      document.getElementById("splitExpenseSelector")?.addEventListener("change", (e) => {
        this.#renderSingleExpenseSplit(e.target.value);
      });
      document.getElementById("dashExploreRecBtn")?.addEventListener("click", () => {
        this.#switchView("recommendations");
        this.#matchCurrentTripInRecommendations();
      });
      document.getElementById("tripsExploreRecBtn")?.addEventListener("click", () => {
        this.#switchView("recommendations");
        this.#matchCurrentTripInRecommendations();
      });
    }
    #bindExtraFeatureEvents() {
      document.getElementById("themeToggleBtn")?.addEventListener("click", () => this.#toggleTheme());
      document.getElementById("sidebarToggleBtn")?.addEventListener("click", () => this.#toggleSidebar());
      document.getElementById("openCurrencyBtn")?.addEventListener("click", () => {
        this.#openModal("currencyModal");
        this.#convertCurrency();
      });
      document.getElementById("convertCurrencyBtn")?.addEventListener("click", () => this.#convertCurrency());
      document.getElementById("currencyAmount")?.addEventListener("input", () => this.#convertCurrency());
      document.getElementById("currencyFrom")?.addEventListener("change", () => this.#convertCurrency());
      document.getElementById("currencyTo")?.addEventListener("change", () => this.#convertCurrency());
      document.getElementById("openActivityBtn")?.addEventListener("click", () => {
        this.#renderActivityFeed();
        this.#openModal("activityModal");
      });
      document.getElementById("exportCsvBtn")?.addEventListener("click", () => this.#exportCSV());
      document.getElementById("exportPdfBtn")?.addEventListener("click", () => this.#exportPDF());
      document.getElementById("whatAmILookingAtBtn")?.addEventListener("click", () => {
        this.#openModal("whatAmILookingAtModal");
      });
    }
    #bindModalEvents() {
      document.querySelectorAll("[data-close]").forEach((btn) => {
        btn.addEventListener("click", () => this.#closeModal(btn.getAttribute("data-close")));
      });
      document.querySelectorAll(".modal-overlay").forEach((overlay) => {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) overlay.classList.remove("active");
        });
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          document.querySelectorAll(".modal-overlay.active").forEach((o) => o.classList.remove("active"));
        }
      });
      document.getElementById("expenseFormCategory").addEventListener("change", (e) => {
        this.#renderPolymorphicFields(e.target.value);
      });
      document.getElementById("selectAllParticipantsBtn").addEventListener("click", () => {
        const checkboxes = document.querySelectorAll('#expenseFormParticipantsList input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
        checkboxes.forEach((cb) => cb.checked = !allChecked);
        document.getElementById("selectAllParticipantsBtn").textContent = allChecked ? "Select All" : "Deselect All";
      });
    }
    #bindFormEvents() {
      document.getElementById("tripForm").addEventListener("submit", (e) => {
        e.preventDefault();
        this.#handleTripFormSubmit();
      });
      document.getElementById("expenseForm").addEventListener("submit", (e) => {
        e.preventDefault();
        this.#handleExpenseFormSubmit();
      });
      document.getElementById("travelerForm").addEventListener("submit", (e) => {
        e.preventDefault();
        this.#handleTravelerFormSubmit();
      });
      document.getElementById("recPlanForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.#handleRecPlanFormSubmit();
      });
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* RENDERING PIPELINE                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderAll() {
      this.#renderTripSelectOptions();
      this.#renderDashboard();
      this.#renderTripsView();
      this.#renderExpensesView();
      this.#renderTravelersView();
      this.#renderSplitView();
      if (this.#activeView === "analytics") this.#renderAnalyticsView();
    }
    #renderTripSelectOptions() {
      const select = document.getElementById("activeTripSelect");
      select.innerHTML = "";
      if (this.#trips.length === 0) {
        select.innerHTML = '<option value="">No Trips Available</option>';
        return;
      }
      this.#trips.forEach((trip) => {
        const opt = document.createElement("option");
        opt.value = trip.id;
        opt.textContent = `${trip.name} (${trip.destination})`;
        if (this.#currentTrip && trip.id === this.#currentTrip.id) opt.selected = true;
        select.appendChild(opt);
      });
    }
    #renderDashboard() {
      const trip = this.#currentTrip;
      if (!trip) {
        document.getElementById("dashTripName").textContent = "No Active Trip";
        document.getElementById("dashTripDetails").textContent = "Please create a new trip to get started";
        return;
      }
      document.getElementById("dashTripName").textContent = trip.name;
      document.getElementById("dashTripDetails").textContent = `\u{1F4CD} ${trip.destination} | \u{1F4C5} ${trip.startDate || "N/A"} \u2192 ${trip.endDate || "N/A"} | \u{1F465} ${trip.travelers.length} Travelers`;
      const totalBudget = trip.totalBudget;
      const totalSpent = trip.getTotalSpent();
      const remaining = trip.getRemainingBudget();
      const usagePct = trip.getBudgetUsagePercentage();
      const budgetStatus = trip.getBudgetStatus();
      this.#animateCounter("metricTotalBudget", totalBudget);
      this.#animateCounter("metricTotalSpent", totalSpent);
      this.#animateCounter("metricRemainingBudget", remaining);
      const pctEl = document.getElementById("metricUsagePct");
      if (pctEl) {
        const startPct = parseFloat(pctEl.dataset.currentValue || "0") || 0;
        const endPct = usagePct;
        const dur = 600;
        const t0 = performance.now();
        const animPct = (now) => {
          const prog = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - prog, 3);
          pctEl.textContent = `${Math.round(startPct + (endPct - startPct) * eased)}%`;
          if (prog < 1) requestAnimationFrame(animPct);
          else pctEl.dataset.currentValue = endPct;
        };
        requestAnimationFrame(animPct);
      }
      document.getElementById("metricSpentSub").textContent = `${trip.expenses.length} expense(s) recorded`;
      document.getElementById("metricRemainingSub").textContent = remaining >= 0 ? "Within budget limit" : "Budget deficit!";
      const progressBar = document.getElementById("dashboardProgressBar");
      const statusBadge = document.getElementById("budgetStatusBadge");
      const warningBanner = document.getElementById("budgetWarningBanner");
      progressBar.style.width = `${Math.min(100, usagePct)}%`;
      document.getElementById("progressSpentLabel").textContent = `$${totalSpent.toFixed(2)} Spent (${usagePct}%)`;
      document.getElementById("progressBudgetLabel").textContent = `$${totalBudget.toFixed(2)} Budget`;
      if (budgetStatus.level === "exceeded") {
        statusBadge.className = "progress-status-badge badge-danger";
        statusBadge.textContent = "\u26A0\uFE0F Exceeded";
        progressBar.style.backgroundColor = "var(--danger)";
        warningBanner.style.display = "flex";
        warningBanner.className = "progress-warning-banner banner-danger";
        warningBanner.innerHTML = `\u26A0\uFE0F <strong>Budget Overrun!</strong> You have exceeded the trip budget by $${Math.abs(remaining).toFixed(2)}.`;
      } else if (budgetStatus.level === "warning") {
        statusBadge.className = "progress-status-badge badge-warning";
        statusBadge.textContent = "\u26A1 Near Limit";
        progressBar.style.backgroundColor = "var(--warning)";
        warningBanner.style.display = "flex";
        warningBanner.className = "progress-warning-banner banner-warning";
        warningBanner.innerHTML = `\u26A1 <strong>Caution:</strong> You have consumed ${usagePct}% of your budget ($${remaining.toFixed(2)} remaining).`;
      } else {
        statusBadge.className = "progress-status-badge badge-safe";
        statusBadge.textContent = "\u2705 On Track";
        progressBar.style.backgroundColor = "var(--success)";
        warningBanner.style.display = "none";
      }
      const recHighlight = document.getElementById("dashRecBudgetHighlight");
      if (recHighlight) {
        recHighlight.textContent = `$${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
      const recentTbody = document.getElementById("recentExpensesTableBody");
      const recentExpenses = [...trip.expenses].reverse().slice(0, 5);
      if (recentExpenses.length === 0) {
        recentTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:28px;">No expenses yet. Click "Add Expense"!</td></tr>`;
      } else {
        recentTbody.innerHTML = recentExpenses.map((exp) => {
          const payer = trip.findTravelerById(exp.paidById);
          const cost = exp.calculateTotalCost();
          return `
                    <tr>
                        <td>
                            <div class="expense-desc-cell">
                                <span class="expense-desc-title">${this.#escapeHtml(exp.title)}</span>
                                <span class="expense-desc-notes">\u{1F5D3}\uFE0F ${exp.date}</span>
                            </div>
                        </td>
                        <td>${this.#renderCategoryBadge(exp.category)}</td>
                        <td>
                            <div class="traveler-pill" title="Paid by ${payer ? this.#escapeHtml(payer.name) : "Unknown"}">
                                <span class="avatar-badge" style="background:${payer ? payer.color : "#6366F1"};">
                                    ${payer ? payer.getInitials() : "?"}
                                </span>
                                <span class="traveler-name">${payer ? this.#escapeHtml(payer.name) : "Unknown"}</span>
                            </div>
                        </td>
                        <td>
                            <span class="expense-total-cost">$${cost.toFixed(2)}</span>
                        </td>
                    </tr>
                `;
        }).join("");
      }
      this.#renderCategoryBreakdown(trip);
    }
    #renderCategoryBreakdown(trip) {
      const breakdown = trip.getCategoryBreakdown();
      const totalSpent = trip.getTotalSpent();
      const donutSvg = document.getElementById("categoryDonutSvg");
      const barsContainer = document.getElementById("categoryBarsContainer");
      const donutTotal = document.getElementById("donutTotalAmount");
      donutTotal.textContent = `$${Math.round(totalSpent)}`;
      const categoryColors = {
        Flight: "#38BDF8",
        Hotel: "#A855F7",
        Food: "#F97316",
        Transport: "#EAB308",
        Activities: "#10B981",
        Shopping: "#EC4899",
        Other: "#94A3B8"
      };
      const categoryIcons = {
        Flight: "\u2708\uFE0F",
        Hotel: "\u{1F3E8}",
        Food: "\u{1F37D}\uFE0F",
        Transport: "\u{1F697}",
        Activities: "\u{1F3C4}",
        Shopping: "\u{1F6CD}\uFE0F",
        Other: "\u{1F4E6}"
      };
      const activeCategories = Object.values(breakdown).filter((c) => c.total > 0);
      if (activeCategories.length === 0) {
        donutSvg.innerHTML = `<circle cx="50" cy="50" r="38" stroke="#334155" stroke-width="18" fill="none" />`;
        barsContainer.innerHTML = `<p style="font-size:12px;color:var(--text-muted);text-align:center;">No categorized expenses yet.</p>`;
        return;
      }
      const circumference = 2 * Math.PI * 38;
      let offset = 0;
      let svgCircles = "";
      activeCategories.forEach((item) => {
        const rawLen = item.percentage / 100 * circumference;
        const gap = activeCategories.length > 1 ? 2.5 : 0;
        const len = Math.max(1, rawLen - gap);
        const color = categoryColors[item.category] || "#94A3B8";
        svgCircles += `
                <circle cx="50" cy="50" r="38"
                    stroke="${color}" stroke-width="15" fill="none"
                    stroke-dasharray="${len} ${circumference - len}"
                    stroke-dashoffset="${-offset}"
                    stroke-linecap="round"
                    style="filter:drop-shadow(0 0 5px ${color}88);" />
            `;
        offset += rawLen;
      });
      donutSvg.innerHTML = svgCircles;
      barsContainer.innerHTML = activeCategories.map((item) => {
        const color = categoryColors[item.category] || "#94A3B8";
        const icon = categoryIcons[item.category] || "\u{1F3F7}\uFE0F";
        return `
                <div class="cat-bar-item">
                    <div class="cat-bar-header">
                        <span class="cat-bar-name">
                            <span style="display:inline-flex;width:24px;height:24px;border-radius:6px;background:${color}22;align-items:center;justify-content:center;font-size:13px;">${icon}</span>
                            <span>${item.category}</span>
                            <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);">(${item.percentage}%)</span>
                        </span>
                        <span class="cat-bar-val" style="color:${color};">$${item.total.toFixed(2)}</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width:${item.percentage}%;background-color:${color};box-shadow:0 0 8px ${color};"></div>
                    </div>
                </div>
            `;
      }).join("");
    }
    #renderTripsView() {
      const container = document.getElementById("tripsGrid");
      if (!container) return;
      if (this.#trips.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);">No trips created yet.</p>`;
        return;
      }
      container.innerHTML = this.#trips.map((t) => {
        const isActive = this.#currentTrip && t.id === this.#currentTrip.id;
        const spent = t.getTotalSpent();
        const pct = t.getBudgetUsagePercentage();
        const barColor = pct > 100 ? "var(--danger)" : pct >= 80 ? "var(--warning)" : "var(--success)";
        return `
                <div class="trip-card ${isActive ? "active-trip" : ""}">
                    ${isActive ? '<span class="trip-active-badge">\u2705 Active</span>' : ""}
                    <div>
                        <h3 style="font-size:17px;font-weight:800;margin-bottom:4px;">${this.#escapeHtml(t.name)}</h3>
                        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">\u{1F4CD} ${this.#escapeHtml(t.destination)}</p>

                        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
                            \u{1F4C5} ${t.startDate || "No start"} \u2192 ${t.endDate || "No end"}
                        </div>

                        <div style="background:var(--bg-primary);padding:12px;border-radius:var(--radius-md);margin-bottom:14px;">
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
                                <span style="color:var(--text-secondary);">Spent / Budget:</span>
                                <strong>$${spent.toFixed(2)} / $${t.totalBudget.toFixed(2)}</strong>
                            </div>
                            <div class="progress-track" style="height:6px;margin-bottom:0;">
                                <div class="progress-bar-fill" style="width:${Math.min(100, pct)}%;background-color:${barColor};"></div>
                            </div>
                        </div>

                        <div style="display:flex;gap:10px;font-size:12px;color:var(--text-secondary);margin-bottom:14px;">
                            <span>\u{1F465} ${t.travelers.length} Travelers</span>
                            <span>\u2022</span>
                            <span>\u{1F4B3} ${t.expenses.length} Expenses</span>
                        </div>
                    </div>

                    <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border);padding-top:12px;flex-wrap:wrap;">
                        ${!isActive ? `
                            <button type="button" class="btn btn-secondary select-trip-btn" data-id="${t.id}" style="font-size:12px;">
                                \u{1F504} Switch
                            </button>
                        ` : ""}
                        <button type="button" class="btn btn-secondary clone-trip-btn" data-id="${t.id}" style="font-size:12px;" title="Duplicate trip">
                            \u{1F4CB} Clone
                        </button>
                        <button type="button" class="btn btn-secondary edit-trip-btn" data-id="${t.id}" style="font-size:12px;">
                            \u270F\uFE0F Edit
                        </button>
                        <button type="button" class="btn btn-danger delete-trip-btn" data-id="${t.id}" style="font-size:12px;">
                            \u{1F5D1}\uFE0F
                        </button>
                    </div>
                </div>
            `;
      }).join("");
      container.querySelectorAll(".select-trip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const found = this.#trips.find((t) => t.id === btn.getAttribute("data-id"));
          if (found) {
            this.#currentTrip = found;
            StorageService.setActiveTripId(found.id);
            this.#renderAll();
            this.#showToast(`Active trip set to "${found.name}"`, "success");
          }
        });
      });
      container.querySelectorAll(".clone-trip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const found = this.#trips.find((t) => t.id === btn.getAttribute("data-id"));
          if (found) this.#handleCloneTripById(found.id);
        });
      });
      container.querySelectorAll(".edit-trip-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const found = this.#trips.find((t) => t.id === btn.getAttribute("data-id"));
          if (found) this.#openTripModal(found);
        });
      });
      container.querySelectorAll(".delete-trip-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.#handleDeleteTrip(btn.getAttribute("data-id")));
      });
    }
    #renderExpensesView() {
      const trip = this.#currentTrip;
      const tbody = document.getElementById("allExpensesTableBody");
      if (!tbody) return;
      const countEl = document.getElementById("expenseLedgerCount");
      const sumEl = document.getElementById("expenseLedgerSum");
      const avgEl = document.getElementById("expenseLedgerAvg");
      const avgPill = document.getElementById("expenseLedgerAvgPill");
      if (!trip || trip.expenses.length === 0) {
        if (countEl) countEl.textContent = "0 expenses";
        if (sumEl) sumEl.textContent = "$0.00";
        if (avgPill) avgPill.style.display = "none";
        tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:48px 24px;color:var(--text-muted);">
                        <div style="font-size:32px;margin-bottom:8px;">\u{1F4B3}</div>
                        <div style="font-weight:600;color:var(--text-secondary);font-size:14px;margin-bottom:4px;">No expenses recorded yet</div>
                        <div style="font-size:12px;">Click "Add Expense" above to record your first polymorphic trip expense!</div>
                    </td>
                </tr>
            `;
        return;
      }
      const searchTerm = (document.getElementById("expenseSearchInput")?.value || "").toLowerCase().trim();
      const selectedCat = document.getElementById("expenseCategoryFilter")?.value || "ALL";
      const sortVal = document.getElementById("expenseSortFilter")?.value || "date-desc";
      let filtered = trip.expenses.filter((exp) => {
        const matchSearch = exp.title.toLowerCase().includes(searchTerm) || exp.notes && exp.notes.toLowerCase().includes(searchTerm);
        const matchCat = selectedCat === "ALL" || exp.category === selectedCat;
        return matchSearch && matchCat;
      });
      filtered.sort((a, b) => {
        if (sortVal === "date-desc") return new Date(b.date) - new Date(a.date);
        if (sortVal === "date-asc") return new Date(a.date) - new Date(b.date);
        if (sortVal === "amount-desc") return b.calculateTotalCost() - a.calculateTotalCost();
        if (sortVal === "amount-asc") return a.calculateTotalCost() - b.calculateTotalCost();
        return 0;
      });
      if (countEl) countEl.textContent = `${filtered.length} expense${filtered.length === 1 ? "" : "s"}`;
      if (sumEl) {
        const totalSum = filtered.reduce((acc, exp) => acc + exp.calculateTotalCost(), 0);
        sumEl.textContent = `$${totalSum.toFixed(2)}`;
        if (avgEl && avgPill) {
          if (filtered.length > 0) {
            avgEl.textContent = `$${(totalSum / filtered.length).toFixed(2)}`;
            avgPill.style.display = "inline-flex";
          } else {
            avgPill.style.display = "none";
          }
        }
      }
      if (filtered.length === 0) {
        tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:48px 24px;color:var(--text-muted);">
                        <div style="font-size:32px;margin-bottom:8px;">\u{1F50D}</div>
                        <div style="font-weight:600;color:var(--text-secondary);font-size:14px;margin-bottom:4px;">No matching expenses found</div>
                        <div style="font-size:12px;">Try adjusting your search query or clicking another category filter above</div>
                    </td>
                </tr>
            `;
        return;
      }
      tbody.innerHTML = filtered.map((exp) => {
        const payer = trip.findTravelerById(exp.paidById);
        const totalCost = exp.calculateTotalCost();
        const details = exp.getDetails ? exp.getDetails() : null;
        const participants = exp.participantIds.map((id) => trip.findTravelerById(id)).filter(Boolean);
        return `
                <tr>
                    <td>
                        <span class="expense-date-badge" title="Transaction Date: ${exp.date}">
                            <span style="opacity:0.75;">\u{1F5D3}\uFE0F</span>
                            <span>${exp.date}</span>
                        </span>
                    </td>
                    <td>
                        <div class="expense-desc-cell">
                            <span class="expense-desc-title">${this.#escapeHtml(exp.title)}</span>
                            ${exp.notes ? `<span class="expense-desc-notes">${this.#escapeHtml(exp.notes)}</span>` : ""}
                        </div>
                    </td>
                    <td>${this.#renderCategoryBadge(exp.category)}</td>
                    <td>
                        <div class="traveler-pill" title="Paid by ${payer ? this.#escapeHtml(payer.name) : "Unknown"}">
                            <span class="avatar-badge" style="background:${payer ? payer.color : "#6366F1"};">
                                ${payer ? payer.getInitials() : "?"}
                            </span>
                            <span class="traveler-name">${payer ? this.#escapeHtml(payer.name) : "Unknown"}</span>
                        </div>
                    </td>
                    <td>
                        <div class="avatar-stack" title="${participants.map((p) => this.#escapeHtml(p.name)).join(", ")}">
                            ${participants.map((p) => `
                                <span class="avatar-badge stack-item" style="background:${p.color};" title="${this.#escapeHtml(p.name)}">
                                    ${p.getInitials()}
                                </span>
                            `).join("")}
                        </div>
                    </td>
                    <td>
                        <span class="expense-base-amount">$${exp.baseAmount.toFixed(2)}</span>
                    </td>
                    <td>
                        <div class="expense-cost-cell">
                            <span class="expense-total-cost">$${totalCost.toFixed(2)}</span>
                            ${details && details.extraDetails ? `
                                <span class="expense-oop-badge" title="${this.#escapeHtml(details.extraDetails)}">
                                    <span class="oop-pulse"></span>
                                    <span>${this.#escapeHtml(details.extraDetails)}</span>
                                </span>
                            ` : ""}
                        </div>
                    </td>
                    <td>
                        <div class="expense-actions-cell">
                            <button type="button" class="btn-expense-action btn-expense-edit edit-expense-btn" data-id="${exp.id}" title="Edit Expense">\u270F\uFE0F</button>
                            <button type="button" class="btn-expense-action btn-expense-delete delete-expense-btn" data-id="${exp.id}" title="Delete Expense">\u{1F5D1}\uFE0F</button>
                        </div>
                    </td>
                </tr>
            `;
      }).join("");
      tbody.querySelectorAll(".edit-expense-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const exp = trip.findExpenseById(btn.getAttribute("data-id"));
          if (exp) this.#openExpenseModal(exp);
        });
      });
      tbody.querySelectorAll(".delete-expense-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.#handleDeleteExpense(btn.getAttribute("data-id")));
      });
    }
    #renderTravelersView() {
      const trip = this.#currentTrip;
      const container = document.getElementById("travelersGrid");
      if (!container) return;
      if (!trip || trip.travelers.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:36px;">No travelers found. Click "Add Traveler" to register friends.</p>`;
        return;
      }
      const balances = ExpenseSplitter.calculateTravelerBalances(trip);
      const balanceMap = {};
      balances.forEach((b) => balanceMap[b.travelerId] = b);
      container.innerHTML = trip.travelers.map((trv) => {
        const b = balanceMap[trv.id] || { totalPaid: 0, totalShare: 0, netBalance: 0 };
        const isOwed = b.netBalance > 0.01;
        const owes = b.netBalance < -0.01;
        return `
                <div class="traveler-card" style="--traveler-accent:${trv.color};">
                    <div class="traveler-card-header">
                        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
                            <div class="traveler-avatar-large" style="background:${trv.color};">
                                ${trv.getInitials()}
                            </div>
                            <div class="traveler-info">
                                <h4 class="traveler-name">${this.#escapeHtml(trv.name)}</h4>
                                <span class="traveler-email">${trv.email ? this.#escapeHtml(trv.email) : "companion@trip"}</span>
                            </div>
                        </div>
                        <button type="button" class="btn-traveler-delete delete-traveler-btn" data-id="${trv.id}" title="Remove Traveler">\u2715</button>
                    </div>

                    <div class="traveler-stats">
                        <div class="traveler-stat-item">
                            <span class="traveler-stat-label"><span>\u{1F4B3}</span><span>Total Paid</span></span>
                            <span class="traveler-stat-value" style="color:#F8FAFC;">$${b.totalPaid.toFixed(2)}</span>
                        </div>
                        <div class="traveler-stat-item">
                            <span class="traveler-stat-label"><span>\u2696\uFE0F</span><span>Fair Share</span></span>
                            <span class="traveler-stat-value" style="color:#94A3B8;">$${b.totalShare.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">
                        <span style="font-size:11.5px;color:var(--text-muted);font-family:var(--font-mono);">Net Settlement:</span>
                        <span class="traveler-balance-pill ${isOwed ? "pill-positive" : owes ? "pill-negative" : "pill-settled"}">
                            <span class="balance-dot ${isOwed ? "dot-positive" : owes ? "dot-negative" : "dot-settled"}"></span>
                            <span>${isOwed ? `+$${b.netBalance.toFixed(2)} (Gets back)` : owes ? `-$${Math.abs(b.netBalance).toFixed(2)} (Owes)` : "$0.00 (Settled)"}</span>
                        </span>
                    </div>

                    <button type="button" class="view-history-btn" data-id="${trv.id}">
                        <span>\u{1F4DC}</span><span>View Expense Ledger</span>
                    </button>
                </div>
            `;
      }).join("");
      container.querySelectorAll(".delete-traveler-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.#handleDeleteTraveler(btn.getAttribute("data-id")));
      });
      container.querySelectorAll(".view-history-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.#openTravelerHistory(btn.getAttribute("data-id"));
        });
      });
    }
    #renderSplitView() {
      const trip = this.#currentTrip;
      if (!trip) return;
      const settlements = ExpenseSplitter.calculateWhoOwesWhom(trip);
      const wowContainer = document.getElementById("whoOwesWhomContainer");
      if (settlements.length === 0) {
        wowContainer.innerHTML = `
                <div style="text-align:center;padding:32px;background:rgba(16,185,129,0.06);border-radius:var(--radius-lg);border:1px solid rgba(16,185,129,0.2);">
                    <div style="font-size:32px;margin-bottom:6px;">\u{1F389}</div>
                    <h4 style="font-size:16px;font-weight:700;color:var(--success);">All Debts Are Settled!</h4>
                    <p style="font-size:12.5px;color:var(--text-secondary);">Nobody owes anyone for this trip right now.</p>
                </div>
            `;
      } else {
        wowContainer.innerHTML = `
                <div class="settlement-grid">
                    ${settlements.map((s) => `
                        <div class="settlement-card">
                            <div class="settlement-person">
                                <span class="avatar-badge" style="background:${s.fromColor};width:36px;height:36px;font-size:13px;border:2px solid #0D0E16;">
                                    ${s.fromName.slice(0, 2).toUpperCase()}
                                </span>
                                <div class="person-details">
                                    <span class="person-name">${this.#escapeHtml(s.fromName)}</span>
                                    <span class="settle-role-tag role-debtor">Debtor</span>
                                </div>
                            </div>
                            <div class="settlement-arrow">
                                <span class="settlement-amount">$${s.amount.toFixed(2)}</span>
                                <div class="settlement-arrow-track">
                                    <span>\u2500\u2500\u25BA</span><span>TRANSFERS</span><span>\u2500\u2500\u25BA</span>
                                </div>
                            </div>
                            <div class="settlement-person" style="justify-content:flex-end;">
                                <div class="person-details" style="text-align:right;">
                                    <span class="person-name">${this.#escapeHtml(s.toName)}</span>
                                    <span class="settle-role-tag role-creditor" style="margin-left:auto;">Creditor</span>
                                </div>
                                <span class="avatar-badge" style="background:${s.toColor};width:36px;height:36px;font-size:13px;border:2px solid #0D0E16;">
                                    ${s.toName.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            `;
      }
      const balances = ExpenseSplitter.calculateTravelerBalances(trip);
      document.getElementById("balancesTableBody").innerHTML = balances.map((b) => {
        const isOwed = b.netBalance > 0.01;
        const owes = b.netBalance < -0.01;
        return `
                <tr>
                    <td>
                        <span class="traveler-pill">
                            <span class="avatar-badge" style="background:${b.color};">
                                ${b.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span class="traveler-name">${this.#escapeHtml(b.name)}</span>
                        </span>
                    </td>
                    <td style="font-family:var(--font-mono);font-size:13px;color:#FFFFFF;">$${b.totalPaid.toFixed(2)}</td>
                    <td style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);">$${b.totalShare.toFixed(2)}</td>
                    <td>
                        <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:700;color:${isOwed ? "var(--success)" : owes ? "var(--danger)" : "var(--text-muted)"};">
                            ${isOwed ? `+$${b.netBalance.toFixed(2)}` : owes ? `-$${Math.abs(b.netBalance).toFixed(2)}` : "$0.00"}
                        </span>
                    </td>
                    <td style="text-align:right;">
                        ${isOwed ? `<span class="status-pill status-pill-safe"><span class="status-pill-dot dot-safe"></span>GETS BACK $${b.netBalance.toFixed(2)}</span>` : owes ? `<span class="status-pill status-pill-danger"><span class="status-pill-dot dot-danger"></span>OWES $${Math.abs(b.netBalance).toFixed(2)}</span>` : `<span class="status-pill status-pill-neutral"><span class="status-pill-dot dot-neutral"></span>FULLY SETTLED</span>`}
                    </td>
                </tr>
            `;
      }).join("");
      const splitSelector = document.getElementById("splitExpenseSelector");
      splitSelector.innerHTML = "";
      if (trip.expenses.length === 0) {
        splitSelector.innerHTML = '<option value="">No expenses available</option>';
        document.getElementById("singleExpenseSplitResult").innerHTML = `<p style="color:var(--text-muted);font-size:13px;">No expenses logged yet.</p>`;
      } else {
        trip.expenses.forEach((exp) => {
          const opt = document.createElement("option");
          opt.value = exp.id;
          opt.textContent = `${exp.title} ($${exp.calculateTotalCost().toFixed(2)})`;
          splitSelector.appendChild(opt);
        });
        this.#renderSingleExpenseSplit(trip.expenses[0].id);
      }
    }
    #renderSingleExpenseSplit(expenseId) {
      const trip = this.#currentTrip;
      const resultContainer = document.getElementById("singleExpenseSplitResult");
      if (!trip || !expenseId) {
        resultContainer.innerHTML = "";
        return;
      }
      const exp = trip.findExpenseById(expenseId);
      if (!exp) {
        resultContainer.innerHTML = "";
        return;
      }
      const splitData = ExpenseSplitter.splitSingleExpense(exp, trip);
      resultContainer.innerHTML = `
            <div style="background:rgba(22,22,34,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-md);padding:18px;margin-top:14px;backdrop-filter:blur(14px);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
                    <div>
                        <h4 style="font-size:15px;font-weight:700;color:#F8FAFC;">${this.#escapeHtml(splitData.expenseTitle)}</h4>
                        <p style="font-size:12px;color:#94A3B8;margin-top:2px;">Paid by <strong style="color:#FFFFFF;">${this.#escapeHtml(splitData.payerName)}</strong> &bull; Total Polymorphic Cost: <strong style="color:#34D399;font-family:var(--font-mono);">$${splitData.totalCost.toFixed(2)}</strong></p>
                    </div>
                    <div style="background:rgba(99,102,241,0.12);padding:8px 16px;border-radius:var(--radius-md);border:1px solid rgba(129,140,248,0.25);text-align:right;">
                        <span style="font-size:10px;color:#A5B4FC;font-family:var(--font-mono);text-transform:uppercase;display:block;">Per Person Share</span>
                        <strong style="color:#38BDF8;font-size:16px;font-family:var(--font-mono);">$${splitData.perPersonCost.toFixed(2)}</strong>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;">
                    ${splitData.breakdown.map((b) => `
                        <div style="background:rgba(14,14,22,0.8);padding:12px 14px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span class="avatar-badge" style="background:${b.travelerColor || "#6366F1"};width:26px;height:26px;font-size:10px;">
                                    ${b.travelerName.slice(0, 2).toUpperCase()}
                                </span>
                                <div>
                                    <strong style="font-size:12.5px;color:#F8FAFC;display:block;">${this.#escapeHtml(b.travelerName)}</strong>
                                    <span style="font-size:10px;color:${b.isPayer ? "#38BDF8" : "#94A3B8"};font-family:var(--font-mono);">${b.isPayer ? "\u2B50 Payer" : "Participant"}</span>
                                </div>
                            </div>
                            <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:${b.isPayer ? "#34D399" : "#CBD5E1"};">$${b.share.toFixed(2)}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* ANALYTICS VIEW                                                          */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderAnalyticsView() {
      const trip = this.#currentTrip;
      if (!trip) return;
      this.#renderDailyBarChart(trip);
      this.#renderAnalyticsCategories(trip);
      this.#renderTopSpenders(trip);
    }
    #renderDailyBarChart(trip) {
      const container = document.getElementById("dailyBarChart");
      if (!container) return;
      const byDate = {};
      trip.expenses.forEach((exp) => {
        byDate[exp.date] = (byDate[exp.date] || 0) + exp.calculateTotalCost();
      });
      const dates = Object.keys(byDate).sort();
      if (dates.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No expense data recorded yet.</p>`;
        return;
      }
      const maxVal = Math.max(...Object.values(byDate));
      container.innerHTML = `
            <div class="daily-chart-canvas">
                ${dates.map((date) => {
        const val = byDate[date];
        const heightPct = maxVal > 0 ? val / maxVal * 100 : 0;
        const dateObj = /* @__PURE__ */ new Date(date + "T00:00:00");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const shortDate = isNaN(dateObj) ? date.slice(5) : `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
        return `
                        <div class="daily-chart-col" title="${date}: $${val.toFixed(2)}">
                            <span class="daily-chart-amt">$${Math.round(val)}</span>
                            <div class="daily-chart-pillar" style="height:${Math.max(12, heightPct)}px;max-height:115px;min-height:12px;"></div>
                            <span class="daily-chart-date">${shortDate}</span>
                        </div>
                    `;
      }).join("")}
            </div>
        `;
    }
    #renderAnalyticsCategories(trip) {
      const container = document.getElementById("analyticsCategories");
      if (!container) return;
      const breakdown = trip.getCategoryBreakdown();
      const categoryColors = {
        Flight: "#38BDF8",
        Hotel: "#A855F7",
        Food: "#F97316",
        Transport: "#EAB308",
        Activities: "#10B981",
        Shopping: "#EC4899",
        Other: "#94A3B8"
      };
      const categoryIcons = {
        Flight: "\u2708\uFE0F",
        Hotel: "\u{1F3E8}",
        Food: "\u{1F37D}\uFE0F",
        Transport: "\u{1F697}",
        Activities: "\u{1F3C4}",
        Shopping: "\u{1F6CD}\uFE0F",
        Other: "\u{1F4E6}"
      };
      const cats = Object.values(breakdown).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
      if (cats.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No data yet.</p>`;
        return;
      }
      container.innerHTML = cats.map((item) => {
        const color = categoryColors[item.category] || "#94A3B8";
        const icon = categoryIcons[item.category] || "\u{1F3F7}\uFE0F";
        return `
                <div class="analytics-cat-row">
                    <div class="analytics-cat-icon" style="background:${color}22;border:1px solid ${color}44;">
                        ${icon}
                    </div>
                    <div class="analytics-cat-info">
                        <div class="analytics-cat-top">
                            <span class="analytics-cat-name">${item.category}</span>
                            <span class="analytics-cat-total" style="color:${color};">$${item.total.toFixed(2)}</span>
                        </div>
                        <div class="progress-track" style="height:6px;background:rgba(255,255,255,0.06);border-radius:9999px;margin-bottom:0;">
                            <div class="cat-bar-fill" style="width:${item.percentage}%;background-color:${color};box-shadow:0 0 10px ${color};"></div>
                        </div>
                    </div>
                    <span class="analytics-cat-pct">${item.percentage}%</span>
                </div>
            `;
      }).join("");
    }
    #renderTopSpenders(trip) {
      const container = document.getElementById("topSpendersContainer");
      if (!container) return;
      const paidMap = {};
      trip.expenses.forEach((exp) => {
        const payer = trip.findTravelerById(exp.paidById);
        if (payer) {
          paidMap[payer.id] = paidMap[payer.id] || { name: payer.name, color: payer.color, total: 0 };
          paidMap[payer.id].total += exp.calculateTotalCost();
        }
      });
      const sorted = Object.values(paidMap).sort((a, b) => b.total - a.total);
      const maxTotal = sorted.length > 0 ? sorted[0].total : 1;
      const totalTripSpent = trip.getTotalSpent();
      if (sorted.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No expenses to analyze.</p>`;
        return;
      }
      const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
      container.innerHTML = sorted.map((s, i) => {
        const pctOfTotal = totalTripSpent > 0 ? (s.total / totalTripSpent * 100).toFixed(1) : "0.0";
        const rankDisplay = medals[i] ? `<span class="top-spender-rank">${medals[i]}</span>` : `<span class="top-spender-rank rank-pill">#${i + 1}</span>`;
        return `
                <div class="top-spender-row">
                    ${rankDisplay}
                    <div class="avatar-badge" style="background:${s.color};width:38px;height:38px;font-size:13px;border:2px solid #0D0E16;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
                        ${s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <div>
                                <strong style="font-size:14px;color:#F8FAFC;">${this.#escapeHtml(s.name)}</strong>
                                <span style="font-size:11px;color:#94A3B8;margin-left:8px;font-family:var(--font-mono);">(${pctOfTotal}% of trip)</span>
                            </div>
                            <span style="font-family:var(--font-mono);font-size:14.5px;font-weight:700;color:#FFFFFF;">$${s.total.toFixed(2)}</span>
                        </div>
                        <div class="progress-track" style="height:6px;background:rgba(255,255,255,0.06);border-radius:9999px;margin-bottom:0;">
                            <div class="progress-bar-fill" style="width:${s.total / maxTotal * 100}%;background:${s.color};box-shadow:0 0 8px ${s.color};"></div>
                        </div>
                    </div>
                </div>
            `;
      }).join("");
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* ACTIVITY FEED / TIMELINE                                                */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderActivityFeed() {
      const trip = this.#currentTrip;
      const container = document.getElementById("activityFeedContainer");
      const label = document.getElementById("activityTripLabel");
      if (!container) return;
      if (!trip) {
        container.innerHTML = `<p style="color:var(--text-muted);">No active trip selected.</p>`;
        return;
      }
      label.textContent = `Expense activity for "${trip.name}" \u2014 ${trip.expenses.length} total expenses`;
      const categoryColors = {
        Flight: "#38BDF8",
        Hotel: "#A855F7",
        Food: "#F97316",
        Transport: "#EAB308",
        Activities: "#10B981",
        Shopping: "#EC4899",
        Other: "#94A3B8"
      };
      const categoryIcons = {
        Flight: "\u2708\uFE0F",
        Hotel: "\u{1F3E8}",
        Food: "\u{1F37D}\uFE0F",
        Transport: "\u{1F697}",
        Activities: "\u{1F3C4}",
        Shopping: "\u{1F6CD}\uFE0F",
        Other: "\u{1F4E6}"
      };
      const sorted = [...trip.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
      if (sorted.length === 0) {
        container.innerHTML = `
                <div style="text-align:center;padding:32px;color:var(--text-muted);">
                    <div style="font-size:36px;margin-bottom:8px;">\u{1F3D6}\uFE0F</div>
                    <p>No expenses recorded for this trip yet.</p>
                </div>
            `;
        return;
      }
      const byDate = {};
      sorted.forEach((exp) => {
        if (!byDate[exp.date]) byDate[exp.date] = [];
        byDate[exp.date].push(exp);
      });
      container.innerHTML = Object.entries(byDate).map(([date, exps]) => {
        const dayTotal = exps.reduce((sum, e) => sum + e.calculateTotalCost(), 0);
        return `
                <div style="margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">
                        <span style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.05em;">\u{1F4C5} ${date}</span>
                        <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Day Total: $${dayTotal.toFixed(2)}</span>
                    </div>
                    <div class="activity-timeline">
                        ${exps.map((exp, idx) => {
          const payer = trip.findTravelerById(exp.paidById);
          const cost = exp.calculateTotalCost();
          const color = categoryColors[exp.category] || "#94A3B8";
          const icon = categoryIcons[exp.category] || "\u{1F3F7}\uFE0F";
          return `
                                <div class="activity-item" style="animation-delay:${idx * 0.06}s;">
                                    <div class="activity-dot" style="background:${color}22;color:${color};">${icon}</div>
                                    <div class="activity-content">
                                        <div class="activity-title">${this.#escapeHtml(exp.title)}</div>
                                        <div class="activity-meta">
                                            Paid by <strong>${payer ? this.#escapeHtml(payer.name) : "Unknown"}</strong>
                                            \xB7 ${exp.participantIds.length} participant(s)
                                            ${exp.notes ? `\xB7 "${this.#escapeHtml(exp.notes)}"` : ""}
                                        </div>
                                    </div>
                                    <div class="activity-amount">$${cost.toFixed(2)}</div>
                                </div>
                            `;
        }).join("")}
                    </div>
                </div>
            `;
      }).join("");
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* PER-TRAVELER EXPENSE HISTORY                                            */
    /* ─────────────────────────────────────────────────────────────────────── */
    #openTravelerHistory(travelerId) {
      const trip = this.#currentTrip;
      if (!trip) return;
      const trv = trip.findTravelerById(travelerId);
      if (!trv) return;
      document.getElementById("travelerHistoryTitle").textContent = `${trv.name}'s Expense History`;
      const content = document.getElementById("travelerHistoryContent");
      const paid = trip.expenses.filter((e) => e.paidById === travelerId);
      const participated = trip.expenses.filter((e) => e.participantIds.includes(travelerId) && e.paidById !== travelerId);
      const totalPaid = paid.reduce((s, e) => s + e.calculateTotalCost(), 0);
      const balances = ExpenseSplitter.calculateTravelerBalances(trip);
      const b = balances.find((x) => x.travelerId === travelerId) || { totalShare: 0, netBalance: 0 };
      const categoryColors = {
        Flight: "#38BDF8",
        Hotel: "#A855F7",
        Food: "#F97316",
        Transport: "#EAB308",
        Activities: "#10B981",
        Shopping: "#EC4899",
        Other: "#94A3B8"
      };
      content.innerHTML = `
            <div class="traveler-history-header">
                <div class="traveler-avatar-large" style="background:${trv.color};">${trv.getInitials()}</div>
                <div>
                    <h3 style="font-size:18px;font-weight:800;">${this.#escapeHtml(trv.name)}</h3>
                    <p style="font-size:12px;color:var(--text-muted);">${trv.email || "No email"}</p>
                </div>
            </div>

            <div class="history-stat-grid">
                <div class="history-stat-box">
                    <div class="history-stat-val" style="color:var(--primary);">$${totalPaid.toFixed(2)}</div>
                    <div class="history-stat-lbl">Total Paid</div>
                </div>
                <div class="history-stat-box">
                    <div class="history-stat-val" style="color:var(--text-secondary);">$${b.totalShare.toFixed(2)}</div>
                    <div class="history-stat-lbl">Fair Share</div>
                </div>
                <div class="history-stat-box">
                    <div class="history-stat-val" style="color:${b.netBalance >= 0 ? "var(--success)" : "var(--danger)"};">
                        ${b.netBalance >= 0 ? "+" : ""}$${b.netBalance.toFixed(2)}
                    </div>
                    <div class="history-stat-lbl">Net Balance</div>
                </div>
            </div>

            <div style="margin-bottom:18px;">
                <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;">
                    \u{1F4B3} Expenses Paid (${paid.length})
                </h4>
                ${paid.length === 0 ? '<p style="color:var(--text-muted);font-size:13px;">None</p>' : paid.map((e) => {
        const color = categoryColors[e.category] || "#94A3B8";
        return `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-elevated);border-radius:var(--radius-md);margin-bottom:6px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:14px;">${{ "Flight": "\u2708\uFE0F", "Hotel": "\u{1F3E8}", "Food": "\u{1F37D}\uFE0F", "Transport": "\u{1F697}", "Activities": "\u{1F3C4}", "Shopping": "\u{1F6CD}\uFE0F" }[e.category] || "\u{1F4E6}"}</span>
                                <div>
                                    <div style="font-size:13px;font-weight:600;">${this.#escapeHtml(e.title)}</div>
                                    <div style="font-size:11px;color:var(--text-muted);">${e.date} \xB7 ${e.participantIds.length} participants</div>
                                </div>
                            </div>
                            <div style="font-weight:700;color:var(--success);">$${e.calculateTotalCost().toFixed(2)}</div>
                        </div>
                    `;
      }).join("")}
            </div>

            <div>
                <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;">
                    \u{1F91D} Participated In (${participated.length})
                </h4>
                ${participated.length === 0 ? '<p style="color:var(--text-muted);font-size:13px;">None</p>' : participated.map((e) => {
        const payer = trip.findTravelerById(e.paidById);
        const share = e.calculateTotalCost() / e.participantIds.length;
        return `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-elevated);border-radius:var(--radius-md);margin-bottom:6px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:14px;">${{ "Flight": "\u2708\uFE0F", "Hotel": "\u{1F3E8}", "Food": "\u{1F37D}\uFE0F", "Transport": "\u{1F697}", "Activities": "\u{1F3C4}", "Shopping": "\u{1F6CD}\uFE0F" }[e.category] || "\u{1F4E6}"}</span>
                                <div>
                                    <div style="font-size:13px;font-weight:600;">${this.#escapeHtml(e.title)}</div>
                                    <div style="font-size:11px;color:var(--text-muted);">${e.date} \xB7 Paid by ${payer ? this.#escapeHtml(payer.name) : "Unknown"}</div>
                                </div>
                            </div>
                            <div style="font-weight:700;color:var(--warning);">$${share.toFixed(2)} share</div>
                        </div>
                    `;
      }).join("")}
            </div>
        `;
      this.#openModal("travelerHistoryModal");
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* CURRENCY CONVERTER                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #convertCurrency() {
      const amountEl = document.getElementById("currencyAmount");
      const fromEl = document.getElementById("currencyFrom");
      const toEl = document.getElementById("currencyTo");
      const resultEl = document.getElementById("currencyResultAmount");
      const labelEl = document.getElementById("currencyResultLabel");
      if (!amountEl || !fromEl || !toEl || !resultEl) return;
      const amount = parseFloat(amountEl.value);
      const from = fromEl.value;
      const to = toEl.value;
      if (isNaN(amount) || amount <= 0) {
        resultEl.textContent = "\u2014";
        labelEl.textContent = "Enter a valid amount above";
        return;
      }
      const fromRate = FX_RATES_TO_USD[from] || 1;
      const toRate = FX_RATES_TO_USD[to] || 1;
      const converted = amount / fromRate * toRate;
      const fromSymbol = CURRENCY_SYMBOLS[from] || from;
      const toSymbol = CURRENCY_SYMBOLS[to] || to;
      resultEl.textContent = `${toSymbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      labelEl.textContent = `${fromSymbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${from} = ${toSymbol}${converted.toFixed(4)} ${to} \xB7 Indicative rate`;
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* EXPORT (CSV & PDF)                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #exportCSV() {
      const trip = this.#currentTrip;
      if (!trip) {
        this.#showToast("No active trip to export.", "warning");
        return;
      }
      const headers = ["Date", "Description", "Category", "Payer", "Base Amount", "Total Cost", "Participants", "Notes"];
      const rows = trip.expenses.map((exp) => {
        const payer = trip.findTravelerById(exp.paidById);
        const participants = exp.participantIds.map((id) => {
          const t = trip.findTravelerById(id);
          return t ? t.name : "Unknown";
        }).join(" | ");
        return [
          exp.date,
          `"${(exp.title || "").replace(/"/g, '""')}"`,
          exp.category,
          payer ? payer.name : "Unknown",
          exp.baseAmount.toFixed(2),
          exp.calculateTotalCost().toFixed(2),
          `"${participants}"`,
          `"${(exp.notes || "").replace(/"/g, '""')}"`
        ].join(",");
      });
      const csvContent = [
        `# Trip: ${trip.name} \u2014 ${trip.destination}`,
        `# Budget: $${trip.totalBudget} | Spent: $${trip.getTotalSpent().toFixed(2)} | Remaining: $${trip.getRemainingBudget().toFixed(2)}`,
        `# Exported: ${(/* @__PURE__ */ new Date()).toLocaleString()}`,
        "",
        headers.join(","),
        ...rows
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${trip.name.replace(/[^a-z0-9]/gi, "_")}_expenses.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.#showToast(`CSV exported: ${trip.expenses.length} expenses`, "success");
    }
    #exportPDF() {
      const trip = this.#currentTrip;
      if (!trip) {
        this.#showToast("No active trip to export.", "warning");
        return;
      }
      const breakdown = trip.getCategoryBreakdown();
      const catRows = Object.values(breakdown).filter((c) => c.total > 0).map(
        (c) => `<tr><td>${c.category}</td><td>$${c.total.toFixed(2)}</td><td>${c.percentage}%</td><td>${c.count}</td></tr>`
      ).join("");
      const expRows = trip.expenses.map((exp) => {
        const payer = trip.findTravelerById(exp.paidById);
        return `<tr>
                <td>${exp.date}</td>
                <td>${exp.title}</td>
                <td>${exp.category}</td>
                <td>${payer ? payer.name : "Unknown"}</td>
                <td>$${exp.baseAmount.toFixed(2)}</td>
                <td><strong>$${exp.calculateTotalCost().toFixed(2)}</strong></td>
            </tr>`;
      }).join("");
      const html = `<!DOCTYPE html>
<html><head><title>Trip Report - ${trip.name}</title>
<style>
    body { font-family: Arial, sans-serif; color: #0F172A; margin: 32px; }
    h1 { color: #6366F1; font-size: 24px; }
    h2 { color: #334155; font-size: 16px; margin-top: 24px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 12px; }
    th { background: #6366F1; color: white; padding: 8px 12px; text-align: left; }
    td { padding: 7px 12px; border-bottom: 1px solid #CBD5E1; }
    tr:nth-child(even) td { background: #F8FAFC; }
    .summary { display: flex; gap: 24px; margin: 16px 0; }
    .summary-box { flex: 1; background: #F1F5F9; border-radius: 8px; padding: 12px; }
    .summary-box .val { font-size: 22px; font-weight: 800; color: #6366F1; }
    .summary-box .lbl { font-size: 11px; color: #64748B; text-transform: uppercase; margin-top: 4px; }
    @media print { button { display: none; } }
</style></head>
<body>
    <h1>\u{1F5FA}\uFE0F ${trip.name}</h1>
    <p style="color:#64748B;">\u{1F4CD} ${trip.destination} | \u{1F4C5} ${trip.startDate || "N/A"} \u2192 ${trip.endDate || "N/A"} | \u{1F465} ${trip.travelers.length} travelers</p>
    <p style="font-size:11px;color:#94A3B8;">Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>

    <div class="summary">
        <div class="summary-box"><div class="val">$${trip.totalBudget.toFixed(2)}</div><div class="lbl">Total Budget</div></div>
        <div class="summary-box"><div class="val" style="color:#EF4444;">$${trip.getTotalSpent().toFixed(2)}</div><div class="lbl">Total Spent</div></div>
        <div class="summary-box"><div class="val" style="color:#10B981;">$${trip.getRemainingBudget().toFixed(2)}</div><div class="lbl">Remaining</div></div>
        <div class="summary-box"><div class="val">${trip.getBudgetUsagePercentage()}%</div><div class="lbl">Budget Used</div></div>
    </div>

    <h2>Category Breakdown</h2>
    <table>
        <thead><tr><th>Category</th><th>Total</th><th>%</th><th>Count</th></tr></thead>
        <tbody>${catRows}</tbody>
    </table>

    <h2>All Expenses (${trip.expenses.length})</h2>
    <table>
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Payer</th><th>Base</th><th>Total</th></tr></thead>
        <tbody>${expRows}</tbody>
    </table>

    <h2>Travelers</h2>
    <table>
        <thead><tr><th>Name</th><th>Email</th></tr></thead>
        <tbody>${trip.travelers.map((t) => `<tr><td>${t.name}</td><td>${t.email || "\u2014"}</td></tr>`).join("")}</tbody>
    </table>
</body></html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          win.print();
        };
        this.#showToast("PDF print dialog opened!", "success");
      } else {
        this.#showToast("Popup blocked. Please allow popups for this site.", "warning");
      }
      setTimeout(() => URL.revokeObjectURL(url), 6e4);
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* TRIP CLONE                                                              */
    /* ─────────────────────────────────────────────────────────────────────── */
    #handleCloneTrip() {
      if (this.#currentTrip) this.#handleCloneTripById(this.#currentTrip.id);
    }
    #handleCloneTripById(tripId) {
      const original = this.#trips.find((t) => t.id === tripId);
      if (!original) return;
      const newTravelers = original.travelers.map((trv) => new Traveler(null, trv.name, trv.email || ""));
      const cloned = new Trip({
        name: `${original.name} (Copy)`,
        destination: original.destination,
        startDate: original.startDate,
        endDate: original.endDate,
        totalBudget: original.totalBudget,
        travelers: newTravelers
      });
      this.#trips.push(cloned);
      this.#currentTrip = cloned;
      this.#saveState();
      this.#renderAll();
      this.#showToast(`Cloned trip: "${cloned.name}" (no expenses copied)`, "success");
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* MODAL CONTROLLERS                                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    #openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add("active");
    }
    #closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("active");
    }
    #openTripModal(tripToEdit = null) {
      const form = document.getElementById("tripForm");
      form.reset();
      const travelersGroup = document.getElementById("tripTravelersInputGroup");
      if (tripToEdit) {
        document.getElementById("tripModalTitle").textContent = "Edit Trip";
        document.getElementById("tripFormId").value = tripToEdit.id;
        document.getElementById("tripFormName").value = tripToEdit.name;
        document.getElementById("tripFormDestination").value = tripToEdit.destination;
        document.getElementById("tripFormStartDate").value = tripToEdit.startDate || "";
        document.getElementById("tripFormEndDate").value = tripToEdit.endDate || "";
        document.getElementById("tripFormBudget").value = tripToEdit.totalBudget;
        travelersGroup.style.display = "none";
      } else {
        document.getElementById("tripModalTitle").textContent = "Create New Trip";
        document.getElementById("tripFormId").value = "";
        travelersGroup.style.display = "block";
        document.getElementById("tripFormTravelers").value = "Alex, Sarah, David";
      }
      this.#openModal("tripModal");
    }
    #openExpenseModal(expenseToEdit = null) {
      const trip = this.#currentTrip;
      if (!trip) {
        this.#showToast("Please create a trip first!", "error");
        return;
      }
      if (trip.travelers.length === 0) {
        this.#showToast("Please add at least one traveler first!", "error");
        return;
      }
      const form = document.getElementById("expenseForm");
      form.reset();
      const paidBySelect = document.getElementById("expenseFormPaidBy");
      paidBySelect.innerHTML = trip.travelers.map(
        (trv) => `<option value="${trv.id}">${this.#escapeHtml(trv.name)}</option>`
      ).join("");
      const participantsList = document.getElementById("expenseFormParticipantsList");
      participantsList.innerHTML = trip.travelers.map((trv) => `
            <label class="participant-checkbox-item">
                <input type="checkbox" name="participants" value="${trv.id}" checked>
                <span class="avatar-badge" style="background:${trv.color};width:20px;height:20px;font-size:10px;">
                    ${trv.getInitials()}
                </span>
                <span>${this.#escapeHtml(trv.name)}</span>
            </label>
        `).join("");
      const categorySelect = document.getElementById("expenseFormCategory");
      if (expenseToEdit) {
        document.getElementById("expenseModalTitle").textContent = "Edit Expense";
        document.getElementById("expenseFormId").value = expenseToEdit.id;
        document.getElementById("expenseFormTitle").value = expenseToEdit.title;
        categorySelect.value = expenseToEdit.category;
        document.getElementById("expenseFormBaseAmount").value = expenseToEdit.baseAmount;
        document.getElementById("expenseFormDate").value = expenseToEdit.date;
        document.getElementById("expenseFormNotes").value = expenseToEdit.notes || "";
        paidBySelect.value = expenseToEdit.paidById;
        this.#renderPolymorphicFields(expenseToEdit.category, expenseToEdit);
        const selectedIds = new Set(expenseToEdit.participantIds);
        participantsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          cb.checked = selectedIds.has(cb.value);
        });
      } else {
        document.getElementById("expenseModalTitle").textContent = "Add Expense";
        document.getElementById("expenseFormId").value = "";
        document.getElementById("expenseFormDate").value = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        categorySelect.value = "Food";
        this.#renderPolymorphicFields("Food");
      }
      this.#openModal("expenseModal");
    }
    #openTravelerModal() {
      if (!this.#currentTrip) {
        this.#showToast("Create or select a trip first!", "error");
        return;
      }
      document.getElementById("travelerForm").reset();
      this.#openModal("travelerModal");
    }
    /**
     * Dynamically renders specific polymorphic extra input fields depending on category.
     * Showcases how each subclass extends the calculation.
     */
    #renderPolymorphicFields(category, existingData = null) {
      const container = document.getElementById("polymorphicFieldsContainer");
      container.innerHTML = "";
      let html = "";
      switch (category) {
        case "Flight":
          html = `
                    <div class="polymorphic-header">\u2708\uFE0F Flight Specific Details (FlightExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="flightBaggageFee">Baggage Fee ($)</label>
                            <input type="number" id="flightBaggageFee" class="form-control" min="0" step="0.01" value="${existingData?.baggageFee || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="flightAirportTax">Airport Tax ($)</label>
                            <input type="number" id="flightAirportTax" class="form-control" min="0" step="0.01" value="${existingData?.airportTax || 0}">
                        </div>
                    </div>
                `;
          break;
        case "Hotel":
          html = `
                    <div class="polymorphic-header">\u{1F3E8} Hotel Specific Details (HotelExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="hotelNights">Number of Nights</label>
                            <input type="number" id="hotelNights" class="form-control" min="1" step="1" value="${existingData?.nights || 1}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="hotelServiceTax">Service / City Tax (%)</label>
                            <input type="number" id="hotelServiceTax" class="form-control" min="0" step="0.01" value="${existingData?.serviceTaxPercent || 0}">
                        </div>
                    </div>
                `;
          break;
        case "Food":
          html = `
                    <div class="polymorphic-header">\u{1F37D}\uFE0F Food Specific Details (FoodExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="foodTip">Tip Amount ($)</label>
                            <input type="number" id="foodTip" class="form-control" min="0" step="0.01" value="${existingData?.tipAmount || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="foodTax">Tax Amount ($)</label>
                            <input type="number" id="foodTax" class="form-control" min="0" step="0.01" value="${existingData?.taxAmount || 0}">
                        </div>
                    </div>
                `;
          break;
        case "Transport":
          html = `
                    <div class="polymorphic-header">\u{1F697} Transport Specific Details (TransportExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="transportTolls">Toll Charges ($)</label>
                            <input type="number" id="transportTolls" class="form-control" min="0" step="0.01" value="${existingData?.tollCharges || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="transportParking">Parking / Surcharge ($)</label>
                            <input type="number" id="transportParking" class="form-control" min="0" step="0.01" value="${existingData?.parkingFee || 0}">
                        </div>
                    </div>
                `;
          break;
        case "Activities":
          html = `
                    <div class="polymorphic-header">\u{1F3C4} Activity Details (ActivitiesExpense Polymorphic Formula)</div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label" for="actEquipment">Equipment Rental / Guide Fee ($)</label>
                        <input type="number" id="actEquipment" class="form-control" min="0" step="0.01" value="${existingData?.equipmentRentalFee || 0}">
                    </div>
                `;
          break;
        case "Shopping":
          html = `
                    <div class="polymorphic-header">\u{1F6CD}\uFE0F Shopping Details (ShoppingExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="shopTax">Sales Tax ($)</label>
                            <input type="number" id="shopTax" class="form-control" min="0" step="0.01" value="${existingData?.salesTax || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="shopDiscount">Discount Amount ($)</label>
                            <input type="number" id="shopDiscount" class="form-control" min="0" step="0.01" value="${existingData?.discount || 0}">
                        </div>
                    </div>
                `;
          break;
        default:
          html = `
                    <div class="polymorphic-header">\u{1F4E6} Other Expense</div>
                    <p style="font-size:12px;color:var(--text-muted);margin:0;">Standard base cost calculation applies.</p>
                `;
          break;
      }
      container.innerHTML = html;
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* FORM SUBMISSION HANDLERS                                                */
    /* ─────────────────────────────────────────────────────────────────────── */
    #handleTripFormSubmit() {
      try {
        const id = document.getElementById("tripFormId").value;
        const name = document.getElementById("tripFormName").value;
        const destination = document.getElementById("tripFormDestination").value;
        const startDate = document.getElementById("tripFormStartDate").value;
        const endDate = document.getElementById("tripFormEndDate").value;
        const budget = document.getElementById("tripFormBudget").value;
        if (id) {
          const trip = this.#trips.find((t) => t.id === id);
          if (trip) {
            trip.setName(name);
            trip.setDestination(destination);
            trip.setDates(startDate, endDate);
            trip.setTotalBudget(budget);
            this.#showToast(`Updated trip "${trip.name}"`, "success");
          }
        } else {
          const travelersInput = document.getElementById("tripFormTravelers").value;
          const travelerNames = travelersInput.split(",").map((s) => s.trim()).filter(Boolean);
          const travelerObjs = travelerNames.map((tName, idx) => new Traveler(`trv_${Date.now()}_${idx}`, tName));
          if (travelerObjs.length === 0) travelerObjs.push(new Traveler(`trv_${Date.now()}_0`, "Organizer"));
          const newTrip = new Trip({ name, destination, startDate, endDate, totalBudget: budget, travelers: travelerObjs });
          this.#trips.push(newTrip);
          this.#currentTrip = newTrip;
          this.#showToast(`Created trip "${newTrip.name}"!`, "success");
        }
        this.#saveState();
        this.#closeModal("tripModal");
        this.#renderAll();
      } catch (err) {
        this.#showToast(err.message, "error");
      }
    }
    #handleExpenseFormSubmit() {
      try {
        const trip = this.#currentTrip;
        if (!trip) throw new Error("No active trip.");
        const id = document.getElementById("expenseFormId").value;
        const title = document.getElementById("expenseFormTitle").value;
        const category = document.getElementById("expenseFormCategory").value;
        const baseAmount = document.getElementById("expenseFormBaseAmount").value;
        const date = document.getElementById("expenseFormDate").value;
        const paidById = document.getElementById("expenseFormPaidBy").value;
        const notes = document.getElementById("expenseFormNotes").value;
        const participantCheckboxes = document.querySelectorAll('#expenseFormParticipantsList input[type="checkbox"]:checked');
        const participantIds = Array.from(participantCheckboxes).map((cb) => cb.value);
        if (participantIds.length === 0) throw new Error("Please select at least one traveler to split this expense with.");
        const expenseData = { title, category, baseAmount: Number(baseAmount), date, paidById, participantIds, notes };
        if (category === "Flight") {
          expenseData.baggageFee = Number(document.getElementById("flightBaggageFee")?.value || 0);
          expenseData.airportTax = Number(document.getElementById("flightAirportTax")?.value || 0);
        } else if (category === "Hotel") {
          expenseData.nights = Number(document.getElementById("hotelNights")?.value || 1);
          expenseData.serviceTaxPercent = Number(document.getElementById("hotelServiceTax")?.value || 0);
        } else if (category === "Food") {
          expenseData.tipAmount = Number(document.getElementById("foodTip")?.value || 0);
          expenseData.taxAmount = Number(document.getElementById("foodTax")?.value || 0);
        } else if (category === "Transport") {
          expenseData.tollCharges = Number(document.getElementById("transportTolls")?.value || 0);
          expenseData.parkingFee = Number(document.getElementById("transportParking")?.value || 0);
        } else if (category === "Activities") {
          expenseData.equipmentRentalFee = Number(document.getElementById("actEquipment")?.value || 0);
        } else if (category === "Shopping") {
          expenseData.salesTax = Number(document.getElementById("shopTax")?.value || 0);
          expenseData.discount = Number(document.getElementById("shopDiscount")?.value || 0);
        }
        if (id) {
          trip.editExpense(id, expenseData);
          this.#showToast(`Updated expense "${title}"`, "success");
        } else {
          const newExp = ExpenseFactory.createExpense(expenseData);
          trip.addExpense(newExp);
          this.#showToast(`Added "${title}" ($${newExp.calculateTotalCost().toFixed(2)})`, "success");
        }
        this.#saveState();
        this.#closeModal("expenseModal");
        this.#renderAll();
      } catch (err) {
        this.#showToast(err.message, "error");
      }
    }
    #handleTravelerFormSubmit() {
      try {
        const trip = this.#currentTrip;
        if (!trip) throw new Error("No active trip.");
        const name = document.getElementById("travelerFormName").value;
        const email = document.getElementById("travelerFormEmail").value;
        const newTraveler = new Traveler(null, name, email);
        trip.addTraveler(newTraveler);
        this.#saveState();
        this.#closeModal("travelerModal");
        this.#renderAll();
        this.#showToast(`Added traveler "${newTraveler.name}"!`, "success");
      } catch (err) {
        this.#showToast(err.message, "error");
      }
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* DELETION ACTIONS                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    #handleDeleteTrip(tripId) {
      if (this.#trips.length <= 1) {
        this.#showToast("You must have at least one trip in the system.", "warning");
        return;
      }
      const toDelete = this.#trips.find((t) => t.id === tripId);
      if (!toDelete) return;
      if (confirm(`Are you sure you want to delete trip "${toDelete.name}"?`)) {
        this.#trips = this.#trips.filter((t) => t.id !== tripId);
        if (this.#currentTrip && this.#currentTrip.id === tripId) this.#currentTrip = this.#trips[0];
        this.#saveState();
        this.#renderAll();
        this.#showToast(`Deleted trip "${toDelete.name}"`, "success");
      }
    }
    #handleDeleteExpense(expenseId) {
      const trip = this.#currentTrip;
      if (!trip) return;
      const exp = trip.findExpenseById(expenseId);
      if (!exp) return;
      if (confirm(`Delete expense "${exp.title}"?`)) {
        trip.deleteExpense(expenseId);
        this.#saveState();
        this.#renderAll();
        this.#showToast(`Deleted expense "${exp.title}"`, "success");
      }
    }
    #handleDeleteTraveler(travelerId) {
      const trip = this.#currentTrip;
      if (!trip) return;
      const traveler = trip.findTravelerById(travelerId);
      if (!traveler) return;
      if (confirm(`Remove traveler "${traveler.name}" from this trip?`)) {
        try {
          trip.removeTraveler(travelerId);
          this.#saveState();
          this.#renderAll();
          this.#showToast(`Removed traveler "${traveler.name}"`, "success");
        } catch (err) {
          this.#showToast(err.message, "error");
        }
      }
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* UI UTILITY HELPERS                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderCategoryBadge(cat) {
      const icons = {
        Flight: "\u2708\uFE0F",
        Hotel: "\u{1F3E8}",
        Food: "\u{1F37D}\uFE0F",
        Transport: "\u{1F697}",
        Activities: "\u{1F3C4}",
        Shopping: "\u{1F6CD}\uFE0F",
        Other: "\u{1F4E6}"
      };
      const icon = icons[cat] || "\u{1F3F7}\uFE0F";
      const catClass = `cat-${(cat || "other").toLowerCase()}`;
      return `
            <span class="category-badge ${catClass}">
                <span class="cat-icon">${icon}</span>
                <span class="cat-label">${this.#escapeHtml(cat || "Other")}</span>
            </span>
        `;
    }
    #showToast(message, type = "success") {
      const container = document.getElementById("toastContainer");
      if (!container) return;
      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      const icons = { success: "\u2705", error: "\u274C", warning: "\u26A0\uFE0F" };
      toast.innerHTML = `
            <span>${icons[type] || "\u2139\uFE0F"}</span>
            <span>${this.#escapeHtml(message)}</span>
        `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(60px) scale(0.9)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
    #escapeHtml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* STARFIELD & CONSTELLATION MAP ENGINE (STAR PARTY AESTHETIC)             */
    /* ─────────────────────────────────────────────────────────────────────── */
    #initStarfieldCanvas() {
      const canvas = document.getElementById("starfieldCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;
      window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
      const starCount = Math.floor(Math.max(width * height / 11e3, 75));
      const stars = [];
      const namedStars = [
        { name: "Vega", xRel: 0.18, yRel: 0.19, color: "#FFFFFF", size: 3.2 },
        { name: "Arcturus", xRel: 0.52, yRel: 0.16, color: "#FED7AA", size: 3.4 },
        { name: "Spica", xRel: 0.58, yRel: 0.38, color: "#BAE6FD", size: 2.8 },
        { name: "Sun", xRel: 0.63, yRel: 0.35, color: "#FDE047", size: 4.5, glow: true },
        { name: "Venus", xRel: 0.54, yRel: 0.42, color: "#FEF08A", size: 3 },
        { name: "Mercury", xRel: 0.56, yRel: 0.38, color: "#E2E8F0", size: 2.2 },
        { name: "Antares", xRel: 0.46, yRel: 0.49, color: "#FCA5A5", size: 3.5 },
        { name: "Shaula", xRel: 0.43, yRel: 0.55, color: "#E0E7FF", size: 2.5 },
        { name: "Jupiter", xRel: 0.88, yRel: 0.42, color: "#FCA5A5", size: 3.8 }
      ];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          baseRadius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 5e-3,
          twinkleDir: Math.random() > 0.5 ? 1 : -1
        });
      }
      let mouseX = -1e3;
      let mouseY = -1e3;
      window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      const render = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#050508";
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < stars.length; i++) {
          const s1 = stars[i];
          s1.alpha += s1.twinkleSpeed * s1.twinkleDir;
          if (s1.alpha > 0.85) {
            s1.alpha = 0.85;
            s1.twinkleDir = -1;
          }
          if (s1.alpha < 0.15) {
            s1.alpha = 0.15;
            s1.twinkleDir = 1;
          }
          s1.x += s1.vx;
          s1.y += s1.vy;
          if (s1.x < 0) s1.x = width;
          if (s1.x > width) s1.x = 0;
          if (s1.y < 0) s1.y = height;
          if (s1.y > height) s1.y = 0;
          ctx.beginPath();
          ctx.arc(s1.x, s1.y, s1.baseRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${s1.alpha})`;
          ctx.fill();
          for (let j = i + 1; j < stars.length; j++) {
            const s2 = stars[j];
            const dx = s1.x - s2.x;
            const dy = s1.y - s2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 85) {
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              const lineAlpha = (1 - dist / 85) * 0.12;
              ctx.strokeStyle = `rgba(200, 220, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }
        namedStars.forEach((star, idx) => {
          const px = star.xRel * width;
          const py = star.yRel * height;
          ctx.beginPath();
          ctx.arc(px, py, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = star.color === "#FDE047" ? "rgba(253, 224, 71, 0.25)" : "rgba(255, 255, 255, 0.12)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();
          ctx.font = '500 10px "JetBrains Mono", monospace';
          ctx.fillStyle = "rgba(240, 240, 255, 0.85)";
          ctx.fillText(star.name, px + star.size + 6, py + 3);
          if (idx > 0 && idx < 5) {
            const prev = namedStars[idx - 1];
            ctx.beginPath();
            ctx.moveTo(prev.xRel * width, prev.yRel * height);
            ctx.lineTo(px, py);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        });
        if (mouseX > 0 && mouseY > 0) {
          stars.slice(0, 30).forEach((s) => {
            const dx = s.x - mouseX;
            const dy = s.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(s.x, s.y);
              ctx.lineTo(mouseX, mouseY);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 100) * 0.2})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          });
        }
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* ASTRONOMICAL HUD TELEMETRY UPDATE                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    #initAstronomicalTelemetry() {
      const updateTelemetry = () => {
        const now = /* @__PURE__ */ new Date();
        const utcHours = String(now.getUTCHours()).padStart(2, "0");
        const utcMinutes = String(now.getUTCMinutes()).padStart(2, "0");
        const utcSeconds = String(now.getUTCSeconds()).padStart(2, "0");
        const timeStr = now.toLocaleTimeString("en-US", { hour12: true });
        const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timeEl = document.getElementById("hudDateTime");
        if (timeEl) {
          timeEl.textContent = `UTC ${utcHours}:${utcMinutes}:${utcSeconds} \xB7 ${dateStr} ${timeStr}`;
        }
        const locEl = document.getElementById("hudLocation");
        if (locEl && this.#currentTrip) {
          locEl.textContent = `${this.#currentTrip.destination.toUpperCase()} \xB7 ORBITAL TEL: 34.0872\xB0 N, 118.2704\xB0 W`;
        }
      };
      updateTelemetry();
      setInterval(updateTelemetry, 1e3);
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* WHERE CAN I GO? — BUDGET RECOMMENDATION SYSTEM                           */
    /* ─────────────────────────────────────────────────────────────────────── */
    #bindRecommendationEvents() {
      const budgetInput = document.getElementById("recBudgetInput");
      const budgetSlider = document.getElementById("recBudgetSlider");
      const currSelect = document.getElementById("recCurrencySelect");
      const travelSelect = document.getElementById("recTravelersCount");
      const durSelect = document.getElementById("recDurationDays");
      const fitSelect = document.getElementById("recFitFilter");
      const sortSelect = document.getElementById("recSortFilter");
      const matchBtn = document.getElementById("recMatchCurrentTripBtn");
      budgetInput?.addEventListener("input", () => {
        const val = parseFloat(budgetInput.value) || 0;
        if (budgetSlider) budgetSlider.value = val;
        const curLabel = document.getElementById("recSliderCurrentLabel");
        const sym = CURRENCY_SYMBOLS[this.#recActiveCurrency] || "$";
        if (curLabel) curLabel.textContent = `${sym}${val.toLocaleString()}`;
        this.#renderRecommendationsView();
      });
      budgetSlider?.addEventListener("input", () => {
        const val = parseFloat(budgetSlider.value) || 0;
        if (budgetInput) budgetInput.value = val;
        const curLabel = document.getElementById("recSliderCurrentLabel");
        const sym = CURRENCY_SYMBOLS[this.#recActiveCurrency] || "$";
        if (curLabel) curLabel.textContent = `${sym}${val.toLocaleString()}`;
        this.#renderRecommendationsView();
      });
      currSelect?.addEventListener("change", (e) => {
        this.#handleRecCurrencyChange(e.target.value);
      });
      travelSelect?.addEventListener("change", () => this.#renderRecommendationsView());
      durSelect?.addEventListener("change", () => this.#renderRecommendationsView());
      fitSelect?.addEventListener("change", () => this.#renderRecommendationsView());
      sortSelect?.addEventListener("change", () => this.#renderRecommendationsView());
      document.querySelectorAll("#recStyleToggle .rec-style-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll("#recStyleToggle .rec-style-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.#recTravelStyle = btn.dataset.style || "moderate";
          const hintEl = document.getElementById("recStrategyHint");
          if (hintEl) {
            if (this.#recTravelStyle === "backpacker") hintEl.textContent = "Hostels, local transit & street dining (Budget Saver)";
            else if (this.#recTravelStyle === "luxury") hintEl.textContent = "5\u2605 luxury resorts, private tours & fine dining (Premium)";
            else hintEl.textContent = "Balanced 3\u20134\u2605 comfort & standard flights";
          }
          this.#renderRecommendationsView();
        });
      });
      document.querySelectorAll("#recVibeChips .chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          document.querySelectorAll("#recVibeChips .chip").forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          this.#recActiveVibe = chip.dataset.vibe || "all";
          this.#renderRecommendationsView();
        });
      });
      document.querySelectorAll("#recRegionChips .chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          document.querySelectorAll("#recRegionChips .chip").forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          this.#recActiveRegion = chip.dataset.region || "all";
          this.#renderRecommendationsView();
        });
      });
      matchBtn?.addEventListener("click", () => {
        this.#matchCurrentTripInRecommendations();
      });
      document.getElementById("recDetailsPlanBtn")?.addEventListener("click", () => {
        this.#closeModal("recommendationDetailsModal");
        if (this.#recSelectedResult) {
          this.#openPlanModalForRecommendation(this.#recSelectedResult);
        }
      });
      this.#updateRecPresets();
    }
    #matchCurrentTripInRecommendations() {
      if (!this.#currentTrip) {
        this.#showToast("Create a trip first to match its budget!", "warning");
        return;
      }
      const rate = FX_RATES_TO_USD[this.#recActiveCurrency] || 1;
      const tripBudget = Math.round(this.#currentTrip.totalBudget * rate);
      const input = document.getElementById("recBudgetInput");
      const slider = document.getElementById("recBudgetSlider");
      if (input) input.value = tripBudget;
      if (slider) {
        if (tripBudget > parseFloat(slider.max)) slider.max = tripBudget * 1.5;
        slider.value = tripBudget;
      }
      const travelSelect = document.getElementById("recTravelersCount");
      if (travelSelect) {
        const count = this.#currentTrip.travelers.length;
        if (count >= 1 && count <= 6) travelSelect.value = String(count);
      }
      const sym = CURRENCY_SYMBOLS[this.#recActiveCurrency] || "$";
      const curLabel = document.getElementById("recSliderCurrentLabel");
      if (curLabel) curLabel.textContent = `${sym}${tripBudget.toLocaleString()}`;
      this.#renderRecommendationsView();
      this.#showToast(`Matched budget of "${this.#currentTrip.name}" (${sym}${tripBudget.toLocaleString()})`, "info");
    }
    #handleRecCurrencyChange(newCurrency) {
      const oldCurrency = this.#recActiveCurrency;
      const oldRate = FX_RATES_TO_USD[oldCurrency] || 1;
      const newRate = FX_RATES_TO_USD[newCurrency] || 1;
      const sym = CURRENCY_SYMBOLS[newCurrency] || newCurrency;
      this.#recActiveCurrency = newCurrency;
      const symLabel = document.getElementById("recCurrencySymbolLabel");
      if (symLabel) symLabel.textContent = sym;
      const input = document.getElementById("recBudgetInput");
      const slider = document.getElementById("recBudgetSlider");
      const currentVal = parseFloat(input?.value) || 1500;
      const valUSD = currentVal / oldRate;
      const converted = Math.round(valUSD * newRate);
      let minBound = 100;
      let maxBound = 6e3;
      let step = 50;
      if (newCurrency === "INR") {
        minBound = 1e4;
        maxBound = 5e5;
        step = 1e3;
      } else if (newCurrency === "JPY") {
        minBound = 15e3;
        maxBound = 8e5;
        step = 2e3;
      } else if (newCurrency === "THB") {
        minBound = 3500;
        maxBound = 2e5;
        step = 500;
      } else if (newCurrency === "AED") {
        minBound = 400;
        maxBound = 22e3;
        step = 100;
      } else {
        minBound = Math.round(100 * newRate);
        maxBound = Math.round(6e3 * newRate);
      }
      if (input) input.value = converted;
      if (slider) {
        slider.min = minBound;
        slider.max = maxBound;
        slider.step = step;
        slider.value = converted;
      }
      const minLbl = document.getElementById("recSliderMinLabel");
      const maxLbl = document.getElementById("recSliderMaxLabel");
      const curLbl = document.getElementById("recSliderCurrentLabel");
      if (minLbl) minLbl.textContent = `${sym}${minBound.toLocaleString()}`;
      if (maxLbl) maxLbl.textContent = `${sym}${maxBound.toLocaleString()}+`;
      if (curLbl) curLbl.textContent = `${sym}${converted.toLocaleString()}`;
      this.#updateRecPresets();
      this.#renderRecommendationsView();
    }
    #updateRecPresets() {
      const container = document.getElementById("recPresetsContainer");
      if (!container) return;
      const curr = this.#recActiveCurrency;
      const sym = CURRENCY_SYMBOLS[curr] || "$";
      let presetValues = [];
      if (curr === "INR") {
        presetValues = [25e3, 5e4, 1e5, 2e5, 35e4];
      } else if (curr === "JPY") {
        presetValues = [75e3, 15e4, 3e5, 5e5, 75e4];
      } else if (curr === "THB") {
        presetValues = [15e3, 35e3, 7e4, 12e4, 18e4];
      } else if (curr === "AED") {
        presetValues = [1800, 3500, 7500, 12e3, 18e3];
      } else {
        presetValues = [500, 1e3, 2e3, 3500, 5e3];
      }
      const input = document.getElementById("recBudgetInput");
      const currentVal = parseFloat(input?.value) || 0;
      container.innerHTML = presetValues.map((val) => `
            <button type="button" class="rec-preset-btn ${Math.abs(currentVal - val) < val * 0.05 ? "active" : ""}" data-value="${val}">
                ${sym}${val.toLocaleString()}
            </button>
        `).join("");
      container.querySelectorAll(".rec-preset-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = parseFloat(btn.dataset.value);
          if (input) input.value = val;
          const slider = document.getElementById("recBudgetSlider");
          if (slider) slider.value = val;
          const curLabel = document.getElementById("recSliderCurrentLabel");
          if (curLabel) curLabel.textContent = `${sym}${val.toLocaleString()}`;
          container.querySelectorAll(".rec-preset-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.#renderRecommendationsView();
        });
      });
    }
    #renderRecommendationsView() {
      if (!this.#recEngine) return;
      const budgetInput = document.getElementById("recBudgetInput");
      const travelSelect = document.getElementById("recTravelersCount");
      const durSelect = document.getElementById("recDurationDays");
      const fitSelect = document.getElementById("recFitFilter");
      const sortSelect = document.getElementById("recSortFilter");
      const grid = document.getElementById("recommendationsGrid");
      const budget = parseFloat(budgetInput?.value) || 1500;
      const travelers = parseInt(travelSelect?.value, 10) || 2;
      const days = parseInt(durSelect?.value, 10) || 5;
      const fitFilter = fitSelect?.value || "all";
      const sortFilter = sortSelect?.value || "match";
      const currency = this.#recActiveCurrency;
      const fxRate = FX_RATES_TO_USD[currency] || 1;
      const sym = CURRENCY_SYMBOLS[currency] || "$";
      const recommendations = this.#recEngine.getRecommendations({
        budget,
        travelers,
        days,
        travelStyle: this.#recTravelStyle,
        vibe: this.#recActiveVibe,
        region: this.#recActiveRegion,
        fitFilter,
        fxRate,
        currencySymbol: sym
      });
      if (sortFilter === "cost_asc") {
        recommendations.sort((a, b) => a.displayTotal - b.displayTotal);
      } else if (sortFilter === "cost_desc") {
        recommendations.sort((a, b) => b.displayTotal - a.displayTotal);
      } else if (sortFilter === "rating") {
        recommendations.sort((a, b) => b.destination.rating - a.destination.rating);
      }
      const withinCount = recommendations.filter((r) => r.fitStatus === "within_budget" || r.fitStatus === "budget_saver").length;
      const saverCount = recommendations.filter((r) => r.fitStatus === "budget_saver").length;
      const stretchCount = recommendations.filter((r) => r.fitStatus === "stretch").length;
      const telemetryEl = document.getElementById("recTelemetryText");
      if (telemetryEl) {
        telemetryEl.textContent = `Found ${recommendations.length} matched destination(s) for ${sym}${budget.toLocaleString()} (${travelers} travelers \xB7 ${days} days \xB7 ${this.#recTravelStyle.toUpperCase()}) \u2014 ${withinCount} within budget, ${saverCount} savers, ${stretchCount} stretch.`;
      }
      const countEl = document.getElementById("recResultsCount");
      if (countEl) {
        countEl.textContent = `SHOWING ${recommendations.length} RECOMMENDATION${recommendations.length === 1 ? "" : "S"}`;
      }
      const tagsEl = document.getElementById("recCriteriaTags");
      if (tagsEl) {
        tagsEl.innerHTML = `
                <span class="rec-criteria-tag">\u{1F4B0} ${sym}${budget.toLocaleString()}</span>
                <span class="rec-criteria-tag">\u{1F465} ${travelers} Traveler${travelers > 1 ? "s" : ""}</span>
                <span class="rec-criteria-tag">\u23F1\uFE0F ${days} Days</span>
                <span class="rec-criteria-tag">\u2728 ${this.#recTravelStyle}</span>
                ${this.#recActiveVibe !== "all" ? `<span class="rec-criteria-tag">\u{1F334} ${this.#recActiveVibe}</span>` : ""}
                ${this.#recActiveRegion !== "all" ? `<span class="rec-criteria-tag">\u{1F5FA}\uFE0F ${this.#recActiveRegion}</span>` : ""}
            `;
      }
      if (!grid) return;
      if (recommendations.length === 0) {
        grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--radius-lg);">
                    <div style="font-size:44px;margin-bottom:12px;">\u{1F9ED}</div>
                    <h3 style="font-size:18px;color:#FFFFFF;margin-bottom:6px;">No Destinations Found</h3>
                    <p style="font-size:13px;color:var(--text-muted);max-width:480px;margin:0 auto 18px auto;">
                        No destinations matched your criteria with ${sym}${budget.toLocaleString()} budget and current filters. Try increasing your target budget, choosing "All Vibes", or switching travel style to "Backpacker".
                    </p>
                    <button type="button" class="btn btn-secondary" id="recResetFiltersBtn">Reset All Filters</button>
                </div>
            `;
        document.getElementById("recResetFiltersBtn")?.addEventListener("click", () => {
          document.getElementById("recBudgetInput").value = Math.round(2500 * fxRate);
          document.getElementById("recBudgetSlider").value = Math.round(2500 * fxRate);
          document.querySelectorAll("#recVibeChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.vibe === "all"));
          document.querySelectorAll("#recRegionChips .chip").forEach((c) => c.classList.toggle("active", c.dataset.region === "all"));
          document.getElementById("recFitFilter").value = "all";
          this.#recActiveVibe = "all";
          this.#recActiveRegion = "all";
          this.#renderRecommendationsView();
        });
        return;
      }
      grid.innerHTML = recommendations.map((rec) => {
        const dest = rec.destination;
        const costs = rec.displayCosts;
        const total = rec.displayTotal;
        const flightPct = total > 0 ? Math.max(8, Math.round(costs.flight / total * 100)) : 25;
        const hotelPct = total > 0 ? Math.max(8, Math.round(costs.hotel / total * 100)) : 25;
        const foodPct = total > 0 ? Math.max(8, Math.round(costs.food / total * 100)) : 25;
        const actPct = total > 0 ? Math.max(8, Math.round(costs.activities / total * 100)) : 15;
        const bufferPct = Math.max(0, 100 - flightPct - hotelPct - foodPct - actPct);
        const deltaText = rec.displayDelta >= 0 ? `+${sym}${rec.displayDelta.toLocaleString()} surplus` : `-${sym}${Math.abs(rec.displayDelta).toLocaleString()} stretch`;
        const deltaClass = rec.displayDelta >= 0 ? "surplus" : "stretch";
        return `
                <div class="rec-card" data-id="${dest.id}">
                    <div class="rec-card-media">
                        <img src="${dest.imageUrl}" alt="${this.#escapeHtml(dest.name)}" class="rec-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'">
                        <div class="rec-card-overlay"></div>
                        <div class="rec-card-top-badges">
                            <span class="rec-badge-match ${rec.statusClass}">
                                ${rec.matchPercentage}% Match \xB7 ${rec.statusLabel}
                            </span>
                            <span class="rec-badge-rating">
                                <span>\u2605</span><span>${dest.rating.toFixed(1)}</span>
                            </span>
                        </div>
                        <div class="rec-card-media-title">
                            <h3 class="rec-card-name">${this.#escapeHtml(dest.name)}</h3>
                            <div class="rec-card-location">
                                <span>\u{1F4CD}</span><span>${this.#escapeHtml(dest.country)}</span>
                                <span style="margin:0 4px;">\xB7</span>
                                <span style="font-family:var(--font-mono);font-size:10px;background:rgba(255,255,255,0.12);padding:1px 5px;border-radius:3px;">${dest.tier}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rec-card-body">
                        <p class="rec-card-tagline">${this.#escapeHtml(dest.tagline)}</p>

                        <!-- Price Breakdown Box -->
                        <div class="rec-price-box">
                            <div class="rec-price-primary-row">
                                <div>
                                    <span class="rec-price-amount">${sym}${total.toLocaleString()}</span>
                                    <span class="rec-price-label">estimated total</span>
                                </div>
                                <span class="rec-price-delta ${deltaClass}">${deltaText}</span>
                            </div>
                            <div class="rec-price-sub-row">
                                <span>${sym}${rec.displayPerPerson.toLocaleString()} / traveler</span>
                                <span>${sym}${rec.displayDaily.toLocaleString()} / day</span>
                            </div>
                        </div>

                        <!-- Segmented Category Cost Bar -->
                        <div class="rec-category-bar-wrap">
                            <div class="rec-category-bar" title="Flight: ${sym}${costs.flight} | Hotel: ${sym}${costs.hotel} | Food: ${sym}${costs.food} | Activities: ${sym}${costs.activities}">
                                <div class="rec-cat-segment rec-cat-flight" style="width:${flightPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-hotel"  style="width:${hotelPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-food"   style="width:${foodPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-act"    style="width:${actPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-buffer" style="width:${bufferPct}%;"></div>
                            </div>
                            <div class="rec-category-legend">
                                <span><span style="color:#38BDF8;">\u2708\uFE0F</span> ${sym}${costs.flight}</span>
                                <span><span style="color:#A78BFA;">\u{1F3E8}</span> ${sym}${costs.hotel}</span>
                                <span><span style="color:#F472B6;">\u{1F37D}\uFE0F</span> ${sym}${costs.food}</span>
                                <span><span style="color:#34D399;">\u{1F39F}\uFE0F</span> ${sym}${costs.activities}</span>
                            </div>
                        </div>

                        <!-- Highlights List -->
                        <ul class="rec-highlights-list">
                            ${dest.highlights.slice(0, 3).map((h) => `
                                <li><span class="bullet">\u2726</span><span>${this.#escapeHtml(h)}</span></li>
                            `).join("")}
                        </ul>

                        <!-- Vibe & Season Meta -->
                        <div class="rec-meta-row">
                            <span class="rec-meta-season">\u{1F5D3}\uFE0F ${this.#escapeHtml(dest.bestSeason)}</span>
                            <div class="rec-vibe-tags">
                                ${dest.vibes.slice(0, 3).map((v) => `
                                    <span class="rec-vibe-tag">${this.#escapeHtml(v)}</span>
                                `).join("")}
                            </div>
                        </div>
                    </div>

                    <div class="rec-card-footer">
                        <button type="button" class="btn btn-primary rec-plan-btn" data-id="${dest.id}">
                            <span>Plan Trip Here</span> <span>\u{1F680}</span>
                        </button>
                        <button type="button" class="btn btn-secondary btn-details rec-details-btn" data-id="${dest.id}" title="Deep dive destination intel">
                            \u2139\uFE0F
                        </button>
                    </div>
                </div>
            `;
      }).join("");
      grid.querySelectorAll(".rec-plan-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const destId = btn.dataset.id;
          const rec = recommendations.find((r) => r.destination.id === destId);
          if (rec) this.#openPlanModalForRecommendation(rec);
        });
      });
      grid.querySelectorAll(".rec-details-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const destId = btn.dataset.id;
          const rec = recommendations.find((r) => r.destination.id === destId);
          if (rec) this.#openDetailsModalForRecommendation(rec);
        });
      });
    }
    #openPlanModalForRecommendation(rec) {
      this.#recSelectedResult = rec;
      const dest = rec.destination;
      const sym = rec.currencySymbol || "$";
      document.getElementById("recPlanDestId").value = dest.id;
      const preview = document.getElementById("recPlanPreviewCard");
      if (preview) {
        preview.innerHTML = `
                <img src="${dest.imageUrl}" alt="${this.#escapeHtml(dest.name)}" class="rec-plan-preview-img" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'">
                <div>
                    <div class="rec-plan-preview-name">${this.#escapeHtml(dest.name)}, ${this.#escapeHtml(dest.country)}</div>
                    <div class="rec-plan-preview-meta">
                        \u2605 ${dest.rating.toFixed(1)} \xB7 ${rec.costBreakdownUSD.days} Days \xB7 ${rec.costBreakdownUSD.travelers} Traveler(s) \xB7 ${rec.strategyName}
                    </div>
                    <div class="rec-plan-preview-cost">
                        Estimated Cost: ${sym}${rec.displayTotal.toLocaleString()} (${rec.statusLabel})
                    </div>
                </div>
            `;
      }
      document.getElementById("recPlanTripName").value = `${dest.name} Getaway`;
      const tomorrow = /* @__PURE__ */ new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = new Date(tomorrow);
      endDate.setDate(tomorrow.getDate() + rec.costBreakdownUSD.days);
      document.getElementById("recPlanStartDate").value = tomorrow.toISOString().split("T")[0];
      document.getElementById("recPlanEndDate").value = endDate.toISOString().split("T")[0];
      document.getElementById("recPlanBudget").value = rec.displayBudget || rec.displayTotal;
      if (this.#currentTrip && this.#currentTrip.travelers.length > 0) {
        document.getElementById("recPlanTravelers").value = this.#currentTrip.travelers.map((t) => t.name).join(", ");
      } else {
        const count = rec.costBreakdownUSD.travelers;
        if (count === 1) document.getElementById("recPlanTravelers").value = "You (Solo Explorer)";
        else if (count === 2) document.getElementById("recPlanTravelers").value = "Alex, Sarah";
        else document.getElementById("recPlanTravelers").value = "Alex, Sarah, David, Priya".split(", ").slice(0, count).join(", ");
      }
      this.#openModal("recommendationPlanModal");
    }
    #openDetailsModalForRecommendation(rec) {
      this.#recSelectedResult = rec;
      const dest = rec.destination;
      const sym = rec.currencySymbol || "$";
      const costs = rec.displayCosts;
      document.getElementById("recDetailsModalTitle").textContent = `${dest.name}, ${dest.country}`;
      document.getElementById("recDetailsModalSubtitle").textContent = `${dest.tagline} \xB7 ${dest.tier} Tier`;
      const body = document.getElementById("recDetailsModalBody");
      if (body) {
        body.innerHTML = `
                <div style="position:relative;height:160px;border-radius:var(--radius-md);overflow:hidden;margin-bottom:16px;">
                    <img src="${dest.imageUrl}" style="width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.85), transparent);"></div>
                    <div style="position:absolute;bottom:10px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-end;">
                        <div>
                            <span style="font-family:var(--font-mono);font-size:11px;color:#FDE047;letter-spacing:0.08em;text-transform:uppercase;">${dest.region}</span>
                            <h3 style="font-size:20px;color:#FFFFFF;margin:0;">${this.#escapeHtml(dest.name)}</h3>
                        </div>
                        <span style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:#FFFFFF;">
                            ${sym}${rec.displayTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                <p style="font-size:13px;line-height:1.6;color:var(--text-secondary);margin-bottom:16px;">
                    ${this.#escapeHtml(dest.description)}
                </p>

                <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
                    <h4 style="font-size:12px;font-family:var(--font-mono);color:#FFFFFF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
                        \u2726 Itemized Estimated Budget (${rec.costBreakdownUSD.days} Days \xB7 ${rec.costBreakdownUSD.travelers} Travelers)
                    </h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>\u2708\uFE0F Flight &amp; Long-dist Transit:</span>
                            <strong style="font-family:var(--font-mono);color:#38BDF8;">${sym}${costs.flight.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>\u{1F3E8} Lodging (${rec.costBreakdownUSD.nights} Nts, ${rec.costBreakdownUSD.rooms} Rm):</span>
                            <strong style="font-family:var(--font-mono);color:#A78BFA;">${sym}${costs.hotel.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>\u{1F37D}\uFE0F Dining &amp; Street Cuisine:</span>
                            <strong style="font-family:var(--font-mono);color:#F472B6;">${sym}${costs.food.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>\u{1F39F}\uFE0F Tours, Tickets &amp; Excursions:</span>
                            <strong style="font-family:var(--font-mono);color:#34D399;">${sym}${costs.activities.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;grid-column:1/-1;">
                            <span>\u{1F6E1}\uFE0F Contingency &amp; Incidentals (${Math.round(costs.contingency / rec.displayTotal * 100)}%):</span>
                            <strong style="font-family:var(--font-mono);color:#94A3B8;">${sym}${costs.contingency.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:12px;">
                    <div>
                        <strong style="display:block;margin-bottom:6px;color:#FFFFFF;">\u2B50 Must-Experience Sights</strong>
                        <ul style="padding-left:18px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                            ${dest.highlights.map((h) => `<li>${this.#escapeHtml(h)}</li>`).join("")}
                        </ul>
                    </div>
                    <div>
                        <strong style="display:block;margin-bottom:6px;color:#FFFFFF;">\u{1F5D3}\uFE0F Travel Intel</strong>
                        <div style="color:var(--text-secondary);line-height:1.6;">
                            \u2022 <strong>Best Season:</strong> ${this.#escapeHtml(dest.bestSeason)}<br>
                            \u2022 <strong>Ideal Duration:</strong> ${dest.idealDaysMin} to ${dest.idealDaysMax} Days<br>
                            \u2022 <strong>Vibe Profile:</strong> ${dest.vibes.join(", ")}<br>
                            \u2022 <strong>Travel Strategy:</strong> ${rec.strategyName} (${rec.strategyIcon})
                        </div>
                    </div>
                </div>
            `;
      }
      this.#openModal("recommendationDetailsModal");
    }
    #handleRecPlanFormSubmit() {
      try {
        if (!this.#recSelectedResult) throw new Error("No destination selected.");
        const destId = document.getElementById("recPlanDestId").value;
        const tripName = document.getElementById("recPlanTripName").value;
        const startDate = document.getElementById("recPlanStartDate").value;
        const endDate = document.getElementById("recPlanEndDate").value;
        const budget = document.getElementById("recPlanBudget").value;
        const travelersInput = document.getElementById("recPlanTravelers").value;
        const includeExpenses = document.getElementById("recPlanIncludeExpenses").checked;
        const travelerNames = travelersInput.split(",").map((s) => s.trim()).filter(Boolean);
        if (travelerNames.length === 0) travelerNames.push("Explorer");
        const newTrip = this.#recEngine.createTripFromRecommendation(
          this.#recSelectedResult,
          tripName,
          travelerNames,
          includeExpenses
        );
        newTrip.setDates(startDate, endDate);
        newTrip.setTotalBudget(budget);
        this.#trips.push(newTrip);
        this.#currentTrip = newTrip;
        this.#saveState();
        this.#closeModal("recommendationPlanModal");
        this.#switchView("dashboard");
        this.#renderAll();
        this.#showToast(
          `\u{1F389} Trip "${newTrip.name}" created with ${newTrip.expenses.length} recommended expense items!`,
          "success"
        );
      } catch (err) {
        this.#showToast(err.message, "error");
      }
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.tripApp = new TripBudgetApp();
    });
  } else {
    window.tripApp = new TripBudgetApp();
  }
})();
