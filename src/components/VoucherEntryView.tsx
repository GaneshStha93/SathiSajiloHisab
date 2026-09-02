import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Calendar,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Keyboard,
} from 'lucide-react';
import {
  Voucher,
  VoucherType,
  LedgerAccount,
  Member,
  CompanyMaster,
} from '../types';
import { TallyVoucherCreationModal } from './TallyVoucherCreationModal';
import { getDualToday } from '../utils/nepaliCalendar';

interface VoucherEntryViewProps {
  vouchers: Voucher[];
  ledgers: LedgerAccount[];
  members: Member[];
  company?: CompanyMaster;
  onAddVoucher: (voucher: Voucher) => void;
  isOpenNewModal: boolean;
  setIsOpenNewModal: (open: boolean) => void;
  initialVoucherType?: VoucherType;
}

export const VoucherEntryView: React.FC<VoucherEntryViewProps> = ({
  vouchers,
  ledgers,
  members,
  company,
  onAddVoucher,
  isOpenNewModal,
  setIsOpenNewModal,
  initialVoucherType,
}) => {
  const today = getDualToday();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  // Selected Voucher for Printable Slip Modal
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);

  // Active Voucher type for quick launch
  const [activeType, setActiveType] = useState<VoucherType>(initialVoucherType || 'RECEIPT');

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if any modal is open
      if (isOpenNewModal) return;

      // F4: Contra
      if (e.key === 'F4') {
        e.preventDefault();
        setActiveType('CONTRA');
        setIsOpenNewModal(true);
      }
      // F5: Payment
      else if (e.key === 'F5') {
        e.preventDefault();
        setActiveType('PAYMENT');
        setIsOpenNewModal(true);
      }
      // F6: Receipt
      else if (e.key === 'F6') {
        e.preventDefault();
        setActiveType('RECEIPT');
        setIsOpenNewModal(true);
      }
      // F7: Journal
      else if (e.key === 'F7') {
        e.preventDefault();
        setActiveType('JOURNAL');
        setIsOpenNewModal(true);
      }
      // Alt+N: New Voucher Entry
      else if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setActiveType('RECEIPT');
        setIsOpenNewModal(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpenNewModal, setIsOpenNewModal]);

  // Filter Day Book Vouchers
  const filteredVouchers = vouchers.filter((v) => {
    if (selectedTypeFilter !== 'ALL' && v.voucherType !== selectedTypeFilter) return false;
    if (selectedDateFilter && !v.dateBS.includes(selectedDateFilter) && !v.dateAD.includes(selectedDateFilter)) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVoucherNo = v.voucherNo.toLowerCase().includes(q);
      const matchNarration = v.narration.toLowerCase().includes(q);
      const matchEntry = v.entries.some((e) => e.ledgerName.toLowerCase().includes(q));
      if (!matchVoucherNo && !matchNarration && !matchEntry) return false;
    }
    return true;
  });

  // Calculate Totals for Day Book
  const dayBookTotalDr = filteredVouchers.reduce(
    (sum, v) => sum + v.entries.reduce((s, e) => s + (Number(e.drAmount) || 0), 0),
    0
  );
  const dayBookTotalCr = filteredVouchers.reduce(
    (sum, v) => sum + v.entries.reduce((s, e) => s + (Number(e.crAmount) || 0), 0),
    0
  );

  // Print Day Book
  const handlePrintDayBook = () => {
    window.print();
  };

  // Export Day Book CSV
  const handleExportCSV = () => {
    const rows = [
      ['Voucher No', 'Type', 'Date (BS)', 'Date (AD)', 'Ledger Account', 'Debit (DR)', 'Credit (CR)', 'Narration', 'Created By'],
    ];

    filteredVouchers.forEach((v) => {
      v.entries.forEach((e) => {
        rows.push([
          v.voucherNo,
          v.voucherType,
          v.dateBS,
          v.dateAD,
          `"${e.ledgerName}"`,
          String(e.drAmount || 0),
          String(e.crAmount || 0),
          `"${v.narration}"`,
          v.createdBy,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sathi_DayBook_${today.bsDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Voucher Entry
          </h1>
          <p className="text-xs text-slate-500">
            Rapid double-entry voucher workstation with dynamic Particulars grid, Dr/Cr rules &amp; instant ledger search
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Direct Voucher Launchers in Sequential F4, F5, F6, F7 Order */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveType('CONTRA');
                setIsOpenNewModal(true);
              }}
              title="Open Contra Voucher Workstation (F4)"
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-50 text-blue-800 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3 text-blue-600" />
              <span>Contra <strong className="text-[10px] text-blue-800 font-mono">[F4]</strong></span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveType('PAYMENT');
                setIsOpenNewModal(true);
              }}
              title="Open Payment Voucher Workstation (F5)"
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-800 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3 h-3 text-rose-600" />
              <span>Payment <strong className="text-[10px] text-rose-800 font-mono">[F5]</strong></span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveType('RECEIPT');
                setIsOpenNewModal(true);
              }}
              title="Open Receipt Voucher Workstation (F6)"
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
              <span>Receipt <strong className="text-[10px] text-emerald-800 font-mono">[F6]</strong></span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveType('JOURNAL');
                setIsOpenNewModal(true);
              }}
              title="Open Journal Voucher Workstation (F7)"
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-amber-50 text-amber-800 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Layers className="w-3 h-3 text-amber-600" />
              <span>Journal <strong className="text-[10px] text-amber-800 font-mono">[F7]</strong></span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={handlePrintDayBook}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            Print Day Book
          </button>

          <button
            onClick={() => {
              setActiveType('RECEIPT');
              setIsOpenNewModal(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + New Voucher Entry [Alt+N]
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ledger, narration, voucher #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-emerald-600"
        >
          <option value="ALL">All Voucher Types</option>
          <option value="RECEIPT">Receipt Vouchers</option>
          <option value="PAYMENT">Payment Vouchers</option>
          <option value="CONTRA">Contra Vouchers</option>
          <option value="JOURNAL">Journal Vouchers</option>
        </select>

        {/* Date Filter */}
        <input
          type="text"
          placeholder="Filter by BS/AD Date (e.g. 2081-01)"
          value={selectedDateFilter}
          onChange={(e) => setSelectedDateFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-emerald-600 font-mono"
        />

        {/* Summary Counter */}
        <div className="flex items-center justify-end text-xs font-semibold text-slate-500">
          Total Vouchers: <span className="text-emerald-700 font-bold ml-1 font-mono">{filteredVouchers.length}</span>
        </div>
      </div>

      {/* Day Book Table View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Dual Date (BS / AD)</th>
                <th className="py-3 px-4">Particulars / Account Ledger</th>
                <th className="py-3 px-3 text-right">Debit (DR)</th>
                <th className="py-3 px-3 text-right">Credit (CR)</th>
                <th className="py-3 px-4">Narration &amp; Tag</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((vch) => (
                  <React.Fragment key={vch.id}>
                    {vch.entries.map((entry, idx) => (
                      <tr
                        key={`${vch.id}-${entry.id}`}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          idx === 0 ? 'border-t border-slate-200' : ''
                        }`}
                      >
                        {/* Group Header on first row */}
                        {idx === 0 ? (
                          <>
                            <td rowSpan={vch.entries.length} className="py-3 px-4 align-top font-mono font-bold text-slate-900 bg-slate-50/30">
                              {vch.voucherNo}
                            </td>
                            <td rowSpan={vch.entries.length} className="py-3 px-3 align-top">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  vch.voucherType === 'RECEIPT'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : vch.voucherType === 'PAYMENT'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : vch.voucherType === 'CONTRA'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {vch.voucherType}
                              </span>
                            </td>
                            <td rowSpan={vch.entries.length} className="py-3 px-3 align-top font-mono text-[11px] text-slate-700">
                              <div className="font-bold">{vch.dateBS}</div>
                              <div className="text-[10px] text-slate-400 font-sans">{vch.dateAD}</div>
                            </td>
                          </>
                        ) : null}

                        {/* Particulars */}
                        <td className="py-2.5 px-4 font-medium text-slate-900">
                          {entry.ledgerName}
                        </td>

                        {/* Debit */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                          {entry.drAmount > 0 ? `Rs ${entry.drAmount.toLocaleString('en-IN')}` : '-'}
                        </td>

                        {/* Credit */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                          {entry.crAmount > 0 ? `Rs ${entry.crAmount.toLocaleString('en-IN')}` : '-'}
                        </td>

                        {/* Narration on first row */}
                        {idx === 0 ? (
                          <>
                            <td rowSpan={vch.entries.length} className="py-3 px-4 align-top text-slate-600 max-w-xs">
                              <div className="line-clamp-2">{vch.narration}</div>
                              {vch.autoTag && (
                                <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  ⚡ {vch.autoTag}
                                </span>
                              )}
                            </td>
                            <td rowSpan={vch.entries.length} className="py-3 px-3 align-top text-center">
                              <button
                                onClick={() => setViewingVoucher(vch)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                Slip
                              </button>
                            </td>
                          </>
                        ) : null}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider text-[11px] text-slate-600">
                  Total Day Book Volume (DR / CR):
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-700 font-bold">
                  Rs {dayBookTotalDr.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-700 font-bold">
                  Rs {dayBookTotalCr.toLocaleString('en-IN')}
                </td>
                <td colSpan={2} className="py-3.5 px-3 text-center">
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fully Balanced
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TALLY.ERP 9 ACCOUNTING VOUCHER CREATION WORKSTATION MODAL */}
      {/* ========================================================================= */}
      <TallyVoucherCreationModal
        isOpen={isOpenNewModal}
        onClose={() => setIsOpenNewModal(false)}
        vouchers={vouchers}
        ledgers={ledgers}
        members={members}
        onAddVoucher={onAddVoucher}
        onPreviewSlip={(voucher) => {
          setViewingVoucher(voucher);
        }}
        initialVoucherType={activeType}
      />

      {/* Printable Voucher Slip Modal */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4 border border-slate-200 print:border-none print:shadow-none my-8">
            {/* Voucher Header */}
            <div className="text-center border-b pb-4 border-slate-200">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {company?.name || 'SATHI SAJILO HISAB ERP'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {company?.address || 'Kathmandu, Nepal'} {company?.panVatNo ? `• PAN/VAT: ${company.panVatNo}` : ''}
              </p>
              <div className="mt-2.5 inline-block px-4 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest">
                {viewingVoucher.voucherType} VOUCHER ({viewingVoucher.voucherType === 'RECEIPT' ? 'RECEIPT MODE' : viewingVoucher.voucherType === 'PAYMENT' ? 'PAYMENT MODE' : 'TRANSFER MODE'})
              </div>
            </div>

            {/* Voucher Meta Info */}
            <div className="grid grid-cols-2 text-xs gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-500 font-medium">Voucher No:</span> <strong className="font-mono text-slate-900">{viewingVoucher.voucherNo}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">Date (BS):</span> <strong className="text-slate-900">{viewingVoucher.dateBS}</strong> <span className="text-slate-500">({viewingVoucher.dateAD} AD)</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Fiscal Year:</span> <strong className="text-slate-900">{company?.fiscalYearLabel || '2081/082'}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">Total Amount:</span> <strong className="font-mono text-emerald-700 text-sm">Rs {viewingVoucher.totalAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Receipt/Payment Mode Structured Display */}
            {viewingVoucher.voucherType === 'RECEIPT' ? (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-emerald-50/80 px-3 py-2 border-b border-slate-200 font-bold text-emerald-950 flex items-center justify-between">
                    <span>Received From / Source Account (Credit)</span>
                    <span>Amount Received</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {viewingVoucher.entries.filter(e => e.crAmount > 0).map((e) => (
                      <div key={e.id} className="px-3 py-2 flex items-center justify-between">
                        <div className="font-medium text-slate-900">{e.ledgerName}</div>
                        <div className="font-mono font-bold text-slate-800">Rs {e.crAmount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50/80 px-3 py-2 border-t border-b border-slate-200 font-bold text-blue-950 flex items-center justify-between">
                    <span>Deposited Into / Cash &amp; Bank Account (Debit)</span>
                    <span>Mode</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {viewingVoucher.entries.filter(e => e.drAmount > 0).map((e) => (
                      <div key={e.id} className="px-3 py-2 flex items-center justify-between">
                        <div className="font-medium text-slate-900">{e.ledgerName}</div>
                        <div className="font-mono font-bold text-emerald-700">Rs {e.drAmount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : viewingVoucher.voucherType === 'PAYMENT' ? (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-rose-50/80 px-3 py-2 border-b border-slate-200 font-bold text-rose-950 flex items-center justify-between">
                    <span>Paid To / Expense &amp; Liability Account (Debit)</span>
                    <span>Payment For</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {viewingVoucher.entries.filter(e => e.drAmount > 0).map((e) => (
                      <div key={e.id} className="px-3 py-2 flex items-center justify-between">
                        <div className="font-medium text-slate-900">{e.ledgerName}</div>
                        <div className="font-mono font-bold text-slate-800">Rs {e.drAmount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50/80 px-3 py-2 border-t border-b border-slate-200 font-bold text-amber-950 flex items-center justify-between">
                    <span>Paid From / Cash &amp; Bank Source (Credit)</span>
                    <span>Disbursed</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {viewingVoucher.entries.filter(e => e.crAmount > 0).map((e) => (
                      <div key={e.id} className="px-3 py-2 flex items-center justify-between">
                        <div className="font-medium text-slate-900">{e.ledgerName}</div>
                        <div className="font-mono font-bold text-rose-700">Rs {e.crAmount.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Table for Contra & Journal */
              <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden my-2">
                <thead className="bg-slate-50 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-600">
                  <tr>
                    <th className="p-2.5 text-left">Particulars / Account</th>
                    <th className="p-2.5 text-right">Debit (NPR)</th>
                    <th className="p-2.5 text-right">Credit (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {viewingVoucher.entries.map((e) => (
                    <tr key={e.id}>
                      <td className="p-2.5 font-sans font-medium text-slate-900">{e.ledgerName}</td>
                      <td className="p-2.5 text-right font-semibold">{e.drAmount > 0 ? `Rs ${e.drAmount.toLocaleString()}` : '-'}</td>
                      <td className="p-2.5 text-right font-semibold">{e.crAmount > 0 ? `Rs ${e.crAmount.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td className="p-2.5 text-right text-slate-600">Total:</td>
                    <td className="p-2.5 text-right text-emerald-700 font-bold">Rs {viewingVoucher.totalAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-emerald-700 font-bold">Rs {viewingVoucher.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Narration */}
            <div className="text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold">Narration:</span> <span className="text-slate-800 font-medium">{viewingVoucher.narration}</span>
            </div>

            {/* Signatures: Only Prepared By & Authorized Signatory */}
            <div className="grid grid-cols-2 text-center text-xs text-slate-600 pt-8 pb-2">
              <div className="mx-6 border-t border-slate-300 pt-2 font-medium">Prepared By</div>
              <div className="mx-6 border-t border-slate-300 pt-2 font-medium">Authorized Signatory / Receiver</div>
            </div>

            {/* Print / Close Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setViewingVoucher(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Voucher Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};
