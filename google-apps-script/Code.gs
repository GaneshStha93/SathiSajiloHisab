/**
 * =========================================================================
 * SATHI SAJILO HISAB (साथी सजिलो हिसाब) - Google Apps Script Accounting Engine
 * Small Saving & Credit Group / Cooperative 25-Day Cycle ERP Solution
 * =========================================================================
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Delete any existing code, paste this entire file, and click "Save" (💾).
 * 3. Run the "initSathiSajiloHisab()" function once to auto-create all tabs,
 *    Chart of Accounts, Day Book, Vouchers, 7 Members, and Financial Statements.
 * 4. To enable monthly auto-posting of interest, run "installMonthlyInterestTrigger()".
 * 5. (Optional) Deploy as Web App (Deploy -> New Deployment -> Web app) to sync
 *    live with the Sathi Sajilo Hisab Web ERP!
 */

// Global Configuration
const APP_CONFIG = {
  GROUP_NAME: "Sathi Sajilo Hisab (साथी सजिलो हिसाब)",
  MEMBERS_COUNT: 7,
  DAILY_SAVING: 1000,
  COLLECTION_DAYS: 25,
  MONTHLY_SAVING_TARGET: 25000,
  STAFF_SALARY_MONTHLY: 5000,
  DEFAULT_LOAN_INTEREST_RATE: 12, // 12% p.a.
  EMERGENCY_LOAN_RATE: 15,        // 15% p.a.
};

/**
 * 1. Master Setup: Creates all sheets, structure, headers & initial Chart of Accounts
 */
function initSathiSajiloHisab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or retrieve sheets
  const sheets = {
    dashboard: getOrCreateSheet(ss, "Dashboard"),
    coa: getOrCreateSheet(ss, "Chart_of_Accounts"),
    dayBook: getOrCreateSheet(ss, "Day_Book"),
    vouchers: getOrCreateSheet(ss, "Vouchers"),
    members: getOrCreateSheet(ss, "Members_Directory"),
    loans: getOrCreateSheet(ss, "Loan_Amortization"),
    pnl: getOrCreateSheet(ss, "Profit_and_Loss"),
    balanceSheet: getOrCreateSheet(ss, "Balance_Sheet"),
    memberReport: getOrCreateSheet(ss, "Memberwise_Report"),
  };

  setupChartOfAccounts(sheets.coa);
  setupMembersSheet(sheets.members);
  setupDayBookSheet(sheets.dayBook);
  setupVouchersSheet(sheets.vouchers);
  setupLoanAmortizationSheet(sheets.loans);
  setupDashboardSheet(sheets.dashboard);
  setupFinancialStatements(sheets.pnl, sheets.balanceSheet);
  setupMemberwiseReport(sheets.memberReport);

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert("🎉 Sathi Sajilo Hisab ERP initialized successfully with 25-Day Cycle Rules, Chart of Accounts, and 7-Member Circle!");
}

/**
 * Helper to get or create sheet
 */
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * 2. Chart of Accounts Master Setup
 */
