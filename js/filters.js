// Date Filtering Module
class DateFilters {
    constructor() {
        this.allInterestingDates = [];
        this.filteredDates = [];
        this.currentYear = APP_CONFIG.numerology.currentYear;
    }

    /**
     * Set the complete list of interesting dates
     * @param {Array} dates - Array of interesting date objects
     */
    setInterestingDates(dates) {
        this.allInterestingDates = dates;
        this.filteredDates = []; // Start with no dates showing
    }

    /**
     * Apply filters based on current filter settings
     * @returns {Array} Filtered dates array
     */
    applyFilters() {
        const dayFilter = document.getElementById('dayFilter')?.value;
        const lifepathFilter = document.getElementById('lifepathFilter')?.value;
        
        // Only generate dates if at least one filter is selected
        if (!dayFilter && !lifepathFilter) {
            this.filteredDates = [];
            this.updateFilterStatus('Please select a day or lifepath number to see dates');
            return [];
        }
        
        // Generate dates based on selected filters
        this.filteredDates = this.generateFilteredDates(dayFilter, lifepathFilter);
        this.updateFilterStatus('');
        return this.filteredDates;
    }

    /**
     * Generate dates based on filter criteria
     * @param {string} dayFilter - Selected day (1-31 or empty)
     * @param {string} lifepathFilter - Selected lifepath (1-33 or empty)
     * @returns {Array} Generated dates matching criteria
     */
    generateFilteredDates(dayFilter, lifepathFilter) {
        const dates = [];
        const year = this.currentYear;
        const filterDay = dayFilter ? parseInt(dayFilter) : null;
        const filterLifepath = lifepathFilter ? parseInt(lifepathFilter) : null;
        
        // Iterate through all months
        for (let month = 1; month <= 12; month++) {
            const daysInMonth = new Date(year, month, 0).getDate();
            
            // Iterate through days in month
            for (let day = 1; day <= daysInMonth; day++) {
                // Skip if day filter is set and doesn't match
                if (filterDay && day !== filterDay) continue;
                
                // Calculate lifepath for this date
                const lifepathResult = NumerologyCalculator.calculateLifepath(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                
                // Skip if lifepath filter is set and doesn't match
                if (filterLifepath && lifepathResult.number !== filterLifepath) continue;
                
                // Add matching date
                dates.push({
                    year: year,
                    month: month,
                    day: day,
                    lifepath: lifepathResult.number,
                    total: lifepathResult.total,
                    calculation: lifepathResult.calculation,
                    reductionSteps: lifepathResult.reductionSteps,
                    reasons: this.generateReasons(day, lifepathResult.number)
                });
            }
        }
        
        return dates;
    }

    /**
     * Generate reasons why this date is interesting
     * @param {number} day - Day of month
     * @param {number} lifepath - Lifepath number
     * @returns {Array} Array of reason strings
     */
    generateReasons(day, lifepath) {
        const reasons = [];
        
        // Lifepath reasons
        if ([11, 22, 33].includes(lifepath)) {
            reasons.push(`Master number lifepath ${lifepath}`);
        } else if (lifepath === 28) {
            reasons.push(`Special lifepath number 28`);
        } else {
            reasons.push(`Lifepath number ${lifepath}`);
        }
        
        // Day reasons
        if ([11, 22, 33].includes(day)) {
            reasons.push(`Master number day ${day}`);
        } else if (day === 28) {
            reasons.push(`Special day 28`);
        } else {
            reasons.push(`Day ${day} of month`);
        }
        
        return reasons;
    }

    /**
     * Update filter status message
     * @param {string} message - Status message to display
     */
    updateFilterStatus(message) {
        const statusDiv = document.getElementById('dateFilterStatus');
        if (statusDiv) {
            if (message) {
                statusDiv.innerHTML = `<p class="filter-message">${message}</p>`;
                statusDiv.style.display = 'block';
            } else {
                statusDiv.style.display = 'none';
            }
        }
    }

    /**
     * Clear all filters and return to showing no dates
     * @returns {Array} Empty array (no dates until filters selected)
     */
    clearFilters() {
        const dayFilter = document.getElementById('dayFilter');
        const lifepathFilter = document.getElementById('lifepathFilter');
        
        if (dayFilter) dayFilter.value = '';
        if (lifepathFilter) lifepathFilter.value = '';
        
        this.filteredDates = [];
        this.updateFilterStatus('Select a day or lifepath number to explore dates');
        return this.filteredDates;
    }

    /**
     * Get currently filtered dates
     * @returns {Array} Currently filtered dates
     */
    getFilteredDates() {
        return this.filteredDates;
    }

    /**
     * Get count of filtered vs total dates
     * @returns {Object} Object with filtered and total counts
     */
    getFilterStats() {
        return {
            filtered: this.filteredDates.length,
            total: this.allInterestingDates.length,
            hasFilters: this.filteredDates.length < this.allInterestingDates.length
        };
    }

    /**
     * Generate filter options based on available data
     * @returns {Object} Object with day and lifepath options
     */
    generateFilterOptions() {
        const dayOptions = new Set();
        const lifepathOptions = new Set();
        
        this.allInterestingDates.forEach(date => {
            dayOptions.add(date.day);
            lifepathOptions.add(date.lifepath);
        });
        
        return {
            days: Array.from(dayOptions).sort((a, b) => a - b),
            lifepaths: Array.from(lifepathOptions).sort((a, b) => a - b)
        };
    }

    /**
     * Update filter dropdowns with dynamic options
     */
    updateFilterOptions() {
        try {
            this.populateDayOptions();
            this.populateLifepathOptions();
            console.log('✅ Date filter options populated successfully');
        } catch (error) {
            console.error('❌ Error populating filter options:', error);
        }
    }

    /**
     * Populate day filter with all possible day numbers (1-31)
     */
    populateDayOptions() {
        const dayFilter = document.getElementById('dayFilter');
        if (!dayFilter) return;
        
        const currentValue = dayFilter.value;
        
        // Clear existing options except the default "-- Select Day --"
        while (dayFilter.children.length > 1) {
            dayFilter.removeChild(dayFilter.lastChild);
        }
        
        // Add all possible day numbers (1-31)
        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = `${day}${this.getDayOrdinal(day)}`;
            
            // Add special notation for master numbers
            if ([11, 22, 33].includes(day)) {
                option.textContent += ` (Master Number)`;
            } else if (day === 28) {
                option.textContent += ` (Special Number)`;
            }
            
            dayFilter.appendChild(option);
        }
        
        // Restore previous selection if still valid
        if (currentValue && parseInt(currentValue) >= 1 && parseInt(currentValue) <= 31) {
            dayFilter.value = currentValue;
        }
    }

