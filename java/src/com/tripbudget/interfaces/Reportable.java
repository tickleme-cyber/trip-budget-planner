package com.tripbudget.interfaces;

/**
 * Reportable Interface - Contract for domain models capable of generating formatted text reports
 */
public interface Reportable {
    /**
     * Generates a structured multi-line report formatted as printable text
     * @return Formatted report string
     */
    String generateSummaryReport();
}

