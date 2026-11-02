/**
 * Main Application Controller (app.js) — Enhanced v2.0
 * Coordinates UI views, event bindings, and interacts with OOP models and services.
 *
 * New features:
 *  - Animated metric counters
 *  - Sidebar collapse/expand
 *  - Dark/Light theme toggle
 *  - Floating Action Button (FAB)
 *  - Top page-progress indicator
 *  - CSV & PDF export
 *  - Currency converter
 *  - Activity / daily spending feed
 *  - Per-traveler expense history modal
 *  - Trip clone / duplicate
 *  - Analytics view (daily bar chart, top spenders)
 *  - Expense sort filter
 */
import { Traveler } from './models/Traveler.js';
import { Trip } from './models/Trip.js';
import { ExpenseFactory } from './models/ExpenseSubclasses.js';
import { ExpenseSplitter } from './services/ExpenseSplitter.js';
import { StorageService } from './services/StorageService.js';
import { RecommendationEngine } from './services/RecommendationEngine.js';
import { TravelStrategyFactory } from './models/TravelStrategy.js';

/* ─────────────────────────────────────────────────────────────────────────── */
/* Approximate static FX rates relative to USD (for demo purposes)            */
/* ─────────────────────────────────────────────────────────────────────────── */
const FX_RATES_TO_USD = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    JPY: 149.8,
    CAD: 1.36,
    AUD: 1.53,
    SGD: 1.34,
    AED: 3.67,
    THB: 35.1
};

const CURRENCY_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹',
    JPY: '¥', CAD: 'C$', AUD: 'A$', SGD: 'S$',
    AED: 'د.إ', THB: '฿'
};

/* ─────────────────────────────────────────────────────────────────────────── */
class TripBudgetApp {
    #trips = [];
    #currentTrip = null;
    #activeView = 'dashboard';
    #isDark = true;
    #sidebarCollapsed = false;

    // Recommendation System fields
    #recEngine = null;
    #recActiveCurrency = 'USD';
    #recTravelStyle = 'moderate';
    #recActiveVibe = 'all';
    #recActiveRegion = 'all';
    #recSelectedResult = null;

    constructor() {
        this.#init();
    }

    #init() {
        // Initialize Recommendation Engine
        this.#recEngine = new RecommendationEngine();

        // Load data from storage
        this.#trips = StorageService.loadTrips();
        const savedActiveId = StorageService.getActiveTripId();

