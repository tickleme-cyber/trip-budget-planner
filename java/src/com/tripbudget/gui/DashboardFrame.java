package com.tripbudget.gui;

import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.dao.TravelerDAO;
import com.tripbudget.dao.TripDAO;
import com.tripbudget.models.Expense;
import com.tripbudget.models.Traveler;
import com.tripbudget.models.Trip;
import com.tripbudget.models.User;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

/**
 * ============================================================================
 * Main Dashboard GUI (Fulfills GUI Design - 5 Marks)
 * ============================================================================
 */
public class DashboardFrame extends JFrame {
    private final User currentUser;
    private final TripDAO tripDAO;
    private final TravelerDAO travelerDAO;
    private final ExpenseDAO expenseDAO;

    private JComboBox<Trip> cmbTrips;
    private JLabel lblTotalBudget;
    private JLabel lblTotalSpent;
    private JLabel lblRemaining;
    private JProgressBar progressBudget;
    private DefaultTableModel expenseTableModel;

    private Trip currentTrip;
    private List<Traveler> currentTravelers;
    private List<Expense> currentExpenses;

    public DashboardFrame(User user) {
        this.currentUser = user;
        this.tripDAO = new TripDAO();
        this.travelerDAO = new TravelerDAO();
        this.expenseDAO = new ExpenseDAO();

        setTitle("TripBudget Planner - Dashboard (" + currentUser.getFullName() + ")");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(980, 680);
        setLocationRelativeTo(null);

        initUI();
        loadTrips();
    }

