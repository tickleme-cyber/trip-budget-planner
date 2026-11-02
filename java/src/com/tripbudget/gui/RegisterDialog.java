package com.tripbudget.gui;

import com.tripbudget.dao.UserDAO;
import com.tripbudget.models.User;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

/**
 * Registration Dialog GUI - Demonstrates Input Validation & Database Insert
 */
public class RegisterDialog extends JDialog {
    public RegisterDialog(Frame parent, UserDAO userDAO) {
        super(parent, "Register New User", true);
        setSize(420, 480);
        setLocationRelativeTo(parent);
        setResizable(false);

        JPanel panel = new JPanel(new GridLayout(6, 2, 10, 15));
        panel.setBackground(new Color(15, 23, 42));
        panel.setBorder(new EmptyBorder(25, 25, 25, 25));

        JTextField txtName = new JTextField();
        JTextField txtEmail = new JTextField();
        JTextField txtUser = new JTextField();
        JPasswordField txtPass = new JPasswordField();

        panel.add(createLabel("Full Name:"));
        panel.add(txtName);
        panel.add(createLabel("Email:"));
        panel.add(txtEmail);
        panel.add(createLabel("Username:"));
        panel.add(txtUser);
        panel.add(createLabel("Password:"));
        panel.add(txtPass);

        JButton btnSubmit = new JButton("Register");
        btnSubmit.setBackground(new Color(99, 102, 241));
        btnSubmit.setForeground(Color.WHITE);
        btnSubmit.addActionListener(e -> {
            String name = txtName.getText().trim();
            String email = txtEmail.getText().trim();
            String user = txtUser.getText().trim();
            String pass = new String(txtPass.getPassword()).trim();

            if (name.isEmpty() || email.isEmpty() || user.isEmpty() || pass.isEmpty()) {
                JOptionPane.showMessageDialog(this, "All fields are required.", "Validation Error", JOptionPane.WARNING_MESSAGE);
                return;
            }

            User newUser = new User(user, pass, name, email);
            boolean ok = userDAO.register(newUser);
            if (ok) {
                JOptionPane.showMessageDialog(this, "Registration Successful! You can now log in.", "Success", JOptionPane.INFORMATION_MESSAGE);
                dispose();
            } else {
                JOptionPane.showMessageDialog(this, "Username already exists.", "Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        JButton btnCancel = new JButton("Cancel");
        btnCancel.addActionListener(e -> dispose());

        panel.add(btnSubmit);
        panel.add(btnCancel);

        add(panel);
    }

    private JLabel createLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.BOLD, 13));
        label.setForeground(new Color(226, 232, 240));
        return label;
    }
}
