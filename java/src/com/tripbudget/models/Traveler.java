package com.tripbudget.models;

/**
 * Traveler Entity Class - Encapsulates participant data
 */
public class Traveler {
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
