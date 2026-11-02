package com.tripbudget.gui;

import com.tripbudget.dao.ExpenseDAO;
import com.tripbudget.dao.TravelerDAO;
import com.tripbudget.dao.TripDAO;
import com.tripbudget.models.Destination;
import com.tripbudget.models.Trip;
import com.tripbudget.models.User;
import com.tripbudget.services.RecommendationEngine;
import com.tripbudget.services.RecommendationEngine.RecommendationMatch;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * ============================================================================
 * RecommendationDialog.java — GUI for Budget Destination Recommendations
 * Features multi-factor filtering, strategy selection, itemized cost cards,
 * and 1-click Trip generation into the database.
 * ============================================================================
 */
public class RecommendationDialog extends JDialog {
    private final User currentUser;
    private final TripDAO tripDAO;
    private final TravelerDAO travelerDAO;
    private final ExpenseDAO expenseDAO;
    private final Trip activeTrip;

    private final RecommendationEngine engine;
    private List<RecommendationMatch> currentMatches = new ArrayList<>();

    // Controls
    private JTextField txtBudget;
    private JComboBox<String> cmbTravelers;
    private JComboBox<String> cmbDuration;
    private JComboBox<String> cmbStyle;
    private JComboBox<String> cmbVibe;
    private JComboBox<String> cmbRegion;
    private JComboBox<String> cmbFitFilter;

    // Results Table & Details
    private DefaultTableModel tableModel;
    private JTable tblResults;
    private JLabel lblStatusCount;

    // Destination Details Components
    private JLabel lblDetailName;
    private JLabel lblDetailLocation;
    private JLabel lblDetailRating;
    private JLabel lblDetailTotalCost;
    private JLabel lblDetailDelta;
    private JTextArea txtDetailDesc;
    private JLabel lblCostFlight;
    private JLabel lblCostHotel;
    private JLabel lblCostFood;
    private JLabel lblCostActivities;
    private JLabel lblCostBuffer;
    private JLabel lblDetailSeason;
    private JTextArea txtHighlights;
    private JButton btnPlanTrip;

    private RecommendationMatch selectedMatch;
    private boolean tripCreated = false;
    private Trip newlyCreatedTrip = null;

    public RecommendationDialog(Frame parent, User user, TripDAO tripDAO,
                                TravelerDAO travelerDAO, ExpenseDAO expenseDAO, Trip activeTrip) {
        super(parent, "Where Can I Go? — Smart Budget Recommendation Engine", true);
        this.currentUser = user;
        this.tripDAO = tripDAO;
        this.travelerDAO = travelerDAO;
        this.expenseDAO = expenseDAO;
        this.activeTrip = activeTrip;
        this.engine = new RecommendationEngine();

        setSize(1040, 720);
        setLocationRelativeTo(parent);
        setMinimumSize(new Dimension(860, 600));

        initUI();
        refreshRecommendations();
    }

