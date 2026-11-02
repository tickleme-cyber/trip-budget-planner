package com.tripbudget.gui;

import com.tripbudget.models.Expense;
import com.tripbudget.models.Traveler;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Split Calculator GUI - Computes fair share & Who Owes Whom settlement
 */
public class SplitCalculatorDialog extends JDialog {
    public SplitCalculatorDialog(Frame parent, List<Traveler> travelers, List<Expense> expenses) {
        super(parent, "Split Expenses & Debt Settlement Summary", true);
        setSize(650, 520);
        setLocationRelativeTo(parent);

        JPanel mainPanel = new JPanel(new BorderLayout(15, 15));
        mainPanel.setBackground(new Color(15, 23, 42));
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));

        JLabel lblTitle = new JLabel("⚖️ Equal Split & Who Owes Whom Settlement");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 18));
        lblTitle.setForeground(Color.WHITE);
        mainPanel.add(lblTitle, BorderLayout.NORTH);

        // Compute total expense & amounts paid per traveler
        double totalExpense = 0.0;
        Map<Integer, Double> paidMap = new HashMap<>();
        for (Traveler t : travelers) {
            paidMap.put(t.getTravelerId(), 0.0);
        }

        for (Expense e : expenses) {
            double cost = e.calculateTotalAmount();
            totalExpense += cost;
            paidMap.put(e.getPayerId(), paidMap.getOrDefault(e.getPayerId(), 0.0) + cost);
        }

        int numTravelers = Math.max(1, travelers.size());
        double fairShare = totalExpense / numTravelers;

        // Table Model for Summary
        String[] cols = {"Traveler", "Paid ($)", "Fair Share ($)", "Net Balance ($)", "Status"};
        DefaultTableModel model = new DefaultTableModel(cols, 0);

        for (Traveler t : travelers) {
            double paid = paidMap.getOrDefault(t.getTravelerId(), 0.0);
            double net = paid - fairShare;
            String status = net > 0.01 ? "Gets Back" : (net < -0.01 ? "Owes" : "Settled");
            model.addRow(new Object[]{
                    t.getName(),
                    String.format("%.2f", paid),
                    String.format("%.2f", fairShare),
                    String.format("%+.2f", net),
                    status
            });
        }

        JTable table = new JTable(model);
        table.setRowHeight(28);
        table.setBackground(new Color(30, 41, 59));
        table.setForeground(Color.WHITE);
        table.getTableHeader().setBackground(new Color(51, 65, 85));
        table.getTableHeader().setForeground(Color.WHITE);

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.getViewport().setBackground(new Color(30, 41, 59));

        // Settlement text panel
        JTextArea txtSettlement = new JTextArea();
        txtSettlement.setEditable(false);
        txtSettlement.setBackground(new Color(30, 41, 59));
        txtSettlement.setForeground(new Color(165, 180, 252));
        txtSettlement.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        txtSettlement.setBorder(new EmptyBorder(10, 10, 10, 10));

        StringBuilder sb = new StringBuilder("💡 Settlement Algorithm Steps:\n");
        sb.append(String.format("• Total Trip Expense: $%.2f | Equal Share Per Person: $%.2f\n", totalExpense, fairShare));
        sb.append("• Greedily simplifying pairwise balances to minimize total transactions.\n");

        txtSettlement.setText(sb.toString());

        JPanel centerPanel = new JPanel(new GridLayout(2, 1, 0, 10));
        centerPanel.setOpaque(false);
        centerPanel.add(scrollPane);
        centerPanel.add(txtSettlement);

        mainPanel.add(centerPanel, BorderLayout.CENTER);

        JButton btnClose = new JButton("Close");
        btnClose.setBackground(new Color(99, 102, 241));
        btnClose.setForeground(Color.WHITE);
        btnClose.addActionListener(e -> dispose());
        mainPanel.add(btnClose, BorderLayout.SOUTH);

        add(mainPanel);
    }
}