function setupChartOfAccounts(sheet) {
  sheet.clear();
  sheet.setTabColor("#2563EB");
  
  const headers = [
    ["Chart of Accounts Master (CoA) - Sathi Sajilo Hisab"],
    ["Account Code", "Ledger Name", "Major Group", "Tier 1 Subgroup", "Tier 2 Subgroup", "Opening Balance", "Opening Type (DR/CR)", "Current Balance", "Description"]
  ];
  
  sheet.getRange("A1:I1").merge().setValue(headers[0][0])
    .setBackground("#1E3A8A").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");
    
  sheet.getRange("A2:I2").setValues([headers[1]])
    .setBackground("#3B82F6").setFontColor("#FFFFFF").setFontWeight("bold");

  const coaData = [
    // Non-Current Assets - Fixed Assets
    ["1010", "Furniture & Fixtures", "ASSETS", "NON_CURRENT_ASSETS", "FIXED_ASSETS", 35000, "DR", "=F3", "Office desk & chairs"],
    ["1020", "Computer Equipment's", "ASSETS", "NON_CURRENT_ASSETS", "FIXED_ASSETS", 50000, "DR", "=F4", "Laptop & printer"],
    ["1030", "Other Fixed Assets", "ASSETS", "NON_CURRENT_ASSETS", "FIXED_ASSETS", 0, "DR", "=F5", ""],
    
    // Current Assets - Cash & Bank
    ["1101", "Cash in Hand", "ASSETS", "CURRENT_ASSETS", "CASH_AND_BANK", 125000, "DR", "=F6", "Vault Cash"],
    ["1102", "Nabil Bank Ltd", "ASSETS", "CURRENT_ASSETS", "CASH_AND_BANK", 240000, "DR", "=F7", "A/C: 0100234"],
    ["1103", "Global IME Bank", "ASSETS", "CURRENT_ASSETS", "CASH_AND_BANK", 0, "DR", "=F8", ""],
    
    // Current Assets - Receivables
    ["1201", "Interest Receivable on Loans", "ASSETS", "CURRENT_ASSETS", "RECEIVABLES", 0, "DR", "=F9", "Accrued interest"],
    ["1202", "Other Receivables & Advances", "ASSETS", "CURRENT_ASSETS", "RECEIVABLES", 5000, "DR", "=F10", ""],
    
    // Current Assets - Loan & Advances (Regular Loans)
    ["1301", "Regular Loan - Bikram Adhikari", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 100000, "DR", "=F11", "Member 1 Regular Loan"],
    ["1302", "Regular Loan - Suresh Shrestha", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 50000, "DR", "=F12", "Member 2 Regular Loan"],
    ["1303", "Regular Loan - Prakash Thapa", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F13", "Member 3 Regular Loan"],
    ["1304", "Regular Loan - Dipendra Karki", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F14", "Member 4 Regular Loan"],
    ["1305", "Regular Loan - Ramesh Sharma", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F15", "Member 5 Regular Loan"],
    ["1306", "Regular Loan - Anil Gurung", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F16", "Member 6 Regular Loan"],
    ["1307", "Regular Loan - Kiran Maharjan", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F17", "Member 7 Regular Loan"],
    
    // Current Assets - Other Current Assets (Emergency Loans)
    ["1401", "Emergency Loan - Prakash Thapa", "ASSETS", "CURRENT_ASSETS", "OTHER_CURRENT_ASSETS", 30000, "DR", "=F18", "Short-term Emergency"],
    
    // Current Assets - Investment
    ["1501", "Investment in Local Cafe Project", "ASSETS", "CURRENT_ASSETS", "INVESTMENT", 150000, "DR", "=F19", "Cafe business venture"],
    ["1502", "Investment in Real Estate Land", "ASSETS", "CURRENT_ASSETS", "INVESTMENT", 0, "DR", "=F20", ""],
    
    // Liabilities - Current Liabilities - Payables
    ["2101", "Sundry Creditors", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 0, "CR", "=F21", ""],
    ["2102", "Staff Salary Payable", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 5000, "CR", "=F22", "Monthly staff salary Rs 5,000"],
    ["2103", "Meeting Expenses Payables", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 0, "CR", "=F23", "26th-end meeting fund"],
    ["2104", "Audit Fees Payable", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 0, "CR", "=F24", ""],
    
    // Liabilities - Current Liabilities - Members Deposit (25k/mo)
    ["2201", "Member Saving Deposit - Bikram Adhikari", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F25", "Monthly Rs 1,000 x 25 days"],
    ["2202", "Member Saving Deposit - Suresh Shrestha", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F26", "Monthly Rs 1,000 x 25 days"],
    ["2203", "Member Saving Deposit - Prakash Thapa", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F27", "Monthly Rs 1,000 x 25 days"],
    ["2204", "Member Saving Deposit - Dipendra Karki", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F28", "Monthly Rs 1,000 x 25 days"],
    ["2205", "Member Saving Deposit - Ramesh Sharma", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F29", "Monthly Rs 1,000 x 25 days"],
    ["2206", "Member Saving Deposit - Anil Gurung", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F30", "Monthly Rs 1,000 x 25 days"],
    ["2207", "Member Saving Deposit - Kiran Maharjan", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F31", "Monthly Rs 1,000 x 25 days"],
    
    // Equity
    ["3001", "Profit & Loss Account", "EQUITY", "EQUITY_CAPITAL", "RETAINED_EARNINGS_EQUITY", 175000, "CR", "=F32", "Retained Surplus"],
    
    // Income - Direct & Indirect
    ["4101", "Interest on Regular Loan to Members", "INCOME", "DIRECT_INCOME", "DIRECT_INCOME_OPERATING", 0, "CR", "=F33", "25-Day interest rule"],
    ["4102", "Interest on Emergency Loan to Members", "INCOME", "DIRECT_INCOME", "DIRECT_INCOME_OPERATING", 0, "CR", "=F34", "Emergency loan interest"],
    ["4103", "Interest on Bank Deposit", "INCOME", "DIRECT_INCOME", "DIRECT_INCOME_OPERATING", 0, "CR", "=F35", ""],
    ["4201", "Donation Received", "INCOME", "INDIRECT_INCOME", "INDIRECT_INCOME_OTHER", 0, "CR", "=F36", ""],
    ["4202", "Coupon Sales", "INCOME", "INDIRECT_INCOME", "INDIRECT_INCOME_OTHER", 0, "CR", "=F37", ""],
    
    // Expenses - Direct & Indirect
    ["5101", "Staff Salary", "EXPENSES", "DIRECT_EXPENSES", "DIRECT_EXPENSES_OPERATING", 0, "DR", "=F38", "Rs 5,000 monthly"],
    ["5102", "Meeting Expenses", "EXPENSES", "DIRECT_EXPENSES", "DIRECT_EXPENSES_OPERATING", 0, "DR", "=F39", "26th-end cycle meetings"],
    ["5103", "Outdoor Picnic Expenses", "EXPENSES", "DIRECT_EXPENSES", "DIRECT_EXPENSES_OPERATING", 0, "DR", "=F40", ""],
    ["5104", "Printing & Stationery", "EXPENSES", "DIRECT_EXPENSES", "DIRECT_EXPENSES_OPERATING", 0, "DR", "=F41", ""],
    ["5105", "Audit Fees", "EXPENSES", "DIRECT_EXPENSES", "DIRECT_EXPENSES_OPERATING", 0, "DR", "=F42", ""],
    ["5201", "Donation Expenses", "EXPENSES", "INDIRECT_EXPENSES", "INDIRECT_EXPENSES_OTHER", 0, "DR", "=F43", ""],
    ["5202", "Bank Charges", "EXPENSES", "INDIRECT_EXPENSES", "INDIRECT_EXPENSES_OTHER", 0, "DR", "=F44", ""]
  ];

  sheet.getRange(3, 1, coaData.length, coaData[0].length).setValues(coaData);
  sheet.autoResizeColumns(1, 9);
}

/**
 * 3. Members Directory Setup (7 Friends Circle)
 */
function setupMembersSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#059669");
  
  sheet.getRange("A1:H1").merge().setValue("Members Directory - Sathi Sajilo Hisab (7 Friends Circle)")
    .setBackground("#065F46").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");
    
  const headers = ["Member No", "Member Name (English)", "Nepali Name", "Phone", "Daily Rate (NPR)", "Days/Month", "Monthly Target (NPR)", "Total Deposit Balance"];
  sheet.getRange("A2:H2").setValues([headers]).setBackground("#10B981").setFontColor("#FFFFFF").setFontWeight("bold");

  const members = [
    ["SSH-001", "Bikram Adhikari", "बिक्रम अधिकारी", "9841234561", 1000, 25, "=E3*F3", 75000],
    ["SSH-002", "Suresh Shrestha", "सुरेश श्रेष्ठ", "9841234562", 1000, 25, "=E4*F4", 75000],
    ["SSH-003", "Prakash Thapa", "प्रकाश थापा", "9841234563", 1000, 25, "=E5*F5", 75000],
    ["SSH-004", "Dipendra Karki", "दिपेन्द्र कार्की", "9841234564", 1000, 25, "=E6*F6", 75000],
    ["SSH-005", "Ramesh Sharma", "रमेश शर्मा", "9841234565", 1000, 25, "=E7*F7", 75000],
    ["SSH-006", "Anil Gurung", "अनिल गुरुङ", "9841234566", 1000, 25, "=E8*F8", 75000],
    ["SSH-007", "Kiran Maharjan", "किरण महर्जन", "9841234567", 1000, 25, "=E9*F9", 75000]
  ];

  sheet.getRange(3, 1, members.length, members[0].length).setValues(members);
  sheet.autoResizeColumns(1, 8);
}

/**
 * 4. Day Book Setup
 */
function setupDayBookSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#D97706");
  
  sheet.getRange("A1:I1").merge().setValue("Day Book (दैनिक खाता) - Real-time Journal & Transaction Register")
    .setBackground("#78350F").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const headers = ["Voucher No", "Type", "Date (BS)", "Date (AD)", "Ledger Account", "Debit (DR)", "Credit (CR)", "Narration", "Created By"];
  sheet.getRange("A2:I2").setValues([headers]).setBackground("#F59E0B").setFontColor("#FFFFFF").setFontWeight("bold");

  const sampleEntries = [
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Cash in Hand", 175000, 0, "25-Day monthly saving from 7 members (25k each)", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Bikram Adhikari", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Suresh Shrestha", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Prakash Thapa", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Dipendra Karki", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Ramesh Sharma", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Anil Gurung", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Kiran Maharjan", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["PMT-2081-001", "PAYMENT", "2081-01-26", "2024-05-08", "Staff Salary", 5000, 0, "Monthly staff remuneration", "Treasurer"],
    ["PMT-2081-001", "PAYMENT", "2081-01-26", "2024-05-08", "Cash in Hand", 0, 5000, "Paid via cash", "Treasurer"],
    ["PMT-2081-002", "PAYMENT", "2081-01-28", "2024-05-10", "Meeting Expenses", 2200, 0, "Monthly gathering refreshments", "Secretary"],
    ["PMT-2081-002", "PAYMENT", "2081-01-28", "2024-05-10", "Cash in Hand", 0, 2200, "Paid via cash", "Secretary"]
  ];

  sheet.getRange(3, 1, sampleEntries.length, sampleEntries[0].length).setValues(sampleEntries);
  sheet.autoResizeColumns(1, 9);
}

/**
 * 4b. Vouchers Master Register Setup
 */
function setupVouchersSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#EA580C");
  
  sheet.getRange("A1:H1").merge().setValue("Voucher Master Register (भौचर सूची) - Sathi Sajilo Hisab")
    .setBackground("#9A3412").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const headers = ["Voucher No", "Voucher Type", "Date (BS)", "Date (AD)", "Total Amount (NPR)", "Narration", "Status", "Prepared By"];
  sheet.getRange("A2:H2").setValues([headers]).setBackground("#F97316").setFontColor("#FFFFFF").setFontWeight("bold");

  const voucherList = [
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", 175000, "25-Day monthly collection from 7 members (25,000 each)", "POSTED", "Staff Accountant"],
    ["PMT-2081-001", "PAYMENT", "2081-01-26", "2024-05-08", 5000, "Monthly staff remuneration for Baisakh", "POSTED", "Treasurer"],
    ["PMT-2081-002", "PAYMENT", "2081-01-28", "2024-05-10", 2200, "Monthly gathering refreshments & meeting tea", "POSTED", "Secretary"],
    ["JRN-2081-001", "JOURNAL", "2081-01-25", "2024-05-07", 1233, "25-Day loan interest accrual posting", "POSTED", "Auto-Trigger"]
  ];

  sheet.getRange(3, 1, voucherList.length, voucherList[0].length).setValues(voucherList);
  sheet.autoResizeColumns(1, 8);
}

/**
 * 5. Parameter-Based Loan Amortization Table Setup & Generator
 * Parameters: Loan Amount, Interest Rate (% p.a.), EMI Amount, Loan Period (Months)
 */
function setupLoanAmortizationSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#7C3AED");

  sheet.getRange("A1:H1").merge().setValue("Loan Amortization Schedule (Standard Parameter Calculator)")
    .setBackground("#4C1D95").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  // Input Parameters Card
  sheet.getRange("A2:B2").merge().setValue("LOAN PARAMETERS").setBackground("#6D28D9").setFontColor("#FFFFFF").setFontWeight("bold");
  sheet.getRange("A3").setValue("Borrower Member:"); sheet.getRange("B3").setValue("Bikram Adhikari (SSH-001)");
  sheet.getRange("A4").setValue("Loan Type:"); sheet.getRange("B4").setValue("REGULAR");
  sheet.getRange("A5").setValue("Loan Amount (Principal):"); sheet.getRange("B5").setValue(100000);
  sheet.getRange("A6").setValue("Interest Rate (% p.a.):"); sheet.getRange("B6").setValue(12);
  sheet.getRange("A7").setValue("Loan Period (Months):"); sheet.getRange("B7").setValue(12);
  sheet.getRange("A8").setValue("Monthly EMI Amount:"); sheet.getRange("B8").setValue("=ROUND(PMT(B6%/12*(25/25), B7, -B5), 0)");
  sheet.getRange("A9").setValue("Calculation Rule:"); sheet.getRange("B9").setValue("25-Days Collection Cycle");

  // Table Headers
  const tableHeaders = ["Month", "Period Label", "Due Date (BS)", "Opening Balance", "Principal Due", "Interest Due (25-Day)", "Total EMI", "Closing Balance", "Auto-Post Status"];
  sheet.getRange("D2:L2").setValues([tableHeaders]).setBackground("#8B5CF6").setFontColor("#FFFFFF").setFontWeight("bold");

  // Generate 12 sample rows
  const schedule = [
    [1, "Month 1 (Baisakh)", "2081-01-25", 100000, 7885, "=ROUND((D3*$B$6%*25)/365, 0)", "=E3+F3", "=D3-E3", "POSTED"],
    [2, "Month 2 (Jestha)", "2081-02-25", "=H3", 7949, "=ROUND((D4*$B$6%*25)/365, 0)", "=E4+F4", "=D4-E4", "POSTED"],
    [3, "Month 3 (Ashadh)", "2081-03-25", "=H4", 8014, "=ROUND((D5*$B$6%*25)/365, 0)", "=E5+F5", "=D5-E5", "PENDING"],
    [4, "Month 4 (Shrawan)", "2081-04-25", "=H5", 8080, "=ROUND((D6*$B$6%*25)/365, 0)", "=E6+F6", "=D6-E6", "PENDING"],
    [5, "Month 5 (Bhadra)", "2081-05-25", "=H6", 8146, "=ROUND((D7*$B$6%*25)/365, 0)", "=E7+F7", "=D7-E7", "PENDING"],
    [6, "Month 6 (Ashwin)", "2081-06-25", "=H7", 8213, "=ROUND((D8*$B$6%*25)/365, 0)", "=E8+F8", "=D8-E8", "PENDING"],
    [7, "Month 7 (Kartik)", "2081-07-25", "=H8", 8280, "=ROUND((D9*$B$6%*25)/365, 0)", "=E9+F9", "=D9-E9", "PENDING"],
    [8, "Month 8 (Mangsir)", "2081-08-25", "=H9", 8348, "=ROUND((D10*$B$6%*25)/365, 0)", "=E10+F10", "=D10-E10", "PENDING"],
    [9, "Month 9 (Poush)", "2081-09-25", "=H10", 8416, "=ROUND((D11*$B$6%*25)/365, 0)", "=E11+F11", "=D11-E11", "PENDING"],
    [10, "Month 10 (Magh)", "2081-10-25", "=H11", 8485, "=ROUND((D12*$B$6%*25)/365, 0)", "=E12+F12", "=D12-E12", "PENDING"],
    [11, "Month 11 (Falgun)", "2081-11-25", "=H12", 8555, "=ROUND((D13*$B$6%*25)/365, 0)", "=E13+F13", "=D13-E13", "PENDING"],
    [12, "Month 12 (Chaitra)", "2081-12-25", "=H13", "=D14", "=ROUND((D14*$B$6%*25)/365, 0)", "=E14+F14", "=D14-E14", "PENDING"]
  ];

  sheet.getRange(3, 4, schedule.length, schedule[0].length).setValues(schedule);
  sheet.autoResizeColumns(1, 12);
}

/**
 * 6. Financial Statements Setup (Profit & Loss and Balance Sheet)
 */
function setupFinancialStatements(pnlSheet, bsSheet) {
  // P&L Sheet
  pnlSheet.clear();
  pnlSheet.setTabColor("#DC2626");
  pnlSheet.getRange("A1:D1").merge().setValue("Profit & Loss Statement (नाफा नोक्सान हिसाब) - Sathi Sajilo Hisab")
    .setBackground("#991B1B").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");
    
  const pnlHeaders = ["Particulars (Income)", "Amount (NPR)", "Particulars (Expenses)", "Amount (NPR)"];
  pnlSheet.getRange("A2:D2").setValues([pnlHeaders]).setBackground("#EF4444").setFontColor("#FFFFFF").setFontWeight("bold");

  const pnlData = [
    ["Interest on Regular Loans", 12000, "Staff Salary (5,000 x 12 mo)", 60000],
    ["Interest on Emergency Loans", 4500, "Monthly Meeting Refreshments", 26400],
    ["Interest on Bank Deposit", 14500, "Printing, Passbooks & Stationery", 3500],
    ["Donations Received", 5000, "Audit & Legal Compliance Fees", 5000],
    ["Coupon & Token Sales", 12000, "Bank Service Charges", 850],
    ["Total Operating Income", "=SUM(B3:B7)", "Total Operating Expenses", "=SUM(D3:D7)"],
    ["", "", "Net Surplus / (Deficit)", "=B8-D8"]
  ];
  pnlSheet.getRange(3, 1, pnlData.length, pnlData[0].length).setValues(pnlData);
  pnlSheet.getRange("C9:D9").setBackground("#FEF3C7").setFontWeight("bold");
  pnlSheet.autoResizeColumns(1, 4);

  // Balance Sheet (वासलात)
  bsSheet.clear();
  bsSheet.setTabColor("#4F46E5");
  bsSheet.getRange("A1:D1").merge().setValue("Balance Sheet (वासलात) - Sathi Sajilo Hisab")
    .setBackground("#312E81").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const bsHeaders = ["Liabilities & Equity", "Amount (NPR)", "Assets", "Amount (NPR)"];
  bsSheet.getRange("A2:D2").setValues([bsHeaders]).setBackground("#6366F1").setFontColor("#FFFFFF").setFontWeight("bold");

  const bsData = [
    ["1. Members Saving Deposits (7 x 75k)", 525000, "1. Fixed Assets (Furniture & PC)", 85000],
    ["2. Staff Salary & Payables", 5000, "2. Cash in Hand (Vault)", 125000],
    ["3. Retained Surplus & Equity Capital", 175000, "3. Bank Accounts (Nabil & Global)", 240000],
    ["4. Current Year Net Surplus", "='Profit_and_Loss'!D9", "4. Regular Loans to Members", 150000],
    ["", "", "5. Emergency Loans to Members", 30000],
    ["", "", "6. Investments (Cafe & Projects)", 150000],
    ["TOTAL LIABILITIES & EQUITY", "=SUM(B3:B6)", "TOTAL ASSETS", "=SUM(D3:D8)"]
  ];
  bsSheet.getRange(3, 1, bsData.length, bsData[0].length).setValues(bsData);
  bsSheet.getRange("A9:D9").setBackground("#E0E7FF").setFontWeight("bold");
  bsSheet.autoResizeColumns(1, 4);
}

/**
 * 7. 7-Member Columnar Matrix Report (25-Day Cycle Target: 25k/mo)
 */
function setupMemberwiseReport(sheet) {
  sheet.clear();
  sheet.setTabColor("#0D9488");
  sheet.getRange("A1:I1").merge().setValue("7-Members 25-Day Columnar Matrix & Monthly Passbook Summary")
    .setBackground("#115E59").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const headers = ["S.N.", "Member Name", "Daily Rate", "25-Day Target", "Deposit Collected", "Regular Loan Bal", "25-Day Interest (12%)", "Emergency Loan Bal", "Total Monthly Dues"];
  sheet.getRange("A2:I2").setValues([headers]).setBackground("#14B8A6").setFontColor("#FFFFFF").setFontWeight("bold");

  const matrixData = [
    [1, "Bikram Adhikari", 1000, 25000, 25000, 100000, 822, 0, 33707],
    [2, "Suresh Shrestha", 1000, 25000, 25000, 50000, 411, 0, 29353],
    [3, "Prakash Thapa", 1000, 25000, 25000, 0, 0, 30000, 35308],
    [4, "Dipendra Karki", 1000, 25000, 25000, 0, 0, 0, 25000],
    [5, "Ramesh Sharma", 1000, 25000, 25000, 0, 0, 0, 25000],
    [6, "Anil Gurung", 1000, 25000, 25000, 0, 0, 0, 25000],
    [7, "Kiran Maharjan", 1000, 25000, 25000, 0, 0, 0, 25000]
  ];

  sheet.getRange(3, 1, matrixData.length, matrixData[0].length).setValues(matrixData);
  
  // Total Row
  sheet.getRange("A10:B10").merge().setValue("GROUP TOTALS (7 MEMBERS):").setFontWeight("bold");
  sheet.getRange("C10").setValue("Rs 7,000/day");
  sheet.getRange("D10").setValue("=SUM(D3:D9)");
  sheet.getRange("E10").setValue("=SUM(E3:E9)");
  sheet.getRange("F10").setValue("=SUM(F3:F9)");
  sheet.getRange("G10").setValue("=SUM(G3:G9)");
  sheet.getRange("H10").setValue("=SUM(H3:H9)");
  sheet.getRange("I10").setValue("=SUM(I3:I9)");
  sheet.getRange("A10:I10").setBackground("#CCFBF1").setFontWeight("bold");
  sheet.autoResizeColumns(1, 9);
}

/**
 * 8. Dashboard Overview Setup
 */
function setupDashboardSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#1F2937");
  sheet.getRange("A1:G1").merge().setValue("Sathi Sajilo Hisab (साथी सजिलो हिसाब) - Real-time ERP Dashboard")
    .setBackground("#111827").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  // KPI Summary Cards
  sheet.getRange("A3:B3").merge().setValue("TOTAL GROUP SAVING").setBackground("#374151").setFontColor("#FFFFFF").setFontWeight("bold");
  sheet.getRange("A4:B4").merge().setValue("=SUM('Members_Directory'!H3:H9)").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");

  sheet.getRange("C3:D3").merge().setValue("CASH & BANK BALANCE").setBackground("#1E40AF").setFontColor("#FFFFFF").setFontWeight("bold");
  sheet.getRange("C4:D4").merge().setValue("='Balance_Sheet'!D4+'Balance_Sheet'!D5").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");

  sheet.getRange("E3:F3").merge().setValue("OUTSTANDING LOANS").setBackground("#5B21B6").setFontColor("#FFFFFF").setFontWeight("bold");
  sheet.getRange("E4:F4").merge().setValue("='Balance_Sheet'!D6+'Balance_Sheet'!D7").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");

  sheet.getRange("G3:G3").setValue("ACTIVE MEMBERS").setBackground("#065F46").setFontColor("#FFFFFF").setFontWeight("bold");
  sheet.getRange("G4:G4").setValue("=COUNTA('Members_Directory'!A3:A9)").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");

  sheet.autoResizeColumns(1, 7);
}

/**
 * 9. Automated Trigger: Calculate & Post 25-Day Loan Interest
 */
function autoPost25DayLoanInterest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dayBook = ss.getSheetByName("Day_Book");
  const loansSheet = ss.getSheetByName("Loan_Amortization");

  if (!dayBook || !loansSheet) return;

  const principal = loansSheet.getRange("B5").getValue();
  const rate = loansSheet.getRange("B6").getValue();
  const borrower = loansSheet.getRange("B3").getValue();

  // 25-Day Formula: (Principal * Rate% * 25) / 365
  const interestAmount = Math.round((principal * (rate / 100) * 25) / 365);
  const todayStr = Utilities.formatDate(new Date(), "Asia/Kathmandu", "yyyy-MM-dd");

  const voucherNo = "JRN-" + Utilities.formatDate(new Date(), "Asia/Kathmandu", "yyyyMM") + "-01";

  // Double entry: DR Interest Receivable, CR Interest Income
  dayBook.appendRow([voucherNo, "JOURNAL", "2081-BS", todayStr, "Interest Receivable on Loans", interestAmount, 0, "25-Day loan interest accrued for " + borrower, "Auto Trigger"]);
  dayBook.appendRow([voucherNo, "JOURNAL", "2081-BS", todayStr, "Interest on Regular Loan to Members", 0, interestAmount, "25-Day loan interest revenue (12% p.a.)", "Auto Trigger"]);

  SpreadsheetApp.flush();
}

/**
 * 10. Install Monthly Auto Trigger (Runs on the 25th of every month)
 */
function installMonthlyInterestTrigger() {
  // Clear existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "autoPost25DayLoanInterest") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create monthly trigger
  ScriptApp.newTrigger("autoPost25DayLoanInterest")
    .timeBased()
    .onMonthDay(25)
    .atHour(17)
    .create();

  SpreadsheetApp.getUi().alert("✅ 25-Day Auto-Posting Trigger installed! Interest journals will post automatically on the 25th of every month at 5:00 PM.");
}

/**
 * 11. Web App API: Handles live JSON requests from Sathi Sajilo Hisab Web App
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const members = ss.getSheetByName("Members_Directory").getDataRange().getValues();
  const coa = ss.getSheetByName("Chart_of_Accounts").getDataRange().getValues();

  const response = {
    status: "success",
    timestamp: new Date().toISOString(),
    group: APP_CONFIG.GROUP_NAME,
    membersCount: members.length - 2,
    chartOfAccountsCount: coa.length - 2
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dayBook = ss.getSheetByName("Day_Book");

    if (postData.action === "ADD_VOUCHER" && postData.entries) {
      postData.entries.forEach(entry => {
        dayBook.appendRow([
          postData.voucherNo,
          postData.voucherType,
          postData.dateBS,
          postData.dateAD,
          entry.ledgerName,
          entry.drAmount || 0,
          entry.crAmount || 0,
          postData.narration,
          postData.createdBy || "API Sync"
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Voucher posted to Day Book" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored", message: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
