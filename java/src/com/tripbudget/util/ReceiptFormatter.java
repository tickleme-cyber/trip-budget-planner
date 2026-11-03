package com.tripbudget.util;

import com.tripbudget.interfaces.Billable;
import com.tripbudget.models.Expense;
import com.tripbudget.models.FlightExpense;
import com.tripbudget.models.HotelExpense;
import com.tripbudget.models.Trip;

/**
 * ReceiptFormatter - Generates printable ASCII financial receipts and trip statements.
 * Leverages StringBuilder, String.format, and string alignments.
 */
public final class ReceiptFormatter {

    private static final int RECEIPT_WIDTH = 54;
    private static final String BORDER_LINE = StringUtils.repeat("=", RECEIPT_WIDTH);
    private static final String DIVIDER_LINE = StringUtils.repeat("-", RECEIPT_WIDTH);

    private ReceiptFormatter() {}

    /**
     * Formats an individual Billable Expense receipt as a formatted text ticket
     */
    public static String formatReceipt(Expense exp) {
        if (exp == null) return "NO EXPENSE DATA";

        StringBuilder sb = new StringBuilder(512);
        sb.append(BORDER_LINE).append("\n");
        sb.append(StringUtils.padLeft("TRIP BUDGET PLANNER", 36)).append("\n");
        sb.append(StringUtils.padLeft("OFFICIAL EXPENSE RECEIPT", 39)).append("\n");
        sb.append(BORDER_LINE).append("\n");

        sb.append(String.format(" Receipt ID : EXP-%05d\n", exp.getExpenseId()));
        sb.append(String.format(" Date       : %s\n", StringUtils.safeTrim(exp.getExpenseDate())));
        sb.append(String.format(" Title      : %s\n", StringUtils.capitalizeWords(exp.getTitle())));
        sb.append(String.format(" Category   : [%s]\n", exp.getCategory().toUpperCase()));
        sb.append(String.format(" Payer      : %s\n", exp.getPayerName()));
        if (!StringUtils.isBlank(exp.getNotes())) {
            sb.append(String.format(" Notes      : %s\n", exp.getNotes()));
        }
        sb.append(DIVIDER_LINE).append("\n");

        // Financial itemization
        sb.append(String.format(" %-36s %14s\n", "Base Charge:", StringUtils.formatCurrency(exp.getBaseAmount())));

        if (exp instanceof FlightExpense) {
            FlightExpense fe = (FlightExpense) exp;
            sb.append(String.format(" %-36s %14s\n", "Baggage Fee:", StringUtils.formatCurrency(fe.getBaggageFee())));
            sb.append(String.format(" %-36s %14s\n", "Seat Selection Fee:", StringUtils.formatCurrency(fe.getSeatSelectionFee())));
            sb.append(String.format(" %-36s %14s\n", "Airport & Security Tax:", StringUtils.formatCurrency(fe.getTaxOrFees())));
        } else if (exp instanceof HotelExpense) {
            HotelExpense he = (HotelExpense) exp;
            sb.append(String.format(" %-36s %14s\n", "Duration (Nights):", he.getNumberOfNights() + " nights"));
            sb.append(String.format(" %-36s %14.1f%%\n", "Hospitality Tax Rate:", he.getTourismTaxRate() * 100));
            sb.append(String.format(" %-36s %14s\n", "Taxes & Service Fees:", StringUtils.formatCurrency(he.getTaxOrFees())));
        } else if (exp.getTaxOrFees() > 0) {
            sb.append(String.format(" %-36s %14s\n", "Taxes & Service Fees:", StringUtils.formatCurrency(exp.getTaxOrFees())));
        }

        sb.append(DIVIDER_LINE).append("\n");
        double total = exp.calculateTotalAmount();
        sb.append(String.format(" %-34s %16s\n", "TOTAL BILLED AMOUNT:", StringUtils.formatCurrency(total)));
        sb.append(BORDER_LINE).append("\n");

        return sb.toString();
    }

    /**
     * Formats a complete multi-line summary statement for a Trip
     */
    public static String formatTripSummary(Trip trip) {
        if (trip == null) return "NO TRIP DATA";

        StringBuilder sb = new StringBuilder(1024);
        sb.append(BORDER_LINE).append("\n");
        sb.append(StringUtils.padLeft("TRIP FINANCIAL STATEMENT", 39)).append("\n");
        sb.append(BORDER_LINE).append("\n");

        sb.append(String.format(" Trip Name    : %s\n", trip.getTitle()));
        sb.append(String.format(" Destination  : %s\n", trip.getDestination()));
        sb.append(String.format(" Window       : %s to %s\n", trip.getStartDate(), trip.getEndDate()));
        sb.append(String.format(" Status       : %s\n", trip.getStatus()));
        sb.append(DIVIDER_LINE).append("\n");

        sb.append(String.format(" Total Budget : %14s\n", StringUtils.formatCurrency(trip.getTotalBudget())));
        sb.append(String.format(" Total Spent  : %14s\n", StringUtils.formatCurrency(trip.getTotalSpent())));
        sb.append(String.format(" Remaining    : %14s\n", StringUtils.formatCurrency(trip.getRemainingBudget())));
        sb.append(String.format(" Budget Used  : %13.1f%%\n", trip.getBudgetUsagePercentage()));
        sb.append(DIVIDER_LINE).append("\n");

        sb.append(" ITEMIZED EXPENSE LOG:\n");
        if (trip.getExpenses().isEmpty()) {
            sb.append("   (No expenses logged yet)\n");
        } else {
            for (Expense e : trip.getExpenses()) {
                sb.append(String.format(" • %-10s %-24s %14s\n",
                        "[" + e.getCategory() + "]",
                        StringUtils.padRight(e.getTitle(), 24),
                        StringUtils.formatCurrency(e.calculateTotalAmount())));
            }
        }

        sb.append(BORDER_LINE).append("\n");
        return sb.toString();
    }
}
