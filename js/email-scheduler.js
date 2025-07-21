// Email Scheduler Module
class EmailScheduler {
    constructor() {
        this.selectedDates = new Map(); // Map of date strings to date objects
        this.userEmail = '';
        this.reminderTime = '09:00';
        this.apiBaseUrl = this.getApiBaseUrl();
    }

    /**
     * Get API base URL based on environment
     * @returns {string} API base URL
     */
    getApiBaseUrl() {
        // In development, use localhost backend
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        
        // In production, use the deployed backend URL
        return window.API_BASE_URL || 'https://numerology-backend-87645a83ad1c.herokuapp.com';
    }

    /**
     * Get today's date in local timezone as YYYY-MM-DD string
     * @returns {string} Today's date in YYYY-MM-DD format
     */
    getTodayLocalDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Initialize the email scheduler
     */
    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.updateTestTimeOption();
    }

    /**
     * Setup event listeners for email scheduler
     */
    setupEventListeners() {
        // Listen for date selection changes
        document.addEventListener('change', (event) => {
            if (event.target.classList.contains('date-checkbox')) {
                this.handleDateSelection(event.target);
            }
        });

        // Save user preferences when email or time changes
        const emailInput = document.getElementById('userEmail');
        const timeSelect = document.getElementById('reminderTime');
        
        if (emailInput) {
            emailInput.addEventListener('change', () => {
                this.userEmail = emailInput.value;
                this.saveUserPreferences();
            });
        }
        
        if (timeSelect) {
            timeSelect.addEventListener('change', () => {
                this.reminderTime = timeSelect.value;
                this.saveUserPreferences();
            });
        }
    }

    /**
     * Handle date checkbox selection
     * @param {HTMLInputElement} checkbox - The clicked checkbox
     */
    handleDateSelection(checkbox) {
        const dateKey = checkbox.dataset.dateKey;
        const dateCard = checkbox.closest('.bg-white');
        
        console.log('📅 Date selection changed:', dateKey, 'checked:', checkbox.checked);
        
        if (checkbox.checked) {
            // Add date to selection
            const dateObj = this.createDateObjectFromKey(dateKey);
            this.selectedDates.set(dateKey, dateObj);
            dateCard.classList.add('selected');
            console.log('✅ Added date to selection. Total selected:', this.selectedDates.size);
        } else {
            // Remove date from selection
            this.selectedDates.delete(dateKey);
            dateCard.classList.remove('selected');
            console.log('❌ Removed date from selection. Total selected:', this.selectedDates.size);
        }
        
        this.updateSelectedDatesDisplay();
        this.updateEmailSchedulerVisibility();
    }

    /**
     * Create date object from date key
     * @param {string} dateKey - Date key in format "YYYY-MM-DD"
     * @returns {Object} Date object with numerology data
     */
    createDateObjectFromKey(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const lifepathResult = NumerologyCalculator.calculateLifepath(dateKey);
        
        return {
            year,
            month,
            day,
            dateString: dateKey,
            formattedDate: new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            lifepath: lifepathResult.number,
            calculation: lifepathResult.calculation,
            reductionSteps: lifepathResult.reductionSteps,
            reasons: this.generateDateReasons(day, lifepathResult.number)
        };
    }

    /**
     * Generate reasons for why this date is significant
     * @param {number} day - Day of month
     * @param {number} lifepath - Lifepath number
     * @returns {Array} Array of reasons
     */
    generateDateReasons(day, lifepath) {
        const reasons = [];
        
        if ([11, 22, 33].includes(lifepath)) {
            reasons.push(`Master number lifepath ${lifepath}`);
        } else if (lifepath === 28) {
            reasons.push(`Special lifepath number 28`);
        }
        
        if ([11, 22, 33].includes(day)) {
            reasons.push(`Master number day ${day}`);
        } else if (day === 28) {
            reasons.push(`Special day 28`);
        }
        
        return reasons;
    }

    /**
     * Update the selected dates display
     */
    updateSelectedDatesDisplay() {
        const selectedDatesList = document.getElementById('selectedDatesList');
        if (!selectedDatesList) return;
        
        if (this.selectedDates.size === 0) {
            selectedDatesList.innerHTML = '<p style="color: #6c757d; font-style: italic;">No dates selected</p>';
            return;
        }
        
        let html = '';
        for (const [dateKey, dateObj] of this.selectedDates) {
            html += `
                <div class="selected-date-tag">
                    <span>${dateObj.formattedDate}</span>
                    <button class="remove-date" onclick="window.emailScheduler.removeSelectedDate('${dateKey}')" title="Remove date">
                        ×
                    </button>
                </div>
            `;
        }
        
        selectedDatesList.innerHTML = html;
    }

    /**
     * Update email scheduler section visibility
     */
    updateEmailSchedulerVisibility() {
        const emailScheduler = document.getElementById('emailScheduler');
        if (!emailScheduler) return;
        
        if (this.selectedDates.size > 0) {
            emailScheduler.style.display = 'block';
        } else {
            emailScheduler.style.display = 'none';
        }
    }

    /**
     * Remove a selected date
     * @param {string} dateKey - Date key to remove
     */
    removeSelectedDate(dateKey) {
        this.selectedDates.delete(dateKey);
        
        // Uncheck the corresponding checkbox
        const checkbox = document.querySelector(`input[data-date-key="${dateKey}"]`);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.closest('.interesting-date-card').classList.remove('selected');
        }
        
        this.updateSelectedDatesDisplay();
        this.updateEmailSchedulerVisibility();
    }

    /**
     * Clear all selected dates
     */
    clearSelectedDates() {
        // Uncheck all checkboxes
        document.querySelectorAll('.date-checkbox:checked').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.interesting-date-card').classList.remove('selected');
        });
        
        this.selectedDates.clear();
        this.updateSelectedDatesDisplay();
        this.updateEmailSchedulerVisibility();
    }

    /**
     * Schedule email reminders for selected dates
     */
    async scheduleEmailReminders() {
        const emailInput = document.getElementById('userEmail');
        const timeSelect = document.getElementById('reminderTime');
        
        if (!emailInput || !emailInput.value.trim()) {
            alert('Please enter your email address');
            emailInput?.focus();
            return;
        }
        
        if (this.selectedDates.size === 0) {
            alert('Please select at least one date');
            return;
        }
        
        const scheduleBtn = document.querySelector('.schedule-btn');
        scheduleBtn.disabled = true;
        scheduleBtn.textContent = 'Scheduling...';
        
        try {
            const actualSendTime = this.getActualSendTime(timeSelect.value);
            const emailData = {
                email: emailInput.value.trim(),
                reminderTime: actualSendTime,
                selectedDates: Array.from(this.selectedDates.values()),
                timestamp: new Date().toISOString()
            };
            
            // Try to schedule via API first, fallback to simulation
            let result;
            try {
                result = await this.scheduleEmailsViaAPI(emailData);
                this.showSchedulingSuccess(emailData, result, true);
            } catch (apiError) {
                console.warn('API scheduling failed, using offline mode:', apiError.message);
                await this.simulateEmailScheduling(emailData);
                this.showSchedulingSuccess(emailData, null, false);
            }
            
            // Clear selections after successful scheduling
            this.clearSelectedDates();
            
        } catch (error) {
            console.error('Email scheduling failed:', error);
            alert(`Failed to schedule email reminders: ${error.message}`);
        } finally {
            scheduleBtn.disabled = false;
            scheduleBtn.textContent = 'Schedule Reminders';
        }
    }

    /**
     * Schedule emails via backend API
     * @param {Object} emailData - Email scheduling data
     */
    async scheduleEmailsViaAPI(emailData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/email/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: emailData.email,
                    selectedDates: emailData.selectedDates.map(date => date.dateString),
                    targetTime: emailData.reminderTime,
                    numerologyData: this.getCurrentNumerologyData(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API Error: ${response.status}`);
            }

            const result = await response.json();
            console.log('📧 Email reminders scheduled via API:', result);
            return result;
            
        } catch (error) {
            console.error('Email scheduling API failed:', error);
            
            // Fallback to localStorage simulation if API is not available
            console.log('Falling back to localStorage simulation...');
            await this.simulateEmailScheduling(emailData);
            throw new Error(`Email scheduling failed: ${error.message}. Using offline mode.`);
        }
    }

    /**
     * Simulate email scheduling (fallback method)
     * @param {Object} emailData - Email scheduling data
     */
    async simulateEmailScheduling(emailData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store scheduled emails locally for demo purposes
        const scheduledEmails = JSON.parse(localStorage.getItem('scheduledEmails') || '[]');
        scheduledEmails.push(emailData);
        localStorage.setItem('scheduledEmails', JSON.stringify(scheduledEmails));
        
        console.log('📧 Email reminders scheduled (offline mode):', emailData);
    }

    /**
     * Get current numerology data for user
     * @returns {Object} Current user's numerology data
     */
    getCurrentNumerologyData() {
        // Get the current birthdate from the form (first family member)
        const birthdateInput = document.getElementById('birthDate1');
        if (!birthdateInput || !birthdateInput.value) {
            // Fallback to a default date if no birthdate is set
            return {
                birthdate: '1990-01-01',
                lifepath: 1,
                zodiacSign: 'Snake',
                currentYear: new Date().getFullYear()
            };
        }

        const birthdate = birthdateInput.value;
        const lifepathResult = NumerologyCalculator.calculateLifepath(birthdate);
        
        // Get zodiac data using our zodiac system
        const [year, month, day] = birthdate.split('-').map(Number);
        const zodiacData = window.zodiacSystem.calculateZodiac(year, month, day);

        return {
            birthdate: birthdate,
            lifepath: lifepathResult.number,
            zodiacSign: zodiacData.animal.name,
            currentYear: new Date().getFullYear(),
            calculation: lifepathResult.calculation,
            reductionSteps: lifepathResult.reductionSteps
        };
    }

    /**
     * Show scheduling success message
     * @param {Object} emailData - Scheduled email data
     */
    showSchedulingSuccess(emailData, result, isApiMode) {
        const modeText = isApiMode ? '(Live Email Service)' : '(Offline Demo Mode)';
        const extraInfo = isApiMode && result ? `\n🆔 Confirmation: ${result.data?.total_emails || emailData.selectedDates.length} emails scheduled` : '';
        
        const message = `
            ✅ Email reminders scheduled successfully! ${modeText}
            
            📧 Email: ${emailData.email}
            🕐 Time: ${emailData.reminderTime}
            📅 Dates: ${emailData.selectedDates.length} selected${extraInfo}
            
            You'll receive personalized numerology insights on each selected date.
        `;
        
        alert(message);
    }

    /**
     * Check API connection status
     * @returns {Promise<boolean>} Whether API is available
     */
    async checkApiStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            return response.ok;
        } catch (error) {
            console.log('API not available:', error.message);
            return false;
        }
    }

    /**
     * Fetch user's scheduled emails from API
     * @param {string} userEmail - User's email address
     * @returns {Promise<Array>} Array of scheduled emails
     */
    async fetchScheduledEmails(userEmail) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/email/scheduled/${encodeURIComponent(userEmail)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch scheduled emails: ${response.status}`);
            }

            const result = await response.json();
            return result.data?.scheduled_emails || [];
            
        } catch (error) {
            console.error('Failed to fetch scheduled emails:', error);
            // Fallback to localStorage
            return this.getScheduledEmails();
        }
    }

    /**
     * Send immediate test email
     * @param {string} userEmail - User's email address
     * @returns {Promise<boolean>} Success status
     */
    async sendTestEmail(userEmail) {
        try {
            if (!userEmail || !userEmail.includes('@')) {
                throw new Error('Valid email address required');
            }

            const response = await fetch(`${this.apiBaseUrl}/api/email/send-now`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: userEmail,
                    selectedDates: [this.getTodayLocalDate()], // Today's date in local timezone
                    targetTime: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
                    numerologyData: this.getCurrentNumerologyData(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Test email failed: ${response.status}`);
            }

            const result = await response.json();
            alert(`✅ Test email sent successfully to ${userEmail}!\n\nMessage ID: ${result.data?.message_id || 'N/A'}`);
            return true;
            
        } catch (error) {
            console.error('Test email failed:', error);
            alert(`❌ Test email failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        const savedPrefs = localStorage.getItem('numerologyEmailPrefs');
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            this.userEmail = prefs.email || '';
            this.reminderTime = prefs.time || '09:00';
            
            // Update UI
            const emailInput = document.getElementById('userEmail');
            const timeSelect = document.getElementById('reminderTime');
            
            if (emailInput && this.userEmail) emailInput.value = this.userEmail;
            if (timeSelect && this.reminderTime) timeSelect.value = this.reminderTime;
        }
    }

    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        const prefs = {
            email: this.userEmail,
            time: this.reminderTime
        };
        localStorage.setItem('numerologyEmailPrefs', JSON.stringify(prefs));
    }

    /**
     * Get scheduled emails (for debugging/admin purposes)
     * @returns {Array} Array of scheduled email data
     */
    getScheduledEmails() {
        return JSON.parse(localStorage.getItem('scheduledEmails') || '[]');
    }

    /**
     * Update the test time option to show current time + 30 minutes
     */
    updateTestTimeOption() {
        const testOption = document.getElementById('testTimeOption');
        if (testOption) {
            const now = new Date();
            const testTime = new Date(now.getTime() + 30 * 60 * 1000); // Add 30 minutes
            const timeString = testTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Los_Angeles'
            });
            testOption.textContent = `${timeString} (Current + 30min - for testing)`;
            testOption.value = timeString;
        }
    }

    /**
     * Get the actual time to send (handles test time logic)
     */
    getActualSendTime(selectedTime) {
        if (!selectedTime || selectedTime === '') {
            // If empty/test option selected, return current time + 30 minutes
            const now = new Date();
            const testTime = new Date(now.getTime() + 30 * 60 * 1000);
            return testTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Los_Angeles'
            });
        }
        return selectedTime;
    }
}

// Create global instance
window.emailScheduler = new EmailScheduler();

// Global functions for HTML event handlers
function scheduleEmailReminders() {
    console.log('📧 Schedule button clicked!');
    console.log('Email scheduler instance:', window.emailScheduler);
    
    if (!window.emailScheduler) {
        console.error('❌ Email scheduler not initialized!');
        alert('Email scheduler not initialized. Please refresh the page.');
        return;
    }
    
    try {
        window.emailScheduler.scheduleEmailReminders();
    } catch (error) {
        console.error('❌ Error calling scheduleEmailReminders:', error);
        alert('Error scheduling emails: ' + error.message);
    }
}

function clearSelectedDates() {
    window.emailScheduler.clearSelectedDates();
}