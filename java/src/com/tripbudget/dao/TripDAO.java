package com.tripbudget.dao;

import com.tripbudget.db.DBConnection;
import com.tripbudget.models.Trip;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Trip Data Access Object (DAO) - CRUD via JDBC
 */
public class TripDAO {
    private static final List<Trip> memoryTrips = new ArrayList<>();

    static {
        Trip defaultTrip = new Trip(1, 1, "Euro Summer Tour 2026", "Paris & Rome", "2026-06-15", "2026-06-25", 3000.00, "USD", "ACTIVE");
        memoryTrips.add(defaultTrip);
    }

    public List<Trip> getTripsByUserId(int userId) {
        List<Trip> trips = new ArrayList<>();
        Connection conn = DBConnection.getConnection();

        if (conn != null && !DBConnection.isMemoryMode()) {
            String sql = "SELECT trip_id, user_id, title, destination, start_date, end_date, total_budget, currency, status "
                       + "FROM trips WHERE user_id = ? ORDER BY trip_id DESC";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, userId);
                ResultSet rs = pstmt.executeQuery();
                while (rs.next()) {
                    trips.add(new Trip(
                            rs.getInt("trip_id"),
                            rs.getInt("user_id"),
                            rs.getString("title"),
                            rs.getString("destination"),
                            rs.getString("start_date"),
                            rs.getString("end_date"),
                            rs.getDouble("total_budget"),
                            rs.getString("currency"),
                            rs.getString("status")
                    ));
                }
                return trips;
            } catch (SQLException e) {
                System.err.println("❌ [TripDAO] Error fetching trips: " + e.getMessage());
            }
        }

        // Memory fallback
        for (Trip t : memoryTrips) {
            if (t.getUserId() == userId) {
                trips.add(t);
            }
        }
        return trips;
    }

    public boolean createTrip(Trip trip) {
        Connection conn = DBConnection.getConnection();
        if (conn != null && !DBConnection.isMemoryMode()) {
            String sql = "INSERT INTO trips (user_id, title, destination, start_date, end_date, total_budget, currency, status) "
                       + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setInt(1, trip.getUserId());
                pstmt.setString(2, trip.getTitle());
                pstmt.setString(3, trip.getDestination());
                pstmt.setString(4, trip.getStartDate());
                pstmt.setString(5, trip.getEndDate());
                pstmt.setDouble(6, trip.getTotalBudget());
                pstmt.setString(7, trip.getCurrency());
                pstmt.setString(8, trip.getStatus());
                int affected = pstmt.executeUpdate();
                if (affected > 0) {
                    ResultSet keys = pstmt.getGeneratedKeys();
                    if (keys.next()) {
                        trip.setTripId(keys.getInt(1));
                    }
                    return true;
                }
            } catch (SQLException e) {
                System.err.println("❌ [TripDAO] Error inserting trip: " + e.getMessage());
                return false;
            }
        }

        // Memory fallback
        trip.setTripId(memoryTrips.size() + 1);
        memoryTrips.add(trip);
        return true;
    }
}
