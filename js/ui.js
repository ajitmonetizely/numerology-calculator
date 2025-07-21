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
        
        newMember.className = 'family-member bg-white rounded-xl shadow-lg p-6 border border-gray-100';
        newMember.innerHTML = `
            <div class="member-header flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold text-gray-800">Family Member ${this.familyMemberCount}</h3>
                <button type="button" class="remove-member bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200" onclick="window.uiManager.removeFamilyMember(${this.familyMemberCount})">Remove</button>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
                <div class="input-group">
                    <label for="name${this.familyMemberCount}" class="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                    <input type="text" id="name${this.familyMemberCount}" placeholder="Enter name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                </div>
                <div class="input-group">
                    <label for="birthDate${this.familyMemberCount}" class="block text-sm font-medium text-gray-700 mb-2">Birth Date:</label>
                    <input type="date" id="birthDate${this.familyMemberCount}" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                </div>
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
        
        if (results.length === 1) {
            // Single person - use original detailed layout
            html = this.generatePersonHTML(results[0]);
        } else {
            // Multiple people - use new compact layout
            html = this.generateFamilyCompactHTML(results);
        }
        
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
            <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">${person.name}</h3>
                
                <div class="grid lg:grid-cols-2 gap-8">
                    <!-- Left Column -->
                    <div class="space-y-6">
                        <!-- Chinese Zodiac -->
                        <div class="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-6 border border-amber-200">
                            <h4 class="text-lg font-semibold text-amber-800 mb-3">Chinese Zodiac</h4>
                            <div class="text-2xl font-bold text-amber-700 mb-2">${person.chineseZodiac.fullName}</div>
                            <div class="text-amber-600">Year of the ${person.chineseZodiac.animal.name} (${person.chineseZodiac.year})</div>
                        </div>
                        
                        <!-- Current Year Status -->
                        <div class="rounded-lg p-6 border ${person.isCurrentYearEnemy ? 'bg-red-50 border-red-200' : person.isCurrentYearFriendly ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}">
                            <h4 class="text-lg font-semibold mb-3 ${person.isCurrentYearEnemy ? 'text-red-800' : person.isCurrentYearFriendly ? 'text-green-800' : 'text-blue-800'}">
                                Current Year ${person.currentYearZodiac.year} - ${person.isCurrentYearEnemy ? 'Enemy Year ⚠️' : person.isCurrentYearFriendly ? 'Friendly Year 💚' : 'Neutral Year ✅'}
                            </h4>
                            <div class="text-2xl font-bold mb-2 ${person.isCurrentYearEnemy ? 'text-red-700' : person.isCurrentYearFriendly ? 'text-green-700' : 'text-blue-700'}">${person.currentYearZodiac.animal.emoji} ${person.currentYearZodiac.animal.name}</div>
                            <div class="text-sm ${person.isCurrentYearEnemy ? 'text-red-600' : person.isCurrentYearFriendly ? 'text-green-600' : 'text-blue-600'}">
                                ${person.isCurrentYearEnemy ?
                                    `${person.currentYearZodiac.animal.name} is the natural enemy of ${person.chineseZodiac.animal.name}` :
                                    person.isCurrentYearFriendly ?
                                    `${person.currentYearZodiac.animal.name} is a close friend of ${person.chineseZodiac.animal.name}` :
                                    `${person.currentYearZodiac.animal.name} is neutral with ${person.chineseZodiac.animal.name}`}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column -->
                    <div class="space-y-6">
                        <!-- Lifepath Number -->
                        <div class="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg p-6 border border-purple-200">
                            <h4 class="text-lg font-semibold text-purple-800 mb-3">Lifepath Number</h4>
                            <div class="bg-white rounded p-3 mb-3 text-sm font-mono text-gray-700">
                                Birth Date: ${person.lifepath.birthDate}<br>
                                Calculation: ${person.lifepath.calculation.join(' + ')} = ${person.lifepath.total}<br>
                                ${person.lifepath.reductionSteps.join('<br>')}
                            </div>
                            <div class="text-4xl font-bold text-center text-purple-700 bg-white rounded-lg py-4">${person.lifepath.number}</div>
                        </div>
                        
                        <!-- Personal Year Number -->
                        <div class="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-lg p-6 border border-teal-200">
                            <h4 class="text-lg font-semibold text-teal-800 mb-3">Personal Year Number (${person.personalYear.currentYear})</h4>
                            <div class="bg-white rounded p-3 mb-3 text-sm font-mono text-gray-700">
                                Birth Month/Day + Current Year: ${person.personalYear.currentYear}<br>
                                Calculation: ${person.personalYear.calculation.join(' + ')} = ${person.personalYear.total}<br>
                                ${person.personalYear.reductionSteps.join('<br>')}
                            </div>
                            <div class="text-4xl font-bold text-center text-teal-700 bg-white rounded-lg py-4">${person.personalYear.number}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Timeline Section -->
                <div class="mt-8">
                    <h4 class="text-xl font-semibold text-gray-800 mb-6 text-center">Chinese Zodiac Years Timeline</h4>
                    <div class="grid lg:grid-cols-2 gap-6">
                        <div class="space-y-3">
                            <h5 class="font-semibold text-gray-700 mb-4">Previous 10 Years (${timelineStartYear}-${currentYear-1})</h5>
                            ${person.chineseYears.prior.map(yearData => `
                                <div class="p-3 rounded-lg border ${yearData.isEnemy ? 'bg-red-50 border-red-200' : yearData.isFriendly ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}">
                                    <div class="font-semibold ${yearData.isEnemy ? 'text-red-700' : yearData.isFriendly ? 'text-green-700' : 'text-gray-700'}">${yearData.zodiac.emoji} ${yearData.year} - ${yearData.zodiac.name} ${yearData.isEnemy ? '⚠️' : yearData.isFriendly ? '💚' : ''}</div>
                                    <div class="text-sm text-gray-600">${yearData.startDate} to ${yearData.endDate}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="space-y-3">
                            <h5 class="font-semibold text-gray-700 mb-4">Next 10 Years (${currentYear+1}-${timelineEndYear})</h5>
                            ${person.chineseYears.future.map(yearData => `
                                <div class="p-3 rounded-lg border ${yearData.isEnemy ? 'bg-red-50 border-red-200' : yearData.isFriendly ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}">
                                    <div class="font-semibold ${yearData.isEnemy ? 'text-red-700' : yearData.isFriendly ? 'text-green-700' : 'text-gray-700'}">${yearData.zodiac.emoji} ${yearData.year} - ${yearData.zodiac.name} ${yearData.isEnemy ? '⚠️' : yearData.isFriendly ? '💚' : ''}</div>
                                    <div class="text-sm text-gray-600">${yearData.startDate} to ${yearData.endDate}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate compact HTML for multiple family members with unified timeline
     * @param {Array} results - Array of family member results
     * @returns {string} HTML string
     */
    generateFamilyCompactHTML(results) {
        const currentYear = APP_CONFIG.numerology.currentYear;
        const timelineStartYear = currentYear - APP_CONFIG.zodiac.timelineYears;
        const timelineEndYear = currentYear + APP_CONFIG.zodiac.timelineYears;
        
        // Generate compact individual cards
        const individualCards = results.map(person => this.generateCompactPersonCard(person)).join('');
        
        // Generate unified family timeline
        const familyTimeline = this.generateUnifiedTimeline(results, currentYear);
        
        return `
            <div class="space-y-8">
                <!-- Compact Individual Cards -->
                <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    ${individualCards}
                </div>
                
                <!-- Unified Family Timeline -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Family Chinese Zodiac Timeline</h3>
                    <div class="text-sm text-gray-600 mb-6 text-center">
                        Overall family compatibility for each year - showing combined status and which members drive it
                    </div>
                    ${familyTimeline}
                </div>
            </div>
        `;
    }

    /**
     * Generate a compact card for a single person
     * @param {Object} person - Person's numerology data
     * @returns {string} HTML string
     */
    generateCompactPersonCard(person) {
        return `
            <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <h4 class="font-bold text-gray-800 mb-3 text-center">${person.name}</h4>
                
                <!-- Lifepath -->
                <div class="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                    <div class="text-xs font-medium text-purple-600 mb-1">Lifepath</div>
                    <div class="text-2xl font-bold text-purple-700 text-center">${person.lifepath.number}</div>
                </div>
                
                <!-- Personal Year -->
                <div class="bg-teal-50 rounded-lg p-3 mb-3 border border-teal-200">
                    <div class="text-xs font-medium text-teal-600 mb-1">Personal Year ${person.personalYear.currentYear}</div>
                    <div class="text-2xl font-bold text-teal-700 text-center">${person.personalYear.number}</div>
                </div>
                
                <!-- Chinese Zodiac -->
                <div class="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
                    <div class="text-xs font-medium text-amber-600 mb-1">Chinese Zodiac</div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-amber-700">${person.chineseZodiac.animal.emoji}</div>
                        <div class="text-xs font-semibold text-amber-600">${person.chineseZodiac.animal.name}</div>
                    </div>
                </div>
                
                <!-- Current Year Status -->
                <div class="rounded-lg p-3 border text-center ${person.isCurrentYearEnemy ? 'bg-red-50 border-red-200' : person.isCurrentYearFriendly ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}">
                    <div class="text-xs font-medium mb-1 ${person.isCurrentYearEnemy ? 'text-red-600' : person.isCurrentYearFriendly ? 'text-green-600' : 'text-blue-600'}">
                        ${person.currentYearZodiac.year} Status
                    </div>
                    <div class="text-sm font-bold ${person.isCurrentYearEnemy ? 'text-red-700' : person.isCurrentYearFriendly ? 'text-green-700' : 'text-blue-700'}">
                        ${person.isCurrentYearEnemy ? '⚠️ Enemy' : person.isCurrentYearFriendly ? '💚 Friendly' : '✅ Neutral'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate unified timeline showing family compatibility by year
     * @param {Array} results - Array of family member results
     * @param {number} currentYear - Current year
     * @returns {string} HTML string
     */
    generateUnifiedTimeline(results, currentYear) {
        const timelineYears = APP_CONFIG.zodiac.timelineYears;
        const allYears = [];
        
        // Generate year range
        for (let year = currentYear - timelineYears; year <= currentYear + timelineYears; year++) {
            const yearData = this.calculateFamilyYearCompatibility(results, year);
            allYears.push(yearData);
        }
        
        // Split into past, current, and future
        const pastYears = allYears.filter(year => year.year < currentYear);
        const currentYearData = allYears.find(year => year.year === currentYear);
        const futureYears = allYears.filter(year => year.year > currentYear);
        
        return `
            <div class="grid lg:grid-cols-3 gap-6">
                <!-- Past Years -->
                <div class="space-y-2">
                    <h5 class="font-semibold text-gray-700 mb-4 text-center">Past Years (${currentYear - timelineYears}-${currentYear - 1})</h5>
                    ${pastYears.map(yearData => this.generateTimelineYearCard(yearData)).join('')}
                </div>
                
                <!-- Current Year -->
                <div class="space-y-2">
                    <h5 class="font-semibold text-gray-700 mb-4 text-center">Current Year</h5>
                    ${this.generateTimelineYearCard(currentYearData, true)}
                </div>
                
                <!-- Future Years -->
                <div class="space-y-2">
                    <h5 class="font-semibold text-gray-700 mb-4 text-center">Future Years (${currentYear + 1}-${currentYear + timelineYears})</h5>
                    ${futureYears.map(yearData => this.generateTimelineYearCard(yearData)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Calculate family compatibility for a specific year
     * @param {Array} results - Array of family member results
     * @param {number} year - Year to calculate compatibility for
     * @returns {Object} Year compatibility data
     */
    calculateFamilyYearCompatibility(results, year) {
        const yearZodiacKey = window.zodiacSystem.getZodiacAnimalKey(year);
        const yearZodiac = window.zodiacSystem.getZodiacDataForYear(year);
        
        const memberStatuses = results.map(person => {
            const isEnemy = window.zodiacSystem.isEnemyYear(person.chineseZodiac.animalKey, yearZodiacKey);
            const isFriendly = window.zodiacSystem.isFriendlyYear(person.chineseZodiac.animalKey, yearZodiacKey);
            
            return {
                name: person.name,
                isEnemy: isEnemy,
                isFriendly: isFriendly,
                status: isEnemy ? 'enemy' : isFriendly ? 'friendly' : 'neutral'
            };
        });
        
        // Determine overall family status (priority: enemy > neutral > friendly)
        const hasEnemies = memberStatuses.some(m => m.isEnemy);
        const hasFriendly = memberStatuses.some(m => m.isFriendly);
        const hasNeutral = memberStatuses.some(m => !m.isEnemy && !m.isFriendly);
        
        let overallStatus = 'neutral';
        let statusIcon = '✅';
        let statusColor = 'blue';
        
        if (hasEnemies) {
            overallStatus = 'enemy';
            statusIcon = '⚠️';
            statusColor = 'red';
        } else if (hasNeutral) {
            overallStatus = 'neutral';
            statusIcon = '✅';
            statusColor = 'blue';
        } else if (hasFriendly) {
            overallStatus = 'friendly';
            statusIcon = '💚';
            statusColor = 'green';
        }
        
        return {
            year: year,
            zodiac: yearZodiac,
            overallStatus: overallStatus,
            statusIcon: statusIcon,
            statusColor: statusColor,
            memberStatuses: memberStatuses,
            enemyMembers: memberStatuses.filter(m => m.isEnemy),
            friendlyMembers: memberStatuses.filter(m => m.isFriendly),
            neutralMembers: memberStatuses.filter(m => !m.isEnemy && !m.isFriendly)
        };
    }

    /**
     * Generate HTML for a single year in the timeline
     * @param {Object} yearData - Year compatibility data
     * @param {boolean} isCurrentYear - Whether this is the current year
     * @returns {string} HTML string
     */
    generateTimelineYearCard(yearData, isCurrentYear = false) {
        const { year, zodiac, overallStatus, statusIcon, statusColor, memberStatuses, enemyMembers, friendlyMembers, neutralMembers } = yearData;
        
        const borderClass = `border-${statusColor}-200`;
        const bgClass = `bg-${statusColor}-50`;
        const textClass = `text-${statusColor}-700`;
        const currentYearBorder = isCurrentYear ? 'ring-2 ring-primary ring-offset-1' : '';
        
        // Create attribution text
        const attributions = [];
        if (enemyMembers.length > 0) {
            attributions.push(`Enemy: ${enemyMembers.map(m => m.name).join(', ')}`);
        }
        if (friendlyMembers.length > 0) {
            attributions.push(`Friendly: ${friendlyMembers.map(m => m.name).join(', ')}`);
        }
        if (neutralMembers.length > 0) {
            attributions.push(`Neutral: ${neutralMembers.map(m => m.name).join(', ')}`);
        }
        
        return `
            <div class="p-3 rounded-lg border ${bgClass} ${borderClass} ${currentYearBorder}">
                <div class="flex items-center justify-between mb-2">
                    <div class="font-semibold ${textClass}">${zodiac.emoji} ${year}</div>
                    <div class="text-lg">${statusIcon}</div>
                </div>
                <div class="text-sm font-medium ${textClass} mb-1">${zodiac.name}</div>
                <div class="text-xs text-gray-600 space-y-1">
                    ${attributions.map(attr => `<div>${attr}</div>`).join('')}
                </div>
                ${isCurrentYear ? '<div class="mt-2 text-xs font-bold text-primary">← Current Year</div>' : ''}
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
            interestingDatesDiv.innerHTML = '<p class="text-center text-gray-500 italic py-8">No dates match the selected filters.</p>';
            return;
        }
        
        let html = '<div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">';
        
        datesToRender.forEach(date => {
            const monthName = new Date(date.year, date.month - 1, date.day).toLocaleDateString('en-US', { month: 'long' });
            const dateKey = `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
            const isMasterNumber = [11, 22, 33].includes(date.lifepath);
            const isSpecialNumber = date.lifepath === 28;
            
            html += `
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer hover:border-primary">
                    <div class="flex items-start gap-3">
                        <input type="checkbox" class="date-checkbox mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2" data-date-key="${dateKey}" id="date-${dateKey}">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-800 mb-2">${monthName} ${date.day}, ${date.year}</h4>
                            <div class="text-sm text-gray-600 mb-3">${date.reasons.join(', ')}</div>
                            <div class="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 mb-2">
                                ${date.calculation.join(' + ')} = ${date.total}
                                ${date.reductionSteps.length > 0 ? '<br>' + date.reductionSteps.join('<br>') : ''}
                            </div>
                            <div class="flex items-center justify-center">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    isMasterNumber ? 'bg-purple-100 text-purple-800' :
                                    isSpecialNumber ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }">
                                    Lifepath: ${date.lifepath}
                                </span>
                            </div>
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
        // Use local date instead of UTC to match the display
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`; // Local date in YYYY-MM-DD format
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
                    testEmailForm.classList.remove('opacity-0', 'max-h-0');
                    testEmailForm.classList.add('opacity-100', 'max-h-96');
                    // Load saved email if available
                    const testUserEmail = document.getElementById('testUserEmail');
                    if (testUserEmail && window.emailScheduler) {
                        testUserEmail.value = window.emailScheduler.userEmail || '';
                    }
                } else {
                    testEmailForm.classList.remove('opacity-100', 'max-h-96');
                    testEmailForm.classList.add('opacity-0', 'max-h-0');
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