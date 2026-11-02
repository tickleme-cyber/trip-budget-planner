package com.tripbudget.gui;

import com.tripbudget.dao.TripDAO;
import com.tripbudget.models.Trip;
import com.tripbudget.models.User;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Add Trip Dialog GUI
 */
public class AddTripDialog extends JDialog {
    private boolean tripAdded = false;

    public AddTripDialog(Frame parent, User user, TripDAO tripDAO) {
        super(parent, "Create New Trip", true);
        setSize(440, 460);
        setLocationRelativeTo(parent);
        setResizable(false);

        JPanel panel = new JPanel(new GridLayout(6, 2, 10, 15));
        panel.setBackground(new Color(15, 23, 42));
        panel.setBorder(new EmptyBorder(25, 25, 25, 25));

        JTextField txtTitle = new JTextField();
        JTextField txtDest = new JTextField();
        JTextField txtBudget = new JTextField("2000.00");
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        JTextField txtStartDate = new JTextField(today);
        JTextField txtEndDate = new JTextField(today);

        panel.add(createLabel("Trip Title:"));
        panel.add(txtTitle);
        panel.add(createLabel("Destination:"));
        panel.add(txtDest);
        panel.add(createLabel("Total Budget ($):"));
        panel.add(txtBudget);
        panel.add(createLabel("Start Date (YYYY-MM-DD):"));
        panel.add(txtStartDate);
        panel.add(createLabel("End Date (YYYY-MM-DD):"));
        panel.add(txtEndDate);

        JButton btnSave = new JButton("Create Trip");
        btnSave.setBackground(new Color(99, 102, 241));
        btnSave.setForeground(Color.WHITE);
        btnSave.addActionListener(e -> {
            try {
                String title = txtTitle.getText().trim();
                String dest = txtDest.getText().trim();
                double budget = Double.parseDouble(txtBudget.getText().trim());
                String start = txtStartDate.getText().trim();
                String end = txtEndDate.getText().trim();

                if (title.isEmpty() || dest.isEmpty()) {
                    throw new IllegalArgumentException("Title and Destination cannot be empty.");
                }

                Trip newTrip = new Trip(0, user.getUserId(), title, dest, start, end, budget, "USD", "ACTIVE");
                boolean ok = tripDAO.createTrip(newTrip);
                if (ok) {
                    tripAdded = true;
                    JOptionPane.showMessageDialog(this, "Trip created successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
                    dispose();
                } else {
                    JOptionPane.showMessageDialog(this, "Failed to create trip.", "Database Error", JOptionPane.ERROR_MESSAGE);
                }
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Invalid budget number.", "Validation Error", JOptionPane.ERROR_MESSAGE);
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

    public boolean isTripAdded() {
        return tripAdded;
    }

    private JLabel createLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.BOLD, 13));
        label.setForeground(new Color(226, 232, 240));
        return label;
    }
}
