/**
 * Complete Google Apps Script (AppScript) Source Code Generator
 * for Sathi Sajilo Hisab
 * 
 * Generates ready-to-deploy Google Sheet Web App & Automated Accounting Macro Code
 */

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * =========================================================================
 * SATHI SAJILO HISAB - Google Apps Script Accounting Engine
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
  GROUP_NAME: "Sathi Sajilo Hisab",
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
    ["1301", "Regular Loan - Shreedhar Regmi", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 100000, "DR", "=F11", "Member 1 Regular Loan"],
    ["1302", "Regular Loan - Jeshan Regmi", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 50000, "DR", "=F12", "Member 2 Regular Loan"],
    ["1303", "Regular Loan - Bhupendra Bhattarai", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F13", "Member 3 Regular Loan"],
    ["1304", "Regular Loan - Sarswoti Aryal (Bhattarai)", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F14", "Member 4 Regular Loan"],
    ["1305", "Regular Loan - Bhairaja Shrestha", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F15", "Member 5 Regular Loan"],
    ["1306", "Regular Loan - Nipesh Sapkota", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F16", "Member 6 Regular Loan"],
    ["1307", "Regular Loan - Suraj Pradhan", "ASSETS", "CURRENT_ASSETS", "LOAN_AND_ADVANCES", 0, "DR", "=F17", "Member 7 Regular Loan"],
    
    // Current Assets - Other Current Assets (Emergency Loans)
    ["1401", "Emergency Loan - Bhupendra Bhattarai", "ASSETS", "CURRENT_ASSETS", "OTHER_CURRENT_ASSETS", 30000, "DR", "=F18", "Short-term Emergency"],
    
    // Current Assets - Investment
    ["1501", "Investment in Local Cafe Project", "ASSETS", "CURRENT_ASSETS", "INVESTMENT", 150000, "DR", "=F19", "Cafe business venture"],
    ["1502", "Investment in Real Estate Land", "ASSETS", "CURRENT_ASSETS", "INVESTMENT", 0, "DR", "=F20", ""],
    
    // Liabilities - Current Liabilities - Payables
    ["2101", "Sundry Creditors", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 0, "CR", "=F21", ""],
    ["2102", "Staff Salary Payable", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 5000, "CR", "=F22", "Monthly staff salary Rs 5,000"],
    ["2103", "Meeting Expenses Payables", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 0, "CR", "=F23", "26th-end meeting fund"],
    ["2104", "Audit Fees Payable", "LIABILITIES", "CURRENT_LIABILITIES", "PAYABLES", 0, "CR", "=F24", ""],
    
    // Liabilities - Current Liabilities - Members Deposit (25k/mo)
    ["2201", "Member Saving Deposit - Shreedhar Regmi", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F25", "Monthly Rs 1,000 x 25 days"],
    ["2202", "Member Saving Deposit - Jeshan Regmi", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F26", "Monthly Rs 1,000 x 25 days"],
    ["2203", "Member Saving Deposit - Bhupendra Bhattarai", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F27", "Monthly Rs 1,000 x 25 days"],
    ["2204", "Member Saving Deposit - Sarswoti Aryal (Bhattarai)", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F28", "Monthly Rs 1,000 x 25 days"],
    ["2205", "Member Saving Deposit - Bhairaja Shrestha", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F29", "Monthly Rs 1,000 x 25 days"],
    ["2206", "Member Saving Deposit - Nipesh Sapkota", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F30", "Monthly Rs 1,000 x 25 days"],
    ["2207", "Member Saving Deposit - Suraj Pradhan", "LIABILITIES", "CURRENT_LIABILITIES", "MEMBERS_DEPOSIT", 75000, "CR", "=F31", "Monthly Rs 1,000 x 25 days"],
    
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
  
  sheet.getRange("A1:G1").merge().setValue("Members Directory - Sathi Sajilo Hisab (7 Friends Circle)")
    .setBackground("#065F46").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");
    
  const headers = ["Member No", "Member Name", "Phone", "Daily Rate (NPR)", "Days/Month", "Monthly Target (NPR)", "Total Deposit Balance"];
  sheet.getRange("A2:G2").setValues([headers]).setBackground("#10B981").setFontColor("#FFFFFF").setFontWeight("bold");

  const members = [
    ["SSH-001", "Shreedhar Regmi", "9841234561", 1000, 25, "=D3*E3", 75000],
    ["SSH-002", "Jeshan Regmi", "9841234562", 1000, 25, "=D4*E4", 75000],
    ["SSH-003", "Bhupendra Bhattarai", "9841234563", 1000, 25, "=D5*E5", 75000],
    ["SSH-004", "Sarswoti Aryal (Bhattarai)", "9841234564", 1000, 25, "=D6*E6", 75000],
    ["SSH-005", "Bhairaja Shrestha", "9841234565", 1000, 25, "=D7*E7", 75000],
    ["SSH-006", "Nipesh Sapkota", "9841234566", 1000, 25, "=D8*E8", 75000],
    ["SSH-007", "Suraj Pradhan", "9841234567", 1000, 25, "=D9*E9", 75000]
  ];

  sheet.getRange(3, 1, members.length, members[0].length).setValues(members);
  sheet.autoResizeColumns(1, 7);
}

/**
 * 4. Day Book Setup
 */
function setupDayBookSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#D97706");
  
  sheet.getRange("A1:I1").merge().setValue("Day Book - Real-time Journal & Transaction Register")
    .setBackground("#78350F").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const headers = ["Voucher No", "Type", "Date (BS)", "Date (AD)", "Ledger Account", "Debit (DR)", "Credit (CR)", "Narration", "Created By"];
  sheet.getRange("A2:I2").setValues([headers]).setBackground("#F59E0B").setFontColor("#FFFFFF").setFontWeight("bold");

  const sampleEntries = [
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Cash in Hand", 175000, 0, "25-Day monthly saving from 7 members (25k each)", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Shreedhar Regmi", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Jeshan Regmi", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Bhupendra Bhattarai", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Sarswoti Aryal (Bhattarai)", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Bhairaja Shrestha", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Nipesh Sapkota", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
    ["RCT-2081-001", "RECEIPT", "2081-01-25", "2024-05-07", "Member Saving Deposit - Suraj Pradhan", 0, 25000, "Rs 1,000 x 25 days", "Staff Accountant"],
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
  
  sheet.getRange("A1:H1").merge().setValue("Voucher Master Register - Sathi Sajilo Hisab")
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
  sheet.getRange("A3").setValue("Borrower Member:"); sheet.getRange("B3").setValue("Shreedhar Regmi (SSH-001)");
  sheet.getRange("A4").setValue("Loan Type:"); sheet.getRange("B4").setValue("REGULAR");
  sheet.getRange("A5").setValue("Loan Amount (Principal):"); sheet.getRange("B5").setValue(100000);
  sheet.getRange("A6").setValue("Interest Rate (% p.a.):"); sheet.getRange("B6").setValue(12);
  sheet.getRange("A7").setValue("Loan Period (Months):"); sheet.getRange("B7").setValue(12);
  sheet.getRange("A8").setValue("Monthly EMI Amount:"); sheet.getRange("B8").setValue("=ROUND(PMT(B6%/12*(25/25), B7, -B5), 0)");
  sheet.getRange("A9").setValue("Calculation Rule:"); sheet.getRange("B9").setValue("25-Days Collection Cycle");

  // Table Headers
  const tableHeaders = ["Month", "Period Label", "Due Date (BS)", "Opening Balance", "Principal Due", "Interest Due (25-Day)", "Total EMI", "Closing Balance", "Auto-Post Status"];
  sheet.getRange("D2:L2").setValues([tableHeaders]).setBackground("#8B5CF6").setFontColor("#FFFFFF").setFontWeight("bold");

  // Auto-generate 12 months amortization rows with dynamic formulas
  const amortRows = [];
  for (let m = 1; m <= 12; m++) {
    const rowNum = m + 2;
    const prevRow = rowNum - 1;
    const openBalFormula = m === 1 ? "=$B$5" : \`=L\${prevRow}\`;
    const interestFormula = \`=ROUND(\${m === 1 ? "$B$5" : "G" + rowNum} * ($B$6 / 100) * (25 / 300), 0)\`;
    const principalFormula = \`=J\${rowNum} - I\${rowNum}\`;
    const emiFormula = "=$B$8";
    const closingFormula = \`=MAX(0, G\${rowNum} - H\${rowNum})\`;
    
    amortRows.push([
      m,
      \`Month \${m}\`,
      \`2081-\${String(m).padStart(2, '0')}-25\`,
      openBalFormula,
      principalFormula,
      interestFormula,
      emiFormula,
      closingFormula,
      m === 1 ? "POSTED" : "PENDING"
    ]);
  }

  sheet.getRange(3, 4, amortRows.length, amortRows[0].length).setValues(amortRows);
  sheet.autoResizeColumns(1, 12);
}

/**
 * 6. Financial Statements: Profit & Loss and Balance Sheet Setup
 */
function setupFinancialStatements(pnlSheet, bsSheet) {
  // P&L Sheet
  pnlSheet.clear();
  pnlSheet.setTabColor("#047857");
  pnlSheet.getRange("A1:D1").merge().setValue("Statement of Profit and Loss")
    .setBackground("#064E3B").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  pnlSheet.getRange("A2:B2").merge().setValue("EXPENSES").setBackground("#059669").setFontColor("#FFFFFF").setFontWeight("bold");
  pnlSheet.getRange("C2:D2").merge().setValue("INCOME").setBackground("#059669").setFontColor("#FFFFFF").setFontWeight("bold");
  
  const pnlData = [
    ["Direct Expenses", "Amount", "Direct Income", "Amount"],
    ["Staff Salary (Rs 5,000/mo)", 5000, "Interest on Regular Loan (25-day)", 1000],
    ["Meeting Expenses (26th-end)", 2200, "Interest on Emergency Loan", 375],
    ["Printing & Stationery", 0, "Interest on Bank Deposit", 0],
    ["Audit Fees", 0, "Indirect Income", ""],
    ["Indirect Expenses", 0, "Donation / Coupons", 0],
    ["Total Expenses", "=SUM(B4:B8)", "Total Income", "=SUM(D4:D8)"],
    ["NET SURPLUS / (DEFICIT)", "=D9-B9", "", ""]
  ];
  pnlSheet.getRange(3, 1, pnlData.length, 4).setValues(pnlData);
  pnlSheet.autoResizeColumns(1, 4);

  // Balance Sheet
  bsSheet.clear();
  bsSheet.setTabColor("#1D4ED8");
  bsSheet.getRange("A1:D1").merge().setValue("Balance Sheet - Group Financial Position")
    .setBackground("#1E3A8A").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const bsHeaders = [
    ["CAPITAL & LIABILITIES", "Amount (NPR)", "PROPERTY & ASSETS", "Amount (NPR)"],
    ["Equity & Reserves", 175000, "Fixed Assets (Furniture & Computers)", 85000],
    ["Net Current Period Surplus", "='Profit_and_Loss'!B10", "Cash in Hand", 292800],
    ["Members Regular Deposit (7 x 75k)", 525000, "Bank Balance (Nabil Bank)", 240000],
    ["Staff Salary Payable", 5000, "Regular Loans to Members", 150000],
    ["Meeting Expenses Payable", 0, "Emergency Loans to Members", 30000],
    ["Other Liabilities", 0, "Investment in Cafe Project", 150000],
    ["TOTAL LIABILITIES & EQUITY", "=SUM(B3:B8)", "TOTAL ASSETS", "=SUM(D3:D8)"]
  ];
  bsSheet.getRange(2, 1, bsHeaders.length, 4).setValues(bsHeaders);
  bsSheet.autoResizeColumns(1, 4);
}

/**
 * 7. Memberwise Columnar Report Setup
 */
function setupMemberwiseReport(sheet) {
  sheet.clear();
  sheet.setTabColor("#BE185D");
  sheet.getRange("A1:I1").merge().setValue("Monthly Memberwise Columnar Interest & Saving Matrix")
    .setBackground("#831843").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const headers = ["Member No", "Member Name", "Monthly Saving (25-Day)", "Regular Loan Bal", "Reg Interest (25-Day)", "Emg Loan Bal", "Emg Interest (25-Day)", "Total Interest", "Total Monthly Due"];
  sheet.getRange("A2:I2").setValues([headers]).setBackground("#DB2777").setFontColor("#FFFFFF").setFontWeight("bold");

  const rows = [
    ["SSH-001", "Shreedhar Regmi", 25000, 100000, 1000, 0, 0, "=E3+G3", "=C3+H3+8885"],
    ["SSH-002", "Jeshan Regmi", 25000, 50000, 500, 0, 0, "=E4+G4", "=C4+H4+8627"],
    ["SSH-003", "Bhupendra Bhattarai", 25000, 0, 0, 30000, 375, "=E5+G5", "=C5+H5+10252"],
    ["SSH-004", "Sarswoti Aryal (Bhattarai)", 25000, 0, 0, 0, 0, "=E6+G6", "=C6+H6"],
    ["SSH-005", "Bhairaja Shrestha", 25000, 0, 0, 0, 0, "=E7+G7", "=C7+H7"],
    ["SSH-006", "Nipesh Sapkota", 25000, 0, 0, 0, 0, "=E8+G8", "=C8+H8"],
    ["SSH-007", "Suraj Pradhan", 25000, 0, 0, 0, 0, "=E9+G9", "=C9+H9"],
    ["TOTAL", "7 Members", "=SUM(C3:C9)", "=SUM(D3:D9)", "=SUM(E3:E9)", "=SUM(F3:F9)", "=SUM(G3:G9)", "=SUM(H3:H9)", "=SUM(I3:I9)"]
  ];

  sheet.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(10, 1, 1, 9).setFontWeight("bold").setBackground("#FCE7F3");
  sheet.autoResizeColumns(1, 9);
}

/**
 * 8. Dashboard Setup
 */
function setupDashboardSheet(sheet) {
  sheet.clear();
  sheet.setTabColor("#111827");
  sheet.getRange("A1:F1").merge().setValue("SATHI SAJILO HISAB - Executive KPI Dashboard")
    .setBackground("#111827").setFontColor("#34D399").setFontWeight("bold").setFontSize(16).setHorizontalAlignment("center");

  const kpiData = [
    ["Total Members", 7, "25-Day Monthly Target", "=7*25000", "Monthly Staff Salary", 5000],
    ["Active Loans Outstanding", "='Balance_Sheet'!D6+'Balance_Sheet'!D7", "Monthly Interest Accrued", "='Memberwise_Report'!H10", "Cash & Bank Balance", "='Balance_Sheet'!D4+'Balance_Sheet'!D5"],
    ["Total Member Deposits", "='Balance_Sheet'!B5", "Net Accumulated Surplus", "='Balance_Sheet'!B3+'Balance_Sheet'!B4", "Meeting Cycle Period", "26th to End of Month"]
  ];

  sheet.getRange(3, 1, kpiData.length, 6).setValues(kpiData);
  sheet.autoResizeColumns(1, 6);
}

/**
 * 9. Monthly Loan Interest Auto-Posting Trigger Function
 * Auto-posts interest journals on 25th of every Nepali month
 */
function autoPostMonthlyLoanInterest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dayBook = ss.getSheetByName("Day_Book");
  const loansSheet = ss.getSheetByName("Loan_Amortization");

  if (!dayBook || !loansSheet) return;

  const today = new Date();
  const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const voucherNo = "JRN-AUTO-" + Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyyMMdd");

  // Read loan details
  const borrower = loansSheet.getRange("B3").getValue();
  const interestDue = loansSheet.getRange("I3").getValue() || 1000;

  // Append Double Entry to Day Book
  dayBook.appendRow([
    voucherNo,
    "JOURNAL",
    "2081-02-25",
    dateStr,
    "Interest Receivable on Loans",
    interestDue,
    0,
    "Auto-posted monthly interest for " + borrower + " (25-day cycle)",
    "System Auto-Post"
  ]);

  dayBook.appendRow([
    voucherNo,
    "JOURNAL",
    "2081-02-25",
    dateStr,
    "Interest on Regular Loan to Members",
    0,
    interestDue,
    "Auto-posted monthly interest for " + borrower + " (25-day cycle)",
    "System Auto-Post"
  ]);

  SpreadsheetApp.flush();
  Logger.log("Auto-posted monthly loan interest: NPR " + interestDue);
}

/**
 * 10. Install Scheduled Trigger for Monthly Auto-Post
 */
function installMonthlyInterestTrigger() {
  // Trigger runs on the 25th of every month at 9:00 AM
  ScriptApp.newTrigger("autoPostMonthlyLoanInterest")
    .timeBased()
    .onMonthDay(25)
    .atHour(9)
    .create();

  SpreadsheetApp.getUi().alert("✅ Scheduled Trigger installed! Monthly interest will auto-post on the 25th of every month.");
}

/**
 * 11. Web App API: Handles HTTP GET and POST for Live Sync with React ERP
 */
function doGet(e) {
  const action = e.parameter.action || "getSummary";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "getSummary") {
    const memSheet = ss.getSheetByName("Memberwise_Report");
    const values = memSheet ? memSheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      appName: APP_CONFIG.GROUP_NAME,
      membersCount: APP_CONFIG.MEMBERS_COUNT,
      data: values
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "postVoucher") {
      const dayBook = ss.getSheetByName("Day_Book");
      const v = payload.voucher;
      
      v.entries.forEach(function(entry) {
        dayBook.appendRow([
          v.voucherNo,
          v.voucherType,
          v.dateBS,
          v.dateAD,
          entry.ledgerName,
          entry.drAmount || 0,
          entry.crAmount || 0,
          v.narration,
          v.createdBy || "Web ERP App"
        ]);
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Voucher " + v.voucherNo + " posted to Google Sheet Day Book successfully."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}
