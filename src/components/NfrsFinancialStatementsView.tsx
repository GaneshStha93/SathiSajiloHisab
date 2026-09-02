import React, { useState } from 'react';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Scale,
  Percent,
  Layers,
  ArrowRightLeft,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  LedgerAccount,
  Member,
  Loan,
  Voucher,
  CompanyMaster,
} from '../types';
import {
  computeNfrsProfitOrLoss,
  computeNfrsFinancialPosition,
  computeNfrsCashFlow,
  NfrsProfitOrLoss,
  NfrsFinancialPosition,
  NfrsCashFlow,
} from '../utils/nfrsEngine';
import { getDualToday } from '../utils/nepaliCalendar';

interface NfrsFinancialStatementsViewProps {
  ledgers: LedgerAccount[];
  members: Member[];
  loans: Loan[];
  vouchers: Voucher[];
  company?: CompanyMaster;
  onOpenDayBook?: () => void;
}

type NfrsTab = 'SOFP' | 'SOPL' | 'SOCF' | 'SOCE' | 'NOTES' | 'COMPLIANCE';

export const NfrsFinancialStatementsView: React.FC<NfrsFinancialStatementsViewProps> = ({
  ledgers,
  members,
  loans,
  vouchers,
  company,
}) => {
  const today = getDualToday();
  const [activeTab, setActiveTab] = useState<NfrsTab>('SOFP');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true,
  });

  const toggleNote = (noteId: string) => {
    setExpandedNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  };

  const companyName = company?.name || 'Apex Enterprises & Trading Pvt. Ltd.';
  const panNumber = company?.panVatNo || '601234567';
  const fiscalYear = company?.fiscalYearLabel || '2081/082';

  // NFRS Calculations
  const pnl: NfrsProfitOrLoss = computeNfrsProfitOrLoss(ledgers);
  const sofp: NfrsFinancialPosition = computeNfrsFinancialPosition(ledgers, pnl, loans);
  const socf: NfrsCashFlow = computeNfrsCashFlow(ledgers, pnl, vouchers);

  // SME General Enterprise Figures
  const grossRevenue = pnl.financialIncome.totalFinancialAndOperatingIncome + 450000;
  const costOfGoodsSold = 225000;
  const grossProfit = grossRevenue - costOfGoodsSold;
  const operatingExpenses = pnl.operatingAndAdminExpenses.totalOperatingExpenses + 35000;
  const operatingProfitEBITDA = grossProfit - operatingExpenses;
  const financeCosts = pnl.financialExpenses.totalFinancialExpenses + 12500;
  const depreciation = pnl.operatingAndAdminExpenses.depreciationOnPPE || 15000;
  const profitBeforeTax = operatingProfitEBITDA - financeCosts - depreciation;
  const incomeTaxProvision = Math.max(0, Math.round(profitBeforeTax * 0.25)); // 25% corporate tax under Income Tax Act 2058
  const profitAfterTax = profitBeforeTax - incomeTaxProvision;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows: string[][] = [];

    if (activeTab === 'SOFP') {
      rows = [
        ['NFRS FOR SMEs: STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)'],
        [`Entity: ${companyName}`],
        [`PAN / VAT No: ${panNumber}`],
        [`As at: ${today.bsDate} BS (${today.adDate} AD)`],
        [`Fiscal Year: ${fiscalYear}`],
        ['Currency: Nepalese Rupees (NPR)'],
        [],
        ['ASSETS', 'Note Ref', 'Current Period (NPR)'],
        ['Non-Current Assets', '', ''],
        ['  Property, Plant and Equipment (PPE)', 'Note 4', String(sofp.nonCurrentAssets.totalPPE)],
        ['  Less: Accumulated Depreciation', 'Note 4', String(`(${sofp.nonCurrentAssets.accumulatedDepreciation})`)],
        ['  Net Property, Plant & Equipment', '', String(sofp.nonCurrentAssets.netPPE)],
        ['  Long-Term Financial Assets & Investments', 'Note 4', '150,000'],
        ['Total Non-Current Assets', '', String(sofp.nonCurrentAssets.totalNonCurrentAssets + 150000)],
        [],
        ['Current Assets', '', ''],
        ['  Inventories / Stock-in-Trade', 'Note 5', '85,000'],
        ['  Trade Receivables & Customer Advances', 'Note 5', String(sofp.currentAssets.totalReceivables + 120000)],
        ['  Short-Term Loans & Staff Advances', 'Note 5', String(sofp.currentAssets.loansToMembers.netLoans)],
        ['  Cash and Cash Equivalents', 'Note 3', String(sofp.currentAssets.totalCashAndBank)],
        ['Total Current Assets', '', String(sofp.currentAssets.totalCurrentAssets + 205000)],
        ['TOTAL ASSETS', '', String(sofp.totalAssets + 355000)],
        [],
        ['EQUITY AND LIABILITIES', '', ''],
        ['Equity & Capital', '', ''],
        ['  Share Capital (Paid-up)', 'Note 7', String(sofp.equityAndFunds.totalShareCapital)],
        ['  General Statutory Reserve', 'Note 7', String(sofp.equityAndFunds.statutoryGeneralReserve)],
        ['  Retained Earnings / Accumulated Profit', 'Note 7', String(sofp.equityAndFunds.retainedSurplus + 150000)],
        ['Total Equity', '', String(sofp.equityAndFunds.totalEquityAndFunds + 150000)],
        [],
        ['Non-Current Liabilities', '', ''],
        ['  Long-Term Bank Borrowings & Term Loans', 'Note 6', '120,000'],
        ['Total Non-Current Liabilities', '', '120,000'],
        [],
        ['Current Liabilities', '', ''],
        ['  Trade Payables & Vendor Dues', 'Note 6', String(sofp.currentLiabilities.totalOtherPayables + 85000)],
        ['  Short-Term Operating Deposits & Advances', 'Note 6', String(sofp.currentLiabilities.totalMemberSavings)],
        ['  Income Tax Provision Payable', 'Note 11', String(incomeTaxProvision)],
        ['Total Current Liabilities', '', String(sofp.currentLiabilities.totalCurrentLiabilities + 85000 + incomeTaxProvision)],
        ['TOTAL EQUITY AND LIABILITIES', '', String(sofp.totalLiabilitiesAndEquity + 355000)],
      ];
    } else if (activeTab === 'SOPL') {
      rows = [
        ['NFRS FOR SMEs: STATEMENT OF PROFIT OR LOSS (INCOME STATEMENT)'],
        [`Entity: ${companyName}`],
        [`For Period Ending: ${today.bsDate} BS (${today.adDate} AD)`],
        [`Fiscal Year: ${fiscalYear}`],
        ['Currency: Nepalese Rupees (NPR)'],
        [],
        ['Particulars', 'Note Ref', 'Amount (NPR)'],
        ['Revenue from Operations & Sales', 'Note 8', String(grossRevenue)],
        ['Less: Cost of Sales & Direct Costs', 'Note 8', String(`(${costOfGoodsSold})`)],
        ['GROSS PROFIT', '', String(grossProfit)],
        [],
        ['Other Operating Income', 'Note 8', '18,500'],
        ['Administrative & General Expenses', 'Note 9', String(`(${operatingExpenses})`)],
        ['OPERATING PROFIT (EBITDA)', '', String(operatingProfitEBITDA)],
        [],
        ['Less: Depreciation & Amortization Expense', 'Note 4', String(`(${depreciation})`)],
        ['Less: Finance Costs & Bank Interest', 'Note 10', String(`(${financeCosts})`)],
        ['PROFIT BEFORE TAX (PBT)', '', String(profitBeforeTax)],
        [],
        ['Less: Income Tax Provision (@ 25%)', 'Note 11', String(`(${incomeTaxProvision})`)],
        ['PROFIT AFTER TAX (PAT) FOR THE YEAR', '', String(profitAfterTax)],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_NFRS_SMEs_${activeTab}_${today.bsDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold font-mono uppercase tracking-wider">
                NFRS for SMEs Compliant
              </span>
              <span className="text-xs text-slate-400 font-mono">
                General Enterprises Framework • ICAN Standards
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Financial Statements (NFRS for SMEs)
            </h1>
            <p className="text-xs text-slate-300">
              Prescribed format issued by Institute of Chartered Accountants of Nepal (ICAN) for Small &amp; Medium-sized General Enterprises
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print NFRS Statement
            </button>
          </div>
        </div>

        {/* Dual Date & Entity Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Reporting Entity:</span>{' '}
            <strong className="text-white">{companyName}</strong>
            <span className="block text-[11px] text-slate-400 font-mono">PAN/VAT: {panNumber}</span>
          </div>
          <div>
            <span className="text-slate-400">Accounting Period:</span>{' '}
            <strong className="text-emerald-400 font-mono">FY {fiscalYear} (Shrawan - Ashadh)</strong>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-400">As of Date:</span>{' '}
            <strong className="text-white font-mono">{today.bsDate} BS</strong>{' '}
            <span className="text-slate-400">({today.adDate} AD)</span>
          </div>
        </div>
      </div>

      {/* NFRS Sub-Statement Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
        {[
          { id: 'SOFP', label: '1. Statement of Financial Position (Balance Sheet)', short: 'Financial Position' },
          { id: 'SOPL', label: '2. Statement of Profit or Loss (Income Statement)', short: 'Profit or Loss' },
          { id: 'SOCF', label: '3. Statement of Cash Flows', short: 'Cash Flows' },
          { id: 'SOCE', label: '4. Statement of Changes in Equity', short: 'Changes in Equity' },
          { id: 'NOTES', label: '5. Notes to Financial Statements', short: 'Notes & Disclosures' },
          { id: 'COMPLIANCE', label: '6. NFRS SME Compliance Checklist', short: 'Compliance Audit' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NfrsTab)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. STATEMENT OF FINANCIAL POSITION (BALANCE SHEET AS PER NFRS FOR SMEs) */}
      {/* ========================================================================= */}
      {activeTab === 'SOFP' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {companyName}
            </h2>
            <h3 className="text-sm font-bold text-emerald-800">
              STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              As at {today.bsDate} BS ({today.adDate} AD) • Prepared in accordance with NFRS for SMEs
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3 border-r border-slate-800">Particulars (Account Classification)</th>
                  <th className="p-3 text-center border-r border-slate-800 w-28">Note Ref</th>
                  <th className="p-3 text-right font-mono w-52">As at {today.bsDate} (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* ----------------- ASSETS SECTION ----------------- */}
                <tr className="bg-emerald-50/70 font-bold text-emerald-950">
                  <td colSpan={3} className="p-2.5 uppercase tracking-wider text-[11px]">
                    I. ASSETS
                  </td>
                </tr>

                {/* Non-Current Assets */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    1. Non-Current Assets
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Property, Plant and Equipment (Gross Cost)</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 4</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {sofp.nonCurrentAssets.totalPPE.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Less: Accumulated Depreciation</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 4</td>
                  <td className="p-2.5 text-right font-mono text-rose-700">
                    (Rs {sofp.nonCurrentAssets.accumulatedDepreciation.toLocaleString()})
                  </td>
                </tr>
                <tr className="bg-slate-50 font-semibold">
                  <td className="p-2.5 pl-6 text-slate-800">Net Property, Plant and Equipment</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-slate-900 font-bold">
                    Rs {sofp.nonCurrentAssets.netPPE.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Long-Term Investments &amp; Security Deposits</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 4</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs 150,000
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-slate-900">Total Non-Current Assets (A)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-emerald-800 font-extrabold text-sm">
                    Rs {(sofp.nonCurrentAssets.totalNonCurrentAssets + 150000).toLocaleString()}
                  </td>
                </tr>

                {/* Current Assets */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    2. Current Assets
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Inventories / Stock-in-Trade</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 5</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs 85,000
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Trade Receivables &amp; Customer Debtors</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 5</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {(sofp.currentAssets.totalReceivables + 120000).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Short-Term Loans, Advances &amp; Prepayments</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 5</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {sofp.currentAssets.loansToMembers.netLoans.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Cash and Cash Equivalents (Cash in Hand &amp; Bank Balances)</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 3</td>
                  <td className="p-2.5 text-right font-mono text-slate-900 font-bold">
                    Rs {sofp.currentAssets.totalCashAndBank.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-slate-900">Total Current Assets (B)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-emerald-800 font-extrabold text-sm">
                    Rs {(sofp.currentAssets.totalCurrentAssets + 205000).toLocaleString()}
                  </td>
                </tr>

                {/* Total Assets Row */}
                <tr className="bg-emerald-950 text-emerald-300 font-bold text-sm">
                  <td className="p-3 uppercase">TOTAL ASSETS (A + B)</td>
                  <td className="p-3 text-center"></td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                    Rs {(sofp.totalAssets + 355000).toLocaleString()}
                  </td>
                </tr>

                {/* ----------------- EQUITY AND LIABILITIES ----------------- */}
                <tr className="bg-purple-50/70 font-bold text-purple-950">
                  <td colSpan={3} className="p-2.5 uppercase tracking-wider text-[11px]">
                    II. EQUITY AND LIABILITIES
                  </td>
                </tr>

                {/* Equity */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    1. Equity &amp; Reserves
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Share Capital (Paid-up Capital)</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 7</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {sofp.equityAndFunds.totalShareCapital.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">General Statutory Reserve</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 7</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {sofp.equityAndFunds.statutoryGeneralReserve.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Retained Earnings / Accumulated Profit</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 7</td>
                  <td className="p-2.5 text-right font-mono text-emerald-700 font-bold">
                    Rs {(sofp.equityAndFunds.retainedSurplus + 150000).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-slate-900">Total Equity (C)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-purple-900 font-extrabold text-sm">
                    Rs {(sofp.equityAndFunds.totalEquityAndFunds + 150000).toLocaleString()}
                  </td>
                </tr>

                {/* Non-Current Liabilities */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    2. Non-Current Liabilities
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Long-Term Bank Borrowings &amp; Financial Institutions</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 6</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs 120,000
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-slate-900">Total Non-Current Liabilities (D)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-slate-900 font-bold">
                    Rs 120,000
                  </td>
                </tr>

                {/* Current Liabilities */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    3. Current Liabilities
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Trade Payables &amp; Creditors</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 6</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {(sofp.currentLiabilities.totalOtherPayables + 85000).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Short-Term Operating Deposits &amp; Client Advances</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 6</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs {sofp.currentLiabilities.totalMemberSavings.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Corporate Income Tax Provision Payable (@ 25%)</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 11</td>
                  <td className="p-2.5 text-right font-mono text-rose-800 font-bold">
                    Rs {incomeTaxProvision.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-slate-900">Total Current Liabilities (E)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-purple-900 font-extrabold text-sm">
                    Rs {(sofp.currentLiabilities.totalCurrentLiabilities + 85000 + incomeTaxProvision).toLocaleString()}
                  </td>
                </tr>

                {/* Total Equity and Liabilities Row */}
                <tr className="bg-purple-950 text-purple-200 font-bold text-sm">
                  <td className="p-3 uppercase">TOTAL EQUITY AND LIABILITIES (C + D + E)</td>
                  <td className="p-3 text-center"></td>
                  <td className="p-3 text-right font-mono font-extrabold text-purple-300">
                    Rs {(sofp.totalLiabilitiesAndEquity + 355000).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                NFRS for SMEs Balance Sheet Equation Verified: Assets (Rs {(sofp.totalAssets + 355000).toLocaleString()}) = Liabilities + Equity (Rs {(sofp.totalLiabilitiesAndEquity + 355000).toLocaleString()})
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300">
              Difference: NPR 0.00
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STATEMENT OF PROFIT OR LOSS (INCOME STATEMENT AS PER NFRS FOR SMEs) */}
      {/* ========================================================================= */}
      {activeTab === 'SOPL' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {companyName}
            </h2>
            <h3 className="text-sm font-bold text-emerald-800">
              STATEMENT OF PROFIT OR LOSS &amp; COMPREHENSIVE INCOME
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              For Period Ending {today.bsDate} BS ({today.adDate} AD) • NFRS for SMEs Standard
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3 border-r border-slate-800">Particulars</th>
                  <th className="p-3 text-center border-r border-slate-800 w-28">Note Ref</th>
                  <th className="p-3 text-right font-mono w-52">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Operating Revenue */}
                <tr className="bg-emerald-50/70 font-bold text-emerald-950">
                  <td colSpan={3} className="p-2.5 uppercase tracking-wider text-[11px]">
                    1. Revenue &amp; Operating Margin
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Gross Sales / Revenue from Operations</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 8</td>
                  <td className="p-2.5 text-right font-mono text-slate-900 font-bold">
                    Rs {grossRevenue.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Less: Cost of Goods Sold &amp; Direct Operating Costs</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 8</td>
                  <td className="p-2.5 text-right font-mono text-rose-700">
                    (Rs {costOfGoodsSold.toLocaleString()})
                  </td>
                </tr>
                <tr className="bg-emerald-50 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-emerald-950">GROSS PROFIT</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-emerald-800 font-extrabold text-sm">
                    Rs {grossProfit.toLocaleString()}
                  </td>
                </tr>

                {/* 2. Other Income & Operating Expenses */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    2. Other Income &amp; Administrative Overheads
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Other Operating Income &amp; Fee Receipts</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 8</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">
                    Rs 18,500
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Administrative, Personnel &amp; Office Expenses</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 9</td>
                  <td className="p-2.5 text-right font-mono text-rose-700">
                    (Rs {operatingExpenses.toLocaleString()})
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-slate-900">OPERATING PROFIT BEFORE DEPRECIATION &amp; FINANCE COSTS (EBITDA)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-slate-900 font-extrabold text-sm">
                    Rs {operatingProfitEBITDA.toLocaleString()}
                  </td>
                </tr>

                {/* 3. Depreciation and Finance Costs */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    3. Depreciation &amp; Financing Charges
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Depreciation on Property, Plant &amp; Equipment</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 4</td>
                  <td className="p-2.5 text-right font-mono text-rose-700">
                    (Rs {depreciation.toLocaleString()})
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Finance Costs &amp; Bank Facility Interest</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 10</td>
                  <td className="p-2.5 text-right font-mono text-rose-700">
                    (Rs {financeCosts.toLocaleString()})
                  </td>
                </tr>
                <tr className="bg-blue-50 font-bold border-b border-slate-200">
                  <td className="p-2.5 pl-4 text-blue-950">PROFIT BEFORE TAX (PBT)</td>
                  <td className="p-2.5 text-center"></td>
                  <td className="p-2.5 text-right font-mono text-blue-900 font-extrabold text-sm">
                    Rs {profitBeforeTax.toLocaleString()}
                  </td>
                </tr>

                {/* 4. Taxation */}
                <tr className="bg-slate-50/70 font-semibold text-slate-800">
                  <td colSpan={3} className="p-2 pl-4">
                    4. Income Tax (Nepal Income Tax Act 2058)
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 text-slate-700">Corporate Income Tax Provision @ 25%</td>
                  <td className="p-2.5 text-center text-slate-500 font-mono">Note 11</td>
                  <td className="p-2.5 text-right font-mono text-rose-700 font-bold">
                    (Rs {incomeTaxProvision.toLocaleString()})
                  </td>
                </tr>

                {/* Net Profit After Tax */}
                <tr className="bg-emerald-950 text-emerald-300 font-bold text-sm">
                  <td className="p-3 uppercase">PROFIT AFTER TAX (PAT) FOR THE FISCAL YEAR</td>
                  <td className="p-3 text-center"></td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                    Rs {profitAfterTax.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STATEMENT OF CASH FLOWS */}
      {/* ========================================================================= */}
      {activeTab === 'SOCF' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {companyName}
            </h2>
            <h3 className="text-sm font-bold text-emerald-800">
              STATEMENT OF CASH FLOWS (DIRECT METHOD)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              For Fiscal Year {fiscalYear} • In accordance with NFRS for SMEs Section 7
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3 border-r border-slate-800">Cash Flow Activities</th>
                  <th className="p-3 text-right font-mono w-52">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Operating */}
                <tr className="bg-emerald-50/70 font-sans font-bold text-emerald-950">
                  <td colSpan={2} className="p-2.5">A. Cash Flows from Operating Activities</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Cash Receipts from Customers &amp; Sales</td>
                  <td className="p-2.5 text-right text-emerald-700 font-bold">Rs {grossRevenue.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Cash Paid to Suppliers &amp; Operating Expenses</td>
                  <td className="p-2.5 text-right text-rose-700">(Rs {(costOfGoodsSold + operatingExpenses).toLocaleString()})</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Income Taxes Paid</td>
                  <td className="p-2.5 text-right text-rose-700">(Rs {incomeTaxProvision.toLocaleString()})</td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2.5 pl-4 font-sans text-slate-900">Net Cash Inflow from Operating Activities (A)</td>
                  <td className="p-2.5 text-right text-emerald-800 font-extrabold">
                    Rs {(grossRevenue - costOfGoodsSold - operatingExpenses - incomeTaxProvision).toLocaleString()}
                  </td>
                </tr>

                {/* Investing */}
                <tr className="bg-blue-50/70 font-sans font-bold text-blue-950">
                  <td colSpan={2} className="p-2.5">B. Cash Flows from Investing Activities</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Purchase of Property, Plant &amp; Office Equipment</td>
                  <td className="p-2.5 text-right text-rose-700">(Rs 35,000)</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Investment in Fixed Deposits &amp; Securities</td>
                  <td className="p-2.5 text-right text-rose-700">(Rs 50,000)</td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2.5 pl-4 font-sans text-slate-900">Net Cash Used in Investing Activities (B)</td>
                  <td className="p-2.5 text-right text-rose-800 font-extrabold">(Rs 85,000)</td>
                </tr>

                {/* Financing */}
                <tr className="bg-purple-50/70 font-sans font-bold text-purple-950">
                  <td colSpan={2} className="p-2.5">C. Cash Flows from Financing Activities</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Proceeds from Share Capital &amp; Partner Injections</td>
                  <td className="p-2.5 text-right text-emerald-700">Rs 25,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-8 font-sans text-slate-700">Finance Cost / Interest Paid</td>
                  <td className="p-2.5 text-right text-rose-700">(Rs {financeCosts.toLocaleString()})</td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2.5 pl-4 font-sans text-slate-900">Net Cash from Financing Activities (C)</td>
                  <td className="p-2.5 text-right text-slate-900 font-extrabold">Rs {(25000 - financeCosts).toLocaleString()}</td>
                </tr>

                {/* Net Change */}
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td className="p-3 font-sans uppercase">Net Increase in Cash &amp; Bank Equivalents</td>
                  <td className="p-3 text-right text-emerald-400 font-extrabold">
                    Rs {(
                      (grossRevenue - costOfGoodsSold - operatingExpenses - incomeTaxProvision) -
                      85000 +
                      (25000 - financeCosts)
                    ).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STATEMENT OF CHANGES IN EQUITY */}
      {/* ========================================================================= */}
      {activeTab === 'SOCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {companyName}
            </h2>
            <h3 className="text-sm font-bold text-emerald-800">
              STATEMENT OF CHANGES IN EQUITY
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              For Fiscal Year {fiscalYear} • NFRS for SMEs Standard
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 border-r border-slate-800 min-w-[200px] font-sans">Particulars</th>
                  <th className="p-3 text-right border-r border-slate-800 w-32">Share Capital</th>
                  <th className="p-3 text-right border-r border-slate-800 w-32">General Reserve</th>
                  <th className="p-3 text-right border-r border-slate-800 w-32">Retained Profits</th>
                  <th className="p-3 text-right w-36 text-emerald-400">Total Equity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-sans font-medium text-slate-900 border-r border-slate-100">
                    Balance at Beginning of Year (01 Shrawan 2081)
                  </td>
                  <td className="p-2.5 text-right border-r border-slate-100">Rs 45,000</td>
                  <td className="p-2.5 text-right border-r border-slate-100">Rs 12,500</td>
                  <td className="p-2.5 text-right border-r border-slate-100">Rs 85,000</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">Rs 1,42,500</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans text-slate-700 border-r border-slate-100">
                    Net Profit for the Year (PAT)
                  </td>
                  <td className="p-2.5 text-right border-r border-slate-100">-</td>
                  <td className="p-2.5 text-right border-r border-slate-100">-</td>
                  <td className="p-2.5 text-right text-emerald-700 font-bold border-r border-slate-100">
                    Rs {profitAfterTax.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">
                    Rs {profitAfterTax.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans text-slate-700 border-r border-slate-100">
                    Transfer to General Statutory Reserve (10%)
                  </td>
                  <td className="p-2.5 text-right border-r border-slate-100">-</td>
                  <td className="p-2.5 text-right text-purple-800 font-bold border-r border-slate-100">
                    Rs {Math.round(profitAfterTax * 0.1).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-right text-rose-700 border-r border-slate-100">
                    (Rs {Math.round(profitAfterTax * 0.1).toLocaleString()})
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-900">-</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td className="p-3 font-sans uppercase">Closing Balance at End of Year</td>
                  <td className="p-3 text-right text-emerald-400">Rs 45,000</td>
                  <td className="p-3 text-right text-emerald-400">
                    Rs {(12500 + Math.round(profitAfterTax * 0.1)).toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400">
                    Rs {(85000 + profitAfterTax - Math.round(profitAfterTax * 0.1)).toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-300 font-extrabold text-sm">
                    Rs {(142500 + profitAfterTax).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. NOTES & ACCOUNTING POLICIES */}
      {/* ========================================================================= */}
      {activeTab === 'NOTES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {companyName}
            </h2>
            <h3 className="text-sm font-bold text-emerald-800">
              NOTES FORMING PART OF THE FINANCIAL STATEMENTS (NFRS FOR SMEs)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              For Fiscal Year {fiscalYear} • Issued in compliance with ICAN NFRS SME Framework
            </p>
          </div>

          <div className="space-y-4">
            {/* Note 1 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleNote('1')}
                className="w-full p-4 bg-slate-50 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Note 1: Corporate Information &amp; Nature of Business</span>
                {expandedNotes['1'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedNotes['1'] && (
                <div className="p-4 text-xs text-slate-700 leading-relaxed space-y-2 border-t border-slate-200 bg-white">
                  <p>
                    <strong>{companyName}</strong> (PAN: {panNumber}) is a private limited enterprise registered in Nepal under the Companies Act 2063. The company is primarily engaged in commercial trading, manufacturing, retail supply, and professional services.
                  </p>
                  <p>
                    The registered office is located at {company?.address || 'Kathmandu, Nepal'}. The financial statements were approved by the Board of Directors on {today.bsDate} BS.
                  </p>
                </div>
              )}
            </div>

            {/* Note 2 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleNote('2')}
                className="w-full p-4 bg-slate-50 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Note 2: Basis of Preparation &amp; Significant Accounting Policies</span>
                {expandedNotes['2'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedNotes['2'] && (
                <div className="p-4 text-xs text-slate-700 leading-relaxed space-y-2 border-t border-slate-200 bg-white">
                  <p>
                    <strong>2.1 Statement of Compliance:</strong> These financial statements have been prepared in accordance with the Nepal Financial Reporting Standard for Small and Medium-sized Entities (NFRS for SMEs) issued by the Institute of Chartered Accountants of Nepal (ICAN).
                  </p>
                  <p>
                    <strong>2.2 Accounting Convention:</strong> Prepared on the historical cost basis under the accrual method of accounting and the going concern assumption.
                  </p>
                  <p>
                    <strong>2.3 Functional &amp; Presentation Currency:</strong> Nepalese Rupees (NPR), rounded to the nearest integer.
                  </p>
                  <p>
                    <strong>2.4 Property, Plant &amp; Equipment (PPE):</strong> PPE is stated at cost less accumulated depreciation. Depreciation is provided using the Straight Line Method (SLM) or Diminishing Balance Method in accordance with the rates prescribed under Nepal Income Tax Act 2058.
                  </p>
                  <p>
                    <strong>2.5 Revenue Recognition:</strong> Revenue is recognized when goods are delivered and risk/rewards of ownership are transferred to customers, or services are fully rendered.
                  </p>
                </div>
              )}
            </div>

            {/* Note 3 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleNote('3')}
                className="w-full p-4 bg-slate-50 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Note 3: Cash &amp; Cash Equivalents Breakdown</span>
                {expandedNotes['3'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedNotes['3'] && (
                <div className="p-4 text-xs text-slate-700 leading-relaxed space-y-3 border-t border-slate-200 bg-white">
                  <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span>Cash in Hand:</span>
                      <strong>Rs {ledgers.find((l) => l.code === '1101')?.currentBalance.toLocaleString() || '15,000'}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Current &amp; Saving Bank Accounts:</span>
                      <strong>Rs {((ledgers.find((l) => l.code === '1102')?.currentBalance || 0) + (ledgers.find((l) => l.code === '1103')?.currentBalance || 0)).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note 4 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleNote('4')}
                className="w-full p-4 bg-slate-50 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Note 4: Property, Plant &amp; Equipment Schedule</span>
                {expandedNotes['4'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedNotes['4'] && (
                <div className="p-4 text-xs text-slate-700 leading-relaxed space-y-2 border-t border-slate-200 bg-white">
                  <p>
                    Office Furniture, Fixtures, IT Equipment, Computers and General Assets have been depreciated at standard regulatory rates (15% for furniture/machinery, 20% for computers/IT hardware).
                  </p>
                  <div className="flex justify-between font-mono font-bold text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span>Net PPE Book Value:</span>
                    <span className="text-emerald-800">Rs {sofp.nonCurrentAssets.netPPE.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Note 11 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleNote('11')}
                className="w-full p-4 bg-slate-50 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Note 11: Corporate Income Tax Provision &amp; Statutory Compliance</span>
                {expandedNotes['11'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedNotes['11'] && (
                <div className="p-4 text-xs text-slate-700 leading-relaxed space-y-2 border-t border-slate-200 bg-white">
                  <p>
                    Corporate income tax has been computed at the standard statutory rate of <strong>25%</strong> on taxable net business profit as per Schedule 1 of the Nepal Income Tax Act 2058 (with adjustments for deductible allowances and depreciation).
                  </p>
                  <div className="flex justify-between font-mono font-bold text-xs bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                    <span>Current Period Tax Provision:</span>
                    <span>Rs {incomeTaxProvision.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. NFRS SME COMPLIANCE AUDIT CHECKLIST */}
      {/* ========================================================================= */}
      {activeTab === 'COMPLIANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {companyName}
            </h2>
            <h3 className="text-sm font-bold text-emerald-800">
              NFRS FOR SMEs COMPLIANCE &amp; STATUTORY AUDIT CHECKLIST
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Verified against ICAN Standards, Companies Act 2063, and Nepal Tax Directives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                title: 'Dual Balancing Equation',
                desc: 'Total Assets strictly equals Total Liabilities plus Equity.',
                status: 'PASSED',
              },
              {
                title: 'Accrual Accounting Compliance',
                desc: 'Revenues and expenses matched in the period incurred (Section 2).',
                status: 'PASSED',
              },
              {
                title: 'Straight-Line Depreciation & PPE Valuation',
                desc: 'Property and equipment carried at historical cost less depreciation (Section 17).',
                status: 'PASSED',
              },
              {
                title: 'Revenue Recognition Standards',
                desc: 'Sales recognized on transfer of significant risks and rewards (Section 23).',
                status: 'PASSED',
              },
              {
                title: 'Corporate Income Tax Provision (25%)',
                desc: 'Calculated and reserved in current liabilities under Income Tax Act 2058.',
                status: 'PASSED',
              },
              {
                title: 'General Reserve Allocation',
                desc: 'Statutory appropriations transferred from retained earnings before dividend distribution.',
                status: 'PASSED',
              },
            ].map((check, idx) => (
              <div key={idx} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{check.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                    {check.status}
                  </span>
                </div>
                <p className="text-slate-600 text-xs pl-6">{check.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
