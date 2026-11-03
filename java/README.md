# ☕ Java Desktop Application: Trip Budget Planner & Expense Manager

A robust, enterprise-structured **Java Desktop Application** for group travel budget planning, expense management, smart debt settlements, and budget travel recommendations.

---

## 🏗️ Technical Architecture & Component Breakdown

| Layer | Architecture Pattern | Implementation in this Application |
|---|---|---|
| **Presentation Layer** | MVC / Event-Driven Swing | Built with modern **Java Swing & AWT**. Features `LoginFrame`, `RegisterDialog`, `DashboardFrame`, `AddExpenseDialog`, `SplitCalculatorDialog`, `RecommendationDialog` (Budget Travel Advisor), real-time KPI budget cards, interactive `JTable`, animated `JProgressBar`, and receipt dialogs. |
| **Relational Database** | 3NF Relational Model | Normalized database schema comprising 5 tables: `users`, `trips`, `travelers`, `expenses`, and `expense_splits`. Implements Primary Keys, Foreign Keys with `ON DELETE CASCADE`, `CHECK` constraints, and automatic seed data. |
| **Persistence Layer** | JDBC & DAO Pattern | **Singleton Pattern** in `DBConnection.java`. Implements parameterized `PreparedStatement` to defend against SQL Injection, clean DAO Pattern (`UserDAO`, `TripDAO`, `ExpenseDAO`, `TravelerDAO`), and automatic fallback to an in-memory embedded relational store when external JDBC drivers are absent. |

---

## 📦 Package Structure

```
com.tripbudget/
├── Main.java                        # Application entry point
├── TestOOP.java                     # Comprehensive automated unit test suite
├── dao/                             # Data Access Object pattern implementation
│   ├── ExpenseDAO.java
│   ├── TravelerDAO.java
│   ├── TripDAO.java
│   └── UserDAO.java
├── db/                              # Database connection singleton & schema runner
│   └── DBConnection.java
├── exceptions/                      # Domain exception hierarchy (checked/unchecked)
│   ├── TripBudgetException.java     # Base domain exception (with timestamp & error code)
│   ├── BudgetExceededException.java # Thrown when expense exceeds allocated trip budget
│   ├── InvalidExpenseException.java # Thrown when financial amounts or fields are invalid
│   ├── ValidationException.java     # Thrown when entity attributes fail domain validation
│   ├── AuthenticationException.java # Thrown when user credentials or authorization fail
│   └── TripNotFoundException.java   # Thrown when queried Trip ID does not exist
├── gui/                             # Java Swing presentation layer & dialogs
│   ├── AddExpenseDialog.java
│   ├── AddTripDialog.java
│   ├── DashboardFrame.java
│   ├── LoginFrame.java
│   ├── RecommendationDialog.java
│   ├── RegisterDialog.java
│   ├── SplitCalculatorDialog.java
│   └── VivaGuideDialog.java
├── interfaces/                      # Core domain contracts
│   ├── Billable.java                # Financial total calculation & receipt contract
│   ├── Splittable.java              # Group cost division & fair share contract
│   ├── Validatable.java             # Structural validation contract
│   ├── Reportable.java              # Printable text report generation contract
│   └── Searchable.java              # Case-insensitive query matching contract
├── models/                          # Domain entities & Strategy pattern
│   ├── Expense.java                 # Base class (implements Billable, Splittable, Validatable, Searchable)
│   ├── FlightExpense.java
│   ├── HotelExpense.java
│   ├── FoodExpense.java
│   ├── TransportExpense.java
│   ├── ActivityExpense.java
│   ├── ShoppingExpense.java
│   ├── Destination.java             # Implements Searchable
│   ├── Traveler.java                # Implements Validatable, Searchable
│   ├── Trip.java                    # Implements Validatable, Reportable, Searchable
│   ├── User.java                    # Implements Validatable
│   ├── TravelStrategy.java          # Abstract Strategy contract
│   ├── BackpackerStrategy.java      # Concrete Strategy
│   ├── ModerateStrategy.java        # Concrete Strategy
│   └── LuxuryStrategy.java          # Concrete Strategy
├── services/                        # Service layer & business logic
│   ├── ExpenseSplitter.java         # Greedy debt simplification algorithm
│   └── RecommendationEngine.java    # Multi-criteria budget travel advisor
└── util/                            # String utilities & text report formatters
    ├── StringUtils.java             # String methods, StringBuilder, StringBuffer, regex
    └── ReceiptFormatter.java        # ASCII receipt and statement formatting
```

