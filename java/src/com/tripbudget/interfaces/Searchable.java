package com.tripbudget.interfaces;

/**
 * Searchable Interface - Contract for entities that can be filtered by string search queries
 */
public interface Searchable {
    /**
     * Determines whether the entity matches a case-insensitive user search keyword
     * @param query Search string query
     * @return True if match found, false otherwise
     */
    boolean matchesQuery(String query);
}
