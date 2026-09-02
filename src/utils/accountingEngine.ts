import {
  LedgerAccount,
  Member,
  Loan,
  AmortizationRow,
  Voucher,
  VoucherType,
  MajorGroup,
  SubGroupTier1,
  SubGroupTier2,
  CompanyMaster,
} from '../types';
import { addMonthsBS, bsToAd } from './nepaliCalendar';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    memberNo: 'SSH-001',
    name: 'Shreedhar Regmi',
    phone: '9841234561',
    email: 'shreedhar@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-1',
    regularLoanLedgerId: 'led-reg-loan-mem-1',
    emergencyLoanLedgerId: 'led-emg-loan-mem-1',
  },
  {
    id: 'mem-2',
    memberNo: 'SSH-002',
    name: 'Jeshan Regmi',
    phone: '9841234562',
    email: 'jeshan@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-2',
    regularLoanLedgerId: 'led-reg-loan-mem-2',
    emergencyLoanLedgerId: 'led-emg-loan-mem-2',
  },
  {
    id: 'mem-3',
    memberNo: 'SSH-003',
    name: 'Bhupendra Bhattarai',
    phone: '9841234563',
    email: 'bhupendra@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-3',
    regularLoanLedgerId: 'led-reg-loan-mem-3',
    emergencyLoanLedgerId: 'led-emg-loan-mem-3',
  },
  {
    id: 'mem-4',
    memberNo: 'SSH-004',
    name: 'Sarswoti Aryal (Bhattarai)',
    phone: '9841234564',
    email: 'sarswoti@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-4',
    regularLoanLedgerId: 'led-reg-loan-mem-4',
    emergencyLoanLedgerId: 'led-emg-loan-mem-4',
  },
  {
    id: 'mem-5',
    memberNo: 'SSH-005',
    name: 'Bhairaja Shrestha',
    phone: '9841234565',
    email: 'bhairaja@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-5',
    regularLoanLedgerId: 'led-reg-loan-mem-5',
    emergencyLoanLedgerId: 'led-emg-loan-mem-5',
  },
  {
    id: 'mem-6',
    memberNo: 'SSH-006',
    name: 'Nipesh Sapkota',
    phone: '9841234566',
    email: 'nipesh@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-6',
    regularLoanLedgerId: 'led-reg-loan-mem-6',
    emergencyLoanLedgerId: 'led-emg-loan-mem-6',
  },
  {
    id: 'mem-7',
    memberNo: 'SSH-007',
    name: 'Suraj Pradhan',
    phone: '9841234567',
    email: 'suraj@sathi.np',
    joinDateBS: '2081-01-01',
    joinDateAD: '2024-04-13',
    status: 'ACTIVE',
    dailySavingRate: 1000,
    collectionDaysPerMonth: 25,
    monthlySavingTarget: 25000,
    shareUnits: 1,
    depositLedgerId: 'led-dep-mem-7',
    regularLoanLedgerId: 'led-reg-loan-mem-7',
    emergencyLoanLedgerId: 'led-emg-loan-mem-7',
  },
];

