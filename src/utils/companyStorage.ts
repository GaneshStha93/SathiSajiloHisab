import {
  LedgerAccount,
  Member,
  Loan,
  Voucher,
  UserAccount,
  CompanyMaster,
} from '../types';
import {
  INITIAL_LEDGERS,
  INITIAL_MEMBERS,
  INITIAL_LOANS,
  INITIAL_VOUCHERS,
} from './accountingEngine';
import { INITIAL_USERS } from './authManager';

/**
 * Standard baseline Chart of Accounts for a newly created company (all opening/current balances 0)
 */
export function createCleanChartOfAccounts(companyName: string = 'Company'): LedgerAccount[] {
  return [
    // Non-Current Assets
    {
      id: 'led-fa-1',
      code: '1010',
      name: 'Furniture & Fixtures',
      majorGroup: 'ASSETS',
      tier1: 'NON_CURRENT_ASSETS',
      tier2: 'FIXED_ASSETS',
      openingBalance: 0,
      openingType: 'DR',
      currentBalance: 0,
      currentType: 'DR',
      isActive: true,
    },
    {
      id: 'led-fa-2',
      code: '1020',
      name: "Computer Equipment's",
      majorGroup: 'ASSETS',
      tier1: 'NON_CURRENT_ASSETS',
      tier2: 'FIXED_ASSETS',
      openingBalance: 0,
      openingType: 'DR',
      currentBalance: 0,
      currentType: 'DR',
      isActive: true,
    },
    {
      id: 'led-fa-3',
      code: '1030',
      name: 'Office Equipment',
      majorGroup: 'ASSETS',
      tier1: 'NON_CURRENT_ASSETS',
      tier2: 'FIXED_ASSETS',
      openingBalance: 0,
      openingType: 'DR',
      currentBalance: 0,
      currentType: 'DR',
      isActive: true,
    },

    // Current Assets - Cash & Bank
    {
      id: 'led-cash-1',
      code: '1101',
      name: 'Cash in Hand',
      majorGroup: 'ASSETS',
      tier1: 'CURRENT_ASSETS',
      tier2: 'CASH_AND_BANK',
      openingBalance: 0,
      openingType: 'DR',
      currentBalance: 0,
      currentType: 'DR',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'led-bank-1',
      code: '1102',
      name: 'Bank Operating Account',
      majorGroup: 'ASSETS',
      tier1: 'CURRENT_ASSETS',
      tier2: 'CASH_AND_BANK',
      openingBalance: 0,
      openingType: 'DR',
      currentBalance: 0,
      currentType: 'DR',
      isActive: true,
    },

    // Current Assets - Receivables
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
      name: 'Accounts Receivable / Debtors',
      majorGroup: 'ASSETS',
      tier1: 'CURRENT_ASSETS',
      tier2: 'RECEIVABLES',
      openingBalance: 0,
      openingType: 'DR',
      currentBalance: 0,
      currentType: 'DR',
      isActive: true,
    },

    // Liabilities - Current Liabilities
    {
      id: 'led-pay-1',
      code: '2101',
      name: 'Accounts Payable / Creditors',
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
      openingBalance: 0,
      openingType: 'CR',
      currentBalance: 0,
      currentType: 'CR',
      isActive: true,
    },
    {
      id: 'led-pay-3',
      code: '2103',
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

    // Equity
    {
      id: 'led-eq-1',
      code: '3001',
      name: 'Profit & Loss Account',
      majorGroup: 'EQUITY',
      tier1: 'EQUITY_CAPITAL',
      tier2: 'RETAINED_EARNINGS_EQUITY',
      openingBalance: 0,
      openingType: 'CR',
      currentBalance: 0,
      currentType: 'CR',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'led-eq-2',
      code: '3002',
      name: 'Share Capital / Owner Equity',
      majorGroup: 'EQUITY',
      tier1: 'EQUITY_CAPITAL',
      tier2: 'RETAINED_EARNINGS_EQUITY',
      openingBalance: 0,
      openingType: 'CR',
      currentBalance: 0,
      currentType: 'CR',
      isActive: true,
    },

    // Income
    {
      id: 'led-inc-dir-1',
      code: '4101',
      name: 'Interest Income on Regular Loans',
      majorGroup: 'INCOME',
      tier1: 'DIRECT_INCOME',
      tier2: 'DIRECT_INCOME_OPERATING',
      openingBalance: 0,
      openingType: 'CR',
      currentBalance: 0,
      currentType: 'CR',
      isActive: true,
    },
    {
      id: 'led-inc-dir-2',
      code: '4102',
      name: 'Interest Income on Emergency Loans',
      majorGroup: 'INCOME',
      tier1: 'DIRECT_INCOME',
      tier2: 'DIRECT_INCOME_OPERATING',
      openingBalance: 0,
      openingType: 'CR',
      currentBalance: 0,
      currentType: 'CR',
      isActive: true,
    },
    {
      id: 'led-inc-ind-1',
      code: '4201',
      name: 'Admission & Membership Fees',
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

    // Expenses
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
      isActive: true,
    },
    {
      id: 'led-exp-dir-2',
      code: '5102',
      name: 'Meeting & Refreshment Expenses',
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
      id: 'led-exp-dir-3',
      code: '5103',
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
      id: 'led-exp-dir-4',
      code: '5104',
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
    {
      id: 'led-exp-ind-1',
      code: '5201',
      name: 'Bank Charges & Commissions',
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
}

/**
 * Loads isolated data set for a given company ID.
 */
export function loadCompanyDataset(companyId: string): {
  ledgers: LedgerAccount[];
  members: Member[];
  loans: Loan[];
  vouchers: Voucher[];
  users: UserAccount[];
} {
  try {
    const rawLedgers = localStorage.getItem(`sathi_data_${companyId}_ledgers`);
    const rawMembers = localStorage.getItem(`sathi_data_${companyId}_members`);
    const rawLoans = localStorage.getItem(`sathi_data_${companyId}_loans`);
    const rawVouchers = localStorage.getItem(`sathi_data_${companyId}_vouchers`);
    const rawUsers = localStorage.getItem(`sathi_data_${companyId}_users`);

    let ledgers: LedgerAccount[];
    let members: Member[];
    let loans: Loan[];
    let vouchers: Voucher[];
    let users: UserAccount[];

    if (rawLedgers) {
      ledgers = JSON.parse(rawLedgers);
    } else {
      // If default company comp-1, load initial seed, otherwise baseline
      ledgers = companyId === 'comp-1' ? INITIAL_LEDGERS : createCleanChartOfAccounts();
    }

    if (rawMembers) {
      members = JSON.parse(rawMembers);
    } else {
      members = companyId === 'comp-1' ? INITIAL_MEMBERS : [];
    }

    if (rawLoans) {
      loans = JSON.parse(rawLoans);
    } else {
      loans = companyId === 'comp-1' ? INITIAL_LOANS : [];
    }

    if (rawVouchers) {
      vouchers = JSON.parse(rawVouchers);
    } else {
      vouchers = companyId === 'comp-1' ? INITIAL_VOUCHERS : [];
    }

    if (rawUsers) {
      users = JSON.parse(rawUsers);
    } else {
      users = INITIAL_USERS;
    }

    return { ledgers, members, loans, vouchers, users };
  } catch (e) {
    console.error('Error loading company data:', e);
    return {
      ledgers: companyId === 'comp-1' ? INITIAL_LEDGERS : createCleanChartOfAccounts(),
      members: companyId === 'comp-1' ? INITIAL_MEMBERS : [],
      loans: companyId === 'comp-1' ? INITIAL_LOANS : [],
      vouchers: companyId === 'comp-1' ? INITIAL_VOUCHERS : [],
      users: INITIAL_USERS,
    };
  }
}

/**
 * Saves company-specific dataset to localStorage
 */
export function saveCompanyDataset(
  companyId: string,
  data: {
    ledgers?: LedgerAccount[];
    members?: Member[];
    loans?: Loan[];
    vouchers?: Voucher[];
    users?: UserAccount[];
  }
) {
  try {
    if (data.ledgers) {
      localStorage.setItem(`sathi_data_${companyId}_ledgers`, JSON.stringify(data.ledgers));
    }
    if (data.members) {
      localStorage.setItem(`sathi_data_${companyId}_members`, JSON.stringify(data.members));
    }
    if (data.loans) {
      localStorage.setItem(`sathi_data_${companyId}_loans`, JSON.stringify(data.loans));
    }
    if (data.vouchers) {
      localStorage.setItem(`sathi_data_${companyId}_vouchers`, JSON.stringify(data.vouchers));
    }
    if (data.users) {
      localStorage.setItem(`sathi_data_${companyId}_users`, JSON.stringify(data.users));
    }
  } catch (e) {
    console.error('Error saving company data:', e);
  }
}
