package com.tripbudget.gui;

import com.tripbudget.dao.UserDAO;
import com.tripbudget.models.User;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;

/**
 * ============================================================================
 * Login GUI (Fulfills GUI Design - 5 Marks & User Login Interface)
 * ============================================================================
 * Features:
 * - Professional dark-themed UI with clean typography
 * - Form validation and error messaging
 * - Demo 1-Click login filler for evaluation
 * - Registration link
 * - Direct launch into the Trip Budget Dashboard upon authentication
 */
public class LoginFrame extends JFrame {
    private final JTextField txtUsername;
    private final JPasswordField txtPassword;
    private final JLabel lblStatus;
    private final UserDAO userDAO;

    public LoginFrame() {
        this.userDAO = new UserDAO();

        setTitle("TripBudget Planner - User Login");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(480, 560);
        setLocationRelativeTo(null);
        setResizable(false);

        // Main Background Panel
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.setBackground(new Color(15, 23, 42)); // Slate 900
        mainPanel.setBorder(new EmptyBorder(30, 40, 30, 40));

        // Header / Brand
        JLabel lblIcon = new JLabel("✈️", SwingConstants.CENTER);
        lblIcon.setFont(new Font("Segoe UI Emoji", Font.PLAIN, 46));
        lblIcon.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel lblTitle = new JLabel("TripBudget Planner");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 22));
        lblTitle.setForeground(new Color(248, 250, 252));
        lblTitle.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel lblSubtitle = new JLabel("PBL Java Project | OOP & JDBC Architecture");
        lblSubtitle.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblSubtitle.setForeground(new Color(148, 163, 184));
        lblSubtitle.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Input Form Container
        JPanel formPanel = new JPanel();
        formPanel.setLayout(new GridLayout(4, 1, 0, 10));
        formPanel.setOpaque(false);
        formPanel.setBorder(new EmptyBorder(25, 0, 15, 0));

        // Username
        JLabel lblUser = new JLabel("Username");
        lblUser.setFont(new Font("Segoe UI", Font.BOLD, 13));
        lblUser.setForeground(new Color(226, 232, 240));

        txtUsername = new JTextField(20);
        txtUsername.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        txtUsername.setBackground(new Color(30, 41, 59));
        txtUsername.setForeground(Color.WHITE);
        txtUsername.setCaretColor(Color.WHITE);
        txtUsername.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
        ));

        // Password
        JLabel lblPass = new JLabel("Password");
        lblPass.setFont(new Font("Segoe UI", Font.BOLD, 13));
        lblPass.setForeground(new Color(226, 232, 240));

        txtPassword = new JPasswordField(20);
        txtPassword.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        txtPassword.setBackground(new Color(30, 41, 59));
        txtPassword.setForeground(Color.WHITE);
        txtPassword.setCaretColor(Color.WHITE);
        txtPassword.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
                BorderFactory.createEmptyBorder(8, 10, 8, 10)
        ));

        formPanel.add(lblUser);
        formPanel.add(txtUsername);
        formPanel.add(lblPass);
        formPanel.add(txtPassword);

        // Status / Error message label
        lblStatus = new JLabel(" ", SwingConstants.CENTER);
        lblStatus.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        lblStatus.setForeground(new Color(239, 68, 68)); // Red error
        lblStatus.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Login Button
        JButton btnLogin = new JButton("Sign In");
        btnLogin.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnLogin.setBackground(new Color(99, 102, 241)); // Indigo 500
        btnLogin.setForeground(Color.WHITE);
        btnLogin.setFocusPainted(false);
        btnLogin.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnLogin.setMaximumSize(new Dimension(Integer.MAX_VALUE, 42));
        btnLogin.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnLogin.addActionListener(this::handleLogin);

        // Quick Demo Auto-Fill Button (For Evaluation & Demo)
        JButton btnDemo = new JButton("⚡ Auto-Fill Demo User (demo / demo123)");
        btnDemo.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnDemo.setBackground(new Color(30, 41, 59));
        btnDemo.setForeground(new Color(165, 180, 252));
        btnDemo.setFocusPainted(false);
        btnDemo.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnDemo.setMaximumSize(new Dimension(Integer.MAX_VALUE, 36));
        btnDemo.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnDemo.addActionListener(e -> {
            txtUsername.setText("demo");
            txtPassword.setText("demo123");
            lblStatus.setText("Demo credentials loaded. Click 'Sign In' or press Enter.");
            lblStatus.setForeground(new Color(52, 211, 153));
        });

        // Register Link
        JButton btnRegister = new JButton("Don't have an account? Register Here");
        btnRegister.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnRegister.setForeground(new Color(148, 163, 184));
        btnRegister.setContentAreaFilled(false);
        btnRegister.setBorderPainted(false);
        btnRegister.setFocusPainted(false);
        btnRegister.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btnRegister.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnRegister.addActionListener(e -> new RegisterDialog(this, userDAO).setVisible(true));

        // Assemble Layout
        mainPanel.add(lblIcon);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        mainPanel.add(lblTitle);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 4)));
        mainPanel.add(lblSubtitle);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        mainPanel.add(formPanel);
        mainPanel.add(lblStatus);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        mainPanel.add(btnLogin);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        mainPanel.add(btnDemo);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 12)));
        mainPanel.add(btnRegister);

        add(mainPanel);

        // Press Enter to login
        getRootPane().setDefaultButton(btnLogin);
    }

    private void handleLogin(ActionEvent e) {
        String username = txtUsername.getText().trim();
        String password = new String(txtPassword.getPassword()).trim();

        if (username.isEmpty() || password.isEmpty()) {
            lblStatus.setText("Please enter both username and password.");
            lblStatus.setForeground(new Color(239, 68, 68));
            return;
        }

        User user = userDAO.authenticate(username, password);
        if (user != null) {
            lblStatus.setText("Authentication successful! Loading dashboard...");
            lblStatus.setForeground(new Color(52, 211, 153));

            // Launch Dashboard GUI and close login
            Timer timer = new Timer(500, evt -> {
                dispose();
                new DashboardFrame(user).setVisible(true);
            });
            timer.setRepeats(false);
            timer.start();
        } else {
            lblStatus.setText("Invalid username or password. Try 'demo' / 'demo123'");
            lblStatus.setForeground(new Color(239, 68, 68));
        }
    }
}