export const INITIAL_LEDGERS: LedgerAccount[] = [
  // ASSETS - Non Current Assets - Fixed Assets
  {
    id: 'led-fa-1',
    code: '1010',
    name: 'Furniture & Fixtures',
    majorGroup: 'ASSETS',
    tier1: 'NON_CURRENT_ASSETS',
    tier2: 'FIXED_ASSETS',
    openingBalance: 35000,
    openingType: 'DR',
    currentBalance: 35000,
    currentType: 'DR',
    description: 'Office desk, chairs and meeting table',
    isActive: true,
  },
  {
    id: 'led-fa-2',
    code: '1020',
    name: "Computer Equipment's",
    majorGroup: 'ASSETS',
    tier1: 'NON_CURRENT_ASSETS',
    tier2: 'FIXED_ASSETS',
    openingBalance: 50000,
    openingType: 'DR',
    currentBalance: 50000,
    currentType: 'DR',
    description: 'Laptop and receipt printer for accounts',
    isActive: true,
  },
  {
    id: 'led-fa-3',
    code: '1030',
    name: 'Other Fixed Assets',
    majorGroup: 'ASSETS',
    tier1: 'NON_CURRENT_ASSETS',
    tier2: 'FIXED_ASSETS',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },

  // ASSETS - Current Assets - Cash & Bank
  {
    id: 'led-cash-1',
    code: '1101',
    name: 'Cash in Hand',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'CASH_AND_BANK',
    openingBalance: 125000,
    openingType: 'DR',
    currentBalance: 125000,
    currentType: 'DR',
    description: 'Cash vault with treasurer',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'led-bank-1',
    code: '1102',
    name: 'Nabil Bank Ltd (A/C: 0100234)',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'CASH_AND_BANK',
    openingBalance: 240000,
    openingType: 'DR',
    currentBalance: 240000,
    currentType: 'DR',
    description: 'Primary group operating account',
    isActive: true,
  },
  {
    id: 'led-bank-2',
    code: '1103',
    name: 'Global IME Bank Ltd',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'CASH_AND_BANK',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },

  // ASSETS - Current Assets - Receivables
  {
    id: 'led-rec-1',
    code: '1201',
    name: 'Interest Receivable on Loans',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'RECEIVABLES',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },
  {
    id: 'led-rec-2',
    code: '1202',
    name: 'Other Receivables & Advances',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'RECEIVABLES',
    openingBalance: 5000,
    openingType: 'DR',
    currentBalance: 5000,
    currentType: 'DR',
    isActive: true,
  },

  // ASSETS - Current Assets - Loan & Advances (Regular Loans)
  ...INITIAL_MEMBERS.map((m, idx) => ({
    id: `led-reg-loan-${m.id}`,
    code: `13${String(idx + 1).padStart(2, '0')}`,
    name: `Regular Loan - ${m.name}`,
    majorGroup: 'ASSETS' as MajorGroup,
    tier1: 'CURRENT_ASSETS' as SubGroupTier1,
    tier2: 'LOAN_AND_ADVANCES' as SubGroupTier2,
    openingBalance: idx === 0 ? 100000 : idx === 1 ? 50000 : 0,
    openingType: 'DR' as const,
    currentBalance: idx === 0 ? 100000 : idx === 1 ? 50000 : 0,
    currentType: 'DR' as const,
    memberId: m.id,
    description: `Regular amortized loan for ${m.name}`,
    isActive: true,
  })),

  // ASSETS - Current Assets - Other Current Assets (Emergency Loans)
  ...INITIAL_MEMBERS.map((m, idx) => ({
    id: `led-emg-loan-${m.id}`,
    code: `14${String(idx + 1).padStart(2, '0')}`,
    name: `Emergency Loan - ${m.name}`,
    majorGroup: 'ASSETS' as MajorGroup,
    tier1: 'CURRENT_ASSETS' as SubGroupTier1,
    tier2: 'OTHER_CURRENT_ASSETS' as SubGroupTier2,
    openingBalance: idx === 2 ? 30000 : 0,
    openingType: 'DR' as const,
    currentBalance: idx === 2 ? 30000 : 0,
    currentType: 'DR' as const,
    memberId: m.id,
    description: `Short-term emergency loan for ${m.name}`,
    isActive: true,
  })),

  // ASSETS - Current Assets - Investment
  {
    id: 'led-inv-1',
    code: '1501',
    name: 'Investment in Local Cafe Project',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'INVESTMENT',
    openingBalance: 150000,
    openingType: 'DR',
    currentBalance: 150000,
    currentType: 'DR',
    description: 'Shared venture investment',
    isActive: true,
  },
  {
    id: 'led-inv-2',
    code: '1502',
    name: 'Investment in Real Estate Land Plotting',
    majorGroup: 'ASSETS',
    tier1: 'CURRENT_ASSETS',
    tier2: 'INVESTMENT',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },

  // LIABILITIES - Non Current Liabilities - Term Loan from BFIs
  {
    id: 'led-liab-ncl-1',
    code: '2010',
    name: 'Term Loan from BFIs',
    majorGroup: 'LIABILITIES',
    tier1: 'NON_CURRENT_LIABILITIES',
    tier2: 'TERM_LOAN_BFIS',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },
  {
    id: 'led-liab-ncl-2',
    code: '2020',
    name: 'Other Non-Current Liabilities',
    majorGroup: 'LIABILITIES',
    tier1: 'NON_CURRENT_LIABILITIES',
    tier2: 'OTHER_NON_CURRENT_LIABILITIES',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },

  // LIABILITIES - Current Liabilities - Payables
  {
    id: 'led-pay-1',
    code: '2101',
    name: 'Sundry Creditors',
    majorGroup: 'LIABILITIES',
    tier1: 'CURRENT_LIABILITIES',
    tier2: 'PAYABLES',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },
  {
    id: 'led-pay-2',
    code: '2102',
    name: 'Staff Salary Payable',
    majorGroup: 'LIABILITIES',
    tier1: 'CURRENT_LIABILITIES',
    tier2: 'PAYABLES',
    openingBalance: 5000,
    openingType: 'CR',
    currentBalance: 5000,
    currentType: 'CR',
    description: 'Monthly staff remuneration Rs. 5,000',
    isActive: true,
  },
  {
    id: 'led-pay-3',
    code: '2103',
    name: 'Meeting Expenses Payables',
    majorGroup: 'LIABILITIES',
    tier1: 'CURRENT_LIABILITIES',
    tier2: 'PAYABLES',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },
  {
    id: 'led-pay-4',
    code: '2104',
    name: 'Audit Fees Payable',
    majorGroup: 'LIABILITIES',
    tier1: 'CURRENT_LIABILITIES',
    tier2: 'PAYABLES',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },

  // LIABILITIES - Current Liabilities - Members Deposit (Regular Monthly Saving 25k/mo)
  ...INITIAL_MEMBERS.map((m, idx) => ({
    id: `led-dep-${m.id}`,
    code: `22${String(idx + 1).padStart(2, '0')}`,
    name: `Member Saving Deposit - ${m.name}`,
    majorGroup: 'LIABILITIES' as MajorGroup,
    tier1: 'CURRENT_LIABILITIES' as SubGroupTier1,
    tier2: 'MEMBERS_DEPOSIT' as SubGroupTier2,
    openingBalance: 75000, // 3 months of 25k saving opening
    openingType: 'CR' as const,
    currentBalance: 75000,
    currentType: 'CR' as const,
    memberId: m.id,
    description: `Regular monthly deposit (Rs 1,000/day x 25 days) for ${m.name}`,
    isActive: true,
  })),

  // LIABILITIES - Current Liabilities - Other Current Liabilities
  {
    id: 'led-ocl-1',
    code: '2301',
    name: 'Other Current Liabilities',
    majorGroup: 'LIABILITIES',
    tier1: 'CURRENT_LIABILITIES',
    tier2: 'OTHER_CURRENT_LIABILITIES',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },

  // EQUITY - Retained Earnings / Reserves
  {
    id: 'led-eq-1',
    code: '3001',
    name: 'Profit & Loss Account',
    majorGroup: 'EQUITY',
    tier1: 'EQUITY_CAPITAL',
    tier2: 'RETAINED_EARNINGS_EQUITY',
    openingBalance: 175000,
    openingType: 'CR',
    currentBalance: 175000,
    currentType: 'CR',
    description: 'Cumulative retained surplus',
    isSystem: true,
    isActive: true,
  },

  // INCOME - Direct Income
  {
    id: 'led-inc-dir-1',
    code: '4101',
    name: 'Interest on Regular Loan to Members',
    majorGroup: 'INCOME',
    tier1: 'DIRECT_INCOME',
    tier2: 'DIRECT_INCOME_OPERATING',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    description: '25-day interest collection on regular member loans',
    isActive: true,
  },
  {
    id: 'led-inc-dir-2',
    code: '4102',
    name: 'Interest on Emergency Loan to Members',
    majorGroup: 'INCOME',
    tier1: 'DIRECT_INCOME',
    tier2: 'DIRECT_INCOME_OPERATING',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    description: 'Interest on short-term emergency loans',
    isActive: true,
  },
  {
    id: 'led-inc-dir-3',
    code: '4103',
    name: 'Interest on Bank Deposit',
    majorGroup: 'INCOME',
    tier1: 'DIRECT_INCOME',
    tier2: 'DIRECT_INCOME_OPERATING',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },

  // INCOME - Indirect Income
  {
    id: 'led-inc-ind-1',
    code: '4201',
    name: 'Donation Received',
    majorGroup: 'INCOME',
    tier1: 'INDIRECT_INCOME',
    tier2: 'INDIRECT_INCOME_OTHER',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },
  {
    id: 'led-inc-ind-2',
    code: '4202',
    name: 'Coupon Sales',
    majorGroup: 'INCOME',
    tier1: 'INDIRECT_INCOME',
    tier2: 'INDIRECT_INCOME_OTHER',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },
  {
    id: 'led-inc-ind-3',
    code: '4203',
    name: 'Other Miscellaneous Income',
    majorGroup: 'INCOME',
    tier1: 'INDIRECT_INCOME',
    tier2: 'INDIRECT_INCOME_OTHER',
    openingBalance: 0,
    openingType: 'CR',
    currentBalance: 0,
    currentType: 'CR',
    isActive: true,
  },

  // EXPENSES - Direct Expenses
  {
    id: 'led-exp-dir-1',
    code: '5101',
    name: 'Staff Salary',
    majorGroup: 'EXPENSES',
    tier1: 'DIRECT_EXPENSES',
    tier2: 'DIRECT_EXPENSES_OPERATING',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    description: 'Monthly staff remuneration Rs 5,000 for accounting',
    isActive: true,
  },
  {
    id: 'led-exp-dir-2',
    code: '5102',
    name: 'Meeting Expenses',
    majorGroup: 'EXPENSES',
    tier1: 'DIRECT_EXPENSES',
    tier2: 'DIRECT_EXPENSES_OPERATING',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    description: 'Refreshments and hall charges for 26th-end month meetings',
    isActive: true,
  },
  {
    id: 'led-exp-dir-3',
    code: '5103',
    name: 'Outdoor Picnic Expenses',
    majorGroup: 'EXPENSES',
    tier1: 'DIRECT_EXPENSES',
    tier2: 'DIRECT_EXPENSES_OPERATING',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },
  {
    id: 'led-exp-dir-4',
    code: '5104',
    name: 'Printing & Stationery',
    majorGroup: 'EXPENSES',
    tier1: 'DIRECT_EXPENSES',
    tier2: 'DIRECT_EXPENSES_OPERATING',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },
  {
    id: 'led-exp-dir-5',
    code: '5105',
    name: 'Audit Fees',
    majorGroup: 'EXPENSES',
    tier1: 'DIRECT_EXPENSES',
    tier2: 'DIRECT_EXPENSES_OPERATING',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },

  // EXPENSES - Indirect Expenses
  {
    id: 'led-exp-ind-1',
    code: '5201',
    name: 'Donation Expenses',
    majorGroup: 'EXPENSES',
    tier1: 'INDIRECT_EXPENSES',
    tier2: 'INDIRECT_EXPENSES_OTHER',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },
  {
    id: 'led-exp-ind-2',
    code: '5202',
    name: 'Bank Charges',
    majorGroup: 'EXPENSES',
    tier1: 'INDIRECT_EXPENSES',
    tier2: 'INDIRECT_EXPENSES_OTHER',
    openingBalance: 0,
    openingType: 'DR',
    currentBalance: 0,
    currentType: 'DR',
    isActive: true,
  },
];