    /**
     * Populate lifepath filter with all possible lifepath numbers (1-33)
     */
    populateLifepathOptions() {
        const lifepathFilter = document.getElementById('lifepathFilter');
        if (!lifepathFilter) return;
        
        const currentValue = lifepathFilter.value;
        
        // Clear existing options except the default "-- Select Lifepath --"
        while (lifepathFilter.children.length > 1) {
            lifepathFilter.removeChild(lifepathFilter.lastChild);
        }
        
        // Add standard numbers 1-9
        for (let num = 1; num <= 9; num++) {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `Lifepath ${num}`;
            lifepathFilter.appendChild(option);
        }
        
        // Add master numbers
        [11, 22, 33].forEach(num => {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `Lifepath ${num} (Master Number)`;
            lifepathFilter.appendChild(option);
        });
        
        // Add special number 28
        const option28 = document.createElement('option');
        option28.value = 28;
        option28.textContent = `Lifepath 28 (Special Number)`;
        lifepathFilter.appendChild(option28);
        
        // Restore previous selection if still valid
        if (currentValue) {
            lifepathFilter.value = currentValue;
        }
    }

    /**
     * Get ordinal suffix for day numbers
     * @param {number} day - Day number
     * @returns {string} Ordinal suffix
     */
    getDayOrdinal(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    /**
     * Search dates by text query
     * @param {string} query - Search query
     * @returns {Array} Matching dates
     */
    searchDates(query) {
        if (!query || query.trim() === '') {
            return this.filteredDates;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.filteredDates.filter(date => {
            // Search in reasons
            const reasonsMatch = date.reasons.some(reason => 
                reason.toLowerCase().includes(searchTerm)
            );
            
            // Search in month name
            const monthName = new Date(date.year, date.month - 1, date.day)
                .toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
            const monthMatch = monthName.includes(searchTerm);
            
            // Search in lifepath number
            const lifepathMatch = date.lifepath.toString().includes(searchTerm);
            
            // Search in day number
            const dayMatch = date.day.toString().includes(searchTerm);
            
            return reasonsMatch || monthMatch || lifepathMatch || dayMatch;
        });
    }

    /**
     * Sort dates by different criteria
     * @param {Array} dates - Dates to sort
     * @param {string} sortBy - Sort criteria: 'date', 'lifepath', 'reasons'
     * @param {string} direction - Sort direction: 'asc' or 'desc'
     * @returns {Array} Sorted dates
     */
    sortDates(dates, sortBy = 'date', direction = 'asc') {
        const sortedDates = [...dates];
        
        sortedDates.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'lifepath':
                    valueA = a.lifepath;
                    valueB = b.lifepath;
                    break;
                case 'reasons':
                    valueA = a.reasons.length;
                    valueB = b.reasons.length;
                    break;
                case 'date':
                default:
                    // Sort by month, then day
                    valueA = a.month * 100 + a.day;
                    valueB = b.month * 100 + b.day;
                    break;
            }
            
            if (direction === 'desc') {
                return valueB - valueA;
            } else {
                return valueA - valueB;
            }
        });
        
        return sortedDates;
    }
}

// Global filter instance
window.dateFilters = new DateFilters();

// Global functions for HTML event handlers
function applyDateFilters() {
    const filteredDates = window.dateFilters.applyFilters();
    if (window.uiManager) {
        window.uiManager.renderInterestingDates(filteredDates);
    }
}

function clearDateFilters() {
    const allDates = window.dateFilters.clearFilters();
    if (window.uiManager) {
        window.uiManager.renderInterestingDates(allDates);
    }
}