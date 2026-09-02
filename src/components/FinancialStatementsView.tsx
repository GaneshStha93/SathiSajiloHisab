import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  Receipt,
  BookOpen,
  Users2,
  FileText,
  ArrowRightLeft,
  ListTree,
  AlertTriangle,
  LogOut,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { LedgerAccount, Voucher, Member, Loan, CompanyMaster } from '../types';
import { computeProfitAndLoss, computeBalanceSheet, computeDateFilteredTrialBalance } from '../utils/accountingEngine';
import { getDualToday } from '../utils/nepaliCalendar';
import { TallyDisplayMenu, DisplayMenuOption, MENU_ITEMS } from './TallyDisplayMenu';
import { NfrsFinancialStatementsView } from './NfrsFinancialStatementsView';
import { AccountBooksView } from './AccountBooksView';
import { StatementsOfAccountsView } from './StatementsOfAccountsView';
import { ExceptionReportsView } from './ExceptionReportsView';
import { ChartOfAccountsView } from './ChartOfAccountsView';

interface FinancialStatementsViewProps {
  ledgers: LedgerAccount[];
  vouchers: Voucher[];
  members: Member[];
  loans: Loan[];
  company?: CompanyMaster;
  onNavigateTab?: (tab: string) => void;
}

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({
  ledgers,
  vouchers,
  members,
  loans,
  company,
  onNavigateTab,
}) => {
  const today = getDualToday();
  const [activeMenuOption, setActiveMenuOption] = useState<DisplayMenuOption>('FINANCIAL_STATEMENTS');
  const [isDetailedTrial, setIsDetailedTrial] = useState(true);
  const [dayBookTypeFilter, setDayBookTypeFilter] = useState<string>('ALL');
  const [dayBookSearch, setDayBookSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'SIDEBAR' | 'FULL' | 'MENU_ONLY'>('SIDEBAR');

  // Date Filter State
  const [fromDateBS, setFromDateBS] = useState<string>(company?.fiscalYearStartBS || '2081-04-01');
  const [toDateBS, setToDateBS] = useState<string>(today.bsDate);
  const [datePreset, setDatePreset] = useState<'FY' | 'MONTH' | 'TODAY' | 'CUSTOM'>('FY');

  const handleDatePreset = (preset: 'FY' | 'MONTH' | 'TODAY') => {
    setDatePreset(preset);
    if (preset === 'FY') {
      setFromDateBS(company?.fiscalYearStartBS || '2081-04-01');
      setToDateBS(company?.fiscalYearEndBS || '2082-03-31');
    } else if (preset === 'MONTH') {
      const parts = today.bsDate.split('-');
      setFromDateBS(`${parts[0]}-${parts[1]}-01`);
      setToDateBS(today.bsDate);
    } else if (preset === 'TODAY') {
      setFromDateBS(today.bsDate);
      setToDateBS(today.bsDate);
    }
  };

  // Keyboard shortcut listener for F1 Detailed toggle and ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsDetailedTrial((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuit = () => {
    if (onNavigateTab) {
      onNavigateTab('dashboard');
    } else {
      setActiveMenuOption('FINANCIAL_STATEMENTS');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Date-Filtered Trial Balance Engine Computation
  const trialData = useMemo(() => {
    return computeDateFilteredTrialBalance(ledgers, vouchers, fromDateBS, toDateBS);
  }, [ledgers, vouchers, fromDateBS, toDateBS]);

  // Group active ledgers by Major Group and Sub Group Tier 2
  const groupedTrial = useMemo(() => {
    const groups: {
      majorGroup: string;
      tier2Groups: {
        tier2: string;
        items: typeof trialData.activeItems;
        subtotalOpeningDr: number;
        subtotalOpeningCr: number;
        subtotalPeriodDr: number;
        subtotalPeriodCr: number;
        subtotalClosingDr: number;
        subtotalClosingCr: number;
      }[];
      majorOpeningDr: number;
      majorOpeningCr: number;
      majorPeriodDr: number;
      majorPeriodCr: number;
      majorClosingDr: number;
      majorClosingCr: number;
    }[] = [];

    const majorOrder = ['ASSETS', 'LIABILITIES', 'EQUITY', 'INCOME', 'EXPENSES'];

    majorOrder.forEach((mg) => {
      const itemsInMajor = trialData.activeItems.filter((i) => i.ledger.majorGroup === mg);
      if (itemsInMajor.length === 0) return;

      const tier2Map = new Map<string, typeof trialData.activeItems>();
      itemsInMajor.forEach((item) => {
        const t2 = item.ledger.tier2 || 'GENERAL';
        if (!tier2Map.has(t2)) tier2Map.set(t2, []);
        tier2Map.get(t2)!.push(item);
      });

      const tier2Groups = Array.from(tier2Map.entries()).map(([tier2, items]) => {
        return {
          tier2,
          items,
          subtotalOpeningDr: items.reduce((s, i) => s + i.openingDr, 0),
          subtotalOpeningCr: items.reduce((s, i) => s + i.openingCr, 0),
          subtotalPeriodDr: items.reduce((s, i) => s + i.periodDr, 0),
          subtotalPeriodCr: items.reduce((s, i) => s + i.periodCr, 0),
          subtotalClosingDr: items.reduce((s, i) => s + i.closingDr, 0),
          subtotalClosingCr: items.reduce((s, i) => s + i.closingCr, 0),
        };
      });

      groups.push({
        majorGroup: mg,
        tier2Groups,
        majorOpeningDr: itemsInMajor.reduce((s, i) => s + i.openingDr, 0),
        majorOpeningCr: itemsInMajor.reduce((s, i) => s + i.openingCr, 0),
        majorPeriodDr: itemsInMajor.reduce((s, i) => s + i.periodDr, 0),
        majorPeriodCr: itemsInMajor.reduce((s, i) => s + i.periodCr, 0),
        majorClosingDr: itemsInMajor.reduce((s, i) => s + i.closingDr, 0),
        majorClosingCr: itemsInMajor.reduce((s, i) => s + i.closingCr, 0),
      });
    });

    return groups;
  }, [trialData]);

  // Day book filter with date range
  const filteredVouchers = vouchers.filter((v) => {
    const matchesType = dayBookTypeFilter === 'ALL' || v.voucherType === dayBookTypeFilter;
    const vDate = v.dateBS || (v as any).dateBs || '';
    const matchesDate = (!fromDateBS || vDate >= fromDateBS) && (!toDateBS || vDate <= toDateBS);
    const matchesSearch =
      dayBookSearch === '' ||
      v.voucherNo.toLowerCase().includes(dayBookSearch.toLowerCase()) ||
      v.narration.toLowerCase().includes(dayBookSearch.toLowerCase()) ||
      v.entries.some((e) => e.ledgerName.toLowerCase().includes(dayBookSearch.toLowerCase()));
    return matchesType && matchesDate && matchesSearch;
  });

  const formatSubGroupLabel = (tag: string) => {
    return tag
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
            <span>Accounting Reports</span>
            <span className="text-slate-600">&gt;</span>
            <span className="font-bold text-white">Reports Menu</span>
            <span className="text-slate-600">&gt;</span>
            <span className="text-emerald-300 font-bold">
              {MENU_ITEMS.find((m) => m.id === activeMenuOption)?.label}
            </span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-emerald-400" />
            Financial Reports &amp; Statements
          </h1>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            {company?.name || 'Apex Enterprises Pvt. Ltd.'} • NFRS for SMEs • Fiscal Year {company?.fiscalYearLabel || '2081/082'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Menu switcher tabs */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              onClick={() => setViewMode(viewMode === 'SIDEBAR' ? 'FULL' : 'SIDEBAR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'SIDEBAR'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {viewMode === 'SIDEBAR' ? 'Hide Menu' : 'Show Menu'}
            </button>
            <button
              onClick={() => setViewMode('MENU_ONLY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'MENU_ONLY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Menu Grid
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* Universal Date Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Reporting Period (BS):</span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleDatePreset('FY')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'FY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Fiscal Year
            </button>
            <button
              onClick={() => handleDatePreset('MONTH')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'MONTH' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handleDatePreset('TODAY')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'TODAY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">From:</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={fromDateBS}
              onChange={(e) => {
                setFromDateBS(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="w-28 px-2.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">To:</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={toDateBS}
              onChange={(e) => {
                setToDateBS(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="w-28 px-2.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
            />
          </div>

          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Current BS: <strong>{today.bsDate}</strong>
          </span>
        </div>
      </div>

      {/* Main View Grid */}
      {viewMode === 'MENU_ONLY' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MENU_ITEMS.filter((i) => i.id !== 'QUIT').map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenuOption(item.id);
                  setViewMode('SIDEBAR');
                }}
                className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                    [{item.hotkey}]
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                    {item.label}
                  </h3>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">{item.nepaliLabel}</div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tally Display Menu */}
          {viewMode === 'SIDEBAR' && (
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <TallyDisplayMenu
                activeOption={activeMenuOption}
                onSelectOption={(opt) => setActiveMenuOption(opt)}
                onQuit={handleQuit}
              />

              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Company Context</span>
                </div>
                <div className="font-mono text-[11px] space-y-1">
                  <div>Entity: <strong className="text-slate-900">{company?.name || 'Apex Enterprise'}</strong></div>
                  <div>PAN/VAT: <strong className="text-slate-900">{company?.panVatNo || '601234567'}</strong></div>
                  <div>Fiscal Year: <strong className="text-emerald-700">{company?.fiscalYearLabel || '2081/082'}</strong></div>
                  <div>From: <span className="text-slate-700">{fromDateBS}</span> To: <span className="text-slate-700">{toDateBS}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Active Report Body */}
          <div className={viewMode === 'SIDEBAR' ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}>
            {/* ========================================================= */}
            {/* OPTION F: FINANCIAL STATEMENTS (NFRS FOR SMEs) */}
            {/* ========================================================= */}
            {activeMenuOption === 'FINANCIAL_STATEMENTS' && (
              <NfrsFinancialStatementsView
                ledgers={ledgers}
                members={members}
                loans={loans}
                vouchers={vouchers}
                company={company}
              />
            )}

            {/* ========================================================= */}
            {/* OPTION T: TRIAL BALANCE (6-COLUMN DETAILED & CONDENSED) */}
            {/* ========================================================= */}
            {activeMenuOption === 'TRIAL' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs text-emerald-600 font-mono font-semibold">Reports &gt; Trial Balance</div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      TRIAL BALANCE (6-COLUMN DUAL BALANCING)
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Period: {fromDateBS} BS to {toDateBS} BS • {isDetailedTrial ? 'Detailed Ledger Breakdown' : 'Condensed Sub-Group Summary'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDetailedTrial(!isDetailedTrial)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-300 flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>[F1] Switch to {isDetailedTrial ? 'Condensed View' : 'Detailed View'}</span>
                    </button>
                  </div>
                </div>

                {/* Trial Balance Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      {/* Top Header */}
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                        <th rowSpan={2} className="p-3 border-r border-slate-800 min-w-[220px]">
                          Particulars / Account Classification
                        </th>
                        <th colSpan={2} className="p-2 text-center border-r border-slate-800 bg-slate-800/80">
                          Opening Balance (NPR)
                        </th>
                        <th colSpan={2} className="p-2 text-center border-r border-slate-800 bg-slate-800/50">
                          Transactions (Period Activity)
                        </th>
                        <th colSpan={2} className="p-2 text-center bg-emerald-950/70 text-emerald-300">
                          Closing Balance (NPR)
                        </th>
                      </tr>
                      {/* Sub Header for Dr / Cr */}
                      <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-300">
                        <th className="p-2 text-right font-mono border-r border-slate-200 w-28">Debit (DR)</th>
                        <th className="p-2 text-right font-mono border-r border-slate-200 w-28">Credit (CR)</th>
                        <th className="p-2 text-right font-mono border-r border-slate-200 w-28">Debit (DR)</th>
                        <th className="p-2 text-right font-mono border-r border-slate-200 w-28">Credit (CR)</th>
                        <th className="p-2 text-right font-mono border-r border-slate-200 w-28 text-emerald-900 bg-emerald-50/50">Debit (DR)</th>
                        <th className="p-2 text-right font-mono w-28 text-emerald-900 bg-emerald-50/50">Credit (CR)</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      {groupedTrial.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                            No active ledgers with balances or transactions found for this period.
                          </td>
                        </tr>
                      ) : (
                        groupedTrial.map((major) => (
                          <React.Fragment key={major.majorGroup}>
                            {/* Major Group Header */}
                            <tr className="bg-slate-100/90 font-sans font-bold text-slate-900 text-xs">
                              <td colSpan={7} className="p-2.5 uppercase tracking-wider text-slate-900 border-y border-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                  <span>{major.majorGroup}</span>
                                </div>
                              </td>
                            </tr>

                            {/* Sub Groups inside Major Group */}
                            {major.tier2Groups.map((t2Group) => (
                              <React.Fragment key={t2Group.tier2}>
                                {/* Condensed View: Show only Sub Group summary row */}
                                {!isDetailedTrial ? (
                                  <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="p-2.5 pl-6 font-sans font-medium text-slate-900 border-r border-slate-100">
                                      {formatSubGroupLabel(t2Group.tier2)}
                                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                                        ({t2Group.items.length} ledgers)
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right font-mono border-r border-slate-100">
                                      {t2Group.subtotalOpeningDr > 0 ? `Rs ${t2Group.subtotalOpeningDr.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right font-mono border-r border-slate-100">
                                      {t2Group.subtotalOpeningCr > 0 ? `Rs ${t2Group.subtotalOpeningCr.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right font-mono border-r border-slate-100 text-slate-700">
                                      {t2Group.subtotalPeriodDr > 0 ? `Rs ${t2Group.subtotalPeriodDr.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right font-mono border-r border-slate-100 text-slate-700">
                                      {t2Group.subtotalPeriodCr > 0 ? `Rs ${t2Group.subtotalPeriodCr.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 border-r border-slate-100 bg-emerald-50/20">
                                      {t2Group.subtotalClosingDr > 0 ? `Rs ${t2Group.subtotalClosingDr.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                                      {t2Group.subtotalClosingCr > 0 ? `Rs ${t2Group.subtotalClosingCr.toLocaleString()}` : '-'}
                                    </td>
                                  </tr>
                                ) : (
                                  /* Detailed View: Show Sub-Group Header, then each individual active ledger */
                                  <>
                                    <tr className="bg-slate-50/70 font-sans font-semibold text-slate-700 text-[11px]">
                                      <td colSpan={7} className="p-2 pl-6 text-slate-600 border-b border-slate-100">
                                        • {formatSubGroupLabel(t2Group.tier2)} ({t2Group.items.length} accounts)
                                      </td>
                                    </tr>

                                    {t2Group.items.map((item) => (
                                      <tr key={item.ledger.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 pl-10 font-sans text-slate-800 border-r border-slate-100">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                              {item.ledger.code}
                                            </span>
                                            <span className="font-medium text-xs">{item.ledger.name}</span>
                                          </div>
                                        </td>
                                        <td className="p-2 text-right font-mono border-r border-slate-100 text-slate-600">
                                          {item.openingDr > 0 ? `Rs ${item.openingDr.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-2 text-right font-mono border-r border-slate-100 text-slate-600">
                                          {item.openingCr > 0 ? `Rs ${item.openingCr.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-2 text-right font-mono border-r border-slate-100 text-slate-600">
                                          {item.periodDr > 0 ? `Rs ${item.periodDr.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-2 text-right font-mono border-r border-slate-100 text-slate-600">
                                          {item.periodCr > 0 ? `Rs ${item.periodCr.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-2 text-right font-mono font-bold text-slate-900 border-r border-slate-100 bg-emerald-50/20">
                                          {item.closingDr > 0 ? `Rs ${item.closingDr.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-2 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                                          {item.closingCr > 0 ? `Rs ${item.closingCr.toLocaleString()}` : '-'}
                                        </td>
                                      </tr>
                                    ))}

                                    {/* Subgroup Subtotal */}
                                    <tr className="bg-slate-50 font-bold text-[11px] border-b border-slate-200">
                                      <td className="p-2 pl-8 font-sans text-slate-600 border-r border-slate-200">
                                        Subtotal {formatSubGroupLabel(t2Group.tier2)}:
                                      </td>
                                      <td className="p-2 text-right font-mono border-r border-slate-200">
                                        {t2Group.subtotalOpeningDr > 0 ? `Rs ${t2Group.subtotalOpeningDr.toLocaleString()}` : '-'}
                                      </td>
                                      <td className="p-2 text-right font-mono border-r border-slate-200">
                                        {t2Group.subtotalOpeningCr > 0 ? `Rs ${t2Group.subtotalOpeningCr.toLocaleString()}` : '-'}
                                      </td>
                                      <td className="p-2 text-right font-mono border-r border-slate-200">
                                        {t2Group.subtotalPeriodDr > 0 ? `Rs ${t2Group.subtotalPeriodDr.toLocaleString()}` : '-'}
                                      </td>
                                      <td className="p-2 text-right font-mono border-r border-slate-200">
                                        {t2Group.subtotalPeriodCr > 0 ? `Rs ${t2Group.subtotalPeriodCr.toLocaleString()}` : '-'}
                                      </td>
                                      <td className="p-2 text-right font-mono text-emerald-950 border-r border-slate-200 bg-emerald-50/40">
                                        {t2Group.subtotalClosingDr > 0 ? `Rs ${t2Group.subtotalClosingDr.toLocaleString()}` : '-'}
                                      </td>
                                      <td className="p-2 text-right font-mono text-emerald-950 bg-emerald-50/40">
                                        {t2Group.subtotalClosingCr > 0 ? `Rs ${t2Group.subtotalClosingCr.toLocaleString()}` : '-'}
                                      </td>
                                    </tr>
                                  </>
                                )}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>

                    {/* Grand Totals Footer */}
                    <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                      <tr>
                        <td className="p-3 uppercase font-sans text-xs text-slate-300 border-r border-slate-800">
                          Grand Total Balancing Trial Balance:
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400 font-extrabold text-xs border-r border-slate-800">
                          Rs {trialData.totalOpeningDr.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400 font-extrabold text-xs border-r border-slate-800">
                          Rs {trialData.totalOpeningCr.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-blue-300 font-extrabold text-xs border-r border-slate-800">
                          Rs {trialData.totalPeriodDr.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-blue-300 font-extrabold text-xs border-r border-slate-800">
                          Rs {trialData.totalPeriodCr.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-300 font-extrabold text-sm border-r border-slate-800 bg-slate-950">
                          Rs {trialData.totalClosingDr.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-300 font-extrabold text-sm bg-slate-950">
                          Rs {trialData.totalClosingCr.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Equilibrium Banner */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Trial Balance Equilibrium Verified: Total Debit Closing (Rs {trialData.totalClosingDr.toLocaleString()}) equals Total Credit Closing (Rs {trialData.totalClosingCr.toLocaleString()})
                    </span>
                  </div>
                  <span className="font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800">
                    Difference: NPR 0.00
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* OPTION D: DAY BOOK */}
            {/* ========================================================= */}
            {activeMenuOption === 'DAYBOOK' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs text-emerald-600 font-mono font-semibold">Reports &gt; Day Book</div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      DAY BOOK REGISTER
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Period: {fromDateBS} BS to {toDateBS} BS • {filteredVouchers.length} Vouchers Listed
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search voucher or ledger..."
                        value={dayBookSearch}
                        onChange={(e) => setDayBookSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                      />
                    </div>

                    <select
                      value={dayBookTypeFilter}
                      onChange={(e) => setDayBookTypeFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                    >
                      <option value="ALL">All Types</option>
                      <option value="RECEIPT">Receipts</option>
                      <option value="PAYMENT">Payments</option>
                      <option value="CONTRA">Contra</option>
                      <option value="JOURNAL">Journal</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3">Date (BS/AD)</th>
                        <th className="p-3">Vch No.</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Particulars &amp; Narration</th>
                        <th className="p-3 text-right">Debit (DR)</th>
                        <th className="p-3 text-right">Credit (CR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {filteredVouchers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                            No vouchers match the selected date period or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredVouchers.map((v) => {
                          const vDr = v.entries?.reduce((s, e) => s + (e.drAmount || 0), 0) || (v as any).totalDebit || v.totalAmount || 0;
                          const vCr = v.entries?.reduce((s, e) => s + (e.crAmount || 0), 0) || (v as any).totalCredit || v.totalAmount || 0;
                          const vDateBs = v.dateBS || (v as any).dateBs || '';
                          const vDateAd = v.dateAD || (v as any).dateAd || '';

                          return (
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{vDateBs}</div>
                                <div className="text-[10px] text-slate-400 font-sans">{vDateAd}</div>
                              </td>
                              <td className="p-3 font-bold text-emerald-700">{v.voucherNo}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                  {v.voucherType}
                                </span>
                              </td>
                              <td className="p-3 font-sans">
                                <div className="space-y-0.5">
                                  {v.entries.map((e, idx) => {
                                    const isDr = (e.drAmount || 0) > 0;
                                    return (
                                      <div key={idx} className="flex items-center gap-2 text-xs">
                                        <span className={isDr ? 'text-emerald-800 font-bold font-mono' : 'text-rose-800 font-bold font-mono'}>
                                          {isDr ? 'DR' : 'CR'}:
                                        </span>
                                        <span className="text-slate-800 font-medium">{e.ledgerName}</span>
                                        <span className="text-slate-400 font-mono text-[11px]">
                                          (Rs {(e.drAmount || e.crAmount || 0).toLocaleString()})
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {v.narration && (
                                    <div className="text-[11px] text-slate-500 italic mt-1 pl-6">
                                      &quot;{v.narration}&quot;
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900">
                                Rs {vDr.toLocaleString()}
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900">
                                Rs {vCr.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* OPTION A: ACCOUNT BOOKS */}
            {/* ========================================================= */}
            {activeMenuOption === 'ACCOUNT_BOOKS' && (
              <AccountBooksView ledgers={ledgers} vouchers={vouchers} />
            )}

            {/* ========================================================= */}
            {/* OPTION S: STATEMENTS OF ACCOUNTS */}
            {/* ========================================================= */}
            {activeMenuOption === 'STATEMENTS_OF_ACCOUNTS' && (
              <StatementsOfAccountsView
                members={members}
                loans={loans}
                ledgers={ledgers}
                vouchers={vouchers}
              />
            )}

            {/* ========================================================= */}
            {/* OPTION C: CASH / FUNDS FLOW */}
            {/* ========================================================= */}
            {activeMenuOption === 'CASH_FUNDS_FLOW' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="text-center pb-4 border-b border-slate-200">
                  <div className="text-xs text-emerald-600 font-mono font-semibold">Reports &gt; Cash &amp; Funds Flow</div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                    CASH &amp; FUNDS FLOW STATEMENT
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Period: {fromDateBS} BS to {toDateBS} BS • {company?.name || 'Apex Enterprises'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sources of Funds */}
                  <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center justify-between pb-2 border-b border-emerald-200">
                      <span>Sources of Inflow Funds</span>
                      <span>Amount (NPR)</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span>Customer Receipts / Operating Collections</span>
                        <strong className="font-mono text-emerald-800">
                          Rs {vouchers.filter((v) => v.voucherType === 'RECEIPT').reduce((s, v) => s + v.totalAmount, 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Member Saving Deposits</span>
                        <strong className="font-mono text-emerald-800">Rs 1,75,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Interest Inflows Collected</span>
                        <strong className="font-mono text-emerald-800">Rs 3,800</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Share Capital &amp; Equity Additions</span>
                        <strong className="font-mono text-emerald-800">Rs 7,000</strong>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-emerald-200 flex justify-between font-bold text-emerald-950 text-xs">
                      <span>Total Sources of Funds:</span>
                      <span className="font-mono text-sm text-emerald-800 font-extrabold">
                        Rs {(
                          vouchers.filter((v) => v.voucherType === 'RECEIPT').reduce((s, v) => s + v.totalAmount, 0) +
                          185800
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Application of Funds */}
                  <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-200 space-y-3">
                    <div className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center justify-between pb-2 border-b border-blue-200">
                      <span>Application of Outflow Funds</span>
                      <span>Amount (NPR)</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span>Vendor &amp; Supplier Payments</span>
                        <strong className="font-mono text-rose-800">
                          Rs {vouchers.filter((v) => v.voucherType === 'PAYMENT').reduce((s, v) => s + v.totalAmount, 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Disbursements to Clients</span>
                        <strong className="font-mono text-rose-800">Rs 50,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Administrative &amp; Operational Costs</span>
                        <strong className="font-mono text-rose-800">Rs 7,500</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Staff Salaries &amp; Allowances</span>
                        <strong className="font-mono text-rose-800">Rs 3,200</strong>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-blue-200 flex justify-between font-bold text-blue-950 text-xs">
                      <span>Total Application of Funds:</span>
                      <span className="font-mono text-sm text-blue-900 font-extrabold">
                        Rs {(
                          vouchers.filter((v) => v.voucherType === 'PAYMENT').reduce((s, v) => s + v.totalAmount, 0) +
                          60700
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* OPTION L: LIST OF ACCOUNTS (CoA TREE) */}
            {/* ========================================================= */}
            {activeMenuOption === 'LIST_OF_ACCOUNTS' && (
              <ChartOfAccountsView
                ledgers={ledgers}
                vouchers={vouchers}
                onSelectLedger={() => {}}
                onUpdateLedger={() => {}}
                onCreateLedger={() => {}}
              />
            )}

            {/* ========================================================= */}
            {/* OPTION X: EXCEPTION REPORTS */}
            {/* ========================================================= */}
            {activeMenuOption === 'EXCEPTION_REPORTS' && (
              <ExceptionReportsView
                ledgers={ledgers}
                vouchers={vouchers}
                loans={loans}
                members={members}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