/**
 * Parameter-based standard Loan Amortization Table Calculator
 * Strictly uses:
 *  - loanAmount
 *  - interestRateAnnual (% p.a.)
 *  - emiAmount (or standard calculated EMI)
 *  - loanPeriodMonths
 *  - cycleType: '25_DAYS' | '30_DAYS'
 */
export function generateAmortizationSchedule(params: {
  loanAmount: number;
  interestRateAnnual: number;
  loanPeriodMonths: number;
  customEmiAmount?: number;
  calculationCycle?: '25_DAYS' | '30_DAYS' | '365_DAYS';
  startDateBS: string;
}): {
  schedule: AmortizationRow[];
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
} {
  const {
    loanAmount,
    interestRateAnnual,
    loanPeriodMonths,
    customEmiAmount,
    calculationCycle = '25_DAYS',
    startDateBS,
  } = params;

  // Monthly interest rate factor
  // For 25-day cycle: (rate / 100) * (25 / 300) = (rate / 100) * (1 / 12) * (25 / 25 or exact 25-day factor)
  // In standard finance: monthlyRate = (interestRateAnnual / 100) / 12
  // When explicitly 25 days rule is applied: (rate / 100 / 365) * 25 or (rate / 100 / 12) * (25 / 30)
  const monthlyRate =
    calculationCycle === '25_DAYS'
      ? (interestRateAnnual / 100) * (25 / 300) // 25 days out of 300 working days in year or exact 25/30 of month
      : (interestRateAnnual / 100) / 12;

  // Compute standard EMI if not provided
  let emi = customEmiAmount || 0;
  if (!emi || emi <= 0) {
    if (monthlyRate === 0) {
      emi = loanAmount / loanPeriodMonths;
    } else {
      emi =
        (loanAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, loanPeriodMonths)) /
        (Math.pow(1 + monthlyRate, loanPeriodMonths) - 1);
    }
  }

  emi = Math.round(emi);

  const schedule: AmortizationRow[] = [];
  let remainingBalance = loanAmount;
  let totalInterest = 0;
  let totalPayment = 0;

  for (let month = 1; month <= loanPeriodMonths; month++) {
    const dueDateBS = addMonthsBS(startDateBS, month);
    const { adString: dueDateAD } = bsToAd(dueDateBS);

    const interestDue = Math.round(remainingBalance * monthlyRate);
    let principalDue = emi - interestDue;

    if (month === loanPeriodMonths || principalDue > remainingBalance) {
      principalDue = remainingBalance;
      emi = principalDue + interestDue;
    }

    const closingBalance = Math.max(0, remainingBalance - principalDue);

    schedule.push({
      monthNo: month,
      periodLabel: `Month ${month}`,
      dueDateBS,
      dueDateAD,
      openingBalance: Math.round(remainingBalance),
      principalDue,
      interestDue,
      totalEmi: emi,
      closingBalance: Math.round(closingBalance),
      status: 'PENDING',
    });

    totalInterest += interestDue;
    totalPayment += emi;
    remainingBalance = closingBalance;

    if (remainingBalance <= 0) break;
  }

  return {
    schedule,
    monthlyEmi: emi,
    totalInterest,
    totalPayment,
  };
}

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan-1',
    loanNumber: 'REG-2081-001',
    memberId: 'mem-1',
    memberName: 'Shreedhar Regmi',
    loanType: 'REGULAR',
    principalAmount: 100000,
    interestRateAnnual: 12,
    durationMonths: 12,
    emiAmount: 8885,
    calculationCycle: '25_DAYS',
    disbursedDateBS: '2081-01-05',
    disbursedDateAD: '2024-04-17',
    maturityDateBS: '2082-01-05',
    status: 'ACTIVE',
    disbursementLedgerId: 'led-cash-1',
    loanLedgerId: 'led-reg-loan-mem-1',
    interestIncomeLedgerId: 'led-inc-dir-1',
    autoPostJournals: true,
    notes: 'Regular business loan for grocery store upgrade',
    amortizationSchedule: generateAmortizationSchedule({
      loanAmount: 100000,
      interestRateAnnual: 12,
      loanPeriodMonths: 12,
      customEmiAmount: 8885,
      calculationCycle: '25_DAYS',
      startDateBS: '2081-01-05',
    }).schedule,
  },
  {
    id: 'loan-2',
    loanNumber: 'REG-2081-002',
    memberId: 'mem-2',
    memberName: 'Jeshan Regmi',
    loanType: 'REGULAR',
    principalAmount: 50000,
    interestRateAnnual: 12,
    durationMonths: 6,
    emiAmount: 8627,
    calculationCycle: '25_DAYS',
    disbursedDateBS: '2081-02-10',
    disbursedDateAD: '2024-05-23',
    maturityDateBS: '2081-08-10',
    status: 'ACTIVE',
    disbursementLedgerId: 'led-bank-1',
    loanLedgerId: 'led-reg-loan-mem-2',
    interestIncomeLedgerId: 'led-inc-dir-1',
    autoPostJournals: true,
    notes: 'Home renovation loan',
    amortizationSchedule: generateAmortizationSchedule({
      loanAmount: 50000,
      interestRateAnnual: 12,
      loanPeriodMonths: 6,
      customEmiAmount: 8627,
      calculationCycle: '25_DAYS',
      startDateBS: '2081-02-10',
    }).schedule,
  },
  {
    id: 'loan-3',
    loanNumber: 'EMG-2081-001',
    memberId: 'mem-3',
    memberName: 'Bhupendra Bhattarai',
    loanType: 'EMERGENCY',
    principalAmount: 30000,
    interestRateAnnual: 15,
    durationMonths: 3,
    emiAmount: 10252,
    calculationCycle: '25_DAYS',
    disbursedDateBS: '2081-03-01',
    disbursedDateAD: '2024-06-15',
    maturityDateBS: '2081-06-01',
    status: 'ACTIVE',
    disbursementLedgerId: 'led-cash-1',
    loanLedgerId: 'led-emg-loan-mem-3',
    interestIncomeLedgerId: 'led-inc-dir-2',
    autoPostJournals: true,
    notes: 'Medical emergency',
    amortizationSchedule: generateAmortizationSchedule({
      loanAmount: 30000,
      interestRateAnnual: 15,
      loanPeriodMonths: 3,
      customEmiAmount: 10252,
      calculationCycle: '25_DAYS',
      startDateBS: '2081-03-01',
    }).schedule,
  },
];

