# 🎓 Java PBL Project: Trip Budget Planner & Expense Manager

## 📊 Evaluation Rubric Breakdown (15 Marks)

| Evaluation Parameter | Marks | Implementation in this Project |
|---|---|---|
| **1. GUI Design** | **5 Marks** | Built with modern **Java Swing & AWT**. Features `LoginFrame`, `RegisterDialog`, `DashboardFrame`, `AddExpenseDialog`, `SplitCalculatorDialog`, `RecommendationDialog` (Budget Travel Advisor), real-time KPI budget cards, interactive `JTable`, and `JProgressBar`. |
| **2. Database Design** | **5 Marks** | **3NF Relational Schema** with 5 tables: `users`, `trips`, `travelers`, `expenses`, and `expense_splits`. Implements Primary Keys, Foreign Keys with `ON DELETE CASCADE`, `CHECK` constraints, and seed data. |
| **3. JDBC Connection** | **5 Marks** | **Singleton Pattern** in `DBConnection.java`. Implements `PreparedStatement` to prevent SQL Injection, DAO Pattern (`UserDAO`, `TripDAO`, `ExpenseDAO`, `TravelerDAO`), and transaction management. |

---

## 🏗️ Architecture & OOP Principles

- **Encapsulation**: Private attributes (`#id`, `userId`, `passwordHash`, `baseFlightCost`, etc.) protected by public getters/setters and data validation in `User`, `Trip`, `Traveler`, `Expense`, and `Destination`.
- **Inheritance**: Subclasses (`FlightExpense`, `HotelExpense`, `FoodExpense`, `ActivityExpense`, etc.) inherit from the base `Expense` class.
- **Polymorphism**: Dynamic method dispatch overriding `calculateTotalAmount()` across expense subclasses and travel strategy multipliers.
- **Strategy Pattern**: `TravelStrategy` abstract class with concrete `BackpackerStrategy`, `ModerateStrategy`, and `LuxuryStrategy` adjusting lodging, food, and transit costs dynamically.
- **Factory Pattern**: `ExpenseFactory` and `TravelStrategyFactory` decoupling object creation from business logic.
- **Composition**: `Trip` aggregates and manages collections of `Traveler` and `Expense` objects. `RecommendationEngine` manages collections of `Destination` models.
- **DAO Pattern**: Clean separation of business logic, GUI layer, and JDBC data persistence layer.

---

## 🗄️ Database Schema (`schema.sql`)

1. **`users`**: `(user_id, username, password_hash, full_name, email, role, created_at)`
2. **`trips`**: `(trip_id, user_id, title, destination, start_date, end_date, total_budget, currency, status, created_at)`
3. **`travelers`**: `(traveler_id, trip_id, name, email, color_code, created_at)`
4. **`expenses`**: `(expense_id, trip_id, payer_id, payer_name, title, category, base_amount, tax_or_fees, total_amount, expense_date, notes)`
5. **`expense_splits`**: `(split_id, expense_id, traveler_id, share_amount, is_settled)`

---

## ⚡ How to Run the Java Application

### 🚀 1-Click Launch (Recommended):
In PowerShell:
```powershell
.\run_java.ps1
```
Or in Command Prompt / Double-click in File Explorer:
```cmd
run_java.bat
```

---

### 🔑 Demo Login Credentials
- **Username:** `demo`
- **Password:** `demo123`
*(Or click the ⚡ **Auto-Fill Demo User** button directly on the login screen!)*

---

### Manual Compilation & Execution via Terminal:
```powershell
# In PowerShell:
$javac = "C:\Users\skand\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64\bin\javac.exe"
$java  = "C:\Users\skand\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64\bin\java.exe"

& $javac -d d:\aoops\java\bin (Get-ChildItem -Path d:\aoops\java\src -Filter *.java -Recurse).FullName
& $java -cp d:\aoops\java\bin com.tripbudget.Main
```

---

## 🎯 Viva Q&A Cheatsheet for Evaluation

1. **Q: How does JDBC prevent SQL Injection in your project?**  
   *A:* By using `PreparedStatement` with parameterized placeholders (`?`) instead of string concatenation. The database engine precompiles the query and treats user input strictly as data literals.

2. **Q: How is Polymorphism used in the Expense calculation?**  
   *A:* `Expense` declares `calculateTotalAmount()`. Derived classes like `FlightExpense` (adds baggage/seat fees) and `HotelExpense` (calculates nightly tax) override this method. When `Trip.getTotalSpent()` iterates over expenses, Java dynamically dispatches the correct subclass calculation at runtime.

3. **Q: How did you implement Database Normalization?**  
   *A:* The schema is in Third Normal Form (3NF). Entities (Users, Trips, Expenses, Travelers) are decoupled into separate tables linked through foreign keys, eliminating redundancy and update anomalies.
