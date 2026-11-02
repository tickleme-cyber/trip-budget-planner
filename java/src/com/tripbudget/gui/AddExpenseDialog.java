package com.tripbudget.gui;

import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.models.Expense;
import com.tripbudget.models.FlightExpense;
import com.tripbudget.models.FoodExpense;
import com.tripbudget.models.HotelExpense;
import com.tripbudget.models.Traveler;
import com.tripbudget.models.Trip;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * Add Expense Dialog GUI - Demonstrates Polymorphism & User Input Handling
 */
public class AddExpenseDialog extends JDialog {
    private final JComboBox<Traveler> cmbTraveler;
    private final JComboBox<String> cmbCategory;
    private final JTextField txtTitle;
    private final JTextField txtBaseAmount;
    private final JTextField txtTaxOrFee;
    private final JTextField txtNotes;
    private boolean expenseAdded = false;

    public AddExpenseDialog(Frame parent, Trip trip, List<Traveler> travelers, ExpenseDAO expenseDAO) {
        super(parent, "Add New Expense - " + trip.getTitle(), true);
        setSize(480, 520);
        setLocationRelativeTo(parent);
        setResizable(false);

        JPanel panel = new JPanel(new GridLayout(8, 2, 10, 12));
        panel.setBackground(new Color(15, 23, 42));
        panel.setBorder(new EmptyBorder(25, 25, 25, 25));

        // Category selection
        String[] categories = {"FLIGHT", "HOTEL", "FOOD", "TRANSPORT", "GENERAL"};
        cmbCategory = new JComboBox<>(categories);

        // Payer selection
        cmbTraveler = new JComboBox<>(travelers.toArray(new Traveler[0]));

        txtTitle = new JTextField();
        txtBaseAmount = new JTextField();
        txtTaxOrFee = new JTextField("0.0");
        txtNotes = new JTextField();

        panel.add(createLabel("Category (Polymorphic):"));
        panel.add(cmbCategory);
        panel.add(createLabel("Payer (Traveler):"));
        panel.add(cmbTraveler);
        panel.add(createLabel("Expense Title:"));
        panel.add(txtTitle);
        panel.add(createLabel("Base Amount ($):"));
        panel.add(txtBaseAmount);
        panel.add(createLabel("Tax / Extra Fees ($):"));
        panel.add(txtTaxOrFee);
        panel.add(createLabel("Notes:"));
        panel.add(txtNotes);

        JButton btnSave = new JButton("Save Expense");
        btnSave.setBackground(new Color(99, 102, 241));
        btnSave.setForeground(Color.WHITE);
        btnSave.addActionListener(e -> {
            try {
                String title = txtTitle.getText().trim();
                if (title.isEmpty()) throw new IllegalArgumentException("Expense title cannot be empty");

                double base = Double.parseDouble(txtBaseAmount.getText().trim());
                double tax = Double.parseDouble(txtTaxOrFee.getText().trim());
                String category = (String) cmbCategory.getSelectedItem();
                Traveler payer = (Traveler) cmbTraveler.getSelectedItem();
                String notes = txtNotes.getText().trim();
                String date = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

                if (payer == null) throw new IllegalArgumentException("Please select a valid traveler");

                // Polymorphic object creation
                Expense newExpense;
                if ("FLIGHT".equalsIgnoreCase(category)) {
                    newExpense = new FlightExpense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, base, tax, 0, 0, date, notes);
                } else if ("HOTEL".equalsIgnoreCase(category)) {
                    newExpense = new HotelExpense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, base, 1, 0, date, notes);
                } else if ("FOOD".equalsIgnoreCase(category)) {
                    newExpense = new FoodExpense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, base, tax, 0, 0, date, notes);
                } else {
                    newExpense = new Expense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, category, base, tax, date, notes);
                }

                boolean ok = expenseDAO.addExpense(newExpense);
                if (ok) {
                    expenseAdded = true;
                    JOptionPane.showMessageDialog(this, "Expense added successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
                    dispose();
                } else {
                    JOptionPane.showMessageDialog(this, "Failed to save expense in database.", "Error", JOptionPane.ERROR_MESSAGE);
                }

            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Please enter valid numeric amounts for Base and Tax.", "Input Error", JOptionPane.ERROR_MESSAGE);
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "Input Error", JOptionPane.WARNING_MESSAGE);
            }
        });

        JButton btnCancel = new JButton("Cancel");
        btnCancel.addActionListener(e -> dispose());

        panel.add(btnSave);
        panel.add(btnCancel);

        add(panel);
    }

    public boolean isExpenseAdded() {
        return expenseAdded;
    }

    private JLabel createLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.BOLD, 13));
        label.setForeground(new Color(226, 232, 240));
        return label;
    }
}