    private void initUI() {
        JPanel mainPanel = new JPanel(new BorderLayout(15, 15));
        mainPanel.setBackground(new Color(15, 23, 42)); // Slate 900
        mainPanel.setBorder(new EmptyBorder(15, 20, 20, 20));

        // 1. TOP HEADER BAR
        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setOpaque(false);

        JLabel lblLogo = new JLabel("✈️ TripBudget Manager");
        lblLogo.setFont(new Font("Segoe UI", Font.BOLD, 20));
        lblLogo.setForeground(Color.WHITE);

        JPanel userActions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        userActions.setOpaque(false);

        JLabel lblWelcome = new JLabel("Welcome, " + currentUser.getFullName() + " (" + currentUser.getRole() + ")");
        lblWelcome.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        lblWelcome.setForeground(new Color(148, 163, 184));

        JButton btnViva = new JButton("🎓 PBL Rubric Guide");
        btnViva.setBackground(new Color(30, 41, 59));
        btnViva.setForeground(new Color(165, 180, 252));
        btnViva.setFocusPainted(false);
        btnViva.addActionListener(e -> new VivaGuideDialog(this).setVisible(true));

        JButton btnLogout = new JButton("Logout");
        btnLogout.setBackground(new Color(239, 68, 68));
        btnLogout.setForeground(Color.WHITE);
        btnLogout.setFocusPainted(false);
        btnLogout.addActionListener(e -> {
            dispose();
            new LoginFrame().setVisible(true);
        });

        userActions.add(lblWelcome);
        userActions.add(btnViva);
        userActions.add(btnLogout);

        headerPanel.add(lblLogo, BorderLayout.WEST);
        headerPanel.add(userActions, BorderLayout.EAST);

        // 2. TRIP SELECTOR & ACTIONS
        JPanel tripBar = new JPanel(new FlowLayout(FlowLayout.LEFT, 12, 10));
        tripBar.setBackground(new Color(30, 41, 59));
        tripBar.setBorder(BorderFactory.createLineBorder(new Color(51, 65, 85), 1));

        JLabel lblSelectTrip = new JLabel("Active Trip:");
        lblSelectTrip.setFont(new Font("Segoe UI", Font.BOLD, 13));
        lblSelectTrip.setForeground(Color.WHITE);

        cmbTrips = new JComboBox<>();
        cmbTrips.setPreferredSize(new Dimension(300, 30));
        cmbTrips.addActionListener(e -> onTripSelected());

        JButton btnAddTrip = new JButton("➕ New Trip");
        btnAddTrip.setBackground(new Color(99, 102, 241));
        btnAddTrip.setForeground(Color.WHITE);
        btnAddTrip.addActionListener(e -> {
            AddTripDialog dlg = new AddTripDialog(this, currentUser, tripDAO);
            dlg.setVisible(true);
            if (dlg.isTripAdded()) {
                loadTrips();
            }
        });

        JButton btnAddTraveler = new JButton("👥 Add Traveler");
        btnAddTraveler.setBackground(new Color(51, 65, 85));
        btnAddTraveler.setForeground(Color.WHITE);
        btnAddTraveler.addActionListener(e -> promptAddTraveler());

        JButton btnWhereCanIGo = new JButton("🧭 Where Can I Go? (Budget Advisor)");
        btnWhereCanIGo.setBackground(new Color(245, 158, 11));
        btnWhereCanIGo.setForeground(Color.BLACK);
        btnWhereCanIGo.setFont(new Font("Segoe UI", Font.BOLD, 12));
        btnWhereCanIGo.setFocusPainted(false);
        btnWhereCanIGo.addActionListener(e -> openRecommendations());

        tripBar.add(lblSelectTrip);
        tripBar.add(cmbTrips);
        tripBar.add(btnAddTrip);
        tripBar.add(btnAddTraveler);
        tripBar.add(btnWhereCanIGo);

        // 3. STATS & KPI CARDS
        JPanel statsPanel = new JPanel(new GridLayout(1, 3, 15, 0));
        statsPanel.setOpaque(false);

        lblTotalBudget = new JLabel("$0.00", SwingConstants.CENTER);
        lblTotalSpent = new JLabel("$0.00", SwingConstants.CENTER);
        lblRemaining = new JLabel("$0.00", SwingConstants.CENTER);

        statsPanel.add(createCard("Total Budget", lblTotalBudget, new Color(59, 130, 246)));
        statsPanel.add(createCard("Total Spent", lblTotalSpent, new Color(245, 158, 11)));
        statsPanel.add(createCard("Remaining Budget", lblRemaining, new Color(16, 185, 129)));

        // Progress Bar
        progressBudget = new JProgressBar(0, 100);
        progressBudget.setStringPainted(true);
        progressBudget.setForeground(new Color(99, 102, 241));
        progressBudget.setBackground(new Color(30, 41, 59));
        progressBudget.setBorder(BorderFactory.createEmptyBorder(6, 0, 6, 0));

        JPanel topContainer = new JPanel();
        topContainer.setLayout(new BoxLayout(topContainer, BoxLayout.Y_AXIS));
        topContainer.setOpaque(false);
        topContainer.add(headerPanel);
        topContainer.add(Box.createRigidArea(new Dimension(0, 10)));
        topContainer.add(tripBar);
        topContainer.add(Box.createRigidArea(new Dimension(0, 12)));
        topContainer.add(statsPanel);
        topContainer.add(Box.createRigidArea(new Dimension(0, 10)));
        topContainer.add(progressBudget);

        mainPanel.add(topContainer, BorderLayout.NORTH);

        // 4. EXPENSES TABLE (Center)
        String[] columns = {"ID", "Title", "Category", "Paid By", "Base Cost ($)", "Tax/Fee ($)", "Total ($)", "Date", "Notes"};
        expenseTableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        JTable expenseTable = new JTable(expenseTableModel);
        expenseTable.setRowHeight(28);
        expenseTable.setBackground(new Color(30, 41, 59));
        expenseTable.setForeground(Color.WHITE);
        expenseTable.getTableHeader().setBackground(new Color(51, 65, 85));
        expenseTable.getTableHeader().setForeground(Color.WHITE);

        JScrollPane scrollTable = new JScrollPane(expenseTable);
        scrollTable.getViewport().setBackground(new Color(30, 41, 59));
        scrollTable.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85)),
                "Trip Expenses (Polymorphic Billing Dispatch)",
                0, 0, new Font("Segoe UI", Font.BOLD, 13), Color.WHITE
        ));

        mainPanel.add(scrollTable, BorderLayout.CENTER);

        // 5. BOTTOM ACTION TOOLBAR
        JPanel bottomBar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 10));
        bottomBar.setOpaque(false);

        JButton btnAddExpense = new JButton("💳 ➕ Add Expense");
        btnAddExpense.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnAddExpense.setBackground(new Color(99, 102, 241));
        btnAddExpense.setForeground(Color.WHITE);
        btnAddExpense.addActionListener(e -> {
            if (currentTrip == null) {
                JOptionPane.showMessageDialog(this, "Please select or create a trip first.", "Info", JOptionPane.INFORMATION_MESSAGE);
                return;
            }
            AddExpenseDialog dlg = new AddExpenseDialog(this, currentTrip, currentTravelers, expenseDAO);
            dlg.setVisible(true);
            if (dlg.isExpenseAdded()) {
                refreshTripData();
            }
        });

        JButton btnSplit = new JButton("⚖️ Split Expenses & Settle Debt");
        btnSplit.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnSplit.setBackground(new Color(16, 185, 129));
        btnSplit.setForeground(Color.WHITE);
        btnSplit.addActionListener(e -> {
            if (currentTrip == null || currentTravelers.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Add travelers and expenses to split.", "Info", JOptionPane.INFORMATION_MESSAGE);
                return;
            }
            new SplitCalculatorDialog(this, currentTravelers, currentExpenses).setVisible(true);
        });

        JButton btnRefresh = new JButton("🔄 Refresh");
        btnRefresh.setBackground(new Color(51, 65, 85));
        btnRefresh.setForeground(Color.WHITE);
        btnRefresh.addActionListener(e -> refreshTripData());

        bottomBar.add(btnRefresh);
        bottomBar.add(btnSplit);
        bottomBar.add(btnAddExpense);

        mainPanel.add(bottomBar, BorderLayout.SOUTH);

        add(mainPanel);
    }

    private JPanel createCard(String title, JLabel valueLabel, Color accentColor) {
        JPanel card = new JPanel(new BorderLayout(5, 5));
        card.setBackground(new Color(30, 41, 59));
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
                BorderFactory.createEmptyBorder(12, 16, 12, 16)
        ));

        JLabel lblTitle = new JLabel(title);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 12));
        lblTitle.setForeground(new Color(148, 163, 184));

        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 20));
        valueLabel.setForeground(accentColor);

        card.add(lblTitle, BorderLayout.NORTH);
        card.add(valueLabel, BorderLayout.CENTER);
        return card;
    }

    private void loadTrips() {
        cmbTrips.removeAllItems();
        List<Trip> trips = tripDAO.getTripsByUserId(currentUser.getUserId());
        for (Trip t : trips) {
            cmbTrips.addItem(t);
        }
        if (!trips.isEmpty()) {
            cmbTrips.setSelectedIndex(0);
        }
    }

    private void onTripSelected() {
        currentTrip = (Trip) cmbTrips.getSelectedItem();
        refreshTripData();
    }

    private void refreshTripData() {
        if (currentTrip == null) return;

        currentTravelers = travelerDAO.getTravelersByTripId(currentTrip.getTripId());
        currentExpenses = expenseDAO.getExpensesByTripId(currentTrip.getTripId());

        // Update Trip composition
        currentTrip.getTravelers().clear();
        currentTrip.getTravelers().addAll(currentTravelers);
        currentTrip.getExpenses().clear();
        currentTrip.getExpenses().addAll(currentExpenses);

        // Update table
        expenseTableModel.setRowCount(0);
        for (Expense exp : currentExpenses) {
            expenseTableModel.addRow(new Object[]{
                    exp.getExpenseId(),
                    exp.getTitle(),
                    exp.getCategory(),
                    exp.getPayerName(),
                    String.format("%.2f", exp.getBaseAmount()),
                    String.format("%.2f", exp.getTaxOrFees()),
                    String.format("%.2f", exp.calculateTotalAmount()), // Polymorphic dispatch
                    exp.getExpenseDate(),
                    exp.getNotes()
            });
        }

        // Update KPI Cards
        double totalSpent = currentTrip.getTotalSpent();
        double remaining = currentTrip.getRemainingBudget();
        double percent = Math.min(100, Math.max(0, currentTrip.getBudgetUsagePercentage()));

        lblTotalBudget.setText(String.format("$%.2f", currentTrip.getTotalBudget()));
        lblTotalSpent.setText(String.format("$%.2f", totalSpent));
        lblRemaining.setText(String.format("$%.2f", remaining));

        progressBudget.setValue((int) percent);
        progressBudget.setString(String.format("Budget Used: %.1f%% ($%.2f / $%.2f)", percent, totalSpent, currentTrip.getTotalBudget()));

        if (percent > 90) {
            progressBudget.setForeground(new Color(239, 68, 68)); // Red warning
        } else if (percent > 70) {
            progressBudget.setForeground(new Color(245, 158, 11)); // Amber
        } else {
            progressBudget.setForeground(new Color(16, 185, 129)); // Green
        }
    }

    private void promptAddTraveler() {
        if (currentTrip == null) return;
        String name = JOptionPane.showInputDialog(this, "Enter Traveler Name:", "Add Traveler", JOptionPane.QUESTION_MESSAGE);
        if (name != null && !name.trim().isEmpty()) {
            Traveler t = new Traveler(currentTrip.getTripId(), name.trim(), "", "#4F46E5");
            travelerDAO.addTraveler(t);
            refreshTripData();
            JOptionPane.showMessageDialog(this, "Traveler added to trip!", "Success", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private void openRecommendations() {
        RecommendationDialog dlg = new RecommendationDialog(
                this, currentUser, tripDAO, travelerDAO, expenseDAO, currentTrip
        );
        dlg.setVisible(true);
        if (dlg.isTripCreated()) {
            loadTrips();
            Trip newTrip = dlg.getNewlyCreatedTrip();
            if (newTrip != null) {
                for (int i = 0; i < cmbTrips.getItemCount(); i++) {
                    Trip t = cmbTrips.getItemAt(i);
                    if (t.getTripId() == newTrip.getTripId()) {
                        cmbTrips.setSelectedIndex(i);
                        break;
                    }
                }
            }
        }
    }
}
