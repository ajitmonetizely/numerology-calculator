// Numerology Calculation Module
class NumerologyCalculator {
    
    /**
     * Calculate lifepath number from birth date
     * @param {string} birthDate - Date in YYYY-MM-DD format
     * @returns {Object} Calculation result with lifepath, steps, and details
     */
    static calculateLifepath(birthDate) {
        const dateParts = birthDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        // Format with leading zeros for consistency
        const monthStr = month.toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const yearStr = year.toString();

        let calculation = [];
        let total = 0;

        // Process month
        if (this.isMasterNumber(monthStr)) {
            calculation.push(monthStr);
            total += parseInt(monthStr);
        } else {
            const monthDigits = monthStr.split('').map(d => parseInt(d));
            calculation.push(...monthDigits);
            total += monthDigits.reduce((sum, digit) => sum + digit, 0);
        }

        // Process day
        if (this.isMasterNumber(dayStr)) {
            calculation.push(dayStr);
            total += parseInt(dayStr);
        } else {
            const dayDigits = dayStr.split('').map(d => parseInt(d));
            calculation.push(...dayDigits);
            total += dayDigits.reduce((sum, digit) => sum + digit, 0);
        }

        // Process year (split into two pairs)
        const yearPart1 = yearStr.substring(0, 2);
        const yearPart2 = yearStr.substring(2, 4);

        // First pair of year
        if (this.isMasterNumber(yearPart1)) {
            calculation.push(yearPart1);
            total += parseInt(yearPart1);
        } else {
            const year1Digits = yearPart1.split('').map(d => parseInt(d));
            calculation.push(...year1Digits);
            total += year1Digits.reduce((sum, digit) => sum + digit, 0);
        }

        // Second pair of year
        if (this.isMasterNumber(yearPart2)) {
            calculation.push(yearPart2);
            total += parseInt(yearPart2);
        } else {
            const year2Digits = yearPart2.split('').map(d => parseInt(d));
            calculation.push(...year2Digits);
            total += year2Digits.reduce((sum, digit) => sum + digit, 0);
        }

        // Reduce to single digit (unless it's a master number or special number)
        const reductionResult = this.reduceToSingleDigit(total);

        return {
            number: reductionResult.final,
            calculation: calculation,
            total: total,
            reductionSteps: reductionResult.steps,
            birthDate: `${monthStr}/${dayStr}/${yearStr}`
        };
    }

    /**
     * Calculate personal year number
     * @param {string} birthDate - Birth date in YYYY-MM-DD format
     * @param {number} currentYear - Current year
     * @returns {Object} Personal year calculation result
     */
    static calculatePersonalYear(birthDate, currentYear) {
        const dateParts = birthDate.split('-');
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        const monthStr = month.toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const currentYearStr = currentYear.toString();

        let calculation = [];
        let total = 0;

        // Add month
        if (this.isMasterNumber(monthStr)) {
            calculation.push(monthStr);
            total += parseInt(monthStr);
        } else {
            const monthDigits = monthStr.split('').map(d => parseInt(d));
            calculation.push(...monthDigits);
            total += monthDigits.reduce((sum, digit) => sum + digit, 0);
        }

        // Add day
        if (this.isMasterNumber(dayStr)) {
            calculation.push(dayStr);
            total += parseInt(dayStr);
        } else {
            const dayDigits = dayStr.split('').map(d => parseInt(d));
            calculation.push(...dayDigits);
            total += dayDigits.reduce((sum, digit) => sum + digit, 0);
        }

        // Add current year (split into two pairs)
        const currentYearPart1 = currentYearStr.substring(0, 2);
        const currentYearPart2 = currentYearStr.substring(2, 4);

        if (this.isMasterNumber(currentYearPart1)) {
            calculation.push(currentYearPart1);
            total += parseInt(currentYearPart1);
        } else {
            const currentYear1Digits = currentYearPart1.split('').map(d => parseInt(d));
            calculation.push(...currentYear1Digits);
            total += currentYear1Digits.reduce((sum, digit) => sum + digit, 0);
        }

        if (this.isMasterNumber(currentYearPart2)) {
            calculation.push(currentYearPart2);
            total += parseInt(currentYearPart2);
        } else {
            const currentYear2Digits = currentYearPart2.split('').map(d => parseInt(d));
            calculation.push(...currentYear2Digits);
            total += currentYear2Digits.reduce((sum, digit) => sum + digit, 0);
        }

        const reductionResult = this.reduceToSingleDigit(total);

        return {
            number: reductionResult.final,
            calculation: calculation,
            total: total,
            reductionSteps: reductionResult.steps,
            currentYear: currentYear
        };
    }

    /**
     * Find all interesting dates in a given year
     * @param {number} year - Year to search
     * @returns {Array} Array of interesting date objects
     */
    static findInterestingDates(year) {
        const interestingDates = [];
        const { lifepathNumbers, specialDays } = APP_CONFIG.interestingDates;

        for (let month = 1; month <= 12; month++) {
            const daysInMonth = new Date(year, month, 0).getDate();
            
            for (let day = 1; day <= daysInMonth; day++) {
                const result = this.calculateDateLifepath(year, month, day);
                let reasons = [];

                // Check if lifepath is a master number
                if (lifepathNumbers.includes(result.lifepath)) {
                    if ([11, 22, 33].includes(result.lifepath)) {
                        reasons.push(`Lifepath = ${result.lifepath} (Master Number)`);
                    } else if (result.lifepath === 28) {
                        reasons.push('Lifepath = 28 (Special Number)');
                    }
                }

                // Check if day is special
                if (specialDays.includes(day)) {
                    reasons.push(`Special day: ${day}${this.getDayOrdinal(day)} of the month`);
                }

                if (reasons.length > 0) {
                    interestingDates.push({
                        ...result,
                        month: month,
                        day: day,
                        year: year,
                        reasons: reasons
                    });
                }
            }
        }

        return interestingDates;
    }

    /**
     * Calculate lifepath for a specific date
     * @param {number} year - Year
     * @param {number} month - Month
     * @param {number} day - Day
     * @returns {Object} Lifepath calculation result
     */
    static calculateDateLifepath(year, month, day) {
        const birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const result = this.calculateLifepath(birthDate);
        
        return {
            lifepath: result.number,
            calculation: result.calculation,
            total: result.total,
            reductionSteps: result.reductionSteps,
            dateString: result.birthDate
        };
    }

    /**
     * Check if a number string is a master number
     * @param {string} numberStr - Number as string
     * @returns {boolean} True if master number
     */
    static isMasterNumber(numberStr) {
        return APP_CONFIG.numerology.masterNumbers.includes(parseInt(numberStr));
    }

    /**
     * Reduce number to single digit unless it's special
     * @param {number} number - Number to reduce
     * @returns {Object} Final number and reduction steps
     */
    static reduceToSingleDigit(number) {
        let current = number;
        let steps = [];
        const { masterNumbers, specialNumbers } = APP_CONFIG.numerology;
        
        while (current > 9 && 
               !masterNumbers.includes(current) && 
               !specialNumbers.includes(current)) {
            const digits = current.toString().split('').map(d => parseInt(d));
            steps.push(`${current} → ${digits.join(' + ')} = ${digits.reduce((sum, digit) => sum + digit, 0)}`);
            current = digits.reduce((sum, digit) => sum + digit, 0);
        }

        return {
            final: current,
            steps: steps
        };
    }

    /**
     * Get ordinal suffix for day numbers
     * @param {number} day - Day number
     * @returns {string} Ordinal suffix
     */
    static getDayOrdinal(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
}

// Make the class globally available
window.NumerologyCalculator = NumerologyCalculator;