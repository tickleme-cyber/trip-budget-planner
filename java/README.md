# ☕ Java Desktop Application: Trip Budget Planner & Expense Manager

A robust, enterprise-structured **Java Desktop Application** for group travel budget planning, expense management, and smart debt settlements.

---

## 🏗️ Technical Architecture & Component Breakdown

| Layer | Architecture Pattern | Implementation in this Application |
|---|---|---|
| **Presentation Layer** | MVC / Event-Driven Swing | Built with modern **Java Swing & AWT**. Features `LoginFrame`, `RegisterDialog`, `DashboardFrame`, `AddExpenseDialog`, `SplitCalculatorDialog`, `RecommendationDialog` (Budget Travel Advisor), real-time KPI budget cards, interactive `JTable`, and animated `JProgressBar`. |
| **Relational Database** | 3NF Relational Model | Normalized database schema comprising 5 tables: `users`, `trips`, `travelers`, `expenses`, and `expense_splits`. Implements Primary Keys, Foreign Keys with `ON DELETE CASCADE`, `CHECK` constraints, and automatic seed data. |
| **Persistence Layer** | JDBC & DAO Pattern | **Singleton Pattern** in `DBConnection.java`. Implements parameterized `PreparedStatement` to defend against SQL Injection, clean DAO Pattern (`UserDAO`, `TripDAO`, `ExpenseDAO`, `TravelerDAO`), and automatic fallback to an in-memory embedded relational store when external JDBC drivers are absent. |

---

## 🧠 Object-Oriented Design & Design Patterns

- **Encapsulation**: Private fields (`userId`, `passwordHash`, `baseFlightCost`, etc.) protected by strict public accessors, mutators, and domain validation across `User`, `Trip`, `Traveler`, `Expense`, and `Destination`.
- **Inheritance**: Subclasses (`FlightExpense`, `HotelExpense`, `FoodExpense`, `ActivityExpense`, `TransportExpense`, `ShoppingExpense`) inherit common expense properties from abstract base class `Expense`.
- **Polymorphism**: Dynamic method dispatch overriding `calculateTotalAmount()` across expense subclasses and travel strategy multipliers.
- **Strategy Pattern**: `TravelStrategy` abstract class with concrete `BackpackerStrategy`, `ModerateStrategy`, and `LuxuryStrategy` adjusting accommodation, meal, and local transit costs dynamically.
- **Factory Pattern**: `ExpenseFactory` and `TravelStrategyFactory` decoupling object creation from business logic.
- **Composition**: `Trip` aggregates and manages collections of `Traveler` and `Expense` objects. `RecommendationEngine` manages collections of `Destination` models.
- **DAO Pattern**: Clean separation of business logic, GUI layer, and JDBC data persistence layer.

---

## 🗄️ Relational Database Schema (`schema.sql`)

1. **`users`**: `(user_id, username, password_hash, full_name, email, role, created_at)`
2. **`trips`**: `(trip_id, user_id, title, destination, start_date, end_date, total_budget, currency, status, created_at)`
3. **`travelers`**: `(traveler_id, trip_id, name, email, color_code, created_at)`
4. **`expenses`**: `(expense_id, trip_id, payer_id, payer_name, title, category, base_amount, tax_or_fees, total_amount, expense_date, notes)`
5. **`expense_splits`**: `(split_id, expense_id, traveler_id, share_amount, is_settled)`

---

## 🚀 How to Run the Java Application

### ⚡ 1-Click Launch (Recommended):
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
To run the automated Object-Oriented test suite verifying polymorphic dispatch, encapsulation, and debt settlement:
```cmd
.\test_oop_java.bat
```

---

## ❓ Architecture & Design FAQ

1. **Q: How does JDBC prevent SQL Injection in your project?**  
   *A:* By using `PreparedStatement` with parameterized placeholders (`?`) instead of string concatenation. The database engine precompiles the query and treats user input strictly as data literals.

2. **Q: How is Polymorphism used in the Expense calculation?**  
   *A:* `Expense` declares `calculateTotalAmount()`. Derived classes like `FlightExpense` (adds baggage/seat fees) and `HotelExpense` (calculates nightly tax) override this method. When `Trip.getTotalSpent()` iterates over expenses, Java dynamically dispatches the correct subclass calculation at runtime without `instanceof` checks.

3. **Q: How did you implement Database Normalization?**  
   *A:* The schema is in Third Normal Form (3NF). Entities (Users, Trips, Expenses, Travelers) are decoupled into separate tables linked through foreign keys, eliminating redundancy and update anomalies.
