package com.tripbudget.interfaces;

/**
 * Billable Interface - Defines the financial billing contract for any chargeable item
 */
public interface Billable {
    /**
     * Calculates the total amount including any taxes, fees, or category adjustments
     * @return Total billable monetary amount
     */
    double calculateTotalAmount();

    /**
     * Retrieves the financial category identifier
     * @return Category string (e.g. FLIGHT, HOTEL, FOOD)
     */
    String getCategory();

    /**
     * Formats an itemized receipt using string formatting
     * @return Printable formatted string receipt
     */
    String getFormattedReceipt();
}