export const INITIAL_VOUCHERS: Voucher[] = [
  // 1. Initial Deposit Collection Month 1
  {
    id: 'vch-1',
    voucherNo: 'RCT-2081-001',
    voucherType: 'RECEIPT',
    dateBS: '2081-01-25',
    dateAD: '2024-05-07',
    narration: 'Monthly regular saving deposit collection (Rs 1,000/day x 25 days = 25k/member) from 7 members',
    totalAmount: 175000,
    createdBy: 'Staff Accountant',
    status: 'POSTED',
    autoTag: 'SAVING_COLLECTION',
    createdAt: '2024-05-07T12:00:00.000Z',
    entries: [
      { id: 'e1', ledgerId: 'led-cash-1', ledgerName: 'Cash in Hand', drAmount: 175000, crAmount: 0 },
      ...INITIAL_MEMBERS.map((m, i) => ({
        id: `e-dep-${i}`,
        ledgerId: `led-dep-${m.id}`,
        ledgerName: `Member Saving Deposit - ${m.name}`,
        drAmount: 0,
        crAmount: 25000,
        memberId: m.id,
        narration: `25 days regular saving (Rs 1,000/day) for ${m.name}`,
      })),
    ],
  },
  // 2. Staff Salary Payment Month 1
  {
    id: 'vch-2',
    voucherNo: 'PMT-2081-001',
    voucherType: 'PAYMENT',
    dateBS: '2081-01-26',
    dateAD: '2024-05-08',
    narration: 'Monthly staff remuneration paid for accounting and daily saving collection',
    totalAmount: 5000,
    createdBy: 'Treasurer',
    status: 'POSTED',
    autoTag: 'SALARY',
    createdAt: '2024-05-08T14:00:00.000Z',
    entries: [
      { id: 'e2-1', ledgerId: 'led-exp-dir-1', ledgerName: 'Staff Salary', drAmount: 5000, crAmount: 0 },
      { id: 'e2-2', ledgerId: 'led-cash-1', ledgerName: 'Cash in Hand', drAmount: 0, crAmount: 5000 },
    ],
  },
  // 3. Meeting Expenses Month 1 (during 26th-end cycle)
  {
    id: 'vch-3',
    voucherNo: 'PMT-2081-002',
    voucherType: 'PAYMENT',
    dateBS: '2081-01-28',
    dateAD: '2024-05-10',
    narration: 'Monthly gathering refreshments & hall stationery expenses for group meeting',
    totalAmount: 2200,
    createdBy: 'Secretary',
    status: 'POSTED',
    createdAt: '2024-05-10T16:30:00.000Z',
    entries: [
      { id: 'e3-1', ledgerId: 'led-exp-dir-2', ledgerName: 'Meeting Expenses', drAmount: 2200, crAmount: 0 },
      { id: 'e3-2', ledgerId: 'led-cash-1', ledgerName: 'Cash in Hand', drAmount: 0, crAmount: 2200 },
    ],
  },
  // 4. Regular Loan Disbursement to Bikram Adhikari
  {
    id: 'vch-4',
    voucherNo: 'JRN-2081-001',
    voucherType: 'JOURNAL',
    dateBS: '2081-02-01',
    dateAD: '2024-05-14',
    narration: 'Regular Loan disbursed to Bikram Adhikari @ 12% p.a. for 12 months',
    totalAmount: 100000,
    createdBy: 'Staff Accountant',
    status: 'POSTED',
    createdAt: '2024-05-14T10:00:00.000Z',
    entries: [
      { id: 'e4-1', ledgerId: 'led-reg-loan-mem-1', ledgerName: 'Regular Loan - Bikram Adhikari', drAmount: 100000, crAmount: 0, memberId: 'mem-1' },
      { id: 'e4-2', ledgerId: 'led-bank-1', ledgerName: 'Nabil Bank Ltd (A/C: 0100234)', drAmount: 0, crAmount: 100000 },
    ],
  },
  // 5. Monthly Auto-posted Interest on Regular Loan (Month 1)
  {
    id: 'vch-5',
    voucherNo: 'JRN-2081-002',
    voucherType: 'JOURNAL',
    dateBS: '2081-02-25',
    dateAD: '2024-06-07',
    narration: 'Auto-posting monthly interest on Regular Loan REG-2081-001 for Bikram Adhikari (25-day cycle)',
    totalAmount: 1000,
    createdBy: 'System Auto-Post',
    status: 'POSTED',
    isAutoGenerated: true,
    autoTag: 'MONTHLY_INTEREST',
    createdAt: '2024-06-07T00:00:00.000Z',
    entries: [
      { id: 'e5-1', ledgerId: 'led-rec-1', ledgerName: 'Interest Receivable on Loans', drAmount: 1000, crAmount: 0, memberId: 'mem-1' },
      { id: 'e5-2', ledgerId: 'led-inc-dir-1', ledgerName: 'Interest on Regular Loan to Members', drAmount: 0, crAmount: 1000 },
    ],
  },
];

