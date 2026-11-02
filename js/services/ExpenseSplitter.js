/**
 * ExpenseSplitter Class - Demonstrates Object-Oriented Service & Algorithms
 * Handles expense splitting, individual net balances, and the "Who Owes Whom" debt settlement algorithm.
 */
export class ExpenseSplitter {
    /**
     * Splits a single expense equally among its participants.
     * @param {Expense} expense - Expense object
     * @param {Trip} trip - Trip object containing traveler details
     * @returns {Object} Split summary for the single expense
     */
    static splitSingleExpense(expense, trip) {
        const total = expense.calculateTotalCost();
        const participants = expense.participantIds;
        const payerId = expense.paidById;
        const payer = trip.findTravelerById(payerId);

        if (!participants || participants.length === 0) {
            return {
                expenseTitle: expense.title,
                totalCost: total,
                payerName: payer ? payer.name : 'Unknown',
                perPersonCost: 0,
                breakdown: []
            };
        }

        const perPersonCost = Math.round((total / participants.length) * 100) / 100;
        const breakdown = participants.map(partId => {
            const traveler = trip.findTravelerById(partId);
            const isPayer = partId === payerId;
            return {
                travelerId: partId,
                travelerName: traveler ? traveler.name : 'Traveler',
                share: perPersonCost,
                isPayer: isPayer,
                owesToPayer: isPayer ? 0 : perPersonCost
            };
        });

        return {
            expenseId: expense.id,
            expenseTitle: expense.title,
            category: expense.category,
            totalCost: total,
            payerId: payerId,
            payerName: payer ? payer.name : 'Unknown',
            participantCount: participants.length,
            perPersonCost: perPersonCost,
            breakdown: breakdown
        };
    }

    /**
     * Calculates net balances for all travelers in the trip.
     * Balance = Total Paid - Total Fair Share
     * If Balance > 0 : Traveler is owed money (creditor)
     * If Balance < 0 : Traveler owes money (debtor)
     * @param {Trip} trip
     * @returns {Array<Object>} List of traveler balance summaries
     */
    static calculateTravelerBalances(trip) {
        const travelers = trip.travelers;
        const expenses = trip.expenses;

        // Initialize balance map
        const balances = {};
        travelers.forEach(trv => {
            balances[trv.id] = {
                traveler: trv,
                totalPaid: 0,
                totalShare: 0,
                netBalance: 0
            };
        });

        // Iterate through all expenses
        expenses.forEach(exp => {
            const total = exp.calculateTotalCost();
            const payerId = exp.paidById;
            const participants = exp.participantIds;

            if (balances[payerId]) {
                balances[payerId].totalPaid += total;
            }

            if (participants && participants.length > 0) {
                const share = total / participants.length;
                participants.forEach(pId => {
                    if (balances[pId]) {
                        balances[pId].totalShare += share;
                    }
                });
            }
        });

        // Compute net balances
        return Object.values(balances).map(record => {
            const paid = Math.round(record.totalPaid * 100) / 100;
            const share = Math.round(record.totalShare * 100) / 100;
            const net = Math.round((paid - share) * 100) / 100;
            return {
                travelerId: record.traveler.id,
                name: record.traveler.name,
                email: record.traveler.email,
                color: record.traveler.color,
                totalPaid: paid,
                totalShare: share,
                netBalance: net,
                status: net > 0.01 ? 'gets_back' : net < -0.01 ? 'owes' : 'settled'
            };
        });
    }

    /**
     * Computes the simplified "Who Owes Whom" settlement transactions
     * Uses the Greedy Debt Simplification Algorithm.
     * Minimizes the number of transactions needed to settle all trip debts.
     * @param {Trip} trip
     * @returns {Array<Object>} List of settlements { from, to, amount }
     */
    static calculateWhoOwesWhom(trip) {
        const balances = this.calculateTravelerBalances(trip);

        // Separate creditors (net > 0) and debtors (net < 0)
        const creditors = [];
        const debtors = [];

        balances.forEach(b => {
            if (b.netBalance > 0.01) {
                creditors.push({ ...b, balance: b.netBalance });
            } else if (b.netBalance < -0.01) {
                debtors.push({ ...b, balance: Math.abs(b.netBalance) });
            }
        });

        // Sort descending by amount
        creditors.sort((a, b) => b.balance - a.balance);
        debtors.sort((a, b) => b.balance - a.balance);

        const settlements = [];
        let cIdx = 0;
        let dIdx = 0;

        while (cIdx < creditors.length && dIdx < debtors.length) {
            const creditor = creditors[cIdx];
            const debtor = debtors[dIdx];

            // Transaction amount is min of what debtor owes and creditor is owed
            const amount = Math.min(creditor.balance, debtor.balance);
            const roundedAmount = Math.round(amount * 100) / 100;

            if (roundedAmount > 0) {
                settlements.push({
                    fromId: debtor.travelerId,
                    fromName: debtor.name,
                    fromColor: debtor.color,
                    toId: creditor.travelerId,
                    toName: creditor.name,
                    toColor: creditor.color,
                    amount: roundedAmount,
                    description: `${debtor.name} pays ${creditor.name} $${roundedAmount.toFixed(2)}`
                });
            }

            creditor.balance -= amount;
            debtor.balance -= amount;

            if (creditor.balance <= 0.01) {
                cIdx++;
            }
            if (debtor.balance <= 0.01) {
                dIdx++;
            }
        }

        return settlements;
    }
}
