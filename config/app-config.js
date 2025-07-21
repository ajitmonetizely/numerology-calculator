// Application Configuration
const APP_CONFIG = {
    // Application settings
    app: {
        name: "Numerology Lifepath Calculator",
        version: "2.0.0",
        maxFamilyMembers: 5
    },
    
    // Numerology calculation settings
    numerology: {
        masterNumbers: [11, 22, 33],
        specialNumbers: [28],
        currentYear: new Date().getFullYear()
    },
    
    // Chinese zodiac settings
    zodiac: {
        baseYear: 1900, // Reference year for zodiac calculations
        cycleLength: 12,
        timelineYears: 10 // Years to show before/after current year
    },
    
    // Data file paths
    dataFiles: {
        chineseNewYear: 'data/chinese-new-year.json',
        zodiacAnimals: 'data/zodiac-animals.json',
        compatibility: 'data/compatibility.json'
    },
    
    // UI settings
    ui: {
        animationDuration: 300,
        scrollBehavior: 'smooth',
        defaultTimezone: 'local'
    },
    
    // Interesting dates criteria
    interestingDates: {
        lifepathNumbers: [11, 22, 33, 28],
        specialDays: [11, 22, 28],
        currentYearOnly: true
    }
};

// Make config globally available
window.APP_CONFIG = APP_CONFIG;