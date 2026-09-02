// Bikram Sambat (BS) to Gregorian (AD) and vice versa accurate calendar utility
// Covers 2075 BS to 2090 BS

export interface MonthData {
  year: number;
  days: number[]; // 12 months days
}

// Days in each month for BS years 2075-2090
export const nepaliYearData: Record<number, number[]> = {
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2088: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
};

// Base reference: 2075-01-01 BS corresponds to 2018-04-14 AD
export const BASE_BS_YEAR = 2075;
export const BASE_AD_DATE = new Date(2018, 3, 14); // 2018-04-14

export const nepaliMonthNames = [
  { index: 1, en: 'Baisakh', np: 'Baisakh' },
  { index: 2, en: 'Jestha', np: 'Jestha' },
  { index: 3, en: 'Ashadh', np: 'Ashadh' },
  { index: 4, en: 'Shrawan', np: 'Shrawan' },
  { index: 5, en: 'Bhadra', np: 'Bhadra' },
  { index: 6, en: 'Ashwin', np: 'Ashwin' },
  { index: 7, en: 'Kartik', np: 'Kartik' },
  { index: 8, en: 'Mangsir', np: 'Mangsir' },
  { index: 9, en: 'Poush', np: 'Poush' },
  { index: 10, en: 'Magh', np: 'Magh' },
  { index: 11, en: 'Falgun', np: 'Falgun' },
  { index: 12, en: 'Chaitra', np: 'Chaitra' },
];

/**
 * Converts AD date string (YYYY-MM-DD) or Date object to BS date string (YYYY-MM-DD)
 */
export function adToBs(adInput: string | Date): {
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  bsString: string;
  monthNameEn: string;
  monthNameNp: string;
} {
  const targetDate = typeof adInput === 'string' ? new Date(adInput) : adInput;
  
  // Calculate difference in days from reference point (2018-04-14)
  const diffTime = targetDate.getTime() - BASE_AD_DATE.getTime();
  let totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let currentYear = BASE_BS_YEAR;
  let currentMonth = 0; // 0-indexed for array
  let currentDay = 1;

  if (totalDays >= 0) {
    while (totalDays > 0) {
      const yearDays = nepaliYearData[currentYear] || [31,31,31,31,31,30,30,30,30,30,30,30];
      const daysInMonth = yearDays[currentMonth];

      if (totalDays >= daysInMonth) {
        totalDays -= daysInMonth;
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
      } else {
        currentDay += totalDays;
        totalDays = 0;
      }
    }
  } else {
    // If before base date, fallback gracefully
    currentYear = 2075;
    currentMonth = 0;
    currentDay = 1;
  }

  const bsMonth = currentMonth + 1;
  const monthInfo = nepaliMonthNames[currentMonth] || nepaliMonthNames[0];
  const bsString = `${currentYear}-${String(bsMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

  return {
    bsYear: currentYear,
    bsMonth,
    bsDay: currentDay,
    bsString,
    monthNameEn: monthInfo.en,
    monthNameNp: monthInfo.np,
  };
}

/**
 * Converts BS date string (YYYY-MM-DD) to AD Date & string (YYYY-MM-DD)
 */
export function bsToAd(bsInput: string): {
  adDate: Date;
  adString: string;
} {
  const parts = bsInput.split('-').map(Number);
  const targetYear = parts[0] || 2081;
  const targetMonth = (parts[1] || 1) - 1; // 0-indexed
  const targetDay = parts[2] || 1;

  let totalDays = 0;

  // Add days for all elapsed years since BASE_BS_YEAR
  for (let y = BASE_BS_YEAR; y < targetYear; y++) {
    const yearDays = nepaliYearData[y] || [31,31,31,31,31,30,30,30,30,30,30,30];
    const sumDays = yearDays.reduce((a, b) => a + b, 0);
    totalDays += sumDays;
  }

  // Add days for elapsed months in the target year
  const targetYearDays = nepaliYearData[targetYear] || [31,31,31,31,31,30,30,30,30,30,30,30];
  for (let m = 0; m < targetMonth; m++) {
    totalDays += targetYearDays[m];
  }

  // Add elapsed days in current month (targetDay - 1 because day 1 = 0 elapsed)
  totalDays += (targetDay - 1);

  // Compute AD date
  const adResult = new Date(BASE_AD_DATE.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const adString = adResult.toISOString().split('T')[0];

  return {
    adDate: adResult,
    adString,
  };
}

/**
 * Get Current Date in both BS and AD
 */
export function getDualToday(): {
  bsDate: string;
  adDate: string;
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  monthNameEn: string;
  monthNameNp: string;
  isCollectionCycle: boolean; // Day 1 to 25
  isMeetingCycle: boolean;    // Day 26 to End of Month
} {
  const today = new Date();
  const bs = adToBs(today);
  const adString = today.toISOString().split('T')[0];

  return {
    bsDate: bs.bsString,
    adDate: adString,
    bsYear: bs.bsYear,
    bsMonth: bs.bsMonth,
    bsDay: bs.bsDay,
    monthNameEn: bs.monthNameEn,
    monthNameNp: bs.monthNameNp,
    isCollectionCycle: bs.bsDay <= 25,
    isMeetingCycle: bs.bsDay > 25,
  };
}

/**
 * Adds months to a BS date string
 */
export function addMonthsBS(bsDateStr: string, monthsToAdd: number): string {
  const parts = bsDateStr.split('-').map(Number);
  let year = parts[0] || 2081;
  let month = parts[1] || 1;
  let day = parts[2] || 1;

  month += monthsToAdd;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  const maxDays = (nepaliYearData[year] && nepaliYearData[year][month - 1]) || 30;
  if (day > maxDays) day = maxDays;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getDaysInBSMonth(year: number, month: number): number {
  if (nepaliYearData[year] && nepaliYearData[year][month - 1]) {
    return nepaliYearData[year][month - 1];
  }
  return 30;
}