/**
 * Calculates current real-time balances for all ledgers from opening balances + all posted vouchers
 */
export function calculateLedgerBalances(
  ledgers: LedgerAccount[],
  vouchers: Voucher[]
): LedgerAccount[] {
  const balanceMap: Record<string, { dr: number; cr: number }> = {};

  // Initialize with opening balances
  ledgers.forEach((led) => {
    balanceMap[led.id] = {
      dr: led.openingType === 'DR' ? led.openingBalance : 0,
      cr: led.openingType === 'CR' ? led.openingBalance : 0,
    };
  });

  // Accumulate from posted vouchers
  vouchers
    .filter((v) => v.status === 'POSTED')
    .forEach((vch) => {
      vch.entries.forEach((item) => {
        if (!balanceMap[item.ledgerId]) {
          balanceMap[item.ledgerId] = { dr: 0, cr: 0 };
        }
        balanceMap[item.ledgerId].dr += Number(item.drAmount) || 0;
        balanceMap[item.ledgerId].cr += Number(item.crAmount) || 0;
      });
    });

  return ledgers.map((led) => {
    const acc = balanceMap[led.id] || { dr: 0, cr: 0 };
    const netDr = acc.dr - acc.cr;

    let currentBalance = 0;
    let currentType: 'DR' | 'CR' = 'DR';

    if (led.majorGroup === 'ASSETS' || led.majorGroup === 'EXPENSES') {
      if (netDr >= 0) {
        currentBalance = netDr;
        currentType = 'DR';
      } else {
        currentBalance = Math.abs(netDr);
        currentType = 'CR';
      }
    } else {
      // LIABILITIES, EQUITY, INCOME (Normally CR)
      const netCr = acc.cr - acc.dr;
      if (netCr >= 0) {
        currentBalance = netCr;
        currentType = 'CR';
      } else {
        currentBalance = Math.abs(netCr);
        currentType = 'DR';
      }
    }

    return {
      ...led,
      currentBalance,
      currentType,
    };
  });
}

