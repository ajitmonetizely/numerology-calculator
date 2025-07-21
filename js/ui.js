// UI Management Module
class UIManager {
    constructor() {
        this.familyMemberCount = 1;
        this.allResults = [];
    }

    /**
     * Initialize UI event handlers and setup
     */
    init() {
        this.updateRemoveButtons();
        this.setupEventListeners();
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Add event listener for Enter key on input fields
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && (e.target.type === 'date' || e.target.type === 'text')) {
                calculateAllNumerology();
            }
        });

        // Add event listener for escape key to clear filters
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Escape') {
                clearDateFilters();
            }
        });
    }

    /**
     * Add a new family member input section
     */
    addFamilyMember() {
        if (this.familyMemberCount >= APP_CONFIG.app.maxFamilyMembers) {
            alert(`Maximum ${APP_CONFIG.app.maxFamilyMembers} family members allowed`);
            return;
        }
        
        this.familyMemberCount++;
        const familyInputs = document.getElementById('familyInputs');
        
        const newMember = document.createElement('div');
        newMember.className = 'family-member';
        newMember.setAttribute('data-member', this.familyMemberCount);
        
        newMember.innerHTML = `
            <div class="member-header">
                <h3>Family Member ${this.familyMemberCount}</h3>
                <button type="button" class="remove-member" onclick="window.uiManager.removeFamilyMember(${this.familyMemberCount})">Remove</button>
            </div>
            <div class="input-group">
                <label for="name${this.familyMemberCount}">Name:</label>
                <input type="text" id="name${this.familyMemberCount}" placeholder="Enter name">
            </div>
            <div class="input-group">
                <label for="birthDate${this.familyMemberCount}">Birth Date:</label>
                <input type="date" id="birthDate${this.familyMemberCount}" required>
            </div>
        `;
        
        familyInputs.appendChild(newMember);
        this.updateAddButtonState();
        this.updateRemoveButtons();

        // Focus on the new name input
        document.getElementById(`name${this.familyMemberCount}`).focus();
    }

    /**
     * Remove a family member by number
     * @param {number} memberNumber - Member number to remove
     */
    removeFamilyMember(memberNumber) {
        const member = document.querySelector(`[data-member="${memberNumber}"]`);
        if (member) {
            member.remove();
            this.familyMemberCount--;
            this.renumberFamilyMembers();
            this.updateAddButtonState();
            this.updateRemoveButtons();
        }
    }

    /**
     * Renumber family members after removal
     */
    renumberFamilyMembers() {
        const members = document.querySelectorAll('.family-member');
        this.familyMemberCount = members.length;
        
        members.forEach((member, index) => {
            const memberNumber = index + 1;
            member.setAttribute('data-member', memberNumber);
            member.querySelector('h3').textContent = `Family Member ${memberNumber}`;
            member.querySelector('.remove-member').setAttribute('onclick', `window.uiManager.removeFamilyMember(${memberNumber})`);
            
            const nameInput = member.querySelector('input[type="text"]');
            const dateInput = member.querySelector('input[type="date"]');
            
            nameInput.id = `name${memberNumber}`;
            nameInput.previousElementSibling.setAttribute('for', `name${memberNumber}`);
            
            dateInput.id = `birthDate${memberNumber}`;
            dateInput.previousElementSibling.setAttribute('for', `birthDate${memberNumber}`);
        });
    }

    /**
     * Update the add member button state
     */
    updateAddButtonState() {
        const addButton = document.querySelector('.add-member-btn');
        const isMaxReached = this.familyMemberCount >= APP_CONFIG.app.maxFamilyMembers;
        
        addButton.disabled = isMaxReached;
        addButton.textContent = isMaxReached 
            ? `Maximum ${APP_CONFIG.app.maxFamilyMembers} Members` 
            : '+ Add Family Member';
    }

    /**
     * Update visibility of remove buttons
     */
    updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-member');
        removeButtons.forEach(button => {
            button.style.display = this.familyMemberCount > 1 ? 'block' : 'none';
        });
    }

    /**
     * Calculate numerology for all family members
     */
    async calculateAllNumerology() {
        try {
            // Ensure zodiac system is initialized
            if (!window.zodiacSystem.initialized) {
                await window.zodiacSystem.init();
            }

            const members = document.querySelectorAll('.family-member');
            const allResults = [];
            
            for (let member of members) {
                const memberNumber = member.getAttribute('data-member');
                const name = document.getElementById(`name${memberNumber}`).value || `Family Member ${memberNumber}`;
                const birthDate = document.getElementById(`birthDate${memberNumber}`).value;
                
                if (!birthDate) {
                    alert(`Please enter birth date for ${name}`);
                    return;
                }
                
                const result = await this.calculatePersonNumerology(birthDate, name);
                allResults.push(result);
            }
            
            this.allResults = allResults;
            this.displayFamilyResults(allResults);
            
        } catch (error) {
            console.error('Error calculating numerology:', error);
            alert('An error occurred while calculating. Please try again.');
        }
    }

    /**
     * Calculate complete numerology data for one person
     * @param {string} birthDate - Birth date in YYYY-MM-DD format
     * @param {string} name - Person's name
     * @returns {Promise<Object>} Complete numerology data
     */
    async calculatePersonNumerology(birthDate, name) {
        const currentYear = APP_CONFIG.numerology.currentYear;
        
        // Calculate lifepath
        const lifepath = NumerologyCalculator.calculateLifepath(birthDate);
        
        // Calculate personal year
        const personalYear = NumerologyCalculator.calculatePersonalYear(birthDate, currentYear);
        
        // Calculate Chinese zodiac
        const dateParts = birthDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        
        const chineseZodiac = window.zodiacSystem.calculateZodiac(year, month, day);
        
        // Get current year zodiac and compatibility
        const currentYearZodiac = window.zodiacSystem.getCurrentYearZodiac();
        const isCurrentYearEnemy = window.zodiacSystem.isEnemyYear(chineseZodiac.animalKey, currentYearZodiac.animalKey);
        const isCurrentYearFriendly = window.zodiacSystem.isFriendlyYear(chineseZodiac.animalKey, currentYearZodiac.animalKey);
        
        // Generate timeline data
        const timelineYears = APP_CONFIG.zodiac.timelineYears;
        const priorYears = window.zodiacSystem.getChineseNewYearTimeline(currentYear, timelineYears, 'prior');
        const futureYears = window.zodiacSystem.getChineseNewYearTimeline(currentYear, timelineYears, 'future');
        
        // Add compatibility info to timeline years
        priorYears.forEach(yearData => {
            yearData.isEnemy = window.zodiacSystem.isEnemyYear(chineseZodiac.animalKey, window.zodiacSystem.getZodiacAnimalKey(yearData.year));
            yearData.isFriendly = window.zodiacSystem.isFriendlyYear(chineseZodiac.animalKey, window.zodiacSystem.getZodiacAnimalKey(yearData.year));
        });
        
        futureYears.forEach(yearData => {
            yearData.isEnemy = window.zodiacSystem.isEnemyYear(chineseZodiac.animalKey, window.zodiacSystem.getZodiacAnimalKey(yearData.year));
            yearData.isFriendly = window.zodiacSystem.isFriendlyYear(chineseZodiac.animalKey, window.zodiacSystem.getZodiacAnimalKey(yearData.year));
        });

        return {
            name: name,
            lifepath: lifepath,
            personalYear: personalYear,
            chineseZodiac: chineseZodiac,
            currentYearZodiac: currentYearZodiac,
            isCurrentYearEnemy: isCurrentYearEnemy,
            isCurrentYearFriendly: isCurrentYearFriendly,
            chineseYears: {
                prior: priorYears,
                future: futureYears
            }
        };
    }

    /**
     * Display family results in the UI
     * @param {Array} results - Array of family member results
     */
    displayFamilyResults(results) {
        const resultsDiv = document.getElementById('results');
        const familyResultsDiv = document.getElementById('familyResults');
        
        let html = '';
        
        results.forEach((person, index) => {
            html += this.generatePersonHTML(person);
        });
        
        familyResultsDiv.innerHTML = html;
        
        // Display interesting dates
        this.displayInterestingDates();
        
        // Display test email section
        this.displayTestEmailSection();
        
        resultsDiv.classList.remove('hidden');
        
        // Scroll to result with smooth animation
        setTimeout(() => {
            resultsDiv.scrollIntoView({ 
                behavior: APP_CONFIG.ui.scrollBehavior,
                block: 'start'
            });
        }, 100);
    }

    /**
     * Generate HTML for a single person's results
     * @param {Object} person - Person's numerology data
     * @returns {string} HTML string
     */
    generatePersonHTML(person) {
        const currentYear = APP_CONFIG.numerology.currentYear;
        const timelineStartYear = currentYear - APP_CONFIG.zodiac.timelineYears;
        const timelineEndYear = currentYear + APP_CONFIG.zodiac.timelineYears;
        
        return `
            <div class="family-member-result">
                <h3>${person.name}</h3>
                
                <div class="zodiac-section">
                    <h4>Chinese Zodiac</h4>
                    <div class="zodiac-display">${person.chineseZodiac.fullName}</div>
                    <div class="zodiac-year">Year of the ${person.chineseZodiac.animal.name} (${person.chineseZodiac.year})</div>
                </div>
                
                <div class="current-year-section ${person.isCurrentYearEnemy ? 'enemy-current-year' : ''}">
                    <h4>Current Year ${person.currentYearZodiac.year} - ${person.isCurrentYearEnemy ? 'Enemy Year ⚠️' : person.isCurrentYearFriendly ? 'Friendly Year 💚' : 'Neutral Year ✅'}</h4>
                    <div class="current-year-display ${person.isCurrentYearEnemy ? 'enemy-current-year' : ''}">${person.currentYearZodiac.animal.emoji} ${person.currentYearZodiac.animal.name}</div>
                    <div class="current-year-status">
                        <span class="${person.isCurrentYearEnemy ? 'enemy-status' : 'friendly-status'}">
                            ${person.isCurrentYearEnemy ? 
                                `${person.currentYearZodiac.animal.name} is the natural enemy of ${person.chineseZodiac.animal.name}` : 
                                person.isCurrentYearFriendly ?
                                `${person.currentYearZodiac.animal.name} is a close friend of ${person.chineseZodiac.animal.name}` :
                                `${person.currentYearZodiac.animal.name} is neutral with ${person.chineseZodiac.animal.name}`}
                        </span>
                    </div>
                </div>
                
                <div class="zodiac-years-section">
                    <h4>Chinese Zodiac Years Timeline</h4>
                    <div class="zodiac-years-grid">
                        <div class="zodiac-years-column">
                            <h5>Previous 10 Years (${timelineStartYear}-${currentYear-1})</h5>
                            ${person.chineseYears.prior.map(yearData => `
                                <div class="zodiac-year-item ${yearData.isEnemy ? 'enemy-year' : yearData.isFriendly ? 'friendly-year' : ''}">
                                    <div class="year">${yearData.zodiac.emoji} ${yearData.year} - ${yearData.zodiac.name} ${yearData.isEnemy ? '⚠️' : yearData.isFriendly ? '💚' : ''}</div>
                                    <div class="dates">${yearData.startDate} to ${yearData.endDate}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="zodiac-years-column">
                            <h5>Next 10 Years (${currentYear+1}-${timelineEndYear})</h5>
                            ${person.chineseYears.future.map(yearData => `
                                <div class="zodiac-year-item ${yearData.isEnemy ? 'enemy-year' : yearData.isFriendly ? 'friendly-year' : ''}">
                                    <div class="year">${yearData.zodiac.emoji} ${yearData.year} - ${yearData.zodiac.name} ${yearData.isEnemy ? '⚠️' : yearData.isFriendly ? '💚' : ''}</div>
                                    <div class="dates">${yearData.startDate} to ${yearData.endDate}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="number-section">
                    <h4>Lifepath Number</h4>
                    <div class="calculation-steps">Birth Date: ${person.lifepath.birthDate}
Calculation: ${person.lifepath.calculation.join(' + ')} = ${person.lifepath.total}
${person.lifepath.reductionSteps.join('\n')}</div>
                    <div class="lifepath-number">${person.lifepath.number}</div>
                </div>
                
                <div class="number-section">
                    <h4>Personal Year Number (${person.personalYear.currentYear})</h4>
                    <div class="calculation-steps">Birth Month/Day + Current Year: ${person.personalYear.currentYear}
Calculation: ${person.personalYear.calculation.join(' + ')} = ${person.personalYear.total}
${person.personalYear.reductionSteps.join('\n')}</div>
                    <div class="lifepath-number">${person.personalYear.number}</div>
                </div>
            </div>
        `;
    }

    /**
     * Display interesting dates section
     */
    displayInterestingDates() {
        const currentYear = APP_CONFIG.numerology.currentYear;
        
        document.getElementById('interestingYear').textContent = currentYear;
        
        // Initialize filter system with empty dates and populate options
        window.dateFilters.setInterestingDates([]);
        
        // Ensure DOM elements exist before populating options
        setTimeout(() => {
            window.dateFilters.updateFilterOptions();
            
            // Start with no dates showing - user must select filters
            window.dateFilters.clearFilters();
            this.renderInterestingDates([]);
        }, 100);
    }

    /**
     * Render interesting dates to the DOM
     * @param {Array} datesToRender - Dates to display
     */
    renderInterestingDates(datesToRender) {
        const interestingDatesDiv = document.getElementById('interestingDatesResults');
        
        if (datesToRender.length === 0) {
            interestingDatesDiv.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No dates match the selected filters.</p>';
            return;
        }
        
        let html = '<div class="interesting-dates-grid">';
        
        datesToRender.forEach(date => {
            const monthName = new Date(date.year, date.month - 1, date.day).toLocaleDateString('en-US', { month: 'long' });
            const dateKey = `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
            
            html += `
                <div class="interesting-date-card">
                    <input type="checkbox" class="date-checkbox" data-date-key="${dateKey}" id="date-${dateKey}">
                    <div class="date-content">
                        <h4>${monthName} ${date.day}, ${date.year}</h4>
                        <div class="interesting-date-reason">${date.reasons.join(', ')}</div>
                        <div class="interesting-date-calc">
                            ${date.calculation.join(' + ')} = ${date.total}
                            ${date.reductionSteps.length > 0 ? '\n' + date.reductionSteps.join('\n') : ''}
                            <br><strong>Lifepath: ${date.lifepath}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        interestingDatesDiv.innerHTML = html;
    }

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #667eea;">
                <div style="font-size: 2em; margin-bottom: 10px;">🔮</div>
                <div>${message}</div>
            </div>
        `;
        
        const container = document.querySelector('.container');
        container.appendChild(loadingDiv);
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingDiv = document.getElementById('loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * Display test email section with today's date
     */
    displayTestEmailSection() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        const lifepathResult = NumerologyCalculator.calculateLifepath(todayString);
        
        // Update the date display
        const testDateValue = document.getElementById('testDateValue');
        const testDateReason = document.getElementById('testDateReason');
        const testDateCalc = document.getElementById('testDateCalc');
        
        if (testDateValue) {
            testDateValue.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (testDateReason) {
            const reasons = this.generateTestEmailReasons(today.getDate(), lifepathResult.number);
            testDateReason.textContent = reasons.join(', ');
        }
        
        if (testDateCalc) {
            testDateCalc.innerHTML = `
                ${lifepathResult.calculation.join(' + ')} = ${lifepathResult.total}
                ${lifepathResult.reductionSteps.length > 0 ? '<br>' + lifepathResult.reductionSteps.join('<br>') : ''}
                <br><strong>Lifepath: ${lifepathResult.number}</strong>
            `;
        }

        // Set up the checkbox event handler
        const testCheckbox = document.getElementById('testEmailCheckbox');
        const testEmailForm = document.getElementById('testEmailForm');
        
        if (testCheckbox && testEmailForm) {
            testCheckbox.addEventListener('change', () => {
                if (testCheckbox.checked) {
                    testEmailForm.classList.add('visible');
                    // Load saved email if available
                    const testUserEmail = document.getElementById('testUserEmail');
                    if (testUserEmail && window.emailScheduler) {
                        testUserEmail.value = window.emailScheduler.userEmail || '';
                    }
                } else {
                    testEmailForm.classList.remove('visible');
                }
            });
        }
    }

    /**
     * Generate reasons for test email date significance
     * @param {number} day - Day of month
     * @param {number} lifepath - Lifepath number
     * @returns {Array} Array of reasons
     */
    generateTestEmailReasons(day, lifepath) {
        const reasons = [];
        
        if ([11, 22, 33].includes(lifepath)) {
            reasons.push(`Master number lifepath ${lifepath}`);
        } else if (lifepath === 28) {
            reasons.push(`Special lifepath number 28`);
        } else {
            reasons.push(`Lifepath number ${lifepath}`);
        }
        
        if ([11, 22, 33].includes(day)) {
            reasons.push(`Master number day ${day}`);
        } else if (day === 28) {
            reasons.push(`Special day 28`);
        } else {
            reasons.push(`Day ${day} of month`);
        }
        
        reasons.push('Perfect for testing email delivery');
        
        return reasons;
    }
}

// Create global UI manager instance
window.uiManager = new UIManager();

// Global functions for HTML event handlers
function addFamilyMember() {
    window.uiManager.addFamilyMember();
}

function removeFamilyMember(memberNumber) {
    window.uiManager.removeFamilyMember(memberNumber);
}

function calculateAllNumerology() {
    window.uiManager.calculateAllNumerology();
}

// Global functions for test email functionality
function sendTestEmail() {
    const testUserEmail = document.getElementById('testUserEmail');
    const testEmailBtn = document.getElementById('testEmailBtn');
    
    if (!testUserEmail || !testUserEmail.value.trim()) {
        alert('Please enter your email address');
        testUserEmail?.focus();
        return;
    }
    
    if (!testUserEmail.value.includes('@')) {
        alert('Please enter a valid email address');
        testUserEmail.focus();
        return;
    }
    
    // Disable button while sending
    testEmailBtn.disabled = true;
    testEmailBtn.textContent = '📧 Sending...';
    
    // Call the email scheduler's sendTestEmail method
    window.emailScheduler.sendTestEmail(testUserEmail.value.trim())
        .finally(() => {
            testEmailBtn.disabled = false;
            testEmailBtn.textContent = '📧 Send Test Email Now';
        });
}

function clearTestEmail() {
    const testCheckbox = document.getElementById('testEmailCheckbox');
    const testEmailForm = document.getElementById('testEmailForm');
    const testUserEmail = document.getElementById('testUserEmail');
    
    if (testCheckbox) testCheckbox.checked = false;
    if (testEmailForm) testEmailForm.classList.remove('visible');
    if (testUserEmail) testUserEmail.value = '';
}