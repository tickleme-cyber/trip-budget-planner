package com.tripbudget.models;

import com.tripbudget.exceptions.ValidationException;
import com.tripbudget.interfaces.Searchable;
import com.tripbudget.interfaces.Validatable;
import com.tripbudget.util.StringUtils;

/**
 * Traveler Entity Class - Encapsulates participant data,
 * and implements core domain interfaces (Validatable, Searchable).
 */
public class Traveler implements Validatable, Searchable {
    private int travelerId;
    private int tripId;
    private String name;
    private String email;
    private String colorCode;

    public Traveler(int travelerId, int tripId, String name, String email, String colorCode) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Traveler name cannot be empty");
        }
        this.travelerId = travelerId;
        this.tripId = tripId;
        this.name = name.trim();
        this.email = email != null ? email.trim() : "";
        this.colorCode = colorCode != null && !colorCode.isEmpty() ? colorCode : "#4F46E5";
    }

    public Traveler(int tripId, String name, String email, String colorCode) {
        this(0, tripId, name, email, colorCode);
    }

    /**
     * Implements Validatable.validate()
     * @throws ValidationException if traveler name is empty or email format is invalid
     */
    @Override
    public void validate() throws ValidationException {
        if (StringUtils.isBlank(this.name)) {
            throw new ValidationException("name", "Traveler name cannot be empty or whitespace.");
        }
        if (StringUtils.isNotBlank(this.email) && !StringUtils.isValidEmail(this.email)) {
            throw new ValidationException("email", "Invalid email format: " + this.email);
        }
    }

    /**
     * Implements Searchable.matchesQuery()
     */
    @Override
    public boolean matchesQuery(String query) {
        return StringUtils.containsIgnoreCase(this.name, query)
                || StringUtils.containsIgnoreCase(this.email, query);
    }

    /**
     * Generates a 2-letter uppercase initials string from traveler name
     * @return Uppercase initials (e.g. "AM" for Alice Morgan)
     */
    public String getInitials() {
        return StringUtils.extractInitials(this.name);
    }

    public int getTravelerId() { return travelerId; }
    public void setTravelerId(int travelerId) { this.travelerId = travelerId; }

    public int getTripId() { return tripId; }
    public void setTripId(int tripId) { this.tripId = tripId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }

    @Override
    public String toString() {
        return name;
    }
}
