package com.tripbudget.models;

import com.tripbudget.exceptions.ValidationException;
import com.tripbudget.interfaces.Validatable;
import com.tripbudget.util.StringUtils;

/**
 * User Entity Class - Demonstrates Encapsulation and implements Validatable
 */
public class User implements Validatable {
    private int userId;
    private String username;
    private String passwordHash;
    private String fullName;
    private String email;
    private String role;

    public User(int userId, String username, String passwordHash, String fullName, String email, String role) {
        this.userId = userId;
        this.username = username != null ? username.trim() : "";
        this.passwordHash = passwordHash != null ? passwordHash : "";
        this.fullName = fullName != null ? fullName.trim() : "";
        this.email = email != null ? email.trim() : "";
        this.role = role != null ? role.trim() : "USER";
    }

    public User(String username, String passwordHash, String fullName, String email) {
        this(0, username, passwordHash, fullName, email, "USER");
    }

    /**
     * Implements Validatable.validate()
     * @throws ValidationException if username is blank or email is malformed
     */
    @Override
    public void validate() throws ValidationException {
        if (StringUtils.isBlank(this.username)) {
            throw new ValidationException("username", "Username cannot be blank or empty.");
        }
        if (StringUtils.isNotBlank(this.email) && !StringUtils.isValidEmail(this.email)) {
            throw new ValidationException("email", "Invalid email format: " + this.email);
        }
    }

    // Encapsulated Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