        if (this.#trips.length > 0) {
            this.#currentTrip = this.#trips.find(t => t.id === savedActiveId) || this.#trips[0];
            StorageService.setActiveTripId(this.#currentTrip.id);
        }

        // Restore theme preference
        const savedTheme = localStorage.getItem('tripbudget_theme') || 'dark';
        this.#isDark = savedTheme === 'dark';
        this.#applyTheme();

        // Restore sidebar state
        const savedSidebarState = localStorage.getItem('tripbudget_sidebar') || 'expanded';
        if (savedSidebarState === 'collapsed') {
            this.#collapseSidebar(false);
        }

        // Initialize UI and listeners
        this.#bindNavigationEvents();
        this.#bindModalEvents();
        this.#bindActionEvents();
        this.#bindFormEvents();
        this.#bindExtraFeatureEvents();
        this.#bindRecommendationEvents();

        // Render current state
        this.#renderAll();

        // Flash top progress bar on load
        this.#showProgressBar(100, 600);

        // Starfield canvas & astronomical telemetry (Star Party aesthetic)
        this.#initStarfieldCanvas();
        this.#initAstronomicalTelemetry();

        // Restore logged in user
        const savedUser = localStorage.getItem('tripbudget_user');
        if (savedUser) {
            try {
                const u = JSON.parse(savedUser);
                const lbl = document.getElementById('userProfileLabel');
                if (lbl && u.username) lbl.textContent = `${u.username} (${u.role || 'User'})`;
            } catch (e) {}
        }
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* STATE HELPERS                                                           */
    /* ─────────────────────────────────────────────────────────────────────── */
    get currentTrip() { return this.#currentTrip; }
    get trips() { return [...this.#trips]; }

    #saveState() {
        StorageService.saveTrips(this.#trips);
        if (this.#currentTrip) StorageService.setActiveTripId(this.#currentTrip.id);
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* TOP PROGRESS BAR                                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    #showProgressBar(targetPct = 100, durationMs = 500) {
        const bar = document.getElementById('topProgressBar');
        if (!bar) return;
        bar.style.opacity = '1';
        bar.style.width = '0%';
        // Animate to target
        requestAnimationFrame(() => {
            bar.style.transition = `width ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            bar.style.width = `${targetPct}%`;
        });
        // Fade out after
        setTimeout(() => {
            bar.style.opacity = '0';
            setTimeout(() => { bar.style.width = '0%'; bar.style.transition = ''; }, 400);
        }, durationMs + 200);
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* THEME TOGGLE                                                            */
    /* ─────────────────────────────────────────────────────────────────────── */
    #applyTheme() {
        const btn = document.getElementById('themeToggleBtn');
        if (this.#isDark) {
            document.documentElement.removeAttribute('data-theme');
            if (btn) btn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            if (btn) btn.textContent = '☀️';
        }
        localStorage.setItem('tripbudget_theme', this.#isDark ? 'dark' : 'light');
    }

    #toggleTheme() {
        this.#isDark = !this.#isDark;
        this.#applyTheme();
        this.#showToast(`Switched to ${this.#isDark ? 'Dark' : 'Light'} theme`, 'success');
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* SIDEBAR COLLAPSE                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    #collapseSidebar(animate = true) {
        this.#sidebarCollapsed = true;
        const sidebar = document.getElementById('sidebar');
        const wrapper = document.getElementById('mainWrapper');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        if (sidebar) sidebar.classList.add('collapsed');
        if (wrapper) wrapper.classList.add('sidebar-collapsed');
        if (toggleBtn) {
            toggleBtn.textContent = '›';
            toggleBtn.title = 'Expand sidebar';
            toggleBtn.setAttribute('aria-label', 'Expand sidebar');
        }
        if (animate) localStorage.setItem('tripbudget_sidebar', 'collapsed');
    }

    #expandSidebar(animate = true) {
        this.#sidebarCollapsed = false;
        const sidebar = document.getElementById('sidebar');
        const wrapper = document.getElementById('mainWrapper');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        if (sidebar) sidebar.classList.remove('collapsed');
        if (wrapper) wrapper.classList.remove('sidebar-collapsed');
        if (toggleBtn) {
            toggleBtn.textContent = '‹';
            toggleBtn.title = 'Collapse sidebar';
            toggleBtn.setAttribute('aria-label', 'Collapse sidebar');
        }
        if (animate) localStorage.setItem('tripbudget_sidebar', 'expanded');
    }

    #toggleSidebar() {
        if (this.#sidebarCollapsed) {
            this.#expandSidebar();
        } else {
            this.#collapseSidebar();
        }
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* ANIMATED COUNTER                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    #animateCounter(elementId, targetValue, prefix = '$', suffix = '') {
        const el = document.getElementById(elementId);
        if (!el) return;
        const duration = 600;
        const start = performance.now();
        const startValue = parseFloat(el.dataset.currentValue || '0') || 0;

        const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (targetValue - startValue) * eased;

            if (suffix === '%') {
                el.textContent = `${Math.round(current)}%`;
            } else {
                el.textContent = `${prefix}${current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
            }

            if (progress < 1) requestAnimationFrame(update);
            else el.dataset.currentValue = targetValue;
        };

        requestAnimationFrame(update);
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* EVENT BINDINGS                                                          */
    /* ─────────────────────────────────────────────────────────────────────── */
    #bindNavigationEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const viewName = item.getAttribute('data-view');
                if (viewName) this.#switchView(viewName);
            });
        });

        const viewAllBtn = document.getElementById('viewAllExpensesBtn');
        if (viewAllBtn) viewAllBtn.addEventListener('click', () => this.#switchView('expenses'));
    }

    #switchView(viewName) {
        this.#activeView = viewName;
        this.#showProgressBar(100, 300);

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-view') === viewName);
        });

        document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `view-${viewName}`);
        });

        if (viewName === 'dashboard') this.#renderDashboard();
        if (viewName === 'trips')     this.#renderTripsView();
        if (viewName === 'expenses')  this.#renderExpensesView();
        if (viewName === 'travelers') this.#renderTravelersView();
        if (viewName === 'split')     this.#renderSplitView();
        if (viewName === 'analytics') this.#renderAnalyticsView();
        if (viewName === 'recommendations') this.#renderRecommendationsView();
    }

    #bindActionEvents() {
        // Active trip dropdown
        const tripSelect = document.getElementById('activeTripSelect');
        tripSelect.addEventListener('change', (e) => {
            const selected = this.#trips.find(t => t.id === e.target.value);
            if (selected) {
                this.#currentTrip = selected;
                StorageService.setActiveTripId(selected.id);
                this.#renderAll();
                this.#showToast(`Switched to "${selected.name}"`, 'success');
            }
        });

        // Reset demo data
        document.getElementById('resetDemoBtn').addEventListener('click', () => {
            if (confirm('Reset to initial sample trip and expenses data?')) {
                this.#trips = StorageService.resetToSampleData();
                this.#currentTrip = this.#trips[0];
                this.#renderAll();
                this.#showToast('Sample trip data restored!', 'success');
            }
        });

        // FAB + quick add expense
        document.getElementById('quickAddExpenseBtn').addEventListener('click', () => this.#openExpenseModal());
        document.getElementById('fab').addEventListener('click', () => this.#openExpenseModal());

        // Expenses view Add button
        document.getElementById('openAddExpenseModalBtn').addEventListener('click', () => this.#openExpenseModal());

        // Create trip
        document.getElementById('openCreateTripModalBtn').addEventListener('click', () => this.#openTripModal());

        // Edit current trip
        document.getElementById('editCurrentTripBtn').addEventListener('click', () => {
            if (this.#currentTrip) this.#openTripModal(this.#currentTrip);
        });

        // Clone current trip
        document.getElementById('cloneCurrentTripBtn').addEventListener('click', () => {
            this.#handleCloneTrip();
        });

        // Add traveler
        document.getElementById('openAddTravelerModalBtn').addEventListener('click', () => this.#openTravelerModal());

        // Viva guide
        document.getElementById('openVivaBtn').addEventListener('click', () => this.#openModal('vivaModal'));

        // Demo login
        document.getElementById('openLoginModalBtn')?.addEventListener('click', () => this.#openModal('loginModal'));
        document.getElementById('demoLoginSubmitBtn')?.addEventListener('click', () => {
            const user = document.getElementById('demoUsername').value || 'demo';
            const role = document.getElementById('demoRole').value || 'Student / Evaluator';
            document.getElementById('userProfileLabel').textContent = `${user} (${role})`;
            localStorage.setItem('tripbudget_user', JSON.stringify({ username: user, role }));
            this.#closeModal('loginModal');
            this.#showToast(`Logged in as "${user}" [${role}]`, 'success');
        });

        // Expense filter & search
        document.getElementById('expenseSearchInput')?.addEventListener('input', () => this.#renderExpensesView());
        const catFilter = document.getElementById('expenseCategoryFilter');
        catFilter?.addEventListener('change', () => {
            const val = catFilter.value;
            document.querySelectorAll('#expenseCategoryChips .category-chip-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-cat') === val);
            });
            this.#renderExpensesView();
        });
        document.querySelectorAll('#expenseCategoryChips .category-chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-cat');
                if (catFilter) catFilter.value = cat;
                document.querySelectorAll('#expenseCategoryChips .category-chip-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
                this.#renderExpensesView();
            });
        });
        document.getElementById('expenseSortFilter')?.addEventListener('change', () => this.#renderExpensesView());

        // Single expense split dropdown
        document.getElementById('splitExpenseSelector')?.addEventListener('change', (e) => {
            this.#renderSingleExpenseSplit(e.target.value);
        });

        // Recommendation navigation shortcuts
        document.getElementById('dashExploreRecBtn')?.addEventListener('click', () => {
            this.#switchView('recommendations');
            this.#matchCurrentTripInRecommendations();
        });
        document.getElementById('tripsExploreRecBtn')?.addEventListener('click', () => {
            this.#switchView('recommendations');
            this.#matchCurrentTripInRecommendations();
        });
    }

    #bindExtraFeatureEvents() {
        // Theme toggle
        document.getElementById('themeToggleBtn')?.addEventListener('click', () => this.#toggleTheme());

        // Sidebar toggle
        document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => this.#toggleSidebar());

        // Currency converter modal open
        document.getElementById('openCurrencyBtn')?.addEventListener('click', () => {
            this.#openModal('currencyModal');
            this.#convertCurrency();
        });

        // Currency convert button
        document.getElementById('convertCurrencyBtn')?.addEventListener('click', () => this.#convertCurrency());
        document.getElementById('currencyAmount')?.addEventListener('input', () => this.#convertCurrency());
        document.getElementById('currencyFrom')?.addEventListener('change', () => this.#convertCurrency());
        document.getElementById('currencyTo')?.addEventListener('change', () => this.#convertCurrency());

        // Activity feed modal
        document.getElementById('openActivityBtn')?.addEventListener('click', () => {
            this.#renderActivityFeed();
            this.#openModal('activityModal');
        });

        // Export CSV
        document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.#exportCSV());

        // Export PDF
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.#exportPDF());

        // What Am I Looking At? modal (Star Party)
        document.getElementById('whatAmILookingAtBtn')?.addEventListener('click', () => {
            this.#openModal('whatAmILookingAtModal');
        });
    }

    #bindModalEvents() {
        // Close modal buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => this.#closeModal(btn.getAttribute('data-close')));
        });

        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        // Escape key closes
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(o => o.classList.remove('active'));
            }
        });

        // Category change triggers polymorphic fields
        document.getElementById('expenseFormCategory').addEventListener('change', (e) => {
            this.#renderPolymorphicFields(e.target.value);
        });

        // Select All participants
        document.getElementById('selectAllParticipantsBtn').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#expenseFormParticipantsList input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => cb.checked = !allChecked);
            document.getElementById('selectAllParticipantsBtn').textContent = allChecked ? 'Select All' : 'Deselect All';
        });
    }

    #bindFormEvents() {
        document.getElementById('tripForm').addEventListener('submit', (e) => { e.preventDefault(); this.#handleTripFormSubmit(); });
        document.getElementById('expenseForm').addEventListener('submit', (e) => { e.preventDefault(); this.#handleExpenseFormSubmit(); });
        document.getElementById('travelerForm').addEventListener('submit', (e) => { e.preventDefault(); this.#handleTravelerFormSubmit(); });
        document.getElementById('recPlanForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.#handleRecPlanFormSubmit(); });
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* RENDERING PIPELINE                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderAll() {
        this.#renderTripSelectOptions();
        this.#renderDashboard();
        this.#renderTripsView();
        this.#renderExpensesView();
        this.#renderTravelersView();
        this.#renderSplitView();
        if (this.#activeView === 'analytics') this.#renderAnalyticsView();
    }

    #renderTripSelectOptions() {
        const select = document.getElementById('activeTripSelect');
        select.innerHTML = '';

        if (this.#trips.length === 0) {
            select.innerHTML = '<option value="">No Trips Available</option>';
            return;
        }

        this.#trips.forEach(trip => {
            const opt = document.createElement('option');
            opt.value = trip.id;
            opt.textContent = `${trip.name} (${trip.destination})`;
            if (this.#currentTrip && trip.id === this.#currentTrip.id) opt.selected = true;
            select.appendChild(opt);
        });
    }

    #renderDashboard() {
        const trip = this.#currentTrip;
        if (!trip) {
            document.getElementById('dashTripName').textContent = 'No Active Trip';
            document.getElementById('dashTripDetails').textContent = 'Please create a new trip to get started';
            return;
        }

        document.getElementById('dashTripName').textContent = trip.name;
        document.getElementById('dashTripDetails').textContent =
            `📍 ${trip.destination} | 📅 ${trip.startDate || 'N/A'} → ${trip.endDate || 'N/A'} | 👥 ${trip.travelers.length} Travelers`;

        const totalBudget  = trip.totalBudget;
        const totalSpent   = trip.getTotalSpent();
        const remaining    = trip.getRemainingBudget();
        const usagePct     = trip.getBudgetUsagePercentage();
        const budgetStatus = trip.getBudgetStatus();

        // Animated counters
        this.#animateCounter('metricTotalBudget', totalBudget);
        this.#animateCounter('metricTotalSpent', totalSpent);
        this.#animateCounter('metricRemainingBudget', remaining);

        const pctEl = document.getElementById('metricUsagePct');
        if (pctEl) {
            const startPct = parseFloat(pctEl.dataset.currentValue || '0') || 0;
            const endPct = usagePct;
            const dur = 600;
            const t0 = performance.now();
            const animPct = (now) => {
                const prog = Math.min((now - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - prog, 3);
                pctEl.textContent = `${Math.round(startPct + (endPct - startPct) * eased)}%`;
                if (prog < 1) requestAnimationFrame(animPct);
                else pctEl.dataset.currentValue = endPct;
            };
            requestAnimationFrame(animPct);
        }

        document.getElementById('metricSpentSub').textContent = `${trip.expenses.length} expense(s) recorded`;
        document.getElementById('metricRemainingSub').textContent = remaining >= 0 ? 'Within budget limit' : 'Budget deficit!';

        // Progress bar
        const progressBar = document.getElementById('dashboardProgressBar');
        const statusBadge = document.getElementById('budgetStatusBadge');
        const warningBanner = document.getElementById('budgetWarningBanner');

        progressBar.style.width = `${Math.min(100, usagePct)}%`;
        document.getElementById('progressSpentLabel').textContent = `$${totalSpent.toFixed(2)} Spent (${usagePct}%)`;
        document.getElementById('progressBudgetLabel').textContent = `$${totalBudget.toFixed(2)} Budget`;

        if (budgetStatus.level === 'exceeded') {
            statusBadge.className = 'progress-status-badge badge-danger';
            statusBadge.textContent = '⚠️ Exceeded';
            progressBar.style.backgroundColor = 'var(--danger)';
            warningBanner.style.display = 'flex';
            warningBanner.className = 'progress-warning-banner banner-danger';
            warningBanner.innerHTML = `⚠️ <strong>Budget Overrun!</strong> You have exceeded the trip budget by $${Math.abs(remaining).toFixed(2)}.`;
        } else if (budgetStatus.level === 'warning') {
            statusBadge.className = 'progress-status-badge badge-warning';
            statusBadge.textContent = '⚡ Near Limit';
            progressBar.style.backgroundColor = 'var(--warning)';
            warningBanner.style.display = 'flex';
            warningBanner.className = 'progress-warning-banner banner-warning';
            warningBanner.innerHTML = `⚡ <strong>Caution:</strong> You have consumed ${usagePct}% of your budget ($${remaining.toFixed(2)} remaining).`;
        } else {
            statusBadge.className = 'progress-status-badge badge-safe';
            statusBadge.textContent = '✅ On Track';
            progressBar.style.backgroundColor = 'var(--success)';
            warningBanner.style.display = 'none';
        }

        // Update Budget Advisor Highlight
        const recHighlight = document.getElementById('dashRecBudgetHighlight');
        if (recHighlight) {
            recHighlight.textContent = `$${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        // Recent Expenses
        const recentTbody = document.getElementById('recentExpensesTableBody');
        const recentExpenses = [...trip.expenses].reverse().slice(0, 5);

        if (recentExpenses.length === 0) {
            recentTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:28px;">No expenses yet. Click "Add Expense"!</td></tr>`;
        } else {
            recentTbody.innerHTML = recentExpenses.map(exp => {
                const payer = trip.findTravelerById(exp.paidById);
                const cost = exp.calculateTotalCost();
                return `
                    <tr>
                        <td>
                            <div class="expense-desc-cell">
                                <span class="expense-desc-title">${this.#escapeHtml(exp.title)}</span>
                                <span class="expense-desc-notes">🗓️ ${exp.date}</span>
                            </div>
                        </td>
                        <td>${this.#renderCategoryBadge(exp.category)}</td>
                        <td>
                            <div class="traveler-pill" title="Paid by ${payer ? this.#escapeHtml(payer.name) : 'Unknown'}">
                                <span class="avatar-badge" style="background:${payer ? payer.color : '#6366F1'};">
                                    ${payer ? payer.getInitials() : '?'}
                                </span>
                                <span class="traveler-name">${payer ? this.#escapeHtml(payer.name) : 'Unknown'}</span>
                            </div>
                        </td>
                        <td>
                            <span class="expense-total-cost">$${cost.toFixed(2)}</span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        this.#renderCategoryBreakdown(trip);
    }

    #renderCategoryBreakdown(trip) {
        const breakdown = trip.getCategoryBreakdown();
        const totalSpent = trip.getTotalSpent();
        const donutSvg = document.getElementById('categoryDonutSvg');
        const barsContainer = document.getElementById('categoryBarsContainer');
        const donutTotal = document.getElementById('donutTotalAmount');

        donutTotal.textContent = `$${Math.round(totalSpent)}`;

        const categoryColors = {
            Flight: '#38BDF8', Hotel: '#A855F7', Food: '#F97316',
            Transport: '#EAB308', Activities: '#10B981', Shopping: '#EC4899', Other: '#94A3B8'
        };
        const categoryIcons = {
            Flight: '✈️', Hotel: '🏨', Food: '🍽️',
            Transport: '🚗', Activities: '🏄', Shopping: '🛍️', Other: '📦'
        };

        const activeCategories = Object.values(breakdown).filter(c => c.total > 0);

        if (activeCategories.length === 0) {
            donutSvg.innerHTML = `<circle cx="50" cy="50" r="38" stroke="#334155" stroke-width="18" fill="none" />`;
            barsContainer.innerHTML = `<p style="font-size:12px;color:var(--text-muted);text-align:center;">No categorized expenses yet.</p>`;
            return;
        }

        const circumference = 2 * Math.PI * 38;
        let offset = 0;
        let svgCircles = '';

        activeCategories.forEach(item => {
            const rawLen = (item.percentage / 100) * circumference;
            const gap = activeCategories.length > 1 ? 2.5 : 0;
            const len = Math.max(1, rawLen - gap);
            const color = categoryColors[item.category] || '#94A3B8';
            svgCircles += `
                <circle cx="50" cy="50" r="38"
                    stroke="${color}" stroke-width="15" fill="none"
                    stroke-dasharray="${len} ${circumference - len}"
                    stroke-dashoffset="${-offset}"
                    stroke-linecap="round"
                    style="filter:drop-shadow(0 0 5px ${color}88);" />
            `;
            offset += rawLen;
        });

        donutSvg.innerHTML = svgCircles;

        barsContainer.innerHTML = activeCategories.map(item => {
            const color = categoryColors[item.category] || '#94A3B8';
            const icon = categoryIcons[item.category] || '🏷️';
            return `
                <div class="cat-bar-item">
                    <div class="cat-bar-header">
                        <span class="cat-bar-name">
                            <span style="display:inline-flex;width:24px;height:24px;border-radius:6px;background:${color}22;align-items:center;justify-content:center;font-size:13px;">${icon}</span>
                            <span>${item.category}</span>
                            <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);">(${item.percentage}%)</span>
                        </span>
                        <span class="cat-bar-val" style="color:${color};">$${item.total.toFixed(2)}</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width:${item.percentage}%;background-color:${color};box-shadow:0 0 8px ${color};"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    #renderTripsView() {
        const container = document.getElementById('tripsGrid');
        if (!container) return;

        if (this.#trips.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);">No trips created yet.</p>`;
            return;
        }

        container.innerHTML = this.#trips.map(t => {
            const isActive = this.#currentTrip && t.id === this.#currentTrip.id;
            const spent = t.getTotalSpent();
            const pct = t.getBudgetUsagePercentage();
            const barColor = pct > 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';

            return `
                <div class="trip-card ${isActive ? 'active-trip' : ''}">
                    ${isActive ? '<span class="trip-active-badge">✅ Active</span>' : ''}
                    <div>
                        <h3 style="font-size:17px;font-weight:800;margin-bottom:4px;">${this.#escapeHtml(t.name)}</h3>
                        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">📍 ${this.#escapeHtml(t.destination)}</p>

                        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
                            📅 ${t.startDate || 'No start'} → ${t.endDate || 'No end'}
                        </div>

                        <div style="background:var(--bg-primary);padding:12px;border-radius:var(--radius-md);margin-bottom:14px;">
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
                                <span style="color:var(--text-secondary);">Spent / Budget:</span>
                                <strong>$${spent.toFixed(2)} / $${t.totalBudget.toFixed(2)}</strong>
                            </div>
                            <div class="progress-track" style="height:6px;margin-bottom:0;">
                                <div class="progress-bar-fill" style="width:${Math.min(100,pct)}%;background-color:${barColor};"></div>
                            </div>
                        </div>

                        <div style="display:flex;gap:10px;font-size:12px;color:var(--text-secondary);margin-bottom:14px;">
                            <span>👥 ${t.travelers.length} Travelers</span>
                            <span>•</span>
                            <span>💳 ${t.expenses.length} Expenses</span>
                        </div>
                    </div>

                    <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border);padding-top:12px;flex-wrap:wrap;">
                        ${!isActive ? `
                            <button type="button" class="btn btn-secondary select-trip-btn" data-id="${t.id}" style="font-size:12px;">
                                🔄 Switch
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-secondary clone-trip-btn" data-id="${t.id}" style="font-size:12px;" title="Duplicate trip">
                            📋 Clone
                        </button>
                        <button type="button" class="btn btn-secondary edit-trip-btn" data-id="${t.id}" style="font-size:12px;">
                            ✏️ Edit
                        </button>
                        <button type="button" class="btn btn-danger delete-trip-btn" data-id="${t.id}" style="font-size:12px;">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind trip card buttons
        container.querySelectorAll('.select-trip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const found = this.#trips.find(t => t.id === btn.getAttribute('data-id'));
                if (found) {
                    this.#currentTrip = found;
                    StorageService.setActiveTripId(found.id);
                    this.#renderAll();
                    this.#showToast(`Active trip set to "${found.name}"`, 'success');
                }
            });
        });

        container.querySelectorAll('.clone-trip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const found = this.#trips.find(t => t.id === btn.getAttribute('data-id'));
                if (found) this.#handleCloneTripById(found.id);
            });
        });

        container.querySelectorAll('.edit-trip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const found = this.#trips.find(t => t.id === btn.getAttribute('data-id'));
                if (found) this.#openTripModal(found);
            });
        });

        container.querySelectorAll('.delete-trip-btn').forEach(btn => {
            btn.addEventListener('click', () => this.#handleDeleteTrip(btn.getAttribute('data-id')));
        });
    }

    #renderExpensesView() {
        const trip = this.#currentTrip;
        const tbody = document.getElementById('allExpensesTableBody');
        if (!tbody) return;

        const countEl = document.getElementById('expenseLedgerCount');
        const sumEl = document.getElementById('expenseLedgerSum');
        const avgEl = document.getElementById('expenseLedgerAvg');
        const avgPill = document.getElementById('expenseLedgerAvgPill');

        if (!trip || trip.expenses.length === 0) {
            if (countEl) countEl.textContent = '0 expenses';
            if (sumEl) sumEl.textContent = '$0.00';
            if (avgPill) avgPill.style.display = 'none';
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:48px 24px;color:var(--text-muted);">
                        <div style="font-size:32px;margin-bottom:8px;">💳</div>
                        <div style="font-weight:600;color:var(--text-secondary);font-size:14px;margin-bottom:4px;">No expenses recorded yet</div>
                        <div style="font-size:12px;">Click "Add Expense" above to record your first polymorphic trip expense!</div>
                    </td>
                </tr>
            `;
            return;
        }

        const searchTerm = (document.getElementById('expenseSearchInput')?.value || '').toLowerCase().trim();
        const selectedCat = document.getElementById('expenseCategoryFilter')?.value || 'ALL';
        const sortVal = document.getElementById('expenseSortFilter')?.value || 'date-desc';

        let filtered = trip.expenses.filter(exp => {
            const matchSearch = exp.title.toLowerCase().includes(searchTerm) ||
                                (exp.notes && exp.notes.toLowerCase().includes(searchTerm));
            const matchCat = selectedCat === 'ALL' || exp.category === selectedCat;
            return matchSearch && matchCat;
        });

        // Sort
        filtered.sort((a, b) => {
            if (sortVal === 'date-desc') return new Date(b.date) - new Date(a.date);
            if (sortVal === 'date-asc')  return new Date(a.date) - new Date(b.date);
            if (sortVal === 'amount-desc') return b.calculateTotalCost() - a.calculateTotalCost();
            if (sortVal === 'amount-asc')  return a.calculateTotalCost() - b.calculateTotalCost();
            return 0;
        });

        // Update ledger telemetry bar
        if (countEl) countEl.textContent = `${filtered.length} expense${filtered.length === 1 ? '' : 's'}`;
        if (sumEl) {
            const totalSum = filtered.reduce((acc, exp) => acc + exp.calculateTotalCost(), 0);
            sumEl.textContent = `$${totalSum.toFixed(2)}`;
            if (avgEl && avgPill) {
                if (filtered.length > 0) {
                    avgEl.textContent = `$${(totalSum / filtered.length).toFixed(2)}`;
                    avgPill.style.display = 'inline-flex';
                } else {
                    avgPill.style.display = 'none';
                }
            }
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:48px 24px;color:var(--text-muted);">
                        <div style="font-size:32px;margin-bottom:8px;">🔍</div>
                        <div style="font-weight:600;color:var(--text-secondary);font-size:14px;margin-bottom:4px;">No matching expenses found</div>
                        <div style="font-size:12px;">Try adjusting your search query or clicking another category filter above</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(exp => {
            const payer = trip.findTravelerById(exp.paidById);
            const totalCost = exp.calculateTotalCost();
            const details = exp.getDetails ? exp.getDetails() : null;
            const participants = exp.participantIds.map(id => trip.findTravelerById(id)).filter(Boolean);

            return `
                <tr>
                    <td>
                        <span class="expense-date-badge" title="Transaction Date: ${exp.date}">
                            <span style="opacity:0.75;">🗓️</span>
                            <span>${exp.date}</span>
                        </span>
                    </td>
                    <td>
                        <div class="expense-desc-cell">
                            <span class="expense-desc-title">${this.#escapeHtml(exp.title)}</span>
                            ${exp.notes ? `<span class="expense-desc-notes">${this.#escapeHtml(exp.notes)}</span>` : ''}
                        </div>
                    </td>
                    <td>${this.#renderCategoryBadge(exp.category)}</td>
                    <td>
                        <div class="traveler-pill" title="Paid by ${payer ? this.#escapeHtml(payer.name) : 'Unknown'}">
                            <span class="avatar-badge" style="background:${payer ? payer.color : '#6366F1'};">
                                ${payer ? payer.getInitials() : '?'}
                            </span>
                            <span class="traveler-name">${payer ? this.#escapeHtml(payer.name) : 'Unknown'}</span>
                        </div>
                    </td>
                    <td>
                        <div class="avatar-stack" title="${participants.map(p => this.#escapeHtml(p.name)).join(', ')}">
                            ${participants.map(p => `
                                <span class="avatar-badge stack-item" style="background:${p.color};" title="${this.#escapeHtml(p.name)}">
                                    ${p.getInitials()}
                                </span>
                            `).join('')}
                        </div>
                    </td>
                    <td>
                        <span class="expense-base-amount">$${exp.baseAmount.toFixed(2)}</span>
                    </td>
                    <td>
                        <div class="expense-cost-cell">
                            <span class="expense-total-cost">$${totalCost.toFixed(2)}</span>
                            ${details && details.extraDetails ? `
                                <span class="expense-oop-badge" title="${this.#escapeHtml(details.extraDetails)}">
                                    <span class="oop-pulse"></span>
                                    <span>${this.#escapeHtml(details.extraDetails)}</span>
                                </span>
                            ` : ''}
                        </div>
                    </td>
                    <td>
                        <div class="expense-actions-cell">
                            <button type="button" class="btn-expense-action btn-expense-edit edit-expense-btn" data-id="${exp.id}" title="Edit Expense">✏️</button>
                            <button type="button" class="btn-expense-action btn-expense-delete delete-expense-btn" data-id="${exp.id}" title="Delete Expense">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.edit-expense-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const exp = trip.findExpenseById(btn.getAttribute('data-id'));
                if (exp) this.#openExpenseModal(exp);
            });
        });

        tbody.querySelectorAll('.delete-expense-btn').forEach(btn => {
            btn.addEventListener('click', () => this.#handleDeleteExpense(btn.getAttribute('data-id')));
        });
    }

    #renderTravelersView() {
        const trip = this.#currentTrip;
        const container = document.getElementById('travelersGrid');
        if (!container) return;

        if (!trip || trip.travelers.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:36px;">No travelers found. Click "Add Traveler" to register friends.</p>`;
            return;
        }

        const balances = ExpenseSplitter.calculateTravelerBalances(trip);
        const balanceMap = {};
        balances.forEach(b => balanceMap[b.travelerId] = b);

        container.innerHTML = trip.travelers.map(trv => {
            const b = balanceMap[trv.id] || { totalPaid: 0, totalShare: 0, netBalance: 0 };
            const isOwed = b.netBalance > 0.01;
            const owes = b.netBalance < -0.01;

            return `
                <div class="traveler-card" style="--traveler-accent:${trv.color};">
                    <div class="traveler-card-header">
                        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
                            <div class="traveler-avatar-large" style="background:${trv.color};">
                                ${trv.getInitials()}
                            </div>
                            <div class="traveler-info">
                                <h4 class="traveler-name">${this.#escapeHtml(trv.name)}</h4>
                                <span class="traveler-email">${trv.email ? this.#escapeHtml(trv.email) : 'companion@trip'}</span>
                            </div>
                        </div>
                        <button type="button" class="btn-traveler-delete delete-traveler-btn" data-id="${trv.id}" title="Remove Traveler">✕</button>
                    </div>

                    <div class="traveler-stats">
                        <div class="traveler-stat-item">
                            <span class="traveler-stat-label"><span>💳</span><span>Total Paid</span></span>
                            <span class="traveler-stat-value" style="color:#F8FAFC;">$${b.totalPaid.toFixed(2)}</span>
                        </div>
                        <div class="traveler-stat-item">
                            <span class="traveler-stat-label"><span>⚖️</span><span>Fair Share</span></span>
                            <span class="traveler-stat-value" style="color:#94A3B8;">$${b.totalShare.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">
                        <span style="font-size:11.5px;color:var(--text-muted);font-family:var(--font-mono);">Net Settlement:</span>
                        <span class="traveler-balance-pill ${isOwed ? 'pill-positive' : owes ? 'pill-negative' : 'pill-settled'}">
                            <span class="balance-dot ${isOwed ? 'dot-positive' : owes ? 'dot-negative' : 'dot-settled'}"></span>
                            <span>${isOwed ? `+$${b.netBalance.toFixed(2)} (Gets back)` : owes ? `-$${Math.abs(b.netBalance).toFixed(2)} (Owes)` : '$0.00 (Settled)'}</span>
                        </span>
                    </div>

                    <button type="button" class="view-history-btn" data-id="${trv.id}">
                        <span>📜</span><span>View Expense Ledger</span>
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.delete-traveler-btn').forEach(btn => {
            btn.addEventListener('click', () => this.#handleDeleteTraveler(btn.getAttribute('data-id')));
        });

        container.querySelectorAll('.view-history-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.#openTravelerHistory(btn.getAttribute('data-id'));
            });
        });
    }

    #renderSplitView() {
        const trip = this.#currentTrip;
        if (!trip) return;

        const settlements = ExpenseSplitter.calculateWhoOwesWhom(trip);
        const wowContainer = document.getElementById('whoOwesWhomContainer');

        if (settlements.length === 0) {
            wowContainer.innerHTML = `
                <div style="text-align:center;padding:32px;background:rgba(16,185,129,0.06);border-radius:var(--radius-lg);border:1px solid rgba(16,185,129,0.2);">
                    <div style="font-size:32px;margin-bottom:6px;">🎉</div>
                    <h4 style="font-size:16px;font-weight:700;color:var(--success);">All Debts Are Settled!</h4>
                    <p style="font-size:12.5px;color:var(--text-secondary);">Nobody owes anyone for this trip right now.</p>
                </div>
            `;
        } else {
            wowContainer.innerHTML = `
                <div class="settlement-grid">
                    ${settlements.map(s => `
                        <div class="settlement-card">
                            <div class="settlement-person">
                                <span class="avatar-badge" style="background:${s.fromColor};width:36px;height:36px;font-size:13px;border:2px solid #0D0E16;">
                                    ${s.fromName.slice(0,2).toUpperCase()}
                                </span>
                                <div class="person-details">
                                    <span class="person-name">${this.#escapeHtml(s.fromName)}</span>
                                    <span class="settle-role-tag role-debtor">Debtor</span>
                                </div>
                            </div>
                            <div class="settlement-arrow">
                                <span class="settlement-amount">$${s.amount.toFixed(2)}</span>
                                <div class="settlement-arrow-track">
                                    <span>──►</span><span>TRANSFERS</span><span>──►</span>
                                </div>
                            </div>
                            <div class="settlement-person" style="justify-content:flex-end;">
                                <div class="person-details" style="text-align:right;">
                                    <span class="person-name">${this.#escapeHtml(s.toName)}</span>
                                    <span class="settle-role-tag role-creditor" style="margin-left:auto;">Creditor</span>
                                </div>
                                <span class="avatar-badge" style="background:${s.toColor};width:36px;height:36px;font-size:13px;border:2px solid #0D0E16;">
                                    ${s.toName.slice(0,2).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Balances table
        const balances = ExpenseSplitter.calculateTravelerBalances(trip);
        document.getElementById('balancesTableBody').innerHTML = balances.map(b => {
            const isOwed = b.netBalance > 0.01;
            const owes = b.netBalance < -0.01;
            return `
                <tr>
                    <td>
                        <span class="traveler-pill">
                            <span class="avatar-badge" style="background:${b.color};">
                                ${b.name.slice(0,2).toUpperCase()}
                            </span>
                            <span class="traveler-name">${this.#escapeHtml(b.name)}</span>
                        </span>
                    </td>
                    <td style="font-family:var(--font-mono);font-size:13px;color:#FFFFFF;">$${b.totalPaid.toFixed(2)}</td>
                    <td style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);">$${b.totalShare.toFixed(2)}</td>
                    <td>
                        <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:700;color:${isOwed ? 'var(--success)' : owes ? 'var(--danger)' : 'var(--text-muted)'};">
                            ${isOwed ? `+$${b.netBalance.toFixed(2)}` : owes ? `-$${Math.abs(b.netBalance).toFixed(2)}` : '$0.00'}
                        </span>
                    </td>
                    <td style="text-align:right;">
                        ${isOwed ? `<span class="status-pill status-pill-safe"><span class="status-pill-dot dot-safe"></span>GETS BACK $${b.netBalance.toFixed(2)}</span>`
                          : owes  ? `<span class="status-pill status-pill-danger"><span class="status-pill-dot dot-danger"></span>OWES $${Math.abs(b.netBalance).toFixed(2)}</span>`
                          : `<span class="status-pill status-pill-neutral"><span class="status-pill-dot dot-neutral"></span>FULLY SETTLED</span>`}
                    </td>
                </tr>
            `;
        }).join('');

        // Single Expense Selector
        const splitSelector = document.getElementById('splitExpenseSelector');
        splitSelector.innerHTML = '';
        if (trip.expenses.length === 0) {
            splitSelector.innerHTML = '<option value="">No expenses available</option>';
            document.getElementById('singleExpenseSplitResult').innerHTML = `<p style="color:var(--text-muted);font-size:13px;">No expenses logged yet.</p>`;
        } else {
            trip.expenses.forEach(exp => {
                const opt = document.createElement('option');
                opt.value = exp.id;
                opt.textContent = `${exp.title} ($${exp.calculateTotalCost().toFixed(2)})`;
                splitSelector.appendChild(opt);
            });
            this.#renderSingleExpenseSplit(trip.expenses[0].id);
        }
    }

    #renderSingleExpenseSplit(expenseId) {
        const trip = this.#currentTrip;
        const resultContainer = document.getElementById('singleExpenseSplitResult');
        if (!trip || !expenseId) { resultContainer.innerHTML = ''; return; }

        const exp = trip.findExpenseById(expenseId);
        if (!exp) { resultContainer.innerHTML = ''; return; }

        const splitData = ExpenseSplitter.splitSingleExpense(exp, trip);

        resultContainer.innerHTML = `
            <div style="background:rgba(22,22,34,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-md);padding:18px;margin-top:14px;backdrop-filter:blur(14px);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
                    <div>
                        <h4 style="font-size:15px;font-weight:700;color:#F8FAFC;">${this.#escapeHtml(splitData.expenseTitle)}</h4>
                        <p style="font-size:12px;color:#94A3B8;margin-top:2px;">Paid by <strong style="color:#FFFFFF;">${this.#escapeHtml(splitData.payerName)}</strong> &bull; Total Polymorphic Cost: <strong style="color:#34D399;font-family:var(--font-mono);">$${splitData.totalCost.toFixed(2)}</strong></p>
                    </div>
                    <div style="background:rgba(99,102,241,0.12);padding:8px 16px;border-radius:var(--radius-md);border:1px solid rgba(129,140,248,0.25);text-align:right;">
                        <span style="font-size:10px;color:#A5B4FC;font-family:var(--font-mono);text-transform:uppercase;display:block;">Per Person Share</span>
                        <strong style="color:#38BDF8;font-size:16px;font-family:var(--font-mono);">$${splitData.perPersonCost.toFixed(2)}</strong>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;">
                    ${splitData.breakdown.map(b => `
                        <div style="background:rgba(14,14,22,0.8);padding:12px 14px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span class="avatar-badge" style="background:${b.travelerColor || '#6366F1'};width:26px;height:26px;font-size:10px;">
                                    ${b.travelerName.slice(0,2).toUpperCase()}
                                </span>
                                <div>
                                    <strong style="font-size:12.5px;color:#F8FAFC;display:block;">${this.#escapeHtml(b.travelerName)}</strong>
                                    <span style="font-size:10px;color:${b.isPayer ? '#38BDF8' : '#94A3B8'};font-family:var(--font-mono);">${b.isPayer ? '⭐ Payer' : 'Participant'}</span>
                                </div>
                            </div>
                            <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:${b.isPayer ? '#34D399' : '#CBD5E1'};">$${b.share.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* ANALYTICS VIEW                                                          */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderAnalyticsView() {
        const trip = this.#currentTrip;
        if (!trip) return;

        this.#renderDailyBarChart(trip);
        this.#renderAnalyticsCategories(trip);
        this.#renderTopSpenders(trip);
    }

    #renderDailyBarChart(trip) {
        const container = document.getElementById('dailyBarChart');
        if (!container) return;

        // Group expenses by date
        const byDate = {};
        trip.expenses.forEach(exp => {
            byDate[exp.date] = (byDate[exp.date] || 0) + exp.calculateTotalCost();
        });

        const dates = Object.keys(byDate).sort();
        if (dates.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No expense data recorded yet.</p>`;
            return;
        }

        const maxVal = Math.max(...Object.values(byDate));

        container.innerHTML = `
            <div class="daily-chart-canvas">
                ${dates.map(date => {
                    const val = byDate[date];
                    const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    const dateObj = new Date(date + 'T00:00:00');
                    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    const shortDate = isNaN(dateObj) ? date.slice(5) : `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
                    return `
                        <div class="daily-chart-col" title="${date}: $${val.toFixed(2)}">
                            <span class="daily-chart-amt">$${Math.round(val)}</span>
                            <div class="daily-chart-pillar" style="height:${Math.max(12, heightPct)}px;max-height:115px;min-height:12px;"></div>
                            <span class="daily-chart-date">${shortDate}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    #renderAnalyticsCategories(trip) {
        const container = document.getElementById('analyticsCategories');
        if (!container) return;

        const breakdown = trip.getCategoryBreakdown();
        const categoryColors = {
            Flight: '#38BDF8', Hotel: '#A855F7', Food: '#F97316',
            Transport: '#EAB308', Activities: '#10B981', Shopping: '#EC4899', Other: '#94A3B8'
        };
        const categoryIcons = {
            Flight: '✈️', Hotel: '🏨', Food: '🍽️',
            Transport: '🚗', Activities: '🏄', Shopping: '🛍️', Other: '📦'
        };

        const cats = Object.values(breakdown).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

        if (cats.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No data yet.</p>`;
            return;
        }

        container.innerHTML = cats.map(item => {
            const color = categoryColors[item.category] || '#94A3B8';
            const icon = categoryIcons[item.category] || '🏷️';
            return `
                <div class="analytics-cat-row">
                    <div class="analytics-cat-icon" style="background:${color}22;border:1px solid ${color}44;">
                        ${icon}
                    </div>
                    <div class="analytics-cat-info">
                        <div class="analytics-cat-top">
                            <span class="analytics-cat-name">${item.category}</span>
                            <span class="analytics-cat-total" style="color:${color};">$${item.total.toFixed(2)}</span>
                        </div>
                        <div class="progress-track" style="height:6px;background:rgba(255,255,255,0.06);border-radius:9999px;margin-bottom:0;">
                            <div class="cat-bar-fill" style="width:${item.percentage}%;background-color:${color};box-shadow:0 0 10px ${color};"></div>
                        </div>
                    </div>
                    <span class="analytics-cat-pct">${item.percentage}%</span>
                </div>
            `;
        }).join('');
    }

    #renderTopSpenders(trip) {
        const container = document.getElementById('topSpendersContainer');
        if (!container) return;

        const paidMap = {};
        trip.expenses.forEach(exp => {
            const payer = trip.findTravelerById(exp.paidById);
            if (payer) {
                paidMap[payer.id] = paidMap[payer.id] || { name: payer.name, color: payer.color, total: 0 };
                paidMap[payer.id].total += exp.calculateTotalCost();
            }
        });

        const sorted = Object.values(paidMap).sort((a, b) => b.total - a.total);
        const maxTotal = sorted.length > 0 ? sorted[0].total : 1;
        const totalTripSpent = trip.getTotalSpent();

        if (sorted.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No expenses to analyze.</p>`;
            return;
        }

        const medals = ['🥇','🥈','🥉'];

        container.innerHTML = sorted.map((s, i) => {
            const pctOfTotal = totalTripSpent > 0 ? ((s.total / totalTripSpent) * 100).toFixed(1) : '0.0';
            const rankDisplay = medals[i] ? `<span class="top-spender-rank">${medals[i]}</span>` : `<span class="top-spender-rank rank-pill">#${i+1}</span>`;
            return `
                <div class="top-spender-row">
                    ${rankDisplay}
                    <div class="avatar-badge" style="background:${s.color};width:38px;height:38px;font-size:13px;border:2px solid #0D0E16;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
                        ${s.name.slice(0,2).toUpperCase()}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <div>
                                <strong style="font-size:14px;color:#F8FAFC;">${this.#escapeHtml(s.name)}</strong>
                                <span style="font-size:11px;color:#94A3B8;margin-left:8px;font-family:var(--font-mono);">(${pctOfTotal}% of trip)</span>
                            </div>
                            <span style="font-family:var(--font-mono);font-size:14.5px;font-weight:700;color:#FFFFFF;">$${s.total.toFixed(2)}</span>
                        </div>
                        <div class="progress-track" style="height:6px;background:rgba(255,255,255,0.06);border-radius:9999px;margin-bottom:0;">
                            <div class="progress-bar-fill" style="width:${(s.total/maxTotal)*100}%;background:${s.color};box-shadow:0 0 8px ${s.color};"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* ACTIVITY FEED / TIMELINE                                                */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderActivityFeed() {
        const trip = this.#currentTrip;
        const container = document.getElementById('activityFeedContainer');
        const label = document.getElementById('activityTripLabel');
        if (!container) return;

        if (!trip) {
            container.innerHTML = `<p style="color:var(--text-muted);">No active trip selected.</p>`;
            return;
        }

        label.textContent = `Expense activity for "${trip.name}" — ${trip.expenses.length} total expenses`;

        const categoryColors = {
            Flight: '#38BDF8', Hotel: '#A855F7', Food: '#F97316',
            Transport: '#EAB308', Activities: '#10B981', Shopping: '#EC4899', Other: '#94A3B8'
        };
        const categoryIcons = {
            Flight: '✈️', Hotel: '🏨', Food: '🍽️',
            Transport: '🚗', Activities: '🏄', Shopping: '🛍️', Other: '📦'
        };

        const sorted = [...trip.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sorted.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:32px;color:var(--text-muted);">
                    <div style="font-size:36px;margin-bottom:8px;">🏖️</div>
                    <p>No expenses recorded for this trip yet.</p>
                </div>
            `;
            return;
        }

        // Group by date
        const byDate = {};
        sorted.forEach(exp => {
            if (!byDate[exp.date]) byDate[exp.date] = [];
            byDate[exp.date].push(exp);
        });

        container.innerHTML = Object.entries(byDate).map(([date, exps]) => {
            const dayTotal = exps.reduce((sum, e) => sum + e.calculateTotalCost(), 0);
            return `
                <div style="margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">
                        <span style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.05em;">📅 ${date}</span>
                        <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Day Total: $${dayTotal.toFixed(2)}</span>
                    </div>
                    <div class="activity-timeline">
                        ${exps.map((exp, idx) => {
                            const payer = trip.findTravelerById(exp.paidById);
                            const cost = exp.calculateTotalCost();
                            const color = categoryColors[exp.category] || '#94A3B8';
                            const icon = categoryIcons[exp.category] || '🏷️';
                            return `
                                <div class="activity-item" style="animation-delay:${idx * 0.06}s;">
                                    <div class="activity-dot" style="background:${color}22;color:${color};">${icon}</div>
                                    <div class="activity-content">
                                        <div class="activity-title">${this.#escapeHtml(exp.title)}</div>
                                        <div class="activity-meta">
                                            Paid by <strong>${payer ? this.#escapeHtml(payer.name) : 'Unknown'}</strong>
                                            · ${exp.participantIds.length} participant(s)
                                            ${exp.notes ? `· "${this.#escapeHtml(exp.notes)}"` : ''}
                                        </div>
                                    </div>
                                    <div class="activity-amount">$${cost.toFixed(2)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* PER-TRAVELER EXPENSE HISTORY                                            */
    /* ─────────────────────────────────────────────────────────────────────── */
    #openTravelerHistory(travelerId) {
        const trip = this.#currentTrip;
        if (!trip) return;

        const trv = trip.findTravelerById(travelerId);
        if (!trv) return;

        document.getElementById('travelerHistoryTitle').textContent = `${trv.name}'s Expense History`;

        const content = document.getElementById('travelerHistoryContent');

        // Expenses paid by this traveler
        const paid = trip.expenses.filter(e => e.paidById === travelerId);
        // Expenses this traveler participated in (as a participant, not payer)
        const participated = trip.expenses.filter(e => e.participantIds.includes(travelerId) && e.paidById !== travelerId);

        const totalPaid = paid.reduce((s, e) => s + e.calculateTotalCost(), 0);
        const balances = ExpenseSplitter.calculateTravelerBalances(trip);
        const b = balances.find(x => x.travelerId === travelerId) || { totalShare: 0, netBalance: 0 };

        const categoryColors = {
            Flight: '#38BDF8', Hotel: '#A855F7', Food: '#F97316',
            Transport: '#EAB308', Activities: '#10B981', Shopping: '#EC4899', Other: '#94A3B8'
        };

        content.innerHTML = `
            <div class="traveler-history-header">
                <div class="traveler-avatar-large" style="background:${trv.color};">${trv.getInitials()}</div>
                <div>
                    <h3 style="font-size:18px;font-weight:800;">${this.#escapeHtml(trv.name)}</h3>
                    <p style="font-size:12px;color:var(--text-muted);">${trv.email || 'No email'}</p>
                </div>
            </div>

            <div class="history-stat-grid">
                <div class="history-stat-box">
                    <div class="history-stat-val" style="color:var(--primary);">$${totalPaid.toFixed(2)}</div>
                    <div class="history-stat-lbl">Total Paid</div>
                </div>
                <div class="history-stat-box">
                    <div class="history-stat-val" style="color:var(--text-secondary);">$${b.totalShare.toFixed(2)}</div>
                    <div class="history-stat-lbl">Fair Share</div>
                </div>
                <div class="history-stat-box">
                    <div class="history-stat-val" style="color:${b.netBalance >= 0 ? 'var(--success)' : 'var(--danger)'};">
                        ${b.netBalance >= 0 ? '+' : ''}$${b.netBalance.toFixed(2)}
                    </div>
                    <div class="history-stat-lbl">Net Balance</div>
                </div>
            </div>

            <div style="margin-bottom:18px;">
                <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;">
                    💳 Expenses Paid (${paid.length})
                </h4>
                ${paid.length === 0 ? '<p style="color:var(--text-muted);font-size:13px;">None</p>' : paid.map(e => {
                    const color = categoryColors[e.category] || '#94A3B8';
                    return `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-elevated);border-radius:var(--radius-md);margin-bottom:6px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:14px;">${{'Flight':'✈️','Hotel':'🏨','Food':'🍽️','Transport':'🚗','Activities':'🏄','Shopping':'🛍️'}[e.category] || '📦'}</span>
                                <div>
                                    <div style="font-size:13px;font-weight:600;">${this.#escapeHtml(e.title)}</div>
                                    <div style="font-size:11px;color:var(--text-muted);">${e.date} · ${e.participantIds.length} participants</div>
                                </div>
                            </div>
                            <div style="font-weight:700;color:var(--success);">$${e.calculateTotalCost().toFixed(2)}</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div>
                <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;">
                    🤝 Participated In (${participated.length})
                </h4>
                ${participated.length === 0 ? '<p style="color:var(--text-muted);font-size:13px;">None</p>' : participated.map(e => {
                    const payer = trip.findTravelerById(e.paidById);
                    const share = e.calculateTotalCost() / e.participantIds.length;
                    return `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-elevated);border-radius:var(--radius-md);margin-bottom:6px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:14px;">${{'Flight':'✈️','Hotel':'🏨','Food':'🍽️','Transport':'🚗','Activities':'🏄','Shopping':'🛍️'}[e.category] || '📦'}</span>
                                <div>
                                    <div style="font-size:13px;font-weight:600;">${this.#escapeHtml(e.title)}</div>
                                    <div style="font-size:11px;color:var(--text-muted);">${e.date} · Paid by ${payer ? this.#escapeHtml(payer.name) : 'Unknown'}</div>
                                </div>
                            </div>
                            <div style="font-weight:700;color:var(--warning);">$${share.toFixed(2)} share</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.#openModal('travelerHistoryModal');
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* CURRENCY CONVERTER                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #convertCurrency() {
        const amountEl = document.getElementById('currencyAmount');
        const fromEl   = document.getElementById('currencyFrom');
        const toEl     = document.getElementById('currencyTo');
        const resultEl = document.getElementById('currencyResultAmount');
        const labelEl  = document.getElementById('currencyResultLabel');
        if (!amountEl || !fromEl || !toEl || !resultEl) return;

        const amount = parseFloat(amountEl.value);
        const from   = fromEl.value;
        const to     = toEl.value;

        if (isNaN(amount) || amount <= 0) {
            resultEl.textContent = '—';
            labelEl.textContent  = 'Enter a valid amount above';
            return;
        }

        const fromRate = FX_RATES_TO_USD[from] || 1;
        const toRate   = FX_RATES_TO_USD[to] || 1;
        const converted = (amount / fromRate) * toRate;

        const fromSymbol = CURRENCY_SYMBOLS[from] || from;
        const toSymbol   = CURRENCY_SYMBOLS[to] || to;

        resultEl.textContent = `${toSymbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        labelEl.textContent  = `${fromSymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${from} = ${toSymbol}${converted.toFixed(4)} ${to} · Indicative rate`;
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* EXPORT (CSV & PDF)                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #exportCSV() {
        const trip = this.#currentTrip;
        if (!trip) { this.#showToast('No active trip to export.', 'warning'); return; }

        const headers = ['Date', 'Description', 'Category', 'Payer', 'Base Amount', 'Total Cost', 'Participants', 'Notes'];
        const rows = trip.expenses.map(exp => {
            const payer = trip.findTravelerById(exp.paidById);
            const participants = exp.participantIds.map(id => {
                const t = trip.findTravelerById(id);
                return t ? t.name : 'Unknown';
            }).join(' | ');
            return [
                exp.date,
                `"${(exp.title || '').replace(/"/g, '""')}"`,
                exp.category,
                payer ? payer.name : 'Unknown',
                exp.baseAmount.toFixed(2),
                exp.calculateTotalCost().toFixed(2),
                `"${participants}"`,
                `"${(exp.notes || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [
            `# Trip: ${trip.name} — ${trip.destination}`,
            `# Budget: $${trip.totalBudget} | Spent: $${trip.getTotalSpent().toFixed(2)} | Remaining: $${trip.getRemainingBudget().toFixed(2)}`,
            `# Exported: ${new Date().toLocaleString()}`,
            '',
            headers.join(','),
            ...rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${trip.name.replace(/[^a-z0-9]/gi, '_')}_expenses.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.#showToast(`CSV exported: ${trip.expenses.length} expenses`, 'success');
    }

    #exportPDF() {
        const trip = this.#currentTrip;
        if (!trip) { this.#showToast('No active trip to export.', 'warning'); return; }

        // Build a printable HTML page
        const breakdown = trip.getCategoryBreakdown();
        const catRows = Object.values(breakdown).filter(c => c.total > 0).map(c =>
            `<tr><td>${c.category}</td><td>$${c.total.toFixed(2)}</td><td>${c.percentage}%</td><td>${c.count}</td></tr>`
        ).join('');

        const expRows = trip.expenses.map(exp => {
            const payer = trip.findTravelerById(exp.paidById);
            return `<tr>
                <td>${exp.date}</td>
                <td>${exp.title}</td>
                <td>${exp.category}</td>
                <td>${payer ? payer.name : 'Unknown'}</td>
                <td>$${exp.baseAmount.toFixed(2)}</td>
                <td><strong>$${exp.calculateTotalCost().toFixed(2)}</strong></td>
            </tr>`;
        }).join('');

        const html = `<!DOCTYPE html>
<html><head><title>Trip Report - ${trip.name}</title>
<style>
    body { font-family: Arial, sans-serif; color: #0F172A; margin: 32px; }
    h1 { color: #6366F1; font-size: 24px; }
    h2 { color: #334155; font-size: 16px; margin-top: 24px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 12px; }
    th { background: #6366F1; color: white; padding: 8px 12px; text-align: left; }
    td { padding: 7px 12px; border-bottom: 1px solid #CBD5E1; }
    tr:nth-child(even) td { background: #F8FAFC; }
    .summary { display: flex; gap: 24px; margin: 16px 0; }
    .summary-box { flex: 1; background: #F1F5F9; border-radius: 8px; padding: 12px; }
    .summary-box .val { font-size: 22px; font-weight: 800; color: #6366F1; }
    .summary-box .lbl { font-size: 11px; color: #64748B; text-transform: uppercase; margin-top: 4px; }
    @media print { button { display: none; } }
</style></head>
<body>
    <h1>🗺️ ${trip.name}</h1>
    <p style="color:#64748B;">📍 ${trip.destination} | 📅 ${trip.startDate || 'N/A'} → ${trip.endDate || 'N/A'} | 👥 ${trip.travelers.length} travelers</p>
    <p style="font-size:11px;color:#94A3B8;">Generated: ${new Date().toLocaleString()}</p>

    <div class="summary">
        <div class="summary-box"><div class="val">$${trip.totalBudget.toFixed(2)}</div><div class="lbl">Total Budget</div></div>
        <div class="summary-box"><div class="val" style="color:#EF4444;">$${trip.getTotalSpent().toFixed(2)}</div><div class="lbl">Total Spent</div></div>
        <div class="summary-box"><div class="val" style="color:#10B981;">$${trip.getRemainingBudget().toFixed(2)}</div><div class="lbl">Remaining</div></div>
        <div class="summary-box"><div class="val">${trip.getBudgetUsagePercentage()}%</div><div class="lbl">Budget Used</div></div>
    </div>

    <h2>Category Breakdown</h2>
    <table>
        <thead><tr><th>Category</th><th>Total</th><th>%</th><th>Count</th></tr></thead>
        <tbody>${catRows}</tbody>
    </table>

    <h2>All Expenses (${trip.expenses.length})</h2>
    <table>
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Payer</th><th>Base</th><th>Total</th></tr></thead>
        <tbody>${expRows}</tbody>
    </table>

    <h2>Travelers</h2>
    <table>
        <thead><tr><th>Name</th><th>Email</th></tr></thead>
        <tbody>${trip.travelers.map(t => `<tr><td>${t.name}</td><td>${t.email || '—'}</td></tr>`).join('')}</tbody>
    </table>
</body></html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
            win.onload = () => { win.print(); };
            this.#showToast('PDF print dialog opened!', 'success');
        } else {
            this.#showToast('Popup blocked. Please allow popups for this site.', 'warning');
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* TRIP CLONE                                                              */
    /* ─────────────────────────────────────────────────────────────────────── */
    #handleCloneTrip() {
        if (this.#currentTrip) this.#handleCloneTripById(this.#currentTrip.id);
    }

    #handleCloneTripById(tripId) {
        const original = this.#trips.find(t => t.id === tripId);
        if (!original) return;

        // Create new traveler objects with new IDs but same names/emails
        const newTravelers = original.travelers.map(trv => new Traveler(null, trv.name, trv.email || ''));

        const cloned = new Trip({
            name: `${original.name} (Copy)`,
            destination: original.destination,
            startDate: original.startDate,
            endDate: original.endDate,
            totalBudget: original.totalBudget,
            travelers: newTravelers
        });

        // NOTE: Expenses are not cloned to keep new trip fresh
        this.#trips.push(cloned);
        this.#currentTrip = cloned;
        this.#saveState();
        this.#renderAll();
        this.#showToast(`Cloned trip: "${cloned.name}" (no expenses copied)`, 'success');
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* MODAL CONTROLLERS                                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    #openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    #closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    #openTripModal(tripToEdit = null) {
        const form = document.getElementById('tripForm');
        form.reset();
        const travelersGroup = document.getElementById('tripTravelersInputGroup');

        if (tripToEdit) {
            document.getElementById('tripModalTitle').textContent = 'Edit Trip';
            document.getElementById('tripFormId').value = tripToEdit.id;
            document.getElementById('tripFormName').value = tripToEdit.name;
            document.getElementById('tripFormDestination').value = tripToEdit.destination;
            document.getElementById('tripFormStartDate').value = tripToEdit.startDate || '';
            document.getElementById('tripFormEndDate').value = tripToEdit.endDate || '';
            document.getElementById('tripFormBudget').value = tripToEdit.totalBudget;
            travelersGroup.style.display = 'none';
        } else {
            document.getElementById('tripModalTitle').textContent = 'Create New Trip';
            document.getElementById('tripFormId').value = '';
            travelersGroup.style.display = 'block';
            document.getElementById('tripFormTravelers').value = 'Alex, Sarah, David';
        }

        this.#openModal('tripModal');
    }

    #openExpenseModal(expenseToEdit = null) {
        const trip = this.#currentTrip;
        if (!trip) { this.#showToast('Please create a trip first!', 'error'); return; }
        if (trip.travelers.length === 0) { this.#showToast('Please add at least one traveler first!', 'error'); return; }

        const form = document.getElementById('expenseForm');
        form.reset();

        const paidBySelect = document.getElementById('expenseFormPaidBy');
        paidBySelect.innerHTML = trip.travelers.map(trv =>
            `<option value="${trv.id}">${this.#escapeHtml(trv.name)}</option>`
        ).join('');

        const participantsList = document.getElementById('expenseFormParticipantsList');
        participantsList.innerHTML = trip.travelers.map(trv => `
            <label class="participant-checkbox-item">
                <input type="checkbox" name="participants" value="${trv.id}" checked>
                <span class="avatar-badge" style="background:${trv.color};width:20px;height:20px;font-size:10px;">
                    ${trv.getInitials()}
                </span>
                <span>${this.#escapeHtml(trv.name)}</span>
            </label>
        `).join('');

        const categorySelect = document.getElementById('expenseFormCategory');

        if (expenseToEdit) {
            document.getElementById('expenseModalTitle').textContent = 'Edit Expense';
            document.getElementById('expenseFormId').value = expenseToEdit.id;
            document.getElementById('expenseFormTitle').value = expenseToEdit.title;
            categorySelect.value = expenseToEdit.category;
            document.getElementById('expenseFormBaseAmount').value = expenseToEdit.baseAmount;
            document.getElementById('expenseFormDate').value = expenseToEdit.date;
            document.getElementById('expenseFormNotes').value = expenseToEdit.notes || '';
            paidBySelect.value = expenseToEdit.paidById;
            this.#renderPolymorphicFields(expenseToEdit.category, expenseToEdit);
            const selectedIds = new Set(expenseToEdit.participantIds);
            participantsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = selectedIds.has(cb.value);
            });
        } else {
            document.getElementById('expenseModalTitle').textContent = 'Add Expense';
            document.getElementById('expenseFormId').value = '';
            document.getElementById('expenseFormDate').value = new Date().toISOString().split('T')[0];
            categorySelect.value = 'Food';
            this.#renderPolymorphicFields('Food');
        }

        this.#openModal('expenseModal');
    }

    #openTravelerModal() {
        if (!this.#currentTrip) { this.#showToast('Create or select a trip first!', 'error'); return; }
        document.getElementById('travelerForm').reset();
        this.#openModal('travelerModal');
    }

    /**
     * Dynamically renders specific polymorphic extra input fields depending on category.
     * Showcases how each subclass extends the calculation.
     */
    #renderPolymorphicFields(category, existingData = null) {
        const container = document.getElementById('polymorphicFieldsContainer');
        container.innerHTML = '';

        let html = '';
        switch (category) {
            case 'Flight':
                html = `
                    <div class="polymorphic-header">✈️ Flight Specific Details (FlightExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="flightBaggageFee">Baggage Fee ($)</label>
                            <input type="number" id="flightBaggageFee" class="form-control" min="0" step="0.01" value="${existingData?.baggageFee || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="flightAirportTax">Airport Tax ($)</label>
                            <input type="number" id="flightAirportTax" class="form-control" min="0" step="0.01" value="${existingData?.airportTax || 0}">
                        </div>
                    </div>
                `;
                break;
            case 'Hotel':
                html = `
                    <div class="polymorphic-header">🏨 Hotel Specific Details (HotelExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="hotelNights">Number of Nights</label>
                            <input type="number" id="hotelNights" class="form-control" min="1" step="1" value="${existingData?.nights || 1}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="hotelServiceTax">Service / City Tax (%)</label>
                            <input type="number" id="hotelServiceTax" class="form-control" min="0" step="0.01" value="${existingData?.serviceTaxPercent || 0}">
                        </div>
                    </div>
                `;
                break;
            case 'Food':
                html = `
                    <div class="polymorphic-header">🍽️ Food Specific Details (FoodExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="foodTip">Tip Amount ($)</label>
                            <input type="number" id="foodTip" class="form-control" min="0" step="0.01" value="${existingData?.tipAmount || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="foodTax">Tax Amount ($)</label>
                            <input type="number" id="foodTax" class="form-control" min="0" step="0.01" value="${existingData?.taxAmount || 0}">
                        </div>
                    </div>
                `;
                break;
            case 'Transport':
                html = `
                    <div class="polymorphic-header">🚗 Transport Specific Details (TransportExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="transportTolls">Toll Charges ($)</label>
                            <input type="number" id="transportTolls" class="form-control" min="0" step="0.01" value="${existingData?.tollCharges || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="transportParking">Parking / Surcharge ($)</label>
                            <input type="number" id="transportParking" class="form-control" min="0" step="0.01" value="${existingData?.parkingFee || 0}">
                        </div>
                    </div>
                `;
                break;
            case 'Activities':
                html = `
                    <div class="polymorphic-header">🏄 Activity Details (ActivitiesExpense Polymorphic Formula)</div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label" for="actEquipment">Equipment Rental / Guide Fee ($)</label>
                        <input type="number" id="actEquipment" class="form-control" min="0" step="0.01" value="${existingData?.equipmentRentalFee || 0}">
                    </div>
                `;
                break;
            case 'Shopping':
                html = `
                    <div class="polymorphic-header">🛍️ Shopping Details (ShoppingExpense Polymorphic Formula)</div>
                    <div class="form-row">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="shopTax">Sales Tax ($)</label>
                            <input type="number" id="shopTax" class="form-control" min="0" step="0.01" value="${existingData?.salesTax || 0}">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label" for="shopDiscount">Discount Amount ($)</label>
                            <input type="number" id="shopDiscount" class="form-control" min="0" step="0.01" value="${existingData?.discount || 0}">
                        </div>
                    </div>
                `;
                break;
            default:
                html = `
                    <div class="polymorphic-header">📦 Other Expense</div>
                    <p style="font-size:12px;color:var(--text-muted);margin:0;">Standard base cost calculation applies.</p>
                `;
                break;
        }

        container.innerHTML = html;
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* FORM SUBMISSION HANDLERS                                                */
    /* ─────────────────────────────────────────────────────────────────────── */
    #handleTripFormSubmit() {
        try {
            const id          = document.getElementById('tripFormId').value;
            const name        = document.getElementById('tripFormName').value;
            const destination = document.getElementById('tripFormDestination').value;
            const startDate   = document.getElementById('tripFormStartDate').value;
            const endDate     = document.getElementById('tripFormEndDate').value;
            const budget      = document.getElementById('tripFormBudget').value;

            if (id) {
                const trip = this.#trips.find(t => t.id === id);
                if (trip) {
                    trip.setName(name);
                    trip.setDestination(destination);
                    trip.setDates(startDate, endDate);
                    trip.setTotalBudget(budget);
                    this.#showToast(`Updated trip "${trip.name}"`, 'success');
                }
            } else {
                const travelersInput = document.getElementById('tripFormTravelers').value;
                const travelerNames  = travelersInput.split(',').map(s => s.trim()).filter(Boolean);
                const travelerObjs   = travelerNames.map((tName, idx) => new Traveler(`trv_${Date.now()}_${idx}`, tName));

                if (travelerObjs.length === 0) travelerObjs.push(new Traveler(`trv_${Date.now()}_0`, 'Organizer'));

                const newTrip = new Trip({ name, destination, startDate, endDate, totalBudget: budget, travelers: travelerObjs });
                this.#trips.push(newTrip);
                this.#currentTrip = newTrip;
                this.#showToast(`Created trip "${newTrip.name}"!`, 'success');
            }

            this.#saveState();
            this.#closeModal('tripModal');
            this.#renderAll();
        } catch (err) {
            this.#showToast(err.message, 'error');
        }
    }

    #handleExpenseFormSubmit() {
        try {
            const trip = this.#currentTrip;
            if (!trip) throw new Error('No active trip.');

            const id         = document.getElementById('expenseFormId').value;
            const title      = document.getElementById('expenseFormTitle').value;
            const category   = document.getElementById('expenseFormCategory').value;
            const baseAmount = document.getElementById('expenseFormBaseAmount').value;
            const date       = document.getElementById('expenseFormDate').value;
            const paidById   = document.getElementById('expenseFormPaidBy').value;
            const notes      = document.getElementById('expenseFormNotes').value;

            const participantCheckboxes = document.querySelectorAll('#expenseFormParticipantsList input[type="checkbox"]:checked');
            const participantIds = Array.from(participantCheckboxes).map(cb => cb.value);

            if (participantIds.length === 0) throw new Error('Please select at least one traveler to split this expense with.');

            const expenseData = { title, category, baseAmount: Number(baseAmount), date, paidById, participantIds, notes };

            if (category === 'Flight') {
                expenseData.baggageFee = Number(document.getElementById('flightBaggageFee')?.value || 0);
                expenseData.airportTax = Number(document.getElementById('flightAirportTax')?.value || 0);
            } else if (category === 'Hotel') {
                expenseData.nights = Number(document.getElementById('hotelNights')?.value || 1);
                expenseData.serviceTaxPercent = Number(document.getElementById('hotelServiceTax')?.value || 0);
            } else if (category === 'Food') {
                expenseData.tipAmount = Number(document.getElementById('foodTip')?.value || 0);
                expenseData.taxAmount = Number(document.getElementById('foodTax')?.value || 0);
            } else if (category === 'Transport') {
                expenseData.tollCharges = Number(document.getElementById('transportTolls')?.value || 0);
                expenseData.parkingFee  = Number(document.getElementById('transportParking')?.value || 0);
            } else if (category === 'Activities') {
                expenseData.equipmentRentalFee = Number(document.getElementById('actEquipment')?.value || 0);
            } else if (category === 'Shopping') {
                expenseData.salesTax = Number(document.getElementById('shopTax')?.value || 0);
                expenseData.discount = Number(document.getElementById('shopDiscount')?.value || 0);
            }

            if (id) {
                trip.editExpense(id, expenseData);
                this.#showToast(`Updated expense "${title}"`, 'success');
            } else {
                const newExp = ExpenseFactory.createExpense(expenseData);
                trip.addExpense(newExp);
                this.#showToast(`Added "${title}" ($${newExp.calculateTotalCost().toFixed(2)})`, 'success');
            }

            this.#saveState();
            this.#closeModal('expenseModal');
            this.#renderAll();
        } catch (err) {
            this.#showToast(err.message, 'error');
        }
    }

    #handleTravelerFormSubmit() {
        try {
            const trip = this.#currentTrip;
            if (!trip) throw new Error('No active trip.');

            const name  = document.getElementById('travelerFormName').value;
            const email = document.getElementById('travelerFormEmail').value;

            const newTraveler = new Traveler(null, name, email);
            trip.addTraveler(newTraveler);

            this.#saveState();
            this.#closeModal('travelerModal');
            this.#renderAll();
            this.#showToast(`Added traveler "${newTraveler.name}"!`, 'success');
        } catch (err) {
            this.#showToast(err.message, 'error');
        }
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* DELETION ACTIONS                                                        */
    /* ─────────────────────────────────────────────────────────────────────── */
    #handleDeleteTrip(tripId) {
        if (this.#trips.length <= 1) {
            this.#showToast('You must have at least one trip in the system.', 'warning');
            return;
        }
        const toDelete = this.#trips.find(t => t.id === tripId);
        if (!toDelete) return;
        if (confirm(`Are you sure you want to delete trip "${toDelete.name}"?`)) {
            this.#trips = this.#trips.filter(t => t.id !== tripId);
            if (this.#currentTrip && this.#currentTrip.id === tripId) this.#currentTrip = this.#trips[0];
            this.#saveState();
            this.#renderAll();
            this.#showToast(`Deleted trip "${toDelete.name}"`, 'success');
        }
    }

    #handleDeleteExpense(expenseId) {
        const trip = this.#currentTrip;
        if (!trip) return;
        const exp = trip.findExpenseById(expenseId);
        if (!exp) return;
        if (confirm(`Delete expense "${exp.title}"?`)) {
            trip.deleteExpense(expenseId);
            this.#saveState();
            this.#renderAll();
            this.#showToast(`Deleted expense "${exp.title}"`, 'success');
        }
    }

    #handleDeleteTraveler(travelerId) {
        const trip = this.#currentTrip;
        if (!trip) return;
        const traveler = trip.findTravelerById(travelerId);
        if (!traveler) return;
        if (confirm(`Remove traveler "${traveler.name}" from this trip?`)) {
            try {
                trip.removeTraveler(travelerId);
                this.#saveState();
                this.#renderAll();
                this.#showToast(`Removed traveler "${traveler.name}"`, 'success');
            } catch (err) {
                this.#showToast(err.message, 'error');
            }
        }
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* UI UTILITY HELPERS                                                      */
    /* ─────────────────────────────────────────────────────────────────────── */
    #renderCategoryBadge(cat) {
        const icons = {
            Flight: '✈️', Hotel: '🏨', Food: '🍽️',
            Transport: '🚗', Activities: '🏄', Shopping: '🛍️', Other: '📦'
        };
        const icon = icons[cat] || '🏷️';
        const catClass = `cat-${(cat || 'other').toLowerCase()}`;
        return `
            <span class="category-badge ${catClass}">
                <span class="cat-icon">${icon}</span>
                <span class="cat-label">${this.#escapeHtml(cat || 'Other')}</span>
            </span>
        `;
    }

    #showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = { success: '✅', error: '❌', warning: '⚠️' };
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span>${this.#escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(60px) scale(0.9)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    #escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    /* ─────────────────────────────────────────────────────────────────────── */
    /* STARFIELD & CONSTELLATION MAP ENGINE (STAR PARTY AESTHETIC)             */
    /* ─────────────────────────────────────────────────────────────────────── */
    #initStarfieldCanvas() {
        const canvas = document.getElementById('starfieldCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Generate stars
        const starCount = Math.floor(Math.max((width * height) / 11000, 75));
        const stars = [];
        const namedStars = [
            { name: 'Vega', xRel: 0.18, yRel: 0.19, color: '#FFFFFF', size: 3.2 },
            { name: 'Arcturus', xRel: 0.52, yRel: 0.16, color: '#FED7AA', size: 3.4 },
            { name: 'Spica', xRel: 0.58, yRel: 0.38, color: '#BAE6FD', size: 2.8 },
            { name: 'Sun', xRel: 0.63, yRel: 0.35, color: '#FDE047', size: 4.5, glow: true },
            { name: 'Venus', xRel: 0.54, yRel: 0.42, color: '#FEF08A', size: 3.0 },
            { name: 'Mercury', xRel: 0.56, yRel: 0.38, color: '#E2E8F0', size: 2.2 },
            { name: 'Antares', xRel: 0.46, yRel: 0.49, color: '#FCA5A5', size: 3.5 },
            { name: 'Shaula', xRel: 0.43, yRel: 0.55, color: '#E0E7FF', size: 2.5 },
            { name: 'Jupiter', xRel: 0.88, yRel: 0.42, color: '#FCA5A5', size: 3.8 }
        ];

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                baseRadius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.7 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleDir: Math.random() > 0.5 ? 1 : -1
            });
        }

        let mouseX = -1000;
        let mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Deep space background
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, width, height);

            // Background twinkling stars and constellation links
            for (let i = 0; i < stars.length; i++) {
                const s1 = stars[i];
                s1.alpha += s1.twinkleSpeed * s1.twinkleDir;
                if (s1.alpha > 0.85) { s1.alpha = 0.85; s1.twinkleDir = -1; }
                if (s1.alpha < 0.15) { s1.alpha = 0.15; s1.twinkleDir = 1; }

                s1.x += s1.vx;
                s1.y += s1.vy;
                if (s1.x < 0) s1.x = width;
                if (s1.x > width) s1.x = 0;
                if (s1.y < 0) s1.y = height;
                if (s1.y > height) s1.y = 0;

                ctx.beginPath();
                ctx.arc(s1.x, s1.y, s1.baseRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${s1.alpha})`;
                ctx.fill();

                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const dx = s1.x - s2.x;
                    const dy = s1.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 85) {
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(s2.x, s2.y);
                        const lineAlpha = (1 - dist / 85) * 0.12;
                        ctx.strokeStyle = `rgba(200, 220, 255, ${lineAlpha})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            // Draw named anchor stars & geometric constellation lines
            namedStars.forEach((star, idx) => {
                const px = star.xRel * width;
                const py = star.yRel * height;

                ctx.beginPath();
                ctx.arc(px, py, star.size * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = (star.color === '#FDE047') ? 'rgba(253, 224, 71, 0.25)' : 'rgba(255, 255, 255, 0.12)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(px, py, star.size, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();

                ctx.font = '500 10px "JetBrains Mono", monospace';
                ctx.fillStyle = 'rgba(240, 240, 255, 0.85)';
                ctx.fillText(star.name, px + star.size + 6, py + 3);

                if (idx > 0 && idx < 5) {
                    const prev = namedStars[idx - 1];
                    ctx.beginPath();
                    ctx.moveTo(prev.xRel * width, prev.yRel * height);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                }
            });

            // Connect mouse gently to nearby stars
            if (mouseX > 0 && mouseY > 0) {
                stars.slice(0, 30).forEach(s => {
                    const dx = s.x - mouseX;
                    const dy = s.y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(s.x, s.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 100) * 0.2})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                });
            }

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* ASTRONOMICAL HUD TELEMETRY UPDATE                                       */
    /* ─────────────────────────────────────────────────────────────────────── */
    #initAstronomicalTelemetry() {
        const updateTelemetry = () => {
            const now = new Date();
            const utcHours = String(now.getUTCHours()).padStart(2, '0');
            const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
            const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');

            const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const timeEl = document.getElementById('hudDateTime');
            if (timeEl) {
                timeEl.textContent = `UTC ${utcHours}:${utcMinutes}:${utcSeconds} · ${dateStr} ${timeStr}`;
            }

            const locEl = document.getElementById('hudLocation');
            if (locEl && this.#currentTrip) {
                locEl.textContent = `${this.#currentTrip.destination.toUpperCase()} · ORBITAL TEL: 34.0872° N, 118.2704° W`;
            }
        };

        updateTelemetry();
        setInterval(updateTelemetry, 1000);
    }

    /* ─────────────────────────────────────────────────────────────────────── */
    /* WHERE CAN I GO? — BUDGET RECOMMENDATION SYSTEM                           */
    /* ─────────────────────────────────────────────────────────────────────── */
    #bindRecommendationEvents() {
        const budgetInput  = document.getElementById('recBudgetInput');
        const budgetSlider = document.getElementById('recBudgetSlider');
        const currSelect   = document.getElementById('recCurrencySelect');
        const travelSelect = document.getElementById('recTravelersCount');
        const durSelect    = document.getElementById('recDurationDays');
        const fitSelect    = document.getElementById('recFitFilter');
        const sortSelect   = document.getElementById('recSortFilter');
        const matchBtn     = document.getElementById('recMatchCurrentTripBtn');

        // Budget input changes
        budgetInput?.addEventListener('input', () => {
            const val = parseFloat(budgetInput.value) || 0;
            if (budgetSlider) budgetSlider.value = val;
            const curLabel = document.getElementById('recSliderCurrentLabel');
            const sym = CURRENCY_SYMBOLS[this.#recActiveCurrency] || '$';
            if (curLabel) curLabel.textContent = `${sym}${val.toLocaleString()}`;
            this.#renderRecommendationsView();
        });

        // Budget slider changes
        budgetSlider?.addEventListener('input', () => {
            const val = parseFloat(budgetSlider.value) || 0;
            if (budgetInput) budgetInput.value = val;
            const curLabel = document.getElementById('recSliderCurrentLabel');
            const sym = CURRENCY_SYMBOLS[this.#recActiveCurrency] || '$';
            if (curLabel) curLabel.textContent = `${sym}${val.toLocaleString()}`;
            this.#renderRecommendationsView();
        });

        // Currency change
        currSelect?.addEventListener('change', (e) => {
            this.#handleRecCurrencyChange(e.target.value);
        });

        // Travelers & duration & fit & sort
        travelSelect?.addEventListener('change', () => this.#renderRecommendationsView());
        durSelect?.addEventListener('change', () => this.#renderRecommendationsView());
        fitSelect?.addEventListener('change', () => this.#renderRecommendationsView());
        sortSelect?.addEventListener('change', () => this.#renderRecommendationsView());

        // Travel style segmented buttons
        document.querySelectorAll('#recStyleToggle .rec-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#recStyleToggle .rec-style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.#recTravelStyle = btn.dataset.style || 'moderate';

                const hintEl = document.getElementById('recStrategyHint');
                if (hintEl) {
                    if (this.#recTravelStyle === 'backpacker') hintEl.textContent = 'Hostels, local transit & street dining (Budget Saver)';
                    else if (this.#recTravelStyle === 'luxury') hintEl.textContent = '5★ luxury resorts, private tours & fine dining (Premium)';
                    else hintEl.textContent = 'Balanced 3–4★ comfort & standard flights';
                }

                this.#renderRecommendationsView();
            });
        });

        // Vibe chips
        document.querySelectorAll('#recVibeChips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#recVibeChips .chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.#recActiveVibe = chip.dataset.vibe || 'all';
                this.#renderRecommendationsView();
            });
        });

        // Region chips
        document.querySelectorAll('#recRegionChips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#recRegionChips .chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.#recActiveRegion = chip.dataset.region || 'all';
                this.#renderRecommendationsView();
            });
        });

        // Match current active trip budget button
        matchBtn?.addEventListener('click', () => {
            this.#matchCurrentTripInRecommendations();
        });

        // Details modal "Plan Trip Here" button
        document.getElementById('recDetailsPlanBtn')?.addEventListener('click', () => {
            this.#closeModal('recommendationDetailsModal');
            if (this.#recSelectedResult) {
                this.#openPlanModalForRecommendation(this.#recSelectedResult);
            }
        });

        // Populate initial presets
        this.#updateRecPresets();
    }

    #matchCurrentTripInRecommendations() {
        if (!this.#currentTrip) {
            this.#showToast('Create a trip first to match its budget!', 'warning');
            return;
        }

        const rate = FX_RATES_TO_USD[this.#recActiveCurrency] || 1;
        const tripBudget = Math.round(this.#currentTrip.totalBudget * rate);

        const input = document.getElementById('recBudgetInput');
        const slider = document.getElementById('recBudgetSlider');
        if (input) input.value = tripBudget;
        if (slider) {
            if (tripBudget > parseFloat(slider.max)) slider.max = tripBudget * 1.5;
            slider.value = tripBudget;
        }

        const travelSelect = document.getElementById('recTravelersCount');
        if (travelSelect) {
            const count = this.#currentTrip.travelers.length;
            if (count >= 1 && count <= 6) travelSelect.value = String(count);
        }

        const sym = CURRENCY_SYMBOLS[this.#recActiveCurrency] || '$';
        const curLabel = document.getElementById('recSliderCurrentLabel');
        if (curLabel) curLabel.textContent = `${sym}${tripBudget.toLocaleString()}`;

        this.#renderRecommendationsView();
        this.#showToast(`Matched budget of "${this.#currentTrip.name}" (${sym}${tripBudget.toLocaleString()})`, 'info');
    }

    #handleRecCurrencyChange(newCurrency) {
        const oldCurrency = this.#recActiveCurrency;
        const oldRate = FX_RATES_TO_USD[oldCurrency] || 1;
        const newRate = FX_RATES_TO_USD[newCurrency] || 1;
        const sym = CURRENCY_SYMBOLS[newCurrency] || newCurrency;

        this.#recActiveCurrency = newCurrency;

        const symLabel = document.getElementById('recCurrencySymbolLabel');
        if (symLabel) symLabel.textContent = sym;

        // Convert current budget value to new currency
        const input = document.getElementById('recBudgetInput');
        const slider = document.getElementById('recBudgetSlider');
        const currentVal = parseFloat(input?.value) || 1500;
        const valUSD = currentVal / oldRate;
        const converted = Math.round(valUSD * newRate);

        // Adjust slider scale
        let minBound = 100;
        let maxBound = 6000;
        let step = 50;

        if (newCurrency === 'INR') {
            minBound = 10000;
            maxBound = 500000;
            step = 1000;
        } else if (newCurrency === 'JPY') {
            minBound = 15000;
            maxBound = 800000;
            step = 2000;
        } else if (newCurrency === 'THB') {
            minBound = 3500;
            maxBound = 200000;
            step = 500;
        } else if (newCurrency === 'AED') {
            minBound = 400;
            maxBound = 22000;
            step = 100;
        } else {
            minBound = Math.round(100 * newRate);
            maxBound = Math.round(6000 * newRate);
        }

        if (input) input.value = converted;
        if (slider) {
            slider.min = minBound;
            slider.max = maxBound;
            slider.step = step;
            slider.value = converted;
        }

        const minLbl = document.getElementById('recSliderMinLabel');
        const maxLbl = document.getElementById('recSliderMaxLabel');
        const curLbl = document.getElementById('recSliderCurrentLabel');
        if (minLbl) minLbl.textContent = `${sym}${minBound.toLocaleString()}`;
        if (maxLbl) maxLbl.textContent = `${sym}${maxBound.toLocaleString()}+`;
        if (curLbl) curLbl.textContent = `${sym}${converted.toLocaleString()}`;

        this.#updateRecPresets();
        this.#renderRecommendationsView();
    }

    #updateRecPresets() {
        const container = document.getElementById('recPresetsContainer');
        if (!container) return;

        const curr = this.#recActiveCurrency;
        const sym = CURRENCY_SYMBOLS[curr] || '$';

        let presetValues = [];
        if (curr === 'INR') {
            presetValues = [25000, 50000, 100000, 200000, 350000];
        } else if (curr === 'JPY') {
            presetValues = [75000, 150000, 300000, 500000, 750000];
        } else if (curr === 'THB') {
            presetValues = [15000, 35000, 70000, 120000, 180000];
        } else if (curr === 'AED') {
            presetValues = [1800, 3500, 7500, 12000, 18000];
        } else {
            presetValues = [500, 1000, 2000, 3500, 5000];
        }

        const input = document.getElementById('recBudgetInput');
        const currentVal = parseFloat(input?.value) || 0;

        container.innerHTML = presetValues.map(val => `
            <button type="button" class="rec-preset-btn ${Math.abs(currentVal - val) < (val * 0.05) ? 'active' : ''}" data-value="${val}">
                ${sym}${val.toLocaleString()}
            </button>
        `).join('');

        container.querySelectorAll('.rec-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseFloat(btn.dataset.value);
                if (input) input.value = val;
                const slider = document.getElementById('recBudgetSlider');
                if (slider) slider.value = val;
                const curLabel = document.getElementById('recSliderCurrentLabel');
                if (curLabel) curLabel.textContent = `${sym}${val.toLocaleString()}`;

                container.querySelectorAll('.rec-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.#renderRecommendationsView();
            });
        });
    }

    #renderRecommendationsView() {
        if (!this.#recEngine) return;

        const budgetInput  = document.getElementById('recBudgetInput');
        const travelSelect = document.getElementById('recTravelersCount');
        const durSelect    = document.getElementById('recDurationDays');
        const fitSelect    = document.getElementById('recFitFilter');
        const sortSelect   = document.getElementById('recSortFilter');
        const grid         = document.getElementById('recommendationsGrid');

        const budget    = parseFloat(budgetInput?.value) || 1500;
        const travelers = parseInt(travelSelect?.value, 10) || 2;
        const days      = parseInt(durSelect?.value, 10) || 5;
        const fitFilter = fitSelect?.value || 'all';
        const sortFilter = sortSelect?.value || 'match';

        const currency = this.#recActiveCurrency;
        const fxRate   = FX_RATES_TO_USD[currency] || 1;
        const sym      = CURRENCY_SYMBOLS[currency] || '$';

        const recommendations = this.#recEngine.getRecommendations({
            budget,
            travelers,
            days,
            travelStyle: this.#recTravelStyle,
            vibe: this.#recActiveVibe,
            region: this.#recActiveRegion,
            fitFilter,
            fxRate,
            currencySymbol: sym
        });

        // Apply sorting
        if (sortFilter === 'cost_asc') {
            recommendations.sort((a, b) => a.displayTotal - b.displayTotal);
        } else if (sortFilter === 'cost_desc') {
            recommendations.sort((a, b) => b.displayTotal - a.displayTotal);
        } else if (sortFilter === 'rating') {
            recommendations.sort((a, b) => b.destination.rating - a.destination.rating);
        }

        // Update telemetry status box
        const withinCount = recommendations.filter(r => r.fitStatus === 'within_budget' || r.fitStatus === 'budget_saver').length;
        const saverCount  = recommendations.filter(r => r.fitStatus === 'budget_saver').length;
        const stretchCount = recommendations.filter(r => r.fitStatus === 'stretch').length;

        const telemetryEl = document.getElementById('recTelemetryText');
        if (telemetryEl) {
            telemetryEl.textContent = `Found ${recommendations.length} matched destination(s) for ${sym}${budget.toLocaleString()} (${travelers} travelers · ${days} days · ${this.#recTravelStyle.toUpperCase()}) — ${withinCount} within budget, ${saverCount} savers, ${stretchCount} stretch.`;
        }

        // Update header count and active criteria
        const countEl = document.getElementById('recResultsCount');
        if (countEl) {
            countEl.textContent = `SHOWING ${recommendations.length} RECOMMENDATION${recommendations.length === 1 ? '' : 'S'}`;
        }

        const tagsEl = document.getElementById('recCriteriaTags');
        if (tagsEl) {
            tagsEl.innerHTML = `
                <span class="rec-criteria-tag">💰 ${sym}${budget.toLocaleString()}</span>
                <span class="rec-criteria-tag">👥 ${travelers} Traveler${travelers > 1 ? 's' : ''}</span>
                <span class="rec-criteria-tag">⏱️ ${days} Days</span>
                <span class="rec-criteria-tag">✨ ${this.#recTravelStyle}</span>
                ${this.#recActiveVibe !== 'all' ? `<span class="rec-criteria-tag">🌴 ${this.#recActiveVibe}</span>` : ''}
                ${this.#recActiveRegion !== 'all' ? `<span class="rec-criteria-tag">🗺️ ${this.#recActiveRegion}</span>` : ''}
            `;
        }

        // Render Cards
        if (!grid) return;

        if (recommendations.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--radius-lg);">
                    <div style="font-size:44px;margin-bottom:12px;">🧭</div>
                    <h3 style="font-size:18px;color:#FFFFFF;margin-bottom:6px;">No Destinations Found</h3>
                    <p style="font-size:13px;color:var(--text-muted);max-width:480px;margin:0 auto 18px auto;">
                        No destinations matched your criteria with ${sym}${budget.toLocaleString()} budget and current filters. Try increasing your target budget, choosing "All Vibes", or switching travel style to "Backpacker".
                    </p>
                    <button type="button" class="btn btn-secondary" id="recResetFiltersBtn">Reset All Filters</button>
                </div>
            `;
            document.getElementById('recResetFiltersBtn')?.addEventListener('click', () => {
                document.getElementById('recBudgetInput').value = Math.round(2500 * fxRate);
                document.getElementById('recBudgetSlider').value = Math.round(2500 * fxRate);
                document.querySelectorAll('#recVibeChips .chip').forEach(c => c.classList.toggle('active', c.dataset.vibe === 'all'));
                document.querySelectorAll('#recRegionChips .chip').forEach(c => c.classList.toggle('active', c.dataset.region === 'all'));
                document.getElementById('recFitFilter').value = 'all';
                this.#recActiveVibe = 'all';
                this.#recActiveRegion = 'all';
                this.#renderRecommendationsView();
            });
            return;
        }

        grid.innerHTML = recommendations.map(rec => {
            const dest = rec.destination;
            const costs = rec.displayCosts;
            const total = rec.displayTotal;

            // Calculate category percentages for progress bar
            const flightPct = total > 0 ? Math.max(8, Math.round((costs.flight / total) * 100)) : 25;
            const hotelPct  = total > 0 ? Math.max(8, Math.round((costs.hotel / total) * 100)) : 25;
            const foodPct   = total > 0 ? Math.max(8, Math.round((costs.food / total) * 100)) : 25;
            const actPct    = total > 0 ? Math.max(8, Math.round((costs.activities / total) * 100)) : 15;
            const bufferPct = Math.max(0, 100 - flightPct - hotelPct - foodPct - actPct);

            const deltaText = rec.displayDelta >= 0
                ? `+${sym}${rec.displayDelta.toLocaleString()} surplus`
                : `-${sym}${Math.abs(rec.displayDelta).toLocaleString()} stretch`;
            const deltaClass = rec.displayDelta >= 0 ? 'surplus' : 'stretch';

            return `
                <div class="rec-card" data-id="${dest.id}">
                    <div class="rec-card-media">
                        <img src="${dest.imageUrl}" alt="${this.#escapeHtml(dest.name)}" class="rec-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'">
                        <div class="rec-card-overlay"></div>
                        <div class="rec-card-top-badges">
                            <span class="rec-badge-match ${rec.statusClass}">
                                ${rec.matchPercentage}% Match · ${rec.statusLabel}
                            </span>
                            <span class="rec-badge-rating">
                                <span>★</span><span>${dest.rating.toFixed(1)}</span>
                            </span>
                        </div>
                        <div class="rec-card-media-title">
                            <h3 class="rec-card-name">${this.#escapeHtml(dest.name)}</h3>
                            <div class="rec-card-location">
                                <span>📍</span><span>${this.#escapeHtml(dest.country)}</span>
                                <span style="margin:0 4px;">·</span>
                                <span style="font-family:var(--font-mono);font-size:10px;background:rgba(255,255,255,0.12);padding:1px 5px;border-radius:3px;">${dest.tier}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rec-card-body">
                        <p class="rec-card-tagline">${this.#escapeHtml(dest.tagline)}</p>

                        <!-- Price Breakdown Box -->
                        <div class="rec-price-box">
                            <div class="rec-price-primary-row">
                                <div>
                                    <span class="rec-price-amount">${sym}${total.toLocaleString()}</span>
                                    <span class="rec-price-label">estimated total</span>
                                </div>
                                <span class="rec-price-delta ${deltaClass}">${deltaText}</span>
                            </div>
                            <div class="rec-price-sub-row">
                                <span>${sym}${rec.displayPerPerson.toLocaleString()} / traveler</span>
                                <span>${sym}${rec.displayDaily.toLocaleString()} / day</span>
                            </div>
                        </div>

                        <!-- Segmented Category Cost Bar -->
                        <div class="rec-category-bar-wrap">
                            <div class="rec-category-bar" title="Flight: ${sym}${costs.flight} | Hotel: ${sym}${costs.hotel} | Food: ${sym}${costs.food} | Activities: ${sym}${costs.activities}">
                                <div class="rec-cat-segment rec-cat-flight" style="width:${flightPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-hotel"  style="width:${hotelPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-food"   style="width:${foodPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-act"    style="width:${actPct}%;"></div>
                                <div class="rec-cat-segment rec-cat-buffer" style="width:${bufferPct}%;"></div>
                            </div>
                            <div class="rec-category-legend">
                                <span><span style="color:#38BDF8;">✈️</span> ${sym}${costs.flight}</span>
                                <span><span style="color:#A78BFA;">🏨</span> ${sym}${costs.hotel}</span>
                                <span><span style="color:#F472B6;">🍽️</span> ${sym}${costs.food}</span>
                                <span><span style="color:#34D399;">🎟️</span> ${sym}${costs.activities}</span>
                            </div>
                        </div>

                        <!-- Highlights List -->
                        <ul class="rec-highlights-list">
                            ${dest.highlights.slice(0, 3).map(h => `
                                <li><span class="bullet">✦</span><span>${this.#escapeHtml(h)}</span></li>
                            `).join('')}
                        </ul>

                        <!-- Vibe & Season Meta -->
                        <div class="rec-meta-row">
                            <span class="rec-meta-season">🗓️ ${this.#escapeHtml(dest.bestSeason)}</span>
                            <div class="rec-vibe-tags">
                                ${dest.vibes.slice(0, 3).map(v => `
                                    <span class="rec-vibe-tag">${this.#escapeHtml(v)}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="rec-card-footer">
                        <button type="button" class="btn btn-primary rec-plan-btn" data-id="${dest.id}">
                            <span>Plan Trip Here</span> <span>🚀</span>
                        </button>
                        <button type="button" class="btn btn-secondary btn-details rec-details-btn" data-id="${dest.id}" title="Deep dive destination intel">
                            ℹ️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind Card Buttons
        grid.querySelectorAll('.rec-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const destId = btn.dataset.id;
                const rec = recommendations.find(r => r.destination.id === destId);
                if (rec) this.#openPlanModalForRecommendation(rec);
            });
        });

        grid.querySelectorAll('.rec-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const destId = btn.dataset.id;
                const rec = recommendations.find(r => r.destination.id === destId);
                if (rec) this.#openDetailsModalForRecommendation(rec);
            });
        });
    }

    #openPlanModalForRecommendation(rec) {
        this.#recSelectedResult = rec;
        const dest = rec.destination;
        const sym = rec.currencySymbol || '$';

        document.getElementById('recPlanDestId').value = dest.id;

        // Preview card
        const preview = document.getElementById('recPlanPreviewCard');
        if (preview) {
            preview.innerHTML = `
                <img src="${dest.imageUrl}" alt="${this.#escapeHtml(dest.name)}" class="rec-plan-preview-img" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'">
                <div>
                    <div class="rec-plan-preview-name">${this.#escapeHtml(dest.name)}, ${this.#escapeHtml(dest.country)}</div>
                    <div class="rec-plan-preview-meta">
                        ★ ${dest.rating.toFixed(1)} · ${rec.costBreakdownUSD.days} Days · ${rec.costBreakdownUSD.travelers} Traveler(s) · ${rec.strategyName}
                    </div>
                    <div class="rec-plan-preview-cost">
                        Estimated Cost: ${sym}${rec.displayTotal.toLocaleString()} (${rec.statusLabel})
                    </div>
                </div>
            `;
        }

        // Prefill trip name
        document.getElementById('recPlanTripName').value = `${dest.name} Getaway`;

        // Start/End dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endDate = new Date(tomorrow);
        endDate.setDate(tomorrow.getDate() + rec.costBreakdownUSD.days);

        document.getElementById('recPlanStartDate').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('recPlanEndDate').value = endDate.toISOString().split('T')[0];

        // Budget
        document.getElementById('recPlanBudget').value = rec.displayBudget || rec.displayTotal;

        // Travelers
        if (this.#currentTrip && this.#currentTrip.travelers.length > 0) {
            document.getElementById('recPlanTravelers').value = this.#currentTrip.travelers.map(t => t.name).join(', ');
        } else {
            const count = rec.costBreakdownUSD.travelers;
            if (count === 1) document.getElementById('recPlanTravelers').value = 'You (Solo Explorer)';
            else if (count === 2) document.getElementById('recPlanTravelers').value = 'Alex, Sarah';
            else document.getElementById('recPlanTravelers').value = 'Alex, Sarah, David, Priya'.split(', ').slice(0, count).join(', ');
        }

        this.#openModal('recommendationPlanModal');
    }

    #openDetailsModalForRecommendation(rec) {
        this.#recSelectedResult = rec;
        const dest = rec.destination;
        const sym = rec.currencySymbol || '$';
        const costs = rec.displayCosts;

        document.getElementById('recDetailsModalTitle').textContent = `${dest.name}, ${dest.country}`;
        document.getElementById('recDetailsModalSubtitle').textContent = `${dest.tagline} · ${dest.tier} Tier`;

        const body = document.getElementById('recDetailsModalBody');
        if (body) {
            body.innerHTML = `
                <div style="position:relative;height:160px;border-radius:var(--radius-md);overflow:hidden;margin-bottom:16px;">
                    <img src="${dest.imageUrl}" style="width:100%;height:100%;object-fit:cover;">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.85), transparent);"></div>
                    <div style="position:absolute;bottom:10px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-end;">
                        <div>
                            <span style="font-family:var(--font-mono);font-size:11px;color:#FDE047;letter-spacing:0.08em;text-transform:uppercase;">${dest.region}</span>
                            <h3 style="font-size:20px;color:#FFFFFF;margin:0;">${this.#escapeHtml(dest.name)}</h3>
                        </div>
                        <span style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:#FFFFFF;">
                            ${sym}${rec.displayTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                <p style="font-size:13px;line-height:1.6;color:var(--text-secondary);margin-bottom:16px;">
                    ${this.#escapeHtml(dest.description)}
                </p>

                <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
                    <h4 style="font-size:12px;font-family:var(--font-mono);color:#FFFFFF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
                        ✦ Itemized Estimated Budget (${rec.costBreakdownUSD.days} Days · ${rec.costBreakdownUSD.travelers} Travelers)
                    </h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>✈️ Flight &amp; Long-dist Transit:</span>
                            <strong style="font-family:var(--font-mono);color:#38BDF8;">${sym}${costs.flight.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>🏨 Lodging (${rec.costBreakdownUSD.nights} Nts, ${rec.costBreakdownUSD.rooms} Rm):</span>
                            <strong style="font-family:var(--font-mono);color:#A78BFA;">${sym}${costs.hotel.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>🍽️ Dining &amp; Street Cuisine:</span>
                            <strong style="font-family:var(--font-mono);color:#F472B6;">${sym}${costs.food.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.08);">
                            <span>🎟️ Tours, Tickets &amp; Excursions:</span>
                            <strong style="font-family:var(--font-mono);color:#34D399;">${sym}${costs.activities.toLocaleString()}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;grid-column:1/-1;">
                            <span>🛡️ Contingency &amp; Incidentals (${Math.round(costs.contingency / rec.displayTotal * 100)}%):</span>
                            <strong style="font-family:var(--font-mono);color:#94A3B8;">${sym}${costs.contingency.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:12px;">
                    <div>
                        <strong style="display:block;margin-bottom:6px;color:#FFFFFF;">⭐ Must-Experience Sights</strong>
                        <ul style="padding-left:18px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                            ${dest.highlights.map(h => `<li>${this.#escapeHtml(h)}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <strong style="display:block;margin-bottom:6px;color:#FFFFFF;">🗓️ Travel Intel</strong>
                        <div style="color:var(--text-secondary);line-height:1.6;">
                            • <strong>Best Season:</strong> ${this.#escapeHtml(dest.bestSeason)}<br>
                            • <strong>Ideal Duration:</strong> ${dest.idealDaysMin} to ${dest.idealDaysMax} Days<br>
                            • <strong>Vibe Profile:</strong> ${dest.vibes.join(', ')}<br>
                            • <strong>Travel Strategy:</strong> ${rec.strategyName} (${rec.strategyIcon})
                        </div>
                    </div>
                </div>
            `;
        }

        this.#openModal('recommendationDetailsModal');
    }

    #handleRecPlanFormSubmit() {
        try {
            if (!this.#recSelectedResult) throw new Error('No destination selected.');

            const destId = document.getElementById('recPlanDestId').value;
            const tripName = document.getElementById('recPlanTripName').value;
            const startDate = document.getElementById('recPlanStartDate').value;
            const endDate = document.getElementById('recPlanEndDate').value;
            const budget = document.getElementById('recPlanBudget').value;
            const travelersInput = document.getElementById('recPlanTravelers').value;
            const includeExpenses = document.getElementById('recPlanIncludeExpenses').checked;

            const travelerNames = travelersInput.split(',').map(s => s.trim()).filter(Boolean);
            if (travelerNames.length === 0) travelerNames.push('Explorer');

            // Polymorphic trip generation using RecommendationEngine & ExpenseFactory
            const newTrip = this.#recEngine.createTripFromRecommendation(
                this.#recSelectedResult,
                tripName,
                travelerNames,
                includeExpenses
            );

            newTrip.setDates(startDate, endDate);
            newTrip.setTotalBudget(budget);

            this.#trips.push(newTrip);
            this.#currentTrip = newTrip;

            this.#saveState();
            this.#closeModal('recommendationPlanModal');
            this.#switchView('dashboard');
            this.#renderAll();

            this.#showToast(
                `🎉 Trip "${newTrip.name}" created with ${newTrip.expenses.length} recommended expense items!`,
                'success'
            );
        } catch (err) {
            this.#showToast(err.message, 'error');
        }
    }
}

// Robust instantiation: handles both DOMContentLoaded and already-loaded states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tripApp = new TripBudgetApp();
    });
} else {
    window.tripApp = new TripBudgetApp();
}
