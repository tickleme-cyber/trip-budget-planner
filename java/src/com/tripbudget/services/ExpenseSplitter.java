package com.tripbudget.services;

import com.tripbudget.models.Expense;
import com.tripbudget.models.Traveler;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * ExpenseSplitter Service - Equal Split & Debt Simplification Algorithm
 * ============================================================================
 * Implements:
 * 1. Fair share computation
 * 2. Net balance calculation per participant
 * 3. Greedy algorithm to minimize the number of transactions between debtors & creditors
 */
public class ExpenseSplitter {

    public static class BalanceEntry {
        public Traveler traveler;
        public double paid;
        public double fairShare;
        public double netBalance; // positive = gets back, negative = owes

        public BalanceEntry(Traveler traveler, double paid, double fairShare, double netBalance) {
            this.traveler = traveler;
            this.paid = paid;
            this.fairShare = fairShare;
            this.netBalance = netBalance;
        }
    }

    public static class DebtTransaction {
        public Traveler from;
        public Traveler to;
        public double amount;

        public DebtTransaction(Traveler from, Traveler to, double amount) {
            this.from = from;
            this.to = to;
            this.amount = amount;
        }

        @Override
        public String toString() {
            return String.format("👉 %s pays %s: $%.2f", from.getName(), to.getName(), amount);
        }
    }

    /**
     * Calculates net balances for all travelers
     */
    public static Map<Integer, BalanceEntry> calculateBalances(List<Traveler> travelers, List<Expense> expenses) {
        Map<Integer, BalanceEntry> map = new HashMap<>();
        if (travelers == null || travelers.isEmpty()) return map;

        double totalTripCost = 0.0;
        Map<Integer, Double> paidMap = new HashMap<>();
        for (Traveler t : travelers) {
            paidMap.put(t.getTravelerId(), 0.0);
        }

        for (Expense exp : expenses) {
            double cost = exp.calculateTotalAmount(); // Polymorphic method call
            totalTripCost += cost;
            int payerId = exp.getPayerId();
            paidMap.put(payerId, paidMap.getOrDefault(payerId, 0.0) + cost);
        }

        double fairShare = totalTripCost / travelers.size();

        for (Traveler t : travelers) {
            double paid = paidMap.getOrDefault(t.getTravelerId(), 0.0);
            double net = paid - fairShare;
            map.put(t.getTravelerId(), new BalanceEntry(t, paid, fairShare, net));
        }

        return map;
    }

    /**
     * Greedy Debt Simplification Algorithm
     * Minimizes the total number of transactions needed to settle all balances.
     */
    public static List<DebtTransaction> settleDebts(List<Traveler> travelers, List<Expense> expenses) {
        List<DebtTransaction> transactions = new ArrayList<>();
        Map<Integer, BalanceEntry> balances = calculateBalances(travelers, expenses);

        class PersonBalance implements Comparable<PersonBalance> {
            Traveler traveler;
            double balance;

            PersonBalance(Traveler t, double b) {
                this.traveler = t;
                this.balance = b;
            }

            @Override
            public int compareTo(PersonBalance o) {
                return Double.compare(this.balance, o.balance);
            }
        }

        List<PersonBalance> debtors = new ArrayList<>();  // owe money (negative)
        List<PersonBalance> creditors = new ArrayList<>(); // get money back (positive)

        for (BalanceEntry entry : balances.values()) {
            if (entry.netBalance < -0.009) {
                debtors.add(new PersonBalance(entry.traveler, -entry.netBalance));
            } else if (entry.netBalance > 0.009) {
                creditors.add(new PersonBalance(entry.traveler, entry.netBalance));
            }
        }

        int i = 0, j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            PersonBalance debtor = debtors.get(i);
            PersonBalance creditor = creditors.get(j);

            double settleAmount = Math.min(debtor.balance, creditor.balance);
            transactions.add(new DebtTransaction(debtor.traveler, creditor.traveler, settleAmount));

            debtor.balance -= settleAmount;
            creditor.balance -= settleAmount;

            if (debtor.balance < 0.009) i++;
            if (creditor.balance < 0.009) j++;
        }

        return transactions;
    }
}
