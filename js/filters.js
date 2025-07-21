// Date Filtering Module
class DateFilters {
    constructor() {
        this.allInterestingDates = [];
        this.filteredDates = [];
    }

    /**
     * Set the complete list of interesting dates
     * @param {Array} dates - Array of interesting date objects
     */
    setInterestingDates(dates) {
        this.allInterestingDates = dates;
        this.filteredDates = [...dates]; // Copy array
    }

    /**
     * Apply filters based on current filter settings
     * @returns {Array} Filtered dates array
     */
    applyFilters() {
        const dayFilter = document.getElementById('dayFilter')?.value;
        const lifepathFilter = document.getElementById('lifepathFilter')?.value;
        
        let filtered = [...this.allInterestingDates];
        
        // Apply day filter
        if (dayFilter && dayFilter !== '') {
            const filterDay = parseInt(dayFilter);
            filtered = filtered.filter(date => date.day === filterDay);
        }
        
        // Apply lifepath filter
        if (lifepathFilter && lifepathFilter !== '') {
            const filterLifepath = parseInt(lifepathFilter);
            filtered = filtered.filter(date => date.lifepath === filterLifepath);
        }
        
        this.filteredDates = filtered;
        return filtered;
    }

    /**
     * Clear all filters and return to showing all dates
     * @returns {Array} All interesting dates
     */
    clearFilters() {
        const dayFilter = document.getElementById('dayFilter');
        const lifepathFilter = document.getElementById('lifepathFilter');
        
        if (dayFilter) dayFilter.value = '';
        if (lifepathFilter) lifepathFilter.value = '';
        
        this.filteredDates = [...this.allInterestingDates];
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
        const options = this.generateFilterOptions();
        
        // Update day filter options
        const dayFilter = document.getElementById('dayFilter');
        if (dayFilter && options.days.length > 0) {
            const currentValue = dayFilter.value;
            
            // Clear existing options except "All Days"
            while (dayFilter.children.length > 1) {
                dayFilter.removeChild(dayFilter.lastChild);
            }
            
            // Add dynamic options
            options.days.forEach(day => {
                if ([11, 22, 28].includes(day)) { // Only show the special days
                    const option = document.createElement('option');
                    option.value = day;
                    option.textContent = `${day}${this.getDayOrdinal(day)} of Month`;
                    dayFilter.appendChild(option);
                }
            });
            
            // Restore previous selection if still valid
            if (currentValue && options.days.includes(parseInt(currentValue))) {
                dayFilter.value = currentValue;
            }
        }
        
        // Update lifepath filter options
        const lifepathFilter = document.getElementById('lifepathFilter');
        if (lifepathFilter && options.lifepaths.length > 0) {
            const currentValue = lifepathFilter.value;
            
            // Clear existing options except "All Lifepaths"
            while (lifepathFilter.children.length > 1) {
                lifepathFilter.removeChild(lifepathFilter.lastChild);
            }
            
            // Add dynamic options
            options.lifepaths.forEach(lifepath => {
                const option = document.createElement('option');
                option.value = lifepath;
                option.textContent = `Lifepath ${lifepath}`;
                lifepathFilter.appendChild(option);
            });
            
            // Restore previous selection if still valid
            if (currentValue && options.lifepaths.includes(parseInt(currentValue))) {
                lifepathFilter.value = currentValue;
            }
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