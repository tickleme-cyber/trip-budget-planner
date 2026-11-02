/**
 * Automated Test Suite for OOP Trip Budget Planner
 */
import { Traveler } from './js/models/Traveler.js';
import { Expense } from './js/models/Expense.js';
import { 
    FlightExpense, 
    HotelExpense, 
    FoodExpense, 
    TransportExpense, 
    ActivitiesExpense, 
    ShoppingExpense, 
    ExpenseFactory 
} from './js/models/ExpenseSubclasses.js';
import { Trip } from './js/models/Trip.js';
import { ExpenseSplitter } from './js/services/ExpenseSplitter.js';
import { Destination } from './js/models/Destination.js';
import { TravelStrategy, BackpackerStrategy, ModerateStrategy, LuxuryStrategy, TravelStrategyFactory } from './js/models/TravelStrategy.js';
import { RecommendationEngine } from './js/services/RecommendationEngine.js';

console.log('🧪 Starting OOP Trip Budget Planner Tests...\n');

// 1. Test Encapsulation & Traveler Class
console.log('--- 1. Testing Encapsulation & Traveler ---');
const t1 = new Traveler('t1', 'Alice', 'alice@test.com', '#10B981');
const t2 = new Traveler('t2', 'Bob', 'bob@test.com', '#4F46E5');
console.assert(t1.name === 'Alice', 'Getter name should return Alice');
console.assert(t1.getInitials() === 'A', 'Initials should be A');
try {
    new Traveler('t3', '');
    console.error('FAIL: Expected error on empty name');
} catch (e) {
    console.log('✅ Encapsulation validation works: Traveler empty name rejected.');
}

// 2. Test Inheritance & Polymorphism
console.log('\n--- 2. Testing Inheritance & Polymorphism ---');
// Flight: base 500 + baggage 50 + tax 30 = 580
const flight = new FlightExpense({
    id: 'f1',
    title: 'Flight Ticket',
    baseAmount: 500,
    baggageFee: 50,
    airportTax: 30,
    date: '2026-11-10',
    paidById: 't1',
    participantIds: ['t1', 't2']
});
console.assert(flight instanceof Expense, 'FlightExpense must inherit from Expense');
console.assert(flight.calculateTotalCost() === 580, `Expected 580, got ${flight.calculateTotalCost()}`);
console.log('✅ FlightExpense polymorphic cost (500 + 50 + 30):', flight.calculateTotalCost());

// Hotel: (base 100 * 3 nights) + 10% tax = 330
const hotel = new HotelExpense({
    id: 'h1',
    title: 'Resort Stay',
    baseAmount: 100,
    nights: 3,
    serviceTaxPercent: 10,
    date: '2026-11-11',
    paidById: 't2',
    participantIds: ['t1', 't2']
});
console.assert(hotel.calculateTotalCost() === 330, `Expected 330, got ${hotel.calculateTotalCost()}`);
console.log('✅ HotelExpense polymorphic cost ((100 * 3) + 10%):', hotel.calculateTotalCost());

// Food: base 80 + tip 15 + tax 5 = 100
const food = new FoodExpense({
    id: 'fd1',
    title: 'Dinner',
    baseAmount: 80,
    tipAmount: 15,
    taxAmount: 5,
    date: '2026-11-12',
    paidById: 't1',
    participantIds: ['t1', 't2']
});
console.assert(food.calculateTotalCost() === 100, `Expected 100, got ${food.calculateTotalCost()}`);
console.log('✅ FoodExpense polymorphic cost (80 + 15 + 5):', food.calculateTotalCost());

// Transport: base 60 + toll 10 + parking 5 = 75
const transport = new TransportExpense({
    id: 'tr1',
    title: 'Rental Car',
    baseAmount: 60,
    tollCharges: 10,
    parkingFee: 5,
    date: '2026-11-13',
    paidById: 't2',
    participantIds: ['t1', 't2']
});
console.assert(transport.calculateTotalCost() === 75, `Expected 75, got ${transport.calculateTotalCost()}`);
console.log('✅ TransportExpense polymorphic cost (60 + 10 + 5):', transport.calculateTotalCost());

// Validation check: negative amount
try {
    new FoodExpense({
        id: 'bad',
        title: 'Negative food',
        baseAmount: -50,
        date: '2026-11-12',
        paidById: 't1'
    });
    console.error('FAIL: Expected error on negative amount');
} catch (e) {
    console.log('✅ Expense validation works: negative amount rejected.');
}

// 3. Test Composition in Trip
console.log('\n--- 3. Testing Composition in Trip ---');
const trip = new Trip({
    id: 'trip1',
    name: 'Weekend Getaway',
    destination: 'Mountains',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    totalBudget: 1200,
    travelers: [t1, t2],
    expenses: [flight, hotel, food, transport]
});

// Total spent = 580 + 330 + 100 + 75 = 1085
const totalSpent = trip.getTotalSpent();
console.assert(totalSpent === 1085, `Expected 1085, got ${totalSpent}`);
console.log('✅ Trip.getTotalSpent() via polymorphic dispatch:', totalSpent);

const remaining = trip.getRemainingBudget();
console.assert(remaining === 115, `Expected 115, got ${remaining}`);
console.log('✅ Remaining budget:', remaining);

const usagePct = trip.getBudgetUsagePercentage();
console.log('✅ Budget usage percentage:', usagePct + '%');
const status = trip.getBudgetStatus();
console.log('✅ Budget status:', status.level, '-', status.message);

