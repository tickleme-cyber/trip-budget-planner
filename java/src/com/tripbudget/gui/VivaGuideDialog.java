package com.tripbudget.gui;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

/**
 * Viva Guide Dialog - Displays mapping to PBL Rubric (GUI Design, Database Design, JDBC Connection)
 */
public class VivaGuideDialog extends JDialog {
    public VivaGuideDialog(Frame parent) {
        super(parent, "PBL College Evaluation & Viva Cheatsheet", true);
        setSize(700, 560);
        setLocationRelativeTo(parent);

        JPanel mainPanel = new JPanel(new BorderLayout(15, 15));
        mainPanel.setBackground(new Color(15, 23, 42));
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));

        JLabel lblTitle = new JLabel("🎓 PBL Evaluation Rubric & Viva Guide");
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
                + "1. GUI DESIGN (5 MARKS)\n"
                + "=================================================================\n"
                + "• Framework: Java Swing / AWT (LoginFrame, DashboardFrame, Dialogs)\n"
                + "• Components: JTable, JProgressBar, JComboBox, JDialog, Custom Cards\n"
                + "• Features: Form validation, responsive layout, real-time KPI metrics\n\n"
                + "=================================================================\n"
                + "2. DATABASE DESIGN (5 MARKS)\n"
                + "=================================================================\n"
                + "• Relational Tables: users, trips, travelers, expenses, expense_splits\n"
                + "• Constraints: Primary Keys, Foreign Keys with ON DELETE CASCADE, CHECK\n"
                + "• Normalization: 3NF Relational Structure avoiding data duplication\n\n"
                + "=================================================================\n"
                + "3. JDBC CONNECTION (5 MARKS)\n"
                + "=================================================================\n"
                + "• Driver: SQLite JDBC / MySQL Connector (Class.forName)\n"
                + "• Pattern: Singleton Pattern in DBConnection.java\n"
                + "• Security: PreparedStatement for parameterized queries against SQLi\n"
                + "• Architecture: DAO Pattern (UserDAO, TripDAO, ExpenseDAO, TravelerDAO)\n\n"
                + "=================================================================\n"
                + "4. OOP CONCEPTS HIGHLIGHTS\n"
                + "=================================================================\n"
                + "• Encapsulation: Private fields + getters/setters in Destination, User & Traveler\n"
                + "• Inheritance: FlightExpense, HotelExpense, FoodExpense extend Expense\n"
                + "• Polymorphism: Overriding calculateTotalAmount() in subclasses\n"
                + "• Composition: Trip coordinates Lists of Travelers and Expenses\n"
                + "• Strategy Pattern: TravelStrategy (Backpacker, Moderate, Luxury) for dynamic cost estimation\n"
                + "• Recommendation System: Multi-criteria destination advisor matching user budget\n";

        txt.setText(content);
        txt.setCaretPosition(0);

        JScrollPane scroll = new JScrollPane(txt);
        mainPanel.add(scroll, BorderLayout.CENTER);

        JButton btnClose = new JButton("Close Guide");
        btnClose.setBackground(new Color(99, 102, 241));
        btnClose.setForeground(Color.WHITE);
        btnClose.addActionListener(e -> dispose());
        mainPanel.add(btnClose, BorderLayout.SOUTH);

        add(mainPanel);
    }
}
