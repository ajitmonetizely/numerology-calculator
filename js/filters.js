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
        const dayFilterSelect = document.getElementById('dayFilter');
        const lifepathFilterSelect = document.getElementById('lifepathFilter');
        
        // Get selected values from multi-select dropdowns
        const selectedDays = dayFilterSelect ? Array.from(dayFilterSelect.selectedOptions)
            .map(option => option.value).filter(v => v !== '') : [];
        const selectedLifepaths = lifepathFilterSelect ? Array.from(lifepathFilterSelect.selectedOptions)
            .map(option => option.value).filter(v => v !== '') : [];
        
        // Only generate dates if at least one filter is selected
        if (selectedDays.length === 0 && selectedLifepaths.length === 0) {
            this.filteredDates = [];
            this.updateFilterStatus('Please select day(s) or lifepath number(s) to see dates');
            this.updateDownloadButton(false);
            return [];
        }
        
        // Generate dates based on selected filters
        this.filteredDates = this.generateMultiFilteredDates(selectedDays, selectedLifepaths);
        this.updateFilterStatus('');
        this.updateDownloadButton(this.filteredDates.length > 0);
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
     * Generate dates based on multiple filter criteria (multi-select)
     * @param {Array} selectedDays - Array of selected day strings
     * @param {Array} selectedLifepaths - Array of selected lifepath strings
     * @returns {Array} Generated dates matching any of the criteria
     */
    generateMultiFilteredDates(selectedDays, selectedLifepaths) {
        const dates = [];
        const year = this.currentYear;
        const filterDays = selectedDays.map(d => parseInt(d));
        const filterLifepaths = selectedLifepaths.map(l => parseInt(l));
        
        // Iterate through all months
        for (let month = 1; month <= 12; month++) {
            const daysInMonth = new Date(year, month, 0).getDate();
            
            // Iterate through days in month
            for (let day = 1; day <= daysInMonth; day++) {
                // Calculate lifepath for this date
                const lifepathResult = NumerologyCalculator.calculateLifepath(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                
                // Check if date matches any of the selected criteria
                let matches = false;
                
                // Match if day is in selected days (if any selected)
                if (filterDays.length > 0 && filterDays.includes(day)) {
                    matches = true;
                }
                
                // Match if lifepath is in selected lifepaths (if any selected)
                if (filterLifepaths.length > 0 && filterLifepaths.includes(lifepathResult.number)) {
                    matches = true;
                }
                
                // If both day and lifepath filters are selected, require both to match
                if (filterDays.length > 0 && filterLifepaths.length > 0) {
                    matches = filterDays.includes(day) && filterLifepaths.includes(lifepathResult.number);
                }
                
                if (matches) {
                    // Add matching date
                    dates.push({
                        year: year,
                        month: month,
                        day: day,
                        lifepath: lifepathResult.number,
                        total: lifepathResult.total,
                        calculation: lifepathResult.calculation,
                        reductionSteps: lifepathResult.reductionSteps,
                        reasons: this.generateReasons(day, lifepathResult.number),
                        selected: false // Track selection for calendar export
                    });
                }
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
        
        // Clear multi-select dropdowns
        if (dayFilter) {
            Array.from(dayFilter.options).forEach(option => option.selected = false);
        }
        if (lifepathFilter) {
            Array.from(lifepathFilter.options).forEach(option => option.selected = false);
        }
        
        this.filteredDates = [];
        this.updateFilterStatus('Select day(s) or lifepath number(s) to explore dates');
        this.updateDownloadButton(false);
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

    /**
     * Update download button state based on selected dates
     * @param {boolean} hasValidDates - Whether there are dates available for download
     */
    updateDownloadButton(hasValidDates) {
        const downloadBtn = document.getElementById('downloadCalendarBtn');
        if (downloadBtn) {
            downloadBtn.disabled = !hasValidDates;
            downloadBtn.style.opacity = hasValidDates ? '1' : '0.5';
        }
    }

    /**
     * Get selected dates from checkboxes for calendar export
     * @returns {Array} Array of selected date objects
     */
    getSelectedDates() {
        const selectedDates = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-date-key]');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const dateStr = checkbox.getAttribute('data-date-key');
                const dateObj = this.filteredDates.find(date =>
                    `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}` === dateStr
                );
                if (dateObj) {
                    selectedDates.push(dateObj);
                }
            }
        });
        
        return selectedDates;
    }

    /**
     * Generate .ics calendar file content from selected dates
     * @param {Array} dates - Array of date objects to include in calendar
     * @returns {string} ICS file content
     */
    generateICSContent(dates) {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Numerology Calculator//Date Explorer//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        dates.forEach((date, index) => {
            const eventDate = `${date.year}${date.month.toString().padStart(2, '0')}${date.day.toString().padStart(2, '0')}`;
            const uid = `numerology-${eventDate}-${index}@numerology-calculator.com`;
            
            // Create event title with lifepath info
            const title = `Numerology: Day ${date.day}, Lifepath ${date.lifepath}${this.getMasterNumberSuffix(date.lifepath)}`;
            
            // Create description with reasons and calculation details
            const description = [
                `Numerology Date: ${this.getMonthName(date.month)} ${date.day}, ${date.year}`,
                `Lifepath Number: ${date.lifepath}${this.getMasterNumberSuffix(date.lifepath)}`,
                `Calculation: ${date.calculation}`,
                `Total: ${date.total}`,
                '',
                'Significance:',
                ...date.reasons.map(reason => `• ${reason}`),
                '',
                'Generated by Numerology Calculator - Date Explorer'
            ].join('\\n');

            icsContent.push(
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${timestamp}`,
                `DTSTART;VALUE=DATE:${eventDate}`,
                `DTEND;VALUE=DATE:${eventDate}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${description}`,
                'STATUS:CONFIRMED',
                'TRANSP:TRANSPARENT',
                'END:VEVENT'
            );
        });

        icsContent.push('END:VCALENDAR');
        return icsContent.join('\r\n');
    }

    /**
     * Get month name from month number
     * @param {number} month - Month number (1-12)
     * @returns {string} Month name
     */
    getMonthName(month) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1] || '';
    }

    /**
     * Get suffix for master numbers
     * @param {number} lifepath - Lifepath number
     * @returns {string} Suffix text
     */
    getMasterNumberSuffix(lifepath) {
        if ([11, 22, 33].includes(lifepath)) {
            return ' (Master Number)';
        } else if (lifepath === 28) {
            return ' (Special Number)';
        }
        return '';
    }

    /**
     * Download .ics calendar file with selected dates
     */
    downloadCalendar() {
        const selectedDates = this.getSelectedDates();
        
        if (selectedDates.length === 0) {
            alert('Please select at least one date by checking the boxes next to the dates you want to add to your calendar.');
            return;
        }

        try {
            const icsContent = this.generateICSContent(selectedDates);
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `numerology-dates-${this.currentYear}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`✅ Calendar downloaded with ${selectedDates.length} numerology dates`);
        } catch (error) {
            console.error('❌ Error generating calendar file:', error);
            alert('Error generating calendar file. Please try again.');
        }
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

function downloadCalendar() {
    window.dateFilters.downloadCalendar();
}