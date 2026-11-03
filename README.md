# ✈️ Trip Budget Planner

> A modern, full-stack travel budgeting, smart expense splitting, and destination recommendation application engineered with Object-Oriented architecture, design patterns, and an astronomical luxury aesthetic.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](#)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](#)
[![Architecture](https://img.shields.io/badge/Architecture-OOP%20%26%20Design%20Patterns-6366F1)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)

---

## 🎯 Overview

Planning trips with companions requires estimating realistic costs, tracking categorical expenses, monitoring budget thresholds in real time, and equitably settling shared expenses. 

**Trip Budget Planner** solves these challenges through a dual-stack software implementation:
1. **Interactive Web Application**: Pure ES6+ JavaScript modules, client-side persistence, SVG data visualizations, and an obsidian "Star Party" luxury design system.
2. **Enterprise Java Application**: Modular Java Swing desktop interface with relational 3NF persistence, JDBC DAO architecture, and simulated multi-user authentication.

Both implementations share the same underlying Object-Oriented domain models, business logic formulas, and algorithmic debt-settlement engine.

---

## ✨ Key Features

- **🧭 Trip & Traveler Management**:
  - Encapsulated trip entities tracking destination, dates, currency, and real-time budget utilization.
  - Multi-traveler support with dedicated color avatars and expense ownership tracking.
- **💸 Polymorphic Expense Engine**:
  - Categorized expenses: **Flight, Hotel, Food, Transport, Activities, and Shopping**.
  - Specialized financial calculations per category (baggage fees, hotel taxes, tip allocations, equipment rentals).
- **📊 Real-Time Financial Telemetry**:
  - Live budget usage meters with starlight glow animations and automatic threshold warnings (≥ 80% warning, > 100% overrun).
  - SVG category breakdown donut charts and daily expenditure time-series pillars.
- **🤝 Smart Debt Settlement ("Who Owes Whom")**:
  - Calculates individual net balances based on payer vs. fair share across selected participants.
  - Solves the debt settlement graph using an optimal **Greedy Min-Cash-Flow Algorithm** to minimize total monetary transfers.
- **🌍 "Where Can I Go?" Budget Recommendation Engine**:
  - Multi-criteria destination discovery matching user budget, trip duration, traveler count, and travel style.
  - **Strategy Pattern** with pluggable travel profiles: **Backpacker (Budget)**, **Moderate (Comfort)**, and **Luxury (Resorts)**.
  - **1-Click Trip Generator**: Automatically generates a fully configured Trip complete with populated polymorphic expenses derived from destination benchmarks.

---

## 🧠 Software Architecture & Design Patterns

| Design Principle / Pattern | Role in Architecture | Implementation Reference |
| :--- | :--- | :--- |
| **Encapsulation** | Strict private fields (`#id`, `#title`, `#baseAmount`, `#budget`) guard internal state against uncontrolled mutation. Controlled via validated getters and setters. | [`Traveler.js`](./js/models/Traveler.js), [`Expense.js`](./js/models/Expense.js), [`Trip.js`](./js/models/Trip.js), [`Destination.js`](./js/models/Destination.js) |
| **Inheritance** | Abstract `Expense` base class defines core contract; specialized domain subclasses extend it with category-specific data. | [`ExpenseSubclasses.js`](./js/models/ExpenseSubclasses.js), [`Expense.java`](./java/src/com/tripbudget/models/Expense.java) |
| **Polymorphism** | Subclasses override `calculateTotalCost()` dynamically. Aggregation functions invoke this method at runtime without `if/else` or `instanceof` checks. | [`ExpenseSubclasses.js`](./js/models/ExpenseSubclasses.js), [`FlightExpense.java`](./java/src/com/tripbudget/models/FlightExpense.java) |
| **Interfaces** | Clear contracts (`Billable`, `Splittable`, `Validatable`, `Reportable`, `Searchable`) decoupled from concrete implementations. | [`Billable.java`](./java/src/com/tripbudget/interfaces/Billable.java), [`Validatable.java`](./java/src/com/tripbudget/interfaces/Validatable.java) |
| **Exception Handling** | Robust domain exception hierarchy (`TripBudgetException`, `BudgetExceededException`, `ValidationException`, `InvalidExpenseException`). | [`TripBudgetException.java`](./java/src/com/tripbudget/exceptions/TripBudgetException.java), [`BudgetExceededException.java`](./java/src/com/tripbudget/exceptions/BudgetExceededException.java) |
| **String Processing** | Advanced string manipulation with `StringBuilder`, thread-safe `StringBuffer`, `String.format`, regex patterns, and ASCII receipt formatting. | [`StringUtils.java`](./java/src/com/tripbudget/util/StringUtils.java), [`ReceiptFormatter.java`](./java/src/com/tripbudget/util/ReceiptFormatter.java) |
| **Strategy Pattern** | `TravelStrategy` abstract contract allows pluggable runtime calculation of lodging, transit, and food cost multipliers. | [`TravelStrategy.js`](./js/models/TravelStrategy.js), [`BackpackerStrategy.java`](./java/src/com/tripbudget/models/BackpackerStrategy.java) |
| **Factory Pattern** | `ExpenseFactory` and `TravelStrategyFactory` encapsulate object instantiation based on category tokens and user preferences. | [`ExpenseSubclasses.js`](./js/models/ExpenseSubclasses.js), [`ExpenseFactory.java`](./java/src/com/tripbudget/models/ExpenseFactory.java) |
| **Composition** | A `Trip` *has-a* collection of `Traveler` instances and *has-a* collection of `Expense` items. | [`Trip.js`](./js/models/Trip.js), [`Trip.java`](./java/src/com/tripbudget/models/Trip.java) |
| **DAO Pattern** | Decouples UI presentation from relational database queries via dedicated Data Access Objects. | [`UserDAO.java`](./java/src/com/tripbudget/dao/UserDAO.java), [`TripDAO.java`](./java/src/com/tripbudget/dao/TripDAO.java) |

---

## 🏗️ Class Hierarchy & Domain Model

```
                       ┌────────────────────────┐
                       │        Traveler        │
                       ├────────────────────────┤
                       │ - id: string           │
                       │ - name: string         │
                       │ - email: string        │
                       │ - color: string        │
                       └────────────────────────┘
                                   ▲
                                   │ (Composition: has many)
                                   │
┌──────────────────────────────────┴──────────────────────────────────┐
│                                 Trip                                 │
├──────────────────────────────────────────────────────────────────────┤
│ - id: string                                                         │
│ - name: string                                                       │
│ - destination: string                                                │
│ - totalBudget: number                                                │
│ - travelers: Traveler[]                                              │
│ - expenses: Expense[]                                                │
├──────────────────────────────────────────────────────────────────────┤
│ + getTotalSpent(): number        // Polymorphic dynamic dispatch     │
│ + getRemainingBudget(): number                                       │
│ + getBudgetUsagePercentage(): number                                 │
│ + getBudgetStatus(): Object                                          │
│ + getCategoryBreakdown(): Object                                     │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼ (Composition: has many)
                 ┌───────────────────────────────────┐
                 │          Expense (Base)           │
                 ├───────────────────────────────────┤
                 │ #id, #title, #baseAmount, #date   │
                 │ #payerId, #participantIds[]       │
                 ├───────────────────────────────────┤
                 │ + calculateTotalCost(): number    │ (Abstract)
                 └─────────────────▲─────────────────┘
                                   │
        ┌──────────────┬───────────┴───┬──────────────┬──────────────┐
        │              │               │              │              │
┌───────┴──────┐┌──────┴───────┐┌──────┴──────┐┌──────┴───────┐┌─────┴────────┐
│FlightExpense ││ HotelExpense ││ FoodExpense ││TransportExp. ││ActivityExp.   │
├──────────────┤├──────────────┤├─────────────┤├──────────────┤├───────────────┤
│+baggageFee   ││+nights       ││+tipAmount   ││+tollCharges  ││+equipmentFee  │
│+airportTax   ││+taxPercent   ││+taxAmount   ││+parkingFee   ││               │
└──────────────┘└──────────────┘└─────────────┘└──────────────┘└───────────────┘
```

---

## 🔬 Polymorphic Calculation Formulas

Each expense subclass implements distinct financial domain logic:

1. **`FlightExpense`**:
   $$\text{Total Cost} = \text{baseAmount} + \text{baggageFee} + \text{airportTax}$$
2. **`HotelExpense`**:
   $$\text{Total Cost} = (\text{baseAmount} \times \text{nights}) \times \left(1 + \frac{\text{taxPercent}}{100}\right)$$
3. **`FoodExpense`**:
   $$\text{Total Cost} = \text{baseAmount} + \text{tipAmount} + \text{taxAmount}$$
4. **`TransportExpense`**:
   $$\text{Total Cost} = \text{baseAmount} + \text{tollCharges} + \text{parkingFee}$$
5. **`ActivityExpense`**:
   $$\text{Total Cost} = \text{baseAmount} + \text{equipmentFee}$$
6. **`ShoppingExpense`**:
   $$\text{Total Cost} = \max\left(0, \text{baseAmount} + \text{salesTax} - \text{discount}\right)$$

---

## 🤝 Debt Settlement Algorithm (`ExpenseSplitter`)

The `ExpenseSplitter` service computes individual net balances:
$$\text{Net Balance} = \text{Total Paid by Traveler} - \text{Total Fair Share}$$

- **Creditor ($\text{Net} > 0$)**: Entitled to receive money.
- **Debtor ($\text{Net} < 0$)**: Needs to pay into the pool.

### Greedy Min-Cash-Flow Algorithm:
1. Identify all creditors and debtors; sort both descending by absolute net balance.
2. Match the largest debtor with the largest creditor:
   $$\text{Payment} = \min\left(|\text{Debtor Balance}|, \text{Creditor Balance}\right)$$
3. Emit transaction: `Debtor pays Creditor $Payment`.
4. Update balances and repeat until all debts are settled to within $\$0.01$.

---

## 🚀 Getting Started

### 1. Web Application (HTML5 / ES6 JavaScript)

Serve the directory with any static HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Open `http://localhost:8000` in your web browser.

#### Running Web Automated Tests:
```bash
node test_oop.js
```

---

### 2. Java Desktop Application (Swing GUI + JDBC)

#### Quick Launch:
```powershell
# PowerShell
.\run_java.ps1

# Command Prompt
.\run_java.bat
```

#### Running Java Automated Tests:
```cmd
.\test_oop_java.bat
```

---

## 📁 Repository Structure

```
.
├── index.html                   # Main web dashboard interface
├── login.html                   # Standalone authentication portal
├── README.md                    # Technical documentation
├── run_java.bat                 # Java desktop launcher (Batch)
├── run_java.ps1                 # Java desktop launcher (PowerShell)
├── test_oop.js                  # Automated JavaScript test suite
├── test_oop_java.bat            # Automated Java test suite
├── css/
│   └── style.css                # Astronomical Star Party design system
├── js/
│   ├── app.js                   # Application controller & DOM bindings
│   ├── bundle.js                # Bundled distribution script
│   ├── models/                  # Domain entity models (Encapsulation)
│   └── services/                # Recommendation engine & debt settlement
└── java/
    ├── README.md                # Java application documentation
    └── src/com/tripbudget/
        ├── Main.java            # Java entry point
        ├── TestOOP.java         # Automated Java test suite
        ├── dao/                 # JDBC Data Access Objects
        ├── db/                  # Connection singleton & schema initializer
        ├── exceptions/          # Custom domain exception hierarchy
        ├── gui/                 # Swing presentation layer & dialogs
        ├── interfaces/          # Domain contracts (Billable, Validatable, etc.)
        ├── models/              # OOP domain entities & Strategy patterns
        ├── services/            # Recommendation engine & split algorithms
        └── util/                # String manipulation, regex & receipt formatters
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
