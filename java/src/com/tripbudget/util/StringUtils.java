package com.tripbudget.util;

import java.util.regex.Pattern;

/**
 * StringUtils - Comprehensive String Processing & Manipulation Utility.
 * Demonstrates:
 *  - Java String methods: trim, toUpperCase, toLowerCase, substring, split, join, replace
 *  - StringBuilder for high-performance string assembly
 *  - StringBuffer for synchronized/thread-safe string buffer operations
 *  - String.format() with custom alignment flags, column widths, and currency formatting
 *  - Regular Expression (regex) validation for emails, numbers, and alphanumeric codes
 */
public final class StringUtils {

    // Regex patterns for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );
    private static final Pattern CURRENCY_PATTERN = Pattern.compile("^\\$?\\s*\\d+(\\.\\d{1,2})?$");
    private static final Pattern ALPHANUMERIC_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s-_]+$");

    // Private constructor to prevent instantiation (Utility Class)
    private StringUtils() {}

    /**
     * Checks if a string is null or consists only of whitespace
     */
    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Checks if a string has non-whitespace characters
     */
    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }

    /**
     * Trims leading and trailing whitespace safely
     */
    public static String safeTrim(String str) {
        return str == null ? "" : str.trim();
    }

    /**
     * Capitalizes each word in a string using StringBuilder and split()
     * e.g. "beachside villa resort" -> "Beachside Villa Resort"
     */
    public static String capitalizeWords(String input) {
        if (isBlank(input)) return "";
        String[] tokens = input.trim().split("\\s+");
        StringBuilder sb = new StringBuilder(input.length());
        for (int i = 0; i < tokens.length; i++) {
            String word = tokens[i];
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) {
                    sb.append(word.substring(1).toLowerCase());
                }
            }
            if (i < tokens.length - 1) {
                sb.append(" ");
            }
        }
        return sb.toString();
    }

    /**
     * Extracts uppercase initials from a full name using split()
     * e.g. "Alice Morgan" -> "AM", "David Kim" -> "DK"
     */
    public static String extractInitials(String fullName) {
        if (isBlank(fullName)) return "??";
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder initials = new StringBuilder(2);
        for (String part : parts) {
            if (!part.isEmpty()) {
                initials.append(Character.toUpperCase(part.charAt(0)));
                if (initials.length() == 2) break;
            }
        }
        return initials.length() > 0 ? initials.toString() : "??";
    }

    /**
     * Validates whether an email string matches standard RFC email structure
     */
    public static boolean isValidEmail(String email) {
        if (isBlank(email)) return false;
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    /**
     * Validates if a string is a valid non-negative currency amount
     */
    public static boolean isValidCurrency(String amountStr) {
        if (isBlank(amountStr)) return false;
        return CURRENCY_PATTERN.matcher(amountStr.trim()).matches();
    }

    /**
     * Formats a monetary double into a clean currency string with 2 decimal places
     * e.g. 1250.5 -> "$1,250.50"
     */
    public static String formatCurrency(double amount) {
        return String.format("$%,.2f", amount);
    }

    /**
     * Pads a string with spaces on the right to reach the desired target width
     */
    public static String padRight(String s, int n) {
        if (s == null) s = "";
        return String.format("%-" + n + "s", s);
    }

    /**
     * Pads a string with spaces on the left to reach the desired target width
     */
    public static String padLeft(String s, int n) {
        if (s == null) s = "";
        return String.format("%" + n + "s", s);
    }

    /**
     * Repeats a given string sequence a specified number of times using StringBuilder
     */
    public static String repeat(String str, int count) {
        if (str == null || count <= 0) return "";
        StringBuilder sb = new StringBuilder(str.length() * count);
        for (int i = 0; i < count; i++) {
            sb.append(str);
        }
        return sb.toString();
    }

    /**
     * Performs a null-safe case-insensitive substring search
     */
    public static boolean containsIgnoreCase(String source, String query) {
        if (source == null || query == null) return false;
        return source.toLowerCase().contains(query.toLowerCase().trim());
    }

    /**
     * Masks an email address for privacy
     * e.g. "alice.morgan@example.com" -> "a***n@example.com"
     */
    public static String maskEmail(String email) {
        if (!isValidEmail(email)) return email != null ? email : "";
        int atIndex = email.indexOf('@');
        String name = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (name.length() <= 2) {
            return name.charAt(0) + "***" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + domain;
    }

    /**
     * Thread-safe logging buffer demonstrator using StringBuffer
     */
    public static String createThreadSafeLogEntry(String category, String action, String details) {
        StringBuffer sbuf = new StringBuffer();
        sbuf.append("[LOG-THREAD: ").append(Thread.currentThread().getName()).append("] ");
        sbuf.append("[").append(category.toUpperCase()).append("] ");
        sbuf.append(action).append(" -> ").append(details);
        return sbuf.toString();
    }
}

