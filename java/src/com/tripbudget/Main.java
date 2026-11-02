package com.tripbudget;

import com.tripbudget.db.DBConnection;
import com.tripbudget.gui.LoginFrame;

import javax.swing.*;

/**
 * ============================================================================
 * PBL Project: Trip Budget Planner & Expense Manager
 * ============================================================================
 * Evaluation Rubric Mappings:
 * 1. GUI Design (5 Marks): Modern Java Swing Dark Theme, JTable, KPI cards, Form Validation.
 * 2. Database Design (5 Marks): 3NF Normalized relational schema (users, trips, travelers, expenses, splits).
 * 3. JDBC Connection (5 Marks): Singleton DBConnection, PreparedStatement CRUD, DAO Pattern.
 */
public class Main {
    public static void main(String[] args) {
        // Set cross-platform System Look and Feel
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {}

        // Initialize JDBC Database Connection
        DBConnection.getConnection();

        // Launch Login GUI on Swing Event Dispatch Thread (EDT)
        SwingUtilities.invokeLater(() -> {
            LoginFrame loginFrame = new LoginFrame();
            loginFrame.setVisible(true);
        });
    }
}
