// Main Application Entry Point
class NumerologyApp {
    constructor() {
        this.initialized = false;
        this.version = APP_CONFIG.app.version;
    }

    /**
     * Initialize the entire application
     */
    async init() {
        if (this.initialized) return;

        try {
            console.log(`🔮 Initializing ${APP_CONFIG.app.name} v${this.version}`);
            
            // Show loading indicator
            window.uiManager.showLoading('Initializing numerology systems...');

            // Initialize zodiac system (loads data files)
            await window.zodiacSystem.init();
            
            // Initialize UI manager
            window.uiManager.init();
            
            // Initialize date filters
            window.dateFilters.setInterestingDates([]);
            
            // Initialize email scheduler
            window.emailScheduler.init();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Mark as initialized
            this.initialized = true;
            
            // Hide loading indicator
            window.uiManager.hideLoading();
            
            console.log('✅ Numerology application initialized successfully');
            
            // Show welcome message in console
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            window.uiManager.hideLoading();
            this.showErrorMessage('Failed to initialize the application. Please refresh the page.');
        }
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.logError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.logError('Promise Rejection', event.reason);
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`📊 Page loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        });

        // Monitor calculation performance (non-intrusive approach)
        this.wrapCalculationPerformance();
    }

    /**
     * Wrap calculation method with performance monitoring
     */
    wrapCalculationPerformance() {
        const originalMethod = window.uiManager.calculateAllNumerology.bind(window.uiManager);
        
        window.uiManager.calculateAllNumerology = async function() {
            const startTime = performance.now();
            try {
                await originalMethod();
                const endTime = performance.now();
                console.log(`⚡ Calculation completed in ${Math.round(endTime - startTime)}ms`);
            } catch (error) {
                console.error('❌ Calculation failed:', error);
                throw error;
            }
        };
    }

    /**
     * Log error for debugging
     * @param {string} type - Error type
     * @param {Error} error - Error object
     */
    logError(type, error) {
        const errorInfo = {
            type: type,
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.groupCollapsed(`🐛 ${type} Details`);
        console.table(errorInfo);
        console.groupEnd();
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        errorDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Error</div>
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 10px;
                background: none;
                border: 1px solid white;
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            ">Dismiss</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    /**
     * Show welcome message in console
     */
    showWelcomeMessage() {
        const styles = {
            title: 'color: #667eea; font-size: 24px; font-weight: bold;',
            version: 'color: #28a745; font-weight: bold;',
            description: 'color: #6c757d;',
            feature: 'color: #17a2b8;'
        };

        console.log('%c🔮 Numerology Lifepath Calculator', styles.title);
        console.log('%cVersion ' + this.version, styles.version);
        console.log('%cAdvanced numerology calculator with Chinese zodiac compatibility', styles.description);
        console.log('');
        console.log('%c✨ Features:', styles.feature);
        console.log('• Lifepath number calculations with master numbers (11, 22, 33, 28)');
        console.log('• Personal year number calculations');
        console.log('• Chinese zodiac compatibility analysis');
        console.log('• Enemy and friendly year highlighting');
        console.log('• Interesting dates filtering');
        console.log('• Multi-family member support');
        console.log('• Responsive design');
        console.log('');
        console.log('%c🚀 Ready to calculate!', 'color: #28a745; font-weight: bold;');
    }

    /**
     * Get application statistics
     * @returns {Object} App statistics
     */
    getStats() {
        return {
            version: this.version,
            initialized: this.initialized,
            familyMembers: window.uiManager?.familyMemberCount || 0,
            zodiacSystemReady: window.zodiacSystem?.initialized || false,
            interestingDatesCount: window.dateFilters?.allInterestingDates?.length || 0,
            currentYear: APP_CONFIG.numerology.currentYear,
            maxFamilyMembers: APP_CONFIG.app.maxFamilyMembers
        };
    }

    /**
     * Export results as JSON
     * @returns {Object} Exportable results data
     */
    exportResults() {
        if (!window.uiManager.allResults || window.uiManager.allResults.length === 0) {
            alert('No results to export. Please calculate numerology first.');
            return null;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            appVersion: this.version,
            results: window.uiManager.allResults,
            interestingDates: window.dateFilters.allInterestingDates,
            config: APP_CONFIG
        };

        return exportData;
    }

    /**
     * Download results as JSON file
     */
    downloadResults() {
        const data = this.exportResults();
        if (!data) return;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `numerology-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('📄 Results exported successfully');
    }

    /**
     * Show debug information
     */
    showDebugInfo() {
        const stats = this.getStats();
        console.group('🔍 Debug Information');
        console.table(stats);
        console.log('Zodiac System:', window.zodiacSystem);
        console.log('UI Manager:', window.uiManager);
        console.log('Date Filters:', window.dateFilters);
        console.log('App Config:', APP_CONFIG);
        console.groupEnd();
    }

    /**
     * Reset application to initial state
     */
    reset() {
        // Clear all family members except the first one
        while (window.uiManager.familyMemberCount > 1) {
            window.uiManager.removeFamilyMember(window.uiManager.familyMemberCount);
        }

        // Clear input values
        document.getElementById('name1').value = '';
        document.getElementById('birthDate1').value = '';

        // Hide results
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }

        // Clear filters
        window.dateFilters.clearFilters();

        // Clear results
        window.uiManager.allResults = [];

        console.log('🔄 Application reset to initial state');
    }
}

// Create and initialize the application
const numerologyApp = new NumerologyApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        numerologyApp.init();
    });
} else {
    numerologyApp.init();
}

// Make app instance globally available for debugging
window.numerologyApp = numerologyApp;

// Add some useful global functions for console debugging
window.debugNumerology = () => numerologyApp.showDebugInfo();
window.exportNumerology = () => numerologyApp.downloadResults();
window.resetNumerology = () => numerologyApp.reset();

// Console tip for users
setTimeout(() => {
    if (numerologyApp.initialized) {
        console.log('%c💡 Tip: Use debugNumerology(), exportNumerology(), or resetNumerology() in console for debugging', 
                   'color: #ffc107; font-style: italic;');
    }
}, 2000);