/**
 * Financial Statement Computation: Profit & Loss Account
 */
export function computeProfitAndLoss(
  ledgers: LedgerAccount[]
): {
  directIncomes: { ledger: LedgerAccount; amount: number }[];
  indirectIncomes: { ledger: LedgerAccount; amount: number }[];
  totalIncome: number;
  directExpenses: { ledger: LedgerAccount; amount: number }[];
  indirectExpenses: { ledger: LedgerAccount; amount: number }[];
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  isProfit: boolean;
} {
  const directIncomes: { ledger: LedgerAccount; amount: number }[] = [];
  const indirectIncomes: { ledger: LedgerAccount; amount: number }[] = [];
  const directExpenses: { ledger: LedgerAccount; amount: number }[] = [];
  const indirectExpenses: { ledger: LedgerAccount; amount: number }[] = [];

  ledgers.forEach((l) => {
    const amt = l.currentBalance;
    if (amt === 0) return;

    if (l.majorGroup === 'INCOME') {
      if (l.tier1 === 'DIRECT_INCOME') {
        directIncomes.push({ ledger: l, amount: amt });
      } else {
        indirectIncomes.push({ ledger: l, amount: amt });
      }
    } else if (l.majorGroup === 'EXPENSES') {
      if (l.tier1 === 'DIRECT_EXPENSES') {
        directExpenses.push({ ledger: l, amount: amt });
      } else {
        indirectExpenses.push({ ledger: l, amount: amt });
      }
    }
  });

  const sumDirInc = directIncomes.reduce((s, i) => s + i.amount, 0);
  const sumIndInc = indirectIncomes.reduce((s, i) => s + i.amount, 0);
  const sumDirExp = directExpenses.reduce((s, i) => s + i.amount, 0);
  const sumIndExp = indirectExpenses.reduce((s, i) => s + i.amount, 0);

  const totalIncome = sumDirInc + sumIndInc;
  const totalExpenses = sumDirExp + sumIndExp;
  const grossProfit = sumDirInc - sumDirExp;
  const netProfit = totalIncome - totalExpenses;

  return {
    directIncomes,
    indirectIncomes,
    totalIncome,
    directExpenses,
    indirectExpenses,
    totalExpenses,
    grossProfit,
    netProfit,
    isProfit: netProfit >= 0,
  };
}

