package com.tripbudget.dao;

import com.tripbudget.db.DBConnection;
import com.tripbudget.models.Traveler;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Traveler Data Access Object (DAO)
 */
public class TravelerDAO {
    private static final List<Traveler> memoryTravelers = new ArrayList<>();

    static {
        memoryTravelers.add(new Traveler(1, 1, "Alex Morgan", "alex@example.com", "#4F46E5"));
        memoryTravelers.add(new Traveler(2, 1, "Sarah Chen", "sarah@example.com", "#EC4899"));
        memoryTravelers.add(new Traveler(3, 1, "David Miller", "david@example.com", "#10B981"));
    }

    public List<Traveler> getTravelersByTripId(int tripId) {
        List<Traveler> list = new ArrayList<>();
        Connection conn = DBConnection.getConnection();

        if (conn != null && !DBConnection.isMemoryMode()) {
            String sql = "SELECT traveler_id, trip_id, name, email, color_code FROM travelers WHERE trip_id = ? ORDER BY traveler_id ASC";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, tripId);
                ResultSet rs = pstmt.executeQuery();
                while (rs.next()) {
                    list.add(new Traveler(
                            rs.getInt("traveler_id"),
                            rs.getInt("trip_id"),
                            rs.getString("name"),
                            rs.getString("email"),
                            rs.getString("color_code")
                    ));
                }
                return list;
            } catch (SQLException e) {
                System.err.println("❌ [TravelerDAO] Error loading travelers: " + e.getMessage());
            }
        }

        // Memory fallback
        for (Traveler t : memoryTravelers) {
            if (t.getTripId() == tripId) {
                list.add(t);
            }
        }
        return list;
    }

    public boolean addTraveler(Traveler traveler) {
        Connection conn = DBConnection.getConnection();
        if (conn != null && !DBConnection.isMemoryMode()) {
            String sql = "INSERT INTO travelers (trip_id, name, email, color_code) VALUES (?, ?, ?, ?)";
            try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setInt(1, traveler.getTripId());
                pstmt.setString(2, traveler.getName());
                pstmt.setString(3, traveler.getEmail());
                pstmt.setString(4, traveler.getColorCode());
                int affected = pstmt.executeUpdate();
                if (affected > 0) {
                    ResultSet keys = pstmt.getGeneratedKeys();
                    if (keys.next()) {
                        traveler.setTravelerId(keys.getInt(1));
                    }
                    return true;
                }
            } catch (SQLException e) {
                System.err.println("❌ [TravelerDAO] Error adding traveler: " + e.getMessage());
                return false;
            }
        }

        // Memory fallback
        traveler.setTravelerId(memoryTravelers.size() + 1);
        memoryTravelers.add(traveler);
        return true;
    }
}
