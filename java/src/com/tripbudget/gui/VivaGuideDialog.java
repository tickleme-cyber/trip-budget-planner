package com.tripbudget.gui;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

/**
 * System Architecture Dialog - Displays Technical Architecture, Design Patterns, and Database Specifications
 */
public class VivaGuideDialog extends JDialog {
    public VivaGuideDialog(Frame parent) {
        super(parent, "Trip Budget Planner - Technical Architecture & Specifications", true);
        setSize(700, 560);
        setLocationRelativeTo(parent);

        JPanel mainPanel = new JPanel(new BorderLayout(15, 15));
        mainPanel.setBackground(new Color(15, 23, 42));
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));

        JLabel lblTitle = new JLabel("📐 System Architecture & Engineering Design");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 18));
        lblTitle.setForeground(Color.WHITE);
        mainPanel.add(lblTitle, BorderLayout.NORTH);

        JTextArea txt = new JTextArea();
        txt.setEditable(false);
        txt.setBackground(new Color(30, 41, 59));
        txt.setForeground(new Color(226, 232, 240));
        txt.setFont(new Font("Consolas", Font.PLAIN, 13));
        txt.setMargin(new Insets(10, 10, 10, 10));

        String content = "=================================================================\n"
                + "1. GUI PRESENTATION LAYER (JAVA SWING / AWT)\n"
                + "=================================================================\n"
                + "• Windows: LoginFrame, DashboardFrame, AddExpenseDialog, SplitDialog\n"
                + "• Components: JTable, JProgressBar, JComboBox, JDialog, Custom KPI Cards\n"
                + "• Features: Real-time budget progress bar, multi-criteria filtering, input validation\n\n"
                + "=================================================================\n"
                + "2. RELATIONAL DATABASE SCHEMA (3NF NORMALIZATION)\n"
                + "=================================================================\n"
                + "• Tables: users, trips, travelers, expenses, expense_splits\n"
                + "• Constraints: Primary Keys, Foreign Keys with ON DELETE CASCADE, CHECK rules\n"
                + "• Integrity: 3NF design ensuring zero data anomalies and isolated entity lifecycles\n\n"
                + "=================================================================\n"
                + "3. PERSISTENCE & DATA ACCESS LAYER (JDBC / DAO)\n"
                + "=================================================================\n"
                + "• Driver: SQLite JDBC / MySQL Connector with automatic fallback\n"
                + "• Pattern: Singleton Pattern for thread-safe DBConnection pooling\n"
                + "• Security: Parameterized PreparedStatements defending against SQL injection\n"
                + "• DAOs: UserDAO, TripDAO, ExpenseDAO, TravelerDAO cleanly isolating data access\n\n"
                + "=================================================================\n"
                + "4. OBJECT-ORIENTED DOMAIN MODEL & DESIGN PATTERNS\n"
                + "=================================================================\n"
                + "• Encapsulation: Strict private fields + verified mutators in models\n"
                + "• Inheritance: FlightExpense, HotelExpense, FoodExpense extend Expense\n"
                + "• Polymorphism: Dynamic runtime dispatch over calculateTotalAmount()\n"
                + "• Composition: Trip orchestrates aggregate collections of Travelers & Expenses\n"
                + "• Strategy Pattern: TravelStrategy (Backpacker, Moderate, Luxury) for dynamic cost estimation\n"
                + "• Recommendation System: Multi-criteria destination advisor matching user budget\n";

        txt.setText(content);
        txt.setCaretPosition(0);

        JScrollPane scroll = new JScrollPane(txt);
        mainPanel.add(scroll, BorderLayout.CENTER);

        JButton btnClose = new JButton("Close Specifications");
        btnClose.setBackground(new Color(99, 102, 241));
        btnClose.setForeground(Color.WHITE);
        btnClose.addActionListener(e -> dispose());
        mainPanel.add(btnClose, BorderLayout.SOUTH);

        add(mainPanel);
    }
}