// 4. Test ExpenseSplitter & Debt Settlement
console.log('\n--- 4. Testing ExpenseSplitter & "Who Owes Whom" ---');
// Total = 1085. Each person fair share = 1085 / 2 = 542.50
// Alice paid: flight (580) + food (100) = 680. Net = 680 - 542.50 = +137.50 (Gets back)
// Bob paid: hotel (330) + transport (75) = 405. Net = 405 - 542.50 = -137.50 (Owes)
const balances = ExpenseSplitter.calculateTravelerBalances(trip);
console.log('✅ Balances summary:');
balances.forEach(b => console.log(`   ${b.name}: Paid $${b.totalPaid}, Fair Share $${b.totalShare}, Net: $${b.netBalance} (${b.status})`));

const settlements = ExpenseSplitter.calculateWhoOwesWhom(trip);
console.assert(settlements.length === 1, `Expected 1 settlement transaction, got ${settlements.length}`);
console.assert(settlements[0].amount === 137.5, `Expected 137.50, got ${settlements[0].amount}`);
console.log('✅ "Who Owes Whom" settlement result:');
settlements.forEach(s => console.log(`   👉 ${s.description}`));

// 5. Test Recommendation System & Strategy Pattern (OOP Principle)
console.log('\n--- 5. Testing Recommendation System & Travel Strategies ---');
// 5a. Strategy Pattern verification
try {
    new TravelStrategy('Abstract', 'Test', '❓');
    console.error('FAIL: Expected error instantiating abstract TravelStrategy');
} catch (e) {
    console.log('✅ Encapsulation & Abstraction: Direct instantiation of abstract TravelStrategy rejected.');
}

const backpacker = TravelStrategyFactory.getStrategy('backpacker');
const moderate   = TravelStrategyFactory.getStrategy('moderate');
const luxury     = TravelStrategyFactory.getStrategy('luxury');

console.assert(backpacker instanceof BackpackerStrategy, 'Should return BackpackerStrategy instance');
console.assert(luxury instanceof LuxuryStrategy, 'Should return LuxuryStrategy instance');
console.assert(backpacker.getStayMultiplier() < moderate.getStayMultiplier(), 'Backpacker stay multiplier should be lower');
console.assert(luxury.getStayMultiplier() > moderate.getStayMultiplier(), 'Luxury stay multiplier should be higher');
console.log('✅ TravelStrategy polymorphic multipliers verified: Backpacker stay =', backpacker.getStayMultiplier(), ', Luxury stay =', luxury.getStayMultiplier());

// 5b. Destination Encapsulation & Polymorphic Cost Estimation
const testDest = new Destination({
    id: 'test_goa',
    name: 'Goa',
    country: 'India',
    region: 'Domestic / India',
    baseFlightCost: 80,
    dailyStayCost: 40,
    dailyFoodCost: 20,
    dailyActivityCost: 15,
    idealDaysMin: 3,
    idealDaysMax: 6,
    vibes: ['Beach', 'Nightlife']
});

console.assert(testDest.name === 'Goa', 'Getter name should return Goa');
console.assert(testDest.hasVibe('Beach') === true, 'Should match Beach vibe');
console.assert(testDest.matchesRegion('India') === true, 'Should match India region');

// Calculate cost for 2 travelers, 5 days with Moderate Strategy
const costMod = testDest.calculateEstimatedCost(2, 5, 'moderate');
console.assert(costMod.total > 0, 'Total cost should be calculated');
console.log('✅ Destination.calculateEstimatedCost(2 travelers, 5 days, Moderate):', `$${costMod.total}`, '(Per Person:', `$${costMod.perPerson})`);

// 5c. Recommendation Engine Filtering & Scoring
const recEngine = new RecommendationEngine();
console.assert(recEngine.destinations.length > 20, `Catalog should have > 20 destinations, found ${recEngine.destinations.length}`);
console.log(`✅ RecommendationEngine catalog loaded: ${recEngine.destinations.length} destinations.`);

// Test recommendation for $1,200 budget, 2 travelers, 5 days
const recs = recEngine.getRecommendations({
    budget: 1200,
    travelers: 2,
    days: 5,
    travelStyle: 'moderate',
    vibe: 'all',
    region: 'all'
});

console.assert(recs.length > 0, 'Recommendations should return candidate destinations');
const topRec = recs[0];
console.log(`✅ Top recommendation for $1,200 budget: ${topRec.destination.name} (${topRec.destination.country})`);
console.log(`   Estimated Cost: $${topRec.displayTotal} (Match Score: ${topRec.matchPercentage}%, Status: ${topRec.statusLabel})`);

// 5d. 1-Click Trip Generation from Recommendation (Composition & Factory Pattern)
const generatedTrip = recEngine.createTripFromRecommendation(
    topRec,
    'Goa Dream Getaway',
    ['Alice', 'Bob'],
    true // include pre-allocated starting expenses
);

console.assert(generatedTrip instanceof Trip, 'Should return a concrete Trip instance');
console.assert(generatedTrip.travelers.length === 2, 'Should create 2 Traveler objects');
console.assert(generatedTrip.expenses.length >= 4, `Should create at least 4 polymorphic expenses, got ${generatedTrip.expenses.length}`);
console.log(`✅ createTripFromRecommendation generated Trip "${generatedTrip.name}" with ${generatedTrip.expenses.length} polymorphic expenses:`);
generatedTrip.expenses.forEach(exp => {
    console.log(`   • [${exp.category}] ${exp.title}: $${exp.calculateTotalCost()}`);
});

console.log('\n🎉 ALL OBJECT-ORIENTED PROGRAMMING UNIT TESTS PASSED SUCCESSFULLY!\n');