---

## 🔌 Custom Interfaces (`com.tripbudget.interfaces`)

1. **`Billable`**:
   - `calculateTotalAmount()`: Returns total cost including category-specific taxes and fees.
   - `getCategory()`: Returns category identifier.
   - `getFormattedReceipt()`: Returns itemized printable text receipt.
   - Implemented by `Expense` (and polymorphic subclasses).

2. **`Splittable`**:
   - `calculateFairShare(int numberOfParticipants)`: Computes per-traveler fair share.
   - `isEligibleForSplit()`: Confirms item can be divided among friends.
   - Implemented by `Expense`.

3. **`Validatable`**:
   - `validate() throws TripBudgetException`: Enforces non-blank fields, positive numerical amounts, and valid formats.
   - Implemented by `Expense`, `Trip`, `Traveler`, `User`.

4. **`Reportable`**:
   - `generateSummaryReport()`: Emits a structured multi-line report.
   - Implemented by `Trip`.

5. **`Searchable`**:
   - `matchesQuery(String query)`: Performs null-safe, case-insensitive keyword filtering.
   - Implemented by `Expense`, `Destination`, `Trip`, `Traveler`.

---

## ⚠️ Exception Handling (`com.tripbudget.exceptions`)

The application defines a structured custom exception hierarchy rooted at `TripBudgetException`:

```
                    ┌─────────────────────────┐
                    │   java.lang.Exception   │
                    └────────────▲────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   TripBudgetException   │
                    │   - errorCode: String   │
                    │   - timestamp: DateTime │
                    └────────────▲────────────┘
                                 │
       ┌─────────────────┬───────┴─────────┬──────────────────┐
┌──────┴──────────────┐┌─┴───────────────┐┌┴────────────────┐┌┴───────────────────┐
│BudgetExceededExcept.││InvalidExpenseEx.││ValidationExcept.││AuthenticationEx.   │
├─────────────────────┤├─────────────────┤├─────────────────┤├────────────────────┤
│+excessAmount: double││+attemptedAmount ││+fieldName:String││+username: String   │
└─────────────────────┘└─────────────────┘└─────────────────┘└────────────────────┘
```

- **`try-catch-finally` Pattern**:
  Used extensively in `AddExpenseDialog`, `AddTripDialog`, and `TestOOP` to catch specific domain exceptions (`ValidationException`, `InvalidExpenseException`, `BudgetExceededException`), display clear alerts, and execute cleanup in `finally` blocks.

---

## 🔤 Strings & String Processing (`com.tripbudget.util`)

Demonstrates comprehensive Java string capabilities:
- **`String` Methods**: `trim()`, `substring()`, `toUpperCase()`, `toLowerCase()`, `split()`, `join()`, `replace()`.
- **`StringBuilder`**: Used in `ReceiptFormatter.java` and `StringUtils.java` for high-performance receipt assembly, financial statements, and tabular data without intermediate string garbage.
- **`StringBuffer`**: Demonstrates thread-safe synchronized string accumulation for audit logging via `createThreadSafeLogEntry()`.
- **`String.format()`**: Precision formatting with column alignments (`%-36s`, `%14s`), decimal padding (`$%,.2f`), and currency presentation.
- **Regex Validation**: Standard RFC-compliant email validation pattern (`isValidEmail`) and positive currency matching (`isValidCurrency`).
- **String Transformations**:
  - `capitalizeWords("beachside villa resort")` $\rightarrow$ `"Beachside Villa Resort"`
  - `extractInitials("Sarah Chen")` $\rightarrow$ `"SC"`
  - `maskEmail("alex.rivera@example.com")` $\rightarrow$ `"a***a@example.com"`
  - `padRight()` / `padLeft()` for columnar alignment.

---

## 🚀 How to Run the Java Application

### ⚡ 1-Click Launch:
In PowerShell:
```powershell
.\run_java.ps1
```
Or in Command Prompt:
```cmd
.\run_java.bat
```

---

### 🔑 Demo Login Credentials
- **Username:** `demo`
- **Password:** `demo123`
*(Or click the **Auto-Fill Demo User** button directly on the login screen!)*

---

### 🧪 Running Java Automated Unit Tests
To run the automated Object-Oriented test suite verifying all 8 units (Encapsulation, Inheritance, Polymorphism, Composition, Strategy Pattern, Interfaces, Exception Handling, Strings):
```cmd
.\test_oop_java.bat
```