    private void initUI() {
        JPanel mainPanel = new JPanel(new BorderLayout(12, 12));
        mainPanel.setBackground(new Color(15, 23, 42)); // Slate 900
        mainPanel.setBorder(new EmptyBorder(16, 18, 16, 18));

        // 1. TOP HEADER & TELEMETRY
        JPanel headerPanel = new JPanel(new BorderLayout(10, 5));
        headerPanel.setOpaque(false);

        JLabel lblTitle = new JLabel("🧭 Where Can I Go? — Budget Travel Advisor");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 20));
        lblTitle.setForeground(Color.WHITE);

        JLabel lblSubtitle = new JLabel("Enter your budget and travel style to discover perfectly matched destinations and itemized expense breakdowns.");
        lblSubtitle.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblSubtitle.setForeground(new Color(148, 163, 184));

        JPanel titleWrap = new JPanel(new GridLayout(2, 1, 0, 2));
        titleWrap.setOpaque(false);
        titleWrap.add(lblTitle);
        titleWrap.add(lblSubtitle);

        JButton btnMatchTrip = new JButton("🎯 Use Active Trip Budget");
        btnMatchTrip.setBackground(new Color(30, 41, 59));
        btnMatchTrip.setForeground(new Color(253, 224, 71));
        btnMatchTrip.setFocusPainted(false);
        btnMatchTrip.addActionListener(e -> matchActiveTripBudget());

        headerPanel.add(titleWrap, BorderLayout.WEST);
        headerPanel.add(btnMatchTrip, BorderLayout.EAST);

        // 2. FILTER & CONTROL DECK
        JPanel controlDeck = new JPanel(new GridBagLayout());
        controlDeck.setBackground(new Color(30, 41, 59));
        controlDeck.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
                BorderFactory.createEmptyBorder(12, 14, 12, 14)
        ));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(4, 6, 4, 6);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // Row 1: Budget input + Presets
        gbc.gridx = 0; gbc.gridy = 0;
        controlDeck.add(createLabel("💰 Target Budget ($):"), gbc);

        gbc.gridx = 1;
        double initialBudget = (activeTrip != null && activeTrip.getTotalBudget() > 0)
                ? activeTrip.getTotalBudget() : 1500.0;
        txtBudget = new JTextField(String.format("%.0f", initialBudget), 8);
        txtBudget.setFont(new Font("Segoe UI", Font.BOLD, 14));
        txtBudget.setBackground(new Color(15, 23, 42));
        txtBudget.setForeground(new Color(253, 224, 71));
        txtBudget.setCaretColor(Color.WHITE);
        txtBudget.addActionListener(e -> refreshRecommendations());
        controlDeck.add(txtBudget, gbc);

        gbc.gridx = 2;
        JPanel presetPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 4, 0));
        presetPanel.setOpaque(false);
        int[] presets = {500, 1000, 2000, 3500, 5000};
        for (int p : presets) {
            JButton btnP = new JButton("$" + p);
            btnP.setFont(new Font("Segoe UI", Font.PLAIN, 11));
            btnP.setBackground(new Color(51, 65, 85));
            btnP.setForeground(Color.WHITE);
            btnP.setMargin(new Insets(2, 6, 2, 6));
            btnP.setFocusPainted(false);
            btnP.addActionListener(e -> {
                txtBudget.setText(String.valueOf(p));
                refreshRecommendations();
            });
            presetPanel.add(btnP);
        }
        controlDeck.add(presetPanel, gbc);

        // Row 2: Travelers & Duration
        gbc.gridx = 0; gbc.gridy = 1;
        controlDeck.add(createLabel("👥 Travelers:"), gbc);

        gbc.gridx = 1;
        cmbTravelers = new JComboBox<>(new String[]{"1 (Solo)", "2 (Couple)", "3 (Group)", "4 (Friends)", "6 (Large Group)"});
        cmbTravelers.setSelectedIndex(1);
        cmbTravelers.addActionListener(e -> refreshRecommendations());
        controlDeck.add(cmbTravelers, gbc);

        gbc.gridx = 2;
        JPanel durAndStyle = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        durAndStyle.setOpaque(false);

        durAndStyle.add(createLabel("⏱️ Duration:"));
        cmbDuration = new JComboBox<>(new String[]{"3 Days (Weekend)", "5 Days (Break)", "7 Days (1 Wk)", "10 Days (Tour)", "14 Days (Grand)"});
        cmbDuration.setSelectedIndex(1);
        cmbDuration.addActionListener(e -> refreshRecommendations());
        durAndStyle.add(cmbDuration);

        durAndStyle.add(createLabel("✨ Style (Strategy):"));
        cmbStyle = new JComboBox<>(new String[]{"🎒 Backpacker (Budget)", "🧳 Moderate (Comfort)", "🥂 Luxury (Premium)"});
        cmbStyle.setSelectedIndex(1);
        cmbStyle.addActionListener(e -> refreshRecommendations());
        durAndStyle.add(cmbStyle);

        controlDeck.add(durAndStyle, gbc);

        // Row 3: Vibe, Region, and Fit
        gbc.gridx = 0; gbc.gridy = 2;
        controlDeck.add(createLabel("🌴 Preferred Vibe:"), gbc);

        gbc.gridx = 1;
        cmbVibe = new JComboBox<>(new String[]{"All Vibes", "Beach", "Mountain", "Heritage", "City", "Adventure", "Wellness", "Foodie"});
        cmbVibe.addActionListener(e -> refreshRecommendations());
        controlDeck.add(cmbVibe, gbc);

        gbc.gridx = 2;
        JPanel regAndFit = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        regAndFit.setOpaque(false);

        regAndFit.add(createLabel("🗺️ Region:"));
        cmbRegion = new JComboBox<>(new String[]{"All Regions", "Domestic", "Southeast Asia", "Europe", "Middle East", "East Asia"});
        cmbRegion.addActionListener(e -> refreshRecommendations());
        regAndFit.add(cmbRegion);

        regAndFit.add(createLabel("🎯 Budget Fit:"));
        cmbFitFilter = new JComboBox<>(new String[]{"All Matches", "Within Budget Only", "Budget Savers (>=30% Surplus)", "Stretch (<=15% Stretch)"});
        cmbFitFilter.addActionListener(e -> refreshRecommendations());
        regAndFit.add(cmbFitFilter);

        JButton btnApply = new JButton("🔍 Find Destinations");
        btnApply.setBackground(new Color(99, 102, 241));
        btnApply.setForeground(Color.WHITE);
        btnApply.addActionListener(e -> refreshRecommendations());
        regAndFit.add(btnApply);

        controlDeck.add(regAndFit, gbc);

        JPanel northPanel = new JPanel();
        northPanel.setLayout(new BoxLayout(northPanel, BoxLayout.Y_AXIS));
        northPanel.setOpaque(false);
        northPanel.add(headerPanel);
        northPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        northPanel.add(controlDeck);
        mainPanel.add(northPanel, BorderLayout.NORTH);

        // 3. CENTER: RESULTS TABLE + DETAILS PANEL (JSplitPane)
        String[] cols = {"#", "Destination", "Country", "Tier", "Est. Total ($)", "Per Person ($)", "Match Score", "Fit Status"};
        tableModel = new DefaultTableModel(cols, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        tblResults = new JTable(tableModel);
        tblResults.setRowHeight(30);
        tblResults.setBackground(new Color(30, 41, 59));
        tblResults.setForeground(Color.WHITE);
        tblResults.getTableHeader().setBackground(new Color(51, 65, 85));
        tblResults.getTableHeader().setForeground(Color.WHITE);
        tblResults.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        tblResults.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                int row = tblResults.getSelectedRow();
                if (row >= 0 && row < currentMatches.size()) {
                    displayDestinationDetails(currentMatches.get(row));
                }
            }
        });

        // Center align numerical columns
        DefaultTableCellRenderer centerRender = new DefaultTableCellRenderer();
        centerRender.setHorizontalAlignment(SwingConstants.CENTER);
        tblResults.getColumnModel().getColumn(0).setPreferredWidth(35);
        tblResults.getColumnModel().getColumn(0).setCellRenderer(centerRender);
        tblResults.getColumnModel().getColumn(3).setPreferredWidth(75);
        tblResults.getColumnModel().getColumn(3).setCellRenderer(centerRender);
        tblResults.getColumnModel().getColumn(4).setPreferredWidth(95);
        tblResults.getColumnModel().getColumn(4).setCellRenderer(centerRender);
        tblResults.getColumnModel().getColumn(5).setPreferredWidth(95);
        tblResults.getColumnModel().getColumn(5).setCellRenderer(centerRender);
        tblResults.getColumnModel().getColumn(6).setPreferredWidth(85);
        tblResults.getColumnModel().getColumn(6).setCellRenderer(centerRender);
        tblResults.getColumnModel().getColumn(7).setPreferredWidth(140);

        JScrollPane scrollTable = new JScrollPane(tblResults);
        scrollTable.getViewport().setBackground(new Color(30, 41, 59));
        scrollTable.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85)),
                "Recommended Destinations (Ranked by Compatibility)",
                0, 0, new Font("Segoe UI", Font.BOLD, 12), Color.WHITE
        ));

        // Details Panel (Right side)
        JPanel detailsPanel = createDetailsPanel();

        JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, scrollTable, detailsPanel);
        splitPane.setDividerLocation(580);
        splitPane.setResizeWeight(0.60);
        splitPane.setOpaque(false);
        splitPane.setBorder(null);

        mainPanel.add(splitPane, BorderLayout.CENTER);

        // 4. BOTTOM BAR: TELEMETRY SUMMARY & ACTIONS
        JPanel bottomBar = new JPanel(new BorderLayout());
        bottomBar.setOpaque(false);

        lblStatusCount = new JLabel("Analyzing destinations...");
        lblStatusCount.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblStatusCount.setForeground(new Color(148, 163, 184));

        JPanel bottomActions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        bottomActions.setOpaque(false);

        JButton btnClose = new JButton("Close");
        btnClose.setBackground(new Color(51, 65, 85));
        btnClose.setForeground(Color.WHITE);
        btnClose.addActionListener(e -> dispose());

        bottomActions.add(btnClose);

        bottomBar.add(lblStatusCount, BorderLayout.WEST);
        bottomBar.add(bottomActions, BorderLayout.EAST);

        mainPanel.add(bottomBar, BorderLayout.SOUTH);

        add(mainPanel);
    }

    private JPanel createDetailsPanel() {
        JPanel panel = new JPanel(new BorderLayout(8, 8));
        panel.setBackground(new Color(30, 41, 59));
        panel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createTitledBorder(
                        BorderFactory.createLineBorder(new Color(51, 65, 85)),
                        "Destination Deep Dive & Cost Intelligence",
                        TitledBorder.DEFAULT_JUSTIFICATION, TitledBorder.DEFAULT_POSITION,
                        new Font("Segoe UI", Font.BOLD, 12), Color.WHITE
                ),
                BorderFactory.createEmptyBorder(10, 12, 10, 12)
        ));

        // Header
        JPanel header = new JPanel(new GridLayout(3, 1, 2, 2));
        header.setOpaque(false);

        lblDetailName = new JLabel("Select a Destination");
        lblDetailName.setFont(new Font("Segoe UI", Font.BOLD, 18));
        lblDetailName.setForeground(Color.WHITE);

        lblDetailLocation = new JLabel("📍 Location details");
        lblDetailLocation.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblDetailLocation.setForeground(new Color(148, 163, 184));

        lblDetailRating = new JLabel("★ 4.9 · Moderate Tier");
        lblDetailRating.setFont(new Font("Segoe UI", Font.BOLD, 12));
        lblDetailRating.setForeground(new Color(253, 224, 71));

        header.add(lblDetailName);
        header.add(lblDetailLocation);
        header.add(lblDetailRating);

        // Price Callout Card
        JPanel priceCard = new JPanel(new GridLayout(2, 2, 8, 4));
        priceCard.setBackground(new Color(15, 23, 42));
        priceCard.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
        ));

        JLabel lblTotalTag = new JLabel("ESTIMATED TOTAL:");
        lblTotalTag.setFont(new Font("Segoe UI", Font.PLAIN, 10));
        lblTotalTag.setForeground(new Color(148, 163, 184));

        JLabel lblDeltaTag = new JLabel("BUDGET SURPLUS / FIT:");
        lblDeltaTag.setFont(new Font("Segoe UI", Font.PLAIN, 10));
        lblDeltaTag.setForeground(new Color(148, 163, 184));

        lblDetailTotalCost = new JLabel("$0.00");
        lblDetailTotalCost.setFont(new Font("Segoe UI", Font.BOLD, 20));
        lblDetailTotalCost.setForeground(Color.WHITE);

        lblDetailDelta = new JLabel("+ $0.00 Surplus");
        lblDetailDelta.setFont(new Font("Segoe UI", Font.BOLD, 14));
        lblDetailDelta.setForeground(new Color(16, 185, 129));

        priceCard.add(lblTotalTag);
        priceCard.add(lblDeltaTag);
        priceCard.add(lblDetailTotalCost);
        priceCard.add(lblDetailDelta);

        // Itemized Cost Breakdown Grid
        JPanel itemizedPanel = new JPanel(new GridLayout(5, 2, 6, 4));
        itemizedPanel.setOpaque(false);
        itemizedPanel.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85)),
                "Itemized Expense Allocations",
                TitledBorder.DEFAULT_JUSTIFICATION, TitledBorder.DEFAULT_POSITION,
                new Font("Segoe UI", Font.BOLD, 11), Color.WHITE
        ));

        lblCostFlight = new JLabel("$0");
        lblCostHotel = new JLabel("$0");
        lblCostFood = new JLabel("$0");
        lblCostActivities = new JLabel("$0");
        lblCostBuffer = new JLabel("$0");

        lblCostFlight.setForeground(new Color(56, 189, 248));
        lblCostHotel.setForeground(new Color(167, 139, 250));
        lblCostFood.setForeground(new Color(244, 114, 182));
        lblCostActivities.setForeground(new Color(52, 211, 153));
        lblCostBuffer.setForeground(new Color(148, 163, 184));

        itemizedPanel.add(createLabel("✈️ Flight & Transit:"));
        itemizedPanel.add(lblCostFlight);
        itemizedPanel.add(createLabel("🏨 Accommodation:"));
        itemizedPanel.add(lblCostHotel);
        itemizedPanel.add(createLabel("🍽️ Food & Dining:"));
        itemizedPanel.add(lblCostFood);
        itemizedPanel.add(createLabel("🎟️ Sightseeing:"));
        itemizedPanel.add(lblCostActivities);
        itemizedPanel.add(createLabel("🛡️ Contingency:"));
        itemizedPanel.add(lblCostBuffer);

        // Center content: Description + Highlights
        JPanel centerContent = new JPanel();
        centerContent.setLayout(new BoxLayout(centerContent, BoxLayout.Y_AXIS));
        centerContent.setOpaque(false);

        txtDetailDesc = new JTextArea("Select a destination on the left to inspect its budget breakdown.");
        txtDetailDesc.setWrapStyleWord(true);
        txtDetailDesc.setLineWrap(true);
        txtDetailDesc.setEditable(false);
        txtDetailDesc.setOpaque(false);
        txtDetailDesc.setForeground(new Color(203, 213, 225));
        txtDetailDesc.setFont(new Font("Segoe UI", Font.PLAIN, 12));

        lblDetailSeason = new JLabel("🗓️ Best Season: Oct - Mar");
        lblDetailSeason.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lblDetailSeason.setForeground(new Color(253, 224, 71));

        txtHighlights = new JTextArea();
        txtHighlights.setWrapStyleWord(true);
        txtHighlights.setLineWrap(true);
        txtHighlights.setEditable(false);
        txtHighlights.setOpaque(false);
        txtHighlights.setForeground(new Color(148, 163, 184));
        txtHighlights.setFont(new Font("Segoe UI", Font.PLAIN, 11));

        centerContent.add(priceCard);
        centerContent.add(Box.createRigidArea(new Dimension(0, 8)));
        centerContent.add(itemizedPanel);
        centerContent.add(Box.createRigidArea(new Dimension(0, 8)));
        centerContent.add(txtDetailDesc);
        centerContent.add(Box.createRigidArea(new Dimension(0, 6)));
        centerContent.add(lblDetailSeason);
        centerContent.add(Box.createRigidArea(new Dimension(0, 6)));
        centerContent.add(createLabel("⭐ Must-Experience Sights:"));
        centerContent.add(txtHighlights);

        // Footer: Action button
        btnPlanTrip = new JButton("🚀 Plan Trip Here & Generate Expenses");
        btnPlanTrip.setFont(new Font("Segoe UI", Font.BOLD, 13));
        btnPlanTrip.setBackground(new Color(16, 185, 129));
        btnPlanTrip.setForeground(Color.WHITE);
        btnPlanTrip.setEnabled(false);
        btnPlanTrip.addActionListener(e -> onPlanTripClicked());

        panel.add(header, BorderLayout.NORTH);
        panel.add(new JScrollPane(centerContent), BorderLayout.CENTER);
        panel.add(btnPlanTrip, BorderLayout.SOUTH);

        return panel;
    }

    private void refreshRecommendations() {
        try {
            double budget = Double.parseDouble(txtBudget.getText().trim());
            int travelers = parseTravelersCount();
            int days = parseDurationDays();
            String style = parseStyle();
            String vibe = (String) cmbVibe.getSelectedItem();
            String region = (String) cmbRegion.getSelectedItem();
            String fitFilter = (String) cmbFitFilter.getSelectedItem();

            List<RecommendationMatch> allMatches = engine.getRecommendations(budget, travelers, days, style, vibe, region);

            // Filter by budget fit if requested
            currentMatches = new ArrayList<>();
            for (RecommendationMatch m : allMatches) {
                if ("Within Budget Only".equals(fitFilter)) {
                    if (m.isWithinBudget()) currentMatches.add(m);
                } else if ("Budget Savers (>=30% Surplus)".equals(fitFilter)) {
                    if ("BUDGET_SAVER".equals(m.getFitStatus())) currentMatches.add(m);
                } else if ("Stretch (<=15% Stretch)".equals(fitFilter)) {
                    if ("STRETCH".equals(m.getFitStatus())) currentMatches.add(m);
                } else {
                    currentMatches.add(m);
                }
            }

            // Populate Table
            tableModel.setRowCount(0);
            int rank = 1;
            for (RecommendationMatch m : currentMatches) {
                Destination d = m.getDestination();
                tableModel.addRow(new Object[]{
                        rank++,
                        d.getName(),
                        d.getCountry(),
                        d.getTier(),
                        String.format("$%,.0f", m.getEstimatedCost()),
                        String.format("$%,.0f", m.getCostBreakdown().perPerson),
                        m.getMatchPercentage() + "%",
                        m.getStatusLabel()
                });
            }

            int withinCount = 0;
            int saverCount = 0;
            for (RecommendationMatch m : currentMatches) {
                if (m.isWithinBudget()) withinCount++;
                if ("BUDGET_SAVER".equals(m.getFitStatus())) saverCount++;
            }

            lblStatusCount.setText(String.format("Found %d destination(s) for $%,.0f budget (%d travelers, %d days) — %d within budget (%d savers).",
                    currentMatches.size(), budget, travelers, days, withinCount, saverCount));

            if (!currentMatches.isEmpty()) {
                tblResults.setRowSelectionInterval(0, 0);
                displayDestinationDetails(currentMatches.get(0));
            } else {
                clearDetails();
            }

        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Please enter a valid numeric budget.", "Invalid Input", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void displayDestinationDetails(RecommendationMatch match) {
        this.selectedMatch = match;
        Destination d = match.getDestination();
        Destination.CostBreakdown cb = match.getCostBreakdown();

        lblDetailName.setText(d.getName());
        lblDetailLocation.setText("📍 " + d.getCountry() + " · " + d.getRegion() + " · " + d.getTagline());
        lblDetailRating.setText("★ " + d.getRating() + " · " + d.getTier() + " Tier · " + match.getMatchPercentage() + "% Match");

        lblDetailTotalCost.setText(String.format("$%,.0f", cb.total));

        if (match.getSurplusOrDeficit() >= 0) {
            lblDetailDelta.setText(String.format("+ $%,.0f Surplus", match.getSurplusOrDeficit()));
            lblDetailDelta.setForeground(new Color(16, 185, 129));
        } else {
            lblDetailDelta.setText(String.format("- $%,.0f Stretch", Math.abs(match.getSurplusOrDeficit())));
            lblDetailDelta.setForeground(new Color(245, 158, 11));
        }

        lblCostFlight.setText(String.format("$%,.0f", cb.flight));
        lblCostHotel.setText(String.format("$%,.0f (%d nights, %d rms)", cb.hotel, cb.nights, cb.rooms));
        lblCostFood.setText(String.format("$%,.0f", cb.food));
        lblCostActivities.setText(String.format("$%,.0f", cb.activities));
        lblCostBuffer.setText(String.format("$%,.0f", cb.contingency));

        txtDetailDesc.setText(d.getDescription());
        lblDetailSeason.setText("🗓️ Best Season: " + d.getBestSeason() + " (Ideal: " + d.getIdealDaysMin() + " - " + d.getIdealDaysMax() + " Days)");

        StringBuilder sb = new StringBuilder();
        for (String h : d.getHighlights()) {
            sb.append("• ").append(h).append("\n");
        }
        txtHighlights.setText(sb.toString().trim());

        btnPlanTrip.setEnabled(true);
        btnPlanTrip.setText("🚀 Plan Trip to " + d.getName() + " ($" + Math.round(cb.total) + ")");
    }

    private void clearDetails() {
        this.selectedMatch = null;
        lblDetailName.setText("No Matches Found");
        lblDetailLocation.setText("Try increasing your budget or choosing 'All Vibes'");
        lblDetailRating.setText("");
        lblDetailTotalCost.setText("$0.00");
        lblDetailDelta.setText("");
        txtDetailDesc.setText("No destinations fit current budget constraints.");
        lblCostFlight.setText("$0");
        lblCostHotel.setText("$0");
        lblCostFood.setText("$0");
        lblCostActivities.setText("$0");
        lblCostBuffer.setText("$0");
        lblDetailSeason.setText("");
        txtHighlights.setText("");
        btnPlanTrip.setEnabled(false);
    }

    private void matchActiveTripBudget() {
        if (activeTrip != null && activeTrip.getTotalBudget() > 0) {
            txtBudget.setText(String.format("%.0f", activeTrip.getTotalBudget()));
            refreshRecommendations();
            JOptionPane.showMessageDialog(this,
                    "Matched budget from active trip \"" + activeTrip.getTitle() + "\" ($" + activeTrip.getTotalBudget() + ")",
                    "Active Trip Budget Loaded", JOptionPane.INFORMATION_MESSAGE);
        } else {
            JOptionPane.showMessageDialog(this, "No active trip found to match.", "Info", JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private void onPlanTripClicked() {
        if (selectedMatch == null) return;

        Destination dest = selectedMatch.getDestination();
        String defaultTitle = dest.getName() + " Getaway 2026";

        JTextField txtTitle = new JTextField(defaultTitle);
        JTextField txtTravelers = new JTextField(currentUser.getFullName() + ", Alex Morgan");
        JCheckBox chkIncludeExpenses = new JCheckBox("Auto-generate initial polymorphic expenses (Flight, Hotel, Food, Activities)", true);

        JPanel promptPanel = new JPanel(new GridLayout(5, 1, 6, 6));
        promptPanel.add(new JLabel("Trip Title:"));
        promptPanel.add(txtTitle);
        promptPanel.add(new JLabel("Travelers (Comma-separated names):"));
        promptPanel.add(txtTravelers);
        promptPanel.add(chkIncludeExpenses);

        int result = JOptionPane.showConfirmDialog(
                this, promptPanel,
                "Convert Recommendation into Active Trip",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE
        );

        if (result == JOptionPane.OK_OPTION) {
            try {
                String title = txtTitle.getText().trim();
                List<String> travelerNames = new ArrayList<>();
                for (String s : txtTravelers.getText().split(",")) {
                    if (!s.trim().isEmpty()) travelerNames.add(s.trim());
                }
                if (travelerNames.isEmpty()) travelerNames.add(currentUser.getFullName());

                boolean includeExp = chkIncludeExpenses.isSelected();

                Trip trip = engine.createTripFromRecommendation(
                        selectedMatch, currentUser, title, travelerNames, includeExp,
                        tripDAO, travelerDAO, expenseDAO
                );

                this.tripCreated = true;
                this.newlyCreatedTrip = trip;

                JOptionPane.showMessageDialog(
                        this,
                        "🎉 Successfully created trip \"" + trip.getTitle() + "\" with "
                                + (includeExp ? "4 pre-allocated starting expenses!" : "travelers configured."),
                        "Trip Created", JOptionPane.INFORMATION_MESSAGE
                );

                dispose();
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error creating trip: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private int parseTravelersCount() {
        String item = (String) cmbTravelers.getSelectedItem();
        if (item != null && item.startsWith("1")) return 1;
        if (item != null && item.startsWith("2")) return 2;
        if (item != null && item.startsWith("3")) return 3;
        if (item != null && item.startsWith("4")) return 4;
        return 6;
    }

    private int parseDurationDays() {
        String item = (String) cmbDuration.getSelectedItem();
        if (item != null && item.startsWith("3")) return 3;
        if (item != null && item.startsWith("5")) return 5;
        if (item != null && item.startsWith("7")) return 7;
        if (item != null && item.startsWith("10")) return 10;
        return 14;
    }

    private String parseStyle() {
        String item = (String) cmbStyle.getSelectedItem();
        if (item != null && item.contains("Backpacker")) return "BACKPACKER";
        if (item != null && item.contains("Luxury")) return "LUXURY";
        return "MODERATE";
    }

    private JLabel createLabel(String text) {
        JLabel l = new JLabel(text);
        l.setFont(new Font("Segoe UI", Font.BOLD, 12));
        l.setForeground(new Color(226, 232, 240));
        return l;
    }

    public boolean isTripCreated() {
        return tripCreated;
    }

    public Trip getNewlyCreatedTrip() {
        return newlyCreatedTrip;
    }
}

