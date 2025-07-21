// Chinese Zodiac Module
class ChineseZodiac {
    constructor() {
        this.newYearDates = null;
        this.zodiacAnimals = null;
        this.compatibility = null;
        this.initialized = false;
    }

    /**
     * Initialize the zodiac system by loading data
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Try to load JSON files first (works with web server)
            const [newYearData, animalsData, compatibilityData] = await Promise.all([
                this.loadJSON(APP_CONFIG.dataFiles.chineseNewYear),
                this.loadJSON(APP_CONFIG.dataFiles.zodiacAnimals),
                this.loadJSON(APP_CONFIG.dataFiles.compatibility)
            ]);

            this.newYearDates = newYearData.dates;
            this.zodiacAnimals = animalsData.animals;
            this.compatibility = compatibilityData;
            this.initialized = true;
            
            console.log('Chinese Zodiac system initialized with JSON data');
        } catch (error) {
            console.warn('Could not load JSON files (normal when opening file directly), using embedded data:', error.message);
            // Fall back to embedded data for direct file opening
            this.initializeWithEmbeddedData();
        }
    }

    /**
     * Load JSON data from file
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<Object>} Parsed JSON data
     */
    async loadJSON(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Initialize with embedded data when JSON files can't be loaded
     */
    initializeWithEmbeddedData() {
        // Complete zodiac animals data
        this.zodiacAnimals = {
            'rat': { name: 'Rat', emoji: '🐭' },
            'ox': { name: 'Ox', emoji: '🐂' },
            'tiger': { name: 'Tiger', emoji: '🐅' },
            'rabbit': { name: 'Rabbit', emoji: '🐰' },
            'dragon': { name: 'Dragon', emoji: '🐉' },
            'snake': { name: 'Snake', emoji: '🐍' },
            'horse': { name: 'Horse', emoji: '🐎' },
            'goat': { name: 'Goat', emoji: '🐐' },
            'monkey': { name: 'Monkey', emoji: '🐵' },
            'rooster': { name: 'Rooster', emoji: '🐓' },
            'dog': { name: 'Dog', emoji: '🐕' },
            'pig': { name: 'Pig', emoji: '🐷' }
        };

        // Complete compatibility data
        this.compatibility = {
            enemies: {
                'rat': 'horse', 'horse': 'rat',
                'ox': 'goat', 'goat': 'ox',
                'tiger': 'monkey', 'monkey': 'tiger',
                'rabbit': 'rooster', 'rooster': 'rabbit',
                'dragon': 'dog', 'dog': 'dragon',
                'snake': 'pig', 'pig': 'snake'
            },
            friendGroups: [
                ['rat', 'dragon', 'monkey'],
                ['ox', 'snake', 'rooster'],
                ['tiger', 'horse', 'dog'],
                ['rabbit', 'goat', 'pig']
            ]
        };

        // Essential Chinese New Year dates (embedded subset)
        this.newYearDates = {
            '2015': '2015-02-19', '2016': '2016-02-08', '2017': '2017-01-28', '2018': '2018-02-16',
            '2019': '2019-02-05', '2020': '2020-01-25', '2021': '2021-02-12', '2022': '2022-02-01',
            '2023': '2023-01-22', '2024': '2024-02-10', '2025': '2025-01-29', '2026': '2026-02-17',
            '2027': '2027-02-06', '2028': '2028-01-26', '2029': '2029-02-13', '2030': '2030-02-03',
            '2031': '2031-01-23', '2032': '2032-02-11', '2033': '2033-01-31', '2034': '2034-02-19',
            '2035': '2035-02-08', '2036': '2036-01-28', '2037': '2037-02-15', '2038': '2038-02-04',
            '2039': '2039-01-24', '2040': '2040-02-12', '2041': '2041-02-01', '2042': '2042-01-22',
            '2043': '2043-02-10', '2044': '2044-01-30', '2045': '2045-02-17', '2046': '2046-02-06',
            '2047': '2047-01-26', '2048': '2048-02-14', '2049': '2049-02-02', '2050': '2050-01-23'
        };

        this.initialized = true;
        console.log('Chinese Zodiac system initialized with embedded data');
    }

    /**
     * Calculate Chinese zodiac for birth date
     * @param {number} year - Birth year
     * @param {number} month - Birth month
     * @param {number} day - Birth day
     * @returns {Object} Zodiac information
     */
    calculateZodiac(year, month, day) {
        if (!this.initialized) {
            throw new Error('Zodiac system not initialized. Call init() first.');
        }

        const birthDate = new Date(year, month - 1, day);
        let chineseYear = year;

        // Use accurate Chinese New Year date if available
        if (this.newYearDates && this.newYearDates[year.toString()]) {
            const newYearData = this.newYearDates[year.toString()];
            // Handle both JSON format {date: "...", zodiac: "..."} and embedded string format
            const dateString = typeof newYearData === 'object' ? newYearData.date : newYearData;
            const chineseNewYear = new Date(dateString);
            
            if (birthDate < chineseNewYear) {
                chineseYear = year - 1;
            }
        } else {
            // Fallback estimation
            const estimatedCNY = this.calculateEstimatedNewYear(year);
            if (birthDate < estimatedCNY) {
                chineseYear = year - 1;
            }
        }

        const animalKey = this.getZodiacAnimalKey(chineseYear);
        const animal = this.zodiacAnimals[animalKey];

        return {
            year: chineseYear,
            animal: animal,
            animalKey: animalKey,
            fullName: `${animal.emoji} ${animal.name}`
        };
    }

    /**
     * Get current year's zodiac information
     * @returns {Object} Current year zodiac data
     */
    getCurrentYearZodiac() {
        const currentYear = APP_CONFIG.numerology.currentYear;
        const animalKey = this.getZodiacAnimalKey(currentYear);
        const animal = this.zodiacAnimals[animalKey];
        
        return {
            year: currentYear,
            animal: animal,
            animalKey: animalKey
        };
    }

    /**
     * Get zodiac animal key for a given year
     * @param {number} year - Year
     * @returns {string} Animal key
     */
    getZodiacAnimalKey(year) {
        const zodiacOrder = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
                           'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
        const zodiacIndex = (year - APP_CONFIG.zodiac.baseYear) % APP_CONFIG.zodiac.cycleLength;
        return zodiacOrder[zodiacIndex];
    }

    /**
     * Check if one animal is enemy of another
     * @param {string} animal1 - First animal key
     * @param {string} animal2 - Second animal key
     * @returns {boolean} True if enemies
     */
    isEnemyYear(animal1, animal2) {
        if (!this.compatibility || !this.compatibility.enemies) return false;
        return this.compatibility.enemies[animal1.toLowerCase()] === animal2.toLowerCase();
    }

    /**
     * Check if one animal is friendly with another
     * @param {string} animal1 - First animal key
     * @param {string} animal2 - Second animal key
     * @returns {boolean} True if friendly
     */
    isFriendlyYear(animal1, animal2) {
        const key1 = animal1.toLowerCase();
        const key2 = animal2.toLowerCase();
        
        // Animals are always friendly with themselves
        if (key1 === key2) return true;
        
        if (!this.compatibility) return false;
        
        // Check trinity groups first (traditional zodiac triangles)
        if (this.compatibility.friendGroups) {
            for (const group of this.compatibility.friendGroups) {
                if (Array.isArray(group)) {
                    if (group.includes(key1) && group.includes(key2)) {
                        return true;
                    }
                } else if (group.animals) {
                    if (group.animals.includes(key1) && group.animals.includes(key2)) {
                        return true;
                    }
                }
            }
        }
        
        // Check individual compatibility ratings (excellent and good)
        if (this.compatibility.compatibility && this.compatibility.compatibility[key1]) {
            const animal1Compat = this.compatibility.compatibility[key1];
            if (animal1Compat.excellent && animal1Compat.excellent.includes(key2)) {
                return true;
            }
            if (animal1Compat.good && animal1Compat.good.includes(key2)) {
                return true;
            }
        }
        
        // Check reverse compatibility (animal2 to animal1)
        if (this.compatibility.compatibility && this.compatibility.compatibility[key2]) {
            const animal2Compat = this.compatibility.compatibility[key2];
            if (animal2Compat.excellent && animal2Compat.excellent.includes(key1)) {
                return true;
            }
            if (animal2Compat.good && animal2Compat.good.includes(key1)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate Chinese New Year timeline data
     * @param {number} baseYear - Reference year
     * @param {number} count - Number of years to include
     * @param {string} direction - 'prior' or 'future'
     * @returns {Array} Timeline data
     */
    getChineseNewYearTimeline(baseYear, count, direction) {
        const years = [];
        const startYear = direction === 'prior' ? baseYear - count : baseYear + 1;
        const endYear = direction === 'prior' ? baseYear - 1 : baseYear + count;
        
        for (let year = startYear; year <= endYear; year++) {
            let yearData;
            
            if (this.newYearDates && this.newYearDates[year.toString()]) {
                const newYearData = this.newYearDates[year.toString()];
                const nextYearData = this.newYearDates[(year + 1).toString()];
                
                if (nextYearData) {
                    // Handle both JSON format and embedded string format
                    const startDateString = typeof newYearData === 'object' ? newYearData.date : newYearData;
                    const endDateString = typeof nextYearData === 'object' ? nextYearData.date : nextYearData;
                    
                    const startDate = new Date(startDateString);
                    const endDate = new Date(new Date(endDateString).getTime() - 24 * 60 * 60 * 1000);
                    
                    yearData = {
                        year: year,
                        zodiac: this.getZodiacDataForYear(year),
                        startDate: this.formatDate(startDate),
                        endDate: this.formatDate(endDate)
                    };
                } else {
                    yearData = this.calculateEstimatedYearData(year);
                }
            } else {
                yearData = this.calculateEstimatedYearData(year);
            }
            
            years.push(yearData);
        }
        
        return years;
    }

    /**
     * Get zodiac data for a specific year
     * @param {number} year - Year
     * @returns {Object} Zodiac data with emoji and name
     */
    getZodiacDataForYear(year) {
        const animalKey = this.getZodiacAnimalKey(year);
        return this.zodiacAnimals[animalKey];
    }

    /**
     * Calculate estimated Chinese New Year data for years without exact dates
     * @param {number} year - Year
     * @returns {Object} Estimated year data
     */
    calculateEstimatedYearData(year) {
        const estimatedDate = this.calculateEstimatedNewYear(year);
        const nextYearEstimated = this.calculateEstimatedNewYear(year + 1);
        const endDate = new Date(nextYearEstimated.getTime() - 24 * 60 * 60 * 1000);
        
        return {
            year: year,
            zodiac: this.getZodiacDataForYear(year),
            startDate: this.formatDate(estimatedDate) + " (est)",
            endDate: this.formatDate(endDate) + " (est)"
        };
    }

    /**
     * Estimate Chinese New Year date for a given year
     * @param {number} year - Year
     * @returns {Date} Estimated New Year date
     */
    calculateEstimatedNewYear(year) {
        // Simple estimation - Chinese New Year usually falls between Jan 21 - Feb 20
        const yearMod = year % 19; // Metonic cycle approximation
        const baseDay = 21 + Math.floor(yearMod * 1.5);
        
        if (baseDay <= 31) {
            return new Date(year, 0, baseDay); // January
        } else {
            return new Date(year, 1, baseDay - 31); // February
        }
    }

    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Create global instance
window.zodiacSystem = new ChineseZodiac();