/**
 * Financial Statement Computation: Balance Sheet
 */
export function computeBalanceSheet(
  ledgers: LedgerAccount[],
  netProfit: number
): {
  fixedAssets: { ledger: LedgerAccount; amount: number }[];
  currentAssets: { ledger: LedgerAccount; amount: number }[];
  totalAssets: number;
  nonCurrentLiabilities: { ledger: LedgerAccount; amount: number }[];
  currentLiabilities: { ledger: LedgerAccount; amount: number }[];
  totalLiabilities: number;
  equityItems: { ledger: LedgerAccount; amount: number }[];
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  difference: number;
} {
  const fixedAssets: { ledger: LedgerAccount; amount: number }[] = [];
  const currentAssets: { ledger: LedgerAccount; amount: number }[] = [];
  const nonCurrentLiabilities: { ledger: LedgerAccount; amount: number }[] = [];
  const currentLiabilities: { ledger: LedgerAccount; amount: number }[] = [];
  const equityItems: { ledger: LedgerAccount; amount: number }[] = [];

  ledgers.forEach((l) => {
    const amt = l.currentBalance;
    if (l.majorGroup === 'ASSETS') {
      if (l.tier1 === 'NON_CURRENT_ASSETS') {
        fixedAssets.push({ ledger: l, amount: amt });
      } else {
        currentAssets.push({ ledger: l, amount: amt });
      }
    } else if (l.majorGroup === 'LIABILITIES') {
      if (l.tier1 === 'NON_CURRENT_LIABILITIES') {
        nonCurrentLiabilities.push({ ledger: l, amount: amt });
      } else {
        currentLiabilities.push({ ledger: l, amount: amt });
      }
    } else if (l.majorGroup === 'EQUITY') {
      equityItems.push({ ledger: l, amount: amt });
    }
  });

  const sumFixedAssets = fixedAssets.reduce((s, a) => s + a.amount, 0);
  const sumCurrentAssets = currentAssets.reduce((s, a) => s + a.amount, 0);
  const totalAssets = sumFixedAssets + sumCurrentAssets;

  const sumNCL = nonCurrentLiabilities.reduce((s, l) => s + l.amount, 0);
  const sumCL = currentLiabilities.reduce((s, l) => s + l.amount, 0);
  const totalLiabilities = sumNCL + sumCL;

  const sumEquityLedgers = equityItems.reduce((s, e) => s + e.amount, 0);
  // Net profit gets added to equity
  const totalEquity = sumEquityLedgers + netProfit;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const difference = totalAssets - totalLiabilitiesAndEquity;

  return {
    fixedAssets,
    currentAssets,
    totalAssets,
    nonCurrentLiabilities,
    currentLiabilities,
    totalLiabilities,
    equityItems,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced: Math.abs(difference) < 1,
    difference,
  };
}

/**
 * Memberwise Columnar Interest & Saving Report Generator
 */
export function computeMemberwiseColumnarReport(
  members: Member[],
  loans: Loan[],
  ledgers: LedgerAccount[],
  vouchers: Voucher[]
) {
  return members.map((mem) => {
    // 1. Total Saving Collected
    const depLedger = ledgers.find((l) => l.id === mem.depositLedgerId);
    const totalSaving = depLedger ? depLedger.currentBalance : 0;

    // 2. Active Regular Loans & Balance
    const memRegLoans = loans.filter(
      (l) => l.memberId === mem.id && l.loanType === 'REGULAR' && l.status === 'ACTIVE'
    );
    const regLoanBalance = memRegLoans.reduce(
      (s, l) =>
        s +
        (l.amortizationSchedule.find((r) => r.status === 'PENDING')
          ?.openingBalance || l.principalAmount),
      0
    );

    // 3. Active Emergency Loans & Balance
    const memEmgLoans = loans.filter(
      (l) => l.memberId === mem.id && l.loanType === 'EMERGENCY' && l.status === 'ACTIVE'
    );
    const emgLoanBalance = memEmgLoans.reduce(
      (s, l) =>
        s +
        (l.amortizationSchedule.find((r) => r.status === 'PENDING')
          ?.openingBalance || l.principalAmount),
      0
    );

    // 4. Monthly Interest Accrued / Paid
    // Regular Loan Interest
    const regInterestMonthly = memRegLoans.reduce((s, l) => {
      const nextRow = l.amortizationSchedule.find((r) => r.status === 'PENDING');
      return s + (nextRow ? nextRow.interestDue : 0);
    }, 0);

    // Emergency Loan Interest
    const emgInterestMonthly = memEmgLoans.reduce((s, l) => {
      const nextRow = l.amortizationSchedule.find((r) => r.status === 'PENDING');
      return s + (nextRow ? nextRow.interestDue : 0);
    }, 0);

    const totalInterestMonthly = regInterestMonthly + emgInterestMonthly;

    // Total Monthly Expected Collection: Rs 25,000 saving + EMI/Interest
    const expectedMonthlyTotal =
      mem.monthlySavingTarget +
      memRegLoans.reduce((s, l) => s + (l.amortizationSchedule[0]?.totalEmi || 0), 0) +
      memEmgLoans.reduce((s, l) => s + (l.amortizationSchedule[0]?.totalEmi || 0), 0);

    return {
      memberId: mem.id,
      memberNo: mem.memberNo,
      name: mem.name,
      nepaliName: mem.nepaliName,
      phone: mem.phone,
      totalSaving,
      monthlySavingTarget: mem.monthlySavingTarget,
      regLoanCount: memRegLoans.length,
      regLoanBalance,
      regInterestMonthly,
      emgLoanCount: memEmgLoans.length,
      emgLoanBalance,
      emgInterestMonthly,
      totalLoanOutstanding: regLoanBalance + emgLoanBalance,
      totalInterestMonthly,
      expectedMonthlyTotal,
    };
  });
}

