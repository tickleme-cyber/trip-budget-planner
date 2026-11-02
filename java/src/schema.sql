-- ==========================================================
-- PBL College Project: Trip Budget Planner & Expense Manager
-- Evaluation Criteria: Database Design (5 Marks)
-- Database: trip_budget_db (Compatible with MySQL and SQLite)
-- ==========================================================

-- 1. USERS TABLE (Authentication & Profile)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRIPS TABLE (Trip Metadata & Budget Constraints)
CREATE TABLE IF NOT EXISTS trips (
    trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget DOUBLE NOT NULL CHECK(total_budget > 0),
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. TRAVELERS TABLE (Participants in Trips)
CREATE TABLE IF NOT EXISTS travelers (
    traveler_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    color_code VARCHAR(20) DEFAULT '#4F46E5',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- 4. EXPENSES TABLE (Polymorphic Base Expense Structure)
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    payer_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'FLIGHT', 'HOTEL', 'FOOD', 'TRANSPORT', 'GENERAL'
    base_amount DOUBLE NOT NULL CHECK(base_amount >= 0),
    tax_or_fees DOUBLE DEFAULT 0.0,
    total_amount DOUBLE NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (payer_id) REFERENCES travelers(traveler_id) ON DELETE CASCADE
);

-- 5. EXPENSE SPLITS TABLE (Many-to-Many Debt Relationships)
CREATE TABLE IF NOT EXISTS expense_splits (
    split_id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL,
    traveler_id INTEGER NOT NULL,
    share_amount DOUBLE NOT NULL,
    is_settled INTEGER DEFAULT 0,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE,
    FOREIGN KEY (traveler_id) REFERENCES travelers(traveler_id) ON DELETE CASCADE
);

-- ==========================================================
-- SEED DATA (For Demo & Practical Evaluation)
-- ==========================================================
INSERT OR IGNORE INTO users (user_id, username, password_hash, full_name, email, role)
VALUES (1, 'demo', 'demo123', 'Alex Morgan', 'alex.morgan@example.com', 'STUDENT');

INSERT OR IGNORE INTO trips (trip_id, user_id, title, destination, start_date, end_date, total_budget, currency, status)
VALUES (1, 1, 'Euro Summer Trip 2026', 'Paris & Rome', '2026-06-15', '2026-06-25', 2500.00, 'USD', 'ACTIVE');

INSERT OR IGNORE INTO travelers (traveler_id, trip_id, name, email, color_code)
VALUES 
(1, 1, 'Alex Morgan', 'alex@example.com', '#4F46E5'),
(2, 1, 'Sarah Chen', 'sarah@example.com', '#EC4899'),
(3, 1, 'David Miller', 'david@example.com', '#10B981');

INSERT OR IGNORE INTO expenses (expense_id, trip_id, payer_id, title, category, base_amount, tax_or_fees, total_amount, expense_date, notes)
VALUES 
(1, 1, 1, 'Flight Tickets SFO to CDG', 'FLIGHT', 850.00, 75.00, 925.00, '2026-06-15', 'Round trip economy class'),
(2, 1, 2, 'Boutique Hotel 4 Nights', 'HOTEL', 600.00, 60.00, 660.00, '2026-06-16', 'Double room in central Paris'),
(3, 1, 3, 'Group Welcome Dinner', 'FOOD', 180.00, 20.00, 200.00, '2026-06-16', 'Bistro Paul Bert');
