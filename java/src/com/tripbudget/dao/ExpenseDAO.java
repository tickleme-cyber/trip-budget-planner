package com.tripbudget.dao;

import com.tripbudget.db.DBConnection;
import com.tripbudget.models.Expense;
import com.tripbudget.models.ExpenseFactory;
import com.tripbudget.models.FlightExpense;
import com.tripbudget.models.FoodExpense;
import com.tripbudget.models.HotelExpense;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Expense Data Access Object (DAO) - Demonstrates Polymorphic Data Mapping
 */
public class ExpenseDAO {
    private static final List<Expense> memoryExpenses = new ArrayList<>();

    static {
        memoryExpenses.add(new FlightExpense(1, 1, 1, "Alex Morgan", "Round Trip Flight to Paris", 850.00, 75.00, 0, 0, "2026-06-15", "Air France Flight"));
        memoryExpenses.add(new HotelExpense(2, 1, 2, "Sarah Chen", "Boutique Hotel 4 Nights", 150.00, 4, 0.10, "2026-06-16", "Paris 4-star hotel"));
        memoryExpenses.add(new FoodExpense(3, 1, 3, "David Miller", "Group Welcome Dinner", 180.00, 20.00, 0, 0, "2026-06-16", "Bistro Paul Bert"));
    }

    public List<Expense> getExpensesByTripId(int tripId) {
        List<Expense> list = new ArrayList<>();
        Connection conn = DBConnection.getConnection();

        if (conn != null && !DBConnection.isMemoryMode()) {
            String sql = "SELECT expense_id, trip_id, payer_id, payer_name, title, category, base_amount, tax_or_fees, total_amount, expense_date, notes "
                       + "FROM expenses WHERE trip_id = ? ORDER BY expense_id DESC";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, tripId);
                ResultSet rs = pstmt.executeQuery();
                while (rs.next()) {
                    String category = rs.getString("category");
                    int id = rs.getInt("expense_id");
                    int tId = rs.getInt("trip_id");
                    int pId = rs.getInt("payer_id");
                    String pName = rs.getString("payer_name");
                    String title = rs.getString("title");
                    double base = rs.getDouble("base_amount");
                    double tax = rs.getDouble("tax_or_fees");
                    String date = rs.getString("expense_date");
                    String notes = rs.getString("notes");

                    // Polymorphic instantiation via ExpenseFactory across all categories
                    Expense exp = ExpenseFactory.createExpenseWithFlatTax(category, id, tId, pId, pName, title, base, tax, date, notes);
                    list.add(exp);
                }
                return list;
            } catch (SQLException e) {
                System.err.println("❌ [ExpenseDAO] Error loading expenses: " + e.getMessage());
            }
        }

        // Memory fallback
        for (Expense e : memoryExpenses) {
            if (e.getTripId() == tripId) {
                list.add(e);
            }
        }
        return list;
    }

    public boolean addExpense(Expense expense) {
        Connection conn = DBConnection.getConnection();
        if (conn != null && !DBConnection.isMemoryMode()) {
            String sql = "INSERT INTO expenses (trip_id, payer_id, payer_name, title, category, base_amount, tax_or_fees, total_amount, expense_date, notes) "
                       + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setInt(1, expense.getTripId());
                pstmt.setInt(2, expense.getPayerId());
                pstmt.setString(3, expense.getPayerName());
                pstmt.setString(4, expense.getTitle());
                pstmt.setString(5, expense.getCategory());
                pstmt.setDouble(6, expense.getBaseAmount());
                pstmt.setDouble(7, expense.getTaxOrFees());
                pstmt.setDouble(8, expense.calculateTotalAmount()); // Polymorphic calculation
                pstmt.setString(9, expense.getExpenseDate());
                pstmt.setString(10, expense.getNotes());
                int affected = pstmt.executeUpdate();
                if (affected > 0) {
                    ResultSet keys = pstmt.getGeneratedKeys();
                    if (keys.next()) {
                        expense.setExpenseId(keys.getInt(1));
                    }
                    return true;
                }
            } catch (SQLException e) {
                System.err.println("❌ [ExpenseDAO] Error adding expense: " + e.getMessage());
                return false;
            }
        }

        // Memory fallback
        expense.setExpenseId(memoryExpenses.size() + 1);
        memoryExpenses.add(expense);
        return true;
    }
}