export const DEFAULT_COMPANY_MASTER: CompanyMaster = {
  id: 'comp-1',
  name: 'Apex Enterprises & Trading Pvt. Ltd.',
  mailingName: 'Apex Enterprises & Trading Pvt. Ltd.',
  address: 'Putalisadak Plaza, Ward No. 28',
  city: 'Kathmandu',
  stateOrProvince: 'Bagmati Province',
  country: 'Nepal',
  phone: '+977-1-4245678, 9851000000',
  email: 'accounts@apexenterprises.com.np',
  website: 'www.apexenterprises.com.np',
  panVatNo: '601234567',
  registrationNo: '184920/078/079',
  currencySymbol: 'Rs',
  currencyFormalName: 'NPR (Nepalese Rupee)',
  fiscalYearStartBS: '2081-04-01',
  fiscalYearEndBS: '2082-03-31',
  fiscalYearStartAD: '2024-07-16',
  fiscalYearEndAD: '2025-07-15',
  fiscalYearLabel: '2081/082',
  booksBeginningFromBS: '2081-04-01',
  booksBeginningFromAD: '2024-07-16',
};

export interface DateFilteredTrialBalanceItem {
  ledger: LedgerAccount;
  openingDr: number;
  openingCr: number;
  netOpening: number;
  periodDr: number;
  periodCr: number;
  closingDr: number;
  closingCr: number;
  netClosing: number;
  hasActivity: boolean;
}

export function computeDateFilteredTrialBalance(
  ledgers: LedgerAccount[],
  vouchers: Voucher[],
  startDateBS?: string,
  endDateBS?: string
) {
  const items: DateFilteredTrialBalanceItem[] = ledgers.map((ledger) => {
    // 1. Initial base opening
    const baseOpeningNet = ledger.openingType === 'DR' ? ledger.openingBalance : -ledger.openingBalance;

    // Prior movements before startDateBS
    let priorDr = 0;
    let priorCr = 0;

    // Movements within period [startDateBS, endDateBS]
    let periodDr = 0;
    let periodCr = 0;

    vouchers.forEach((vch) => {
      vch.entries.forEach((e) => {
        if (e.ledgerId === ledger.id) {
          if (startDateBS && vch.dateBS < startDateBS) {
            priorDr += e.drAmount || 0;
            priorCr += e.crAmount || 0;
          } else if (
            (!startDateBS || vch.dateBS >= startDateBS) &&
            (!endDateBS || vch.dateBS <= endDateBS)
          ) {
            periodDr += e.drAmount || 0;
            periodCr += e.crAmount || 0;
          }
        }
      });
    });

    const netOpening = baseOpeningNet + (priorDr - priorCr);
    const openingDr = netOpening > 0 ? netOpening : 0;
    const openingCr = netOpening < 0 ? Math.abs(netOpening) : 0;

    const netClosing = netOpening + (periodDr - periodCr);
    const closingDr = netClosing > 0 ? netClosing : 0;
    const closingCr = netClosing < 0 ? Math.abs(netClosing) : 0;

    const hasActivity =
      openingDr > 0 ||
      openingCr > 0 ||
      periodDr > 0 ||
      periodCr > 0 ||
      closingDr > 0 ||
      closingCr > 0;

    return {
      ledger,
      openingDr,
      openingCr,
      netOpening,
      periodDr,
      periodCr,
      closingDr,
      closingCr,
      netClosing,
      hasActivity,
    };
  });

  // Filter to show ONLY ledgers that have Opening Balance or Transactions or Closing Balance
  const activeItems = items.filter((item) => item.hasActivity);

  const totalOpeningDr = activeItems.reduce((s, i) => s + i.openingDr, 0);
  const totalOpeningCr = activeItems.reduce((s, i) => s + i.openingCr, 0);
  const totalPeriodDr = activeItems.reduce((s, i) => s + i.periodDr, 0);
  const totalPeriodCr = activeItems.reduce((s, i) => s + i.periodCr, 0);
  const totalClosingDr = activeItems.reduce((s, i) => s + i.closingDr, 0);
  const totalClosingCr = activeItems.reduce((s, i) => s + i.closingCr, 0);

  const isBalanced =
    Math.abs(totalClosingDr - totalClosingCr) < 0.01 &&
    Math.abs(totalPeriodDr - totalPeriodCr) < 0.01;

  return {
    items,
    activeItems,
    totalOpeningDr,
    totalOpeningCr,
    totalPeriodDr,
    totalPeriodCr,
    totalClosingDr,
    totalClosingCr,
    isBalanced,
  };
}
