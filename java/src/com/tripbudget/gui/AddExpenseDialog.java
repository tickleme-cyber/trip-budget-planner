package com.tripbudget.gui;

import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.exceptions.BudgetExceededException;
import com.tripbudget.exceptions.InvalidExpenseException;
import com.tripbudget.exceptions.ValidationException;
import com.tripbudget.models.Expense;
import com.tripbudget.models.FlightExpense;
import com.tripbudget.models.FoodExpense;
import com.tripbudget.models.HotelExpense;
import com.tripbudget.models.Traveler;
import com.tripbudget.models.Trip;
import com.tripbudget.util.StringUtils;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * Add Expense Dialog GUI - Demonstrates:
 *  - Custom Exception Handling (ValidationException, InvalidExpenseException, BudgetExceededException)
 *  - try-catch-finally block structure with specific exception hierarchies
 *  - StringUtils validation and formatting
 *  - Interface interaction via Billable & Validatable
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
        setSize(500, 560);
        setLocationRelativeTo(parent);
        setResizable(false);

        JPanel panel = new JPanel(new GridLayout(9, 2, 10, 12));
        panel.setBackground(new Color(15, 23, 42));
        panel.setBorder(new EmptyBorder(25, 25, 25, 25));

        // Category selection
        String[] categories = {"FLIGHT", "HOTEL", "FOOD", "TRANSPORT", "ACTIVITIES", "SHOPPING", "GENERAL"};
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

        JButton btnPreviewReceipt = new JButton("🧾 Preview Receipt");
        btnPreviewReceipt.setBackground(new Color(30, 41, 59));
        btnPreviewReceipt.setForeground(new Color(165, 180, 252));
        btnPreviewReceipt.setFocusPainted(false);
        btnPreviewReceipt.addActionListener(e -> {
            try {
                Expense tempExpense = buildExpenseFromInputs(trip);
                tempExpense.validate();
                showReceiptDialog(tempExpense.getFormattedReceipt());
            } catch (ValidationException ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "Validation Warning", JOptionPane.WARNING_MESSAGE);
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Please enter valid numeric amounts for Base and Tax.", "Input Error", JOptionPane.ERROR_MESSAGE);
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        JButton btnSave = new JButton("Save Expense");
        btnSave.setBackground(new Color(99, 102, 241));
        btnSave.setForeground(Color.WHITE);
        btnSave.addActionListener(e -> {
            boolean success = false;
            try {
                // 1. Build and validate expense
                Expense newExpense = buildExpenseFromInputs(trip);
                newExpense.validate();

                // 2. Exception Handling: Check budget overrun
                try {
                    trip.checkBudgetThreshold(newExpense);
                } catch (BudgetExceededException budgetEx) {
                    int choice = JOptionPane.showConfirmDialog(
                            this,
                            budgetEx.getMessage() + "\n\nDo you still wish to record this expense?",
                            "Budget Overrun Warning",
                            JOptionPane.YES_NO_OPTION,
                            JOptionPane.WARNING_MESSAGE
                    );
                    if (choice != JOptionPane.YES_OPTION) {
                        return;
                    }
                }

                // 3. Persist to database
                boolean ok = expenseDAO.addExpense(newExpense);
                if (ok) {
                    expenseAdded = true;
                    success = true;
                    JOptionPane.showMessageDialog(
                            this,
                            String.format("Expense '%s' for %s added successfully!",
                                    newExpense.getTitle(), StringUtils.formatCurrency(newExpense.calculateTotalAmount())),
                            "Success",
                            JOptionPane.INFORMATION_MESSAGE
                    );
                    dispose();
                } else {
                    JOptionPane.showMessageDialog(this, "Failed to save expense in database.", "Database Error", JOptionPane.ERROR_MESSAGE);
                }

            } catch (ValidationException ex) {
                // Catches custom field validation exceptions
                JOptionPane.showMessageDialog(this, "Validation Failed: " + ex.getMessage(), "Input Error", JOptionPane.WARNING_MESSAGE);
            } catch (InvalidExpenseException ex) {
                // Catches financial calculation errors
                JOptionPane.showMessageDialog(this, "Invalid Expense: " + ex.getMessage(), "Expense Error", JOptionPane.ERROR_MESSAGE);
            } catch (NumberFormatException ex) {
                // Catches parsing issues
                JOptionPane.showMessageDialog(this, "Invalid number format. Please enter positive decimal amounts.", "Format Error", JOptionPane.ERROR_MESSAGE);
            } catch (Exception ex) {
                // Catch-all fallback
                JOptionPane.showMessageDialog(this, "System Error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            } finally {
                // Finally block for resource management / telemetry
                String log = StringUtils.createThreadSafeLogEntry("EXPENSE_ACTION", "SAVE_ATTEMPT", "Outcome: " + (success ? "SUCCESS" : "FAILED_OR_CANCELLED"));
                System.out.println(log);
            }
        });

        JButton btnCancel = new JButton("Cancel");
        btnCancel.addActionListener(e -> dispose());

        panel.add(btnPreviewReceipt);
        panel.add(new JLabel("")); // Placeholder
        panel.add(btnSave);
        panel.add(btnCancel);

        add(panel);
    }

    private Expense buildExpenseFromInputs(Trip trip) throws ValidationException, InvalidExpenseException {
        String title = StringUtils.safeTrim(txtTitle.getText());
        if (StringUtils.isBlank(title)) {
            throw new ValidationException("title", "Expense title cannot be empty or whitespace.");
        }

        String baseText = StringUtils.safeTrim(txtBaseAmount.getText());
        if (StringUtils.isBlank(baseText)) {
            throw new ValidationException("baseAmount", "Base amount is required.");
        }

        double base = Double.parseDouble(baseText);
        if (base < 0) {
            throw new InvalidExpenseException("Base amount cannot be negative: $" + base, base);
        }

        double tax = 0.0;
        String taxText = StringUtils.safeTrim(txtTaxOrFee.getText());
        if (StringUtils.isNotBlank(taxText)) {
            tax = Double.parseDouble(taxText);
        }

        String category = (String) cmbCategory.getSelectedItem();
        Traveler payer = (Traveler) cmbTraveler.getSelectedItem();
        if (payer == null) {
            throw new ValidationException("payer", "Please select a participating traveler.");
        }

        String notes = StringUtils.safeTrim(txtNotes.getText());
        String date = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

        // Polymorphic creation based on category
        if ("FLIGHT".equalsIgnoreCase(category)) {
            return new FlightExpense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, base, tax, 0, 0, date, notes);
        } else if ("HOTEL".equalsIgnoreCase(category)) {
            return new HotelExpense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, base, 1, 0, date, notes);
        } else if ("FOOD".equalsIgnoreCase(category)) {
            return new FoodExpense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, base, tax, 0, 0, date, notes);
        } else {
            return new Expense(0, trip.getTripId(), payer.getTravelerId(), payer.getName(), title, category, base, tax, date, notes);
        }
    }

    private void showReceiptDialog(String receiptText) {
        JTextArea area = new JTextArea(receiptText);
        area.setEditable(false);
        area.setFont(new Font("Consolas", Font.PLAIN, 12));
        area.setBackground(new Color(15, 23, 42));
        area.setForeground(new Color(226, 232, 240));
        area.setMargin(new Insets(10, 10, 10, 10));

        JScrollPane scroll = new JScrollPane(area);
        scroll.setPreferredSize(new Dimension(460, 360));
        JOptionPane.showMessageDialog(this, scroll, "Official Itemized Receipt Preview", JOptionPane.PLAIN_MESSAGE);
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
