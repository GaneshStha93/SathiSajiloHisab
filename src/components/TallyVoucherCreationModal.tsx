import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Calendar,
  Search,
  Plus,
  Trash2,
  Printer,
  FileText,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  Keyboard,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  Voucher,
  VoucherType,
  VoucherEntryItem,
  LedgerAccount,
  Member,
} from '../types';
import { DualDatePicker } from './DualDatePicker';
import { getDualToday } from '../utils/nepaliCalendar';

interface TallyVoucherCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  ledgers: LedgerAccount[];
  members: Member[];
  onAddVoucher: (voucher: Voucher) => void;
  onPreviewSlip?: (voucher: Voucher) => void;
  initialVoucherType?: VoucherType;
}

interface TallyLineRow {
  id: string;
  drCr: 'Dr' | 'Cr';
  ledgerId: string;
  amount: number | string;
  narration?: string;
}

export const TallyVoucherCreationModal: React.FC<TallyVoucherCreationModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  ledgers,
  members,
  onAddVoucher,
  onPreviewSlip,
  initialVoucherType = 'PAYMENT' as VoucherType,
}) => {
  const today = getDualToday();

  // Mode & Type
  const [vType, setVType] = useState<VoucherType>(initialVoucherType);
  const [isSingleEntryMode, setIsSingleEntryMode] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(true);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showPresetMenu, setShowPresetMenu] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Date States
  const [dateBS, setDateBS] = useState<string>(today.bsDate);
  const [dateAD, setDateAD] = useState<string>(today.adDate);

  // Top Account for Single Entry Mode (Bank or Cash)
  const cashAndBankLedgers = useMemo(
    () =>
      ledgers.filter(
        (l) =>
          l.majorGroup === 'ASSETS' &&
          l.tier1 === 'CURRENT_ASSETS' &&
          l.tier2 === 'CASH_AND_BANK'
      ),
    [ledgers]
  );

  const defaultCashOrBankId = cashAndBankLedgers[0]?.id || ledgers[0]?.id || 'led-cash-1';
  const [headerAccountId, setHeaderAccountId] = useState<string>(defaultCashOrBankId);

  // Particulars Line Items
  const [particularRows, setParticularRows] = useState<TallyLineRow[]>([
    {
      id: 'row-1',
      drCr: initialVoucherType === 'PAYMENT' ? 'Dr' : 'Cr',
      ledgerId: ledgers.find((l) => l.majorGroup === 'EXPENSES')?.id || ledgers[1]?.id || '',
      amount: 5000,
      narration: '',
    },
  ]);

  // Overall Narration
  const [narration, setNarration] = useState<string>('');

  // Active Typeahead dropdown state for inline table
  const [activeSearchRowId, setActiveSearchRowId] = useState<string | null>(null);
  const [activeHeaderSearch, setActiveHeaderSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLTextAreaElement>(null);

  // Formatted day of week in English
  const dayOfWeek = useMemo(() => {
    try {
      const d = new Date(dateAD);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return 'Today';
    }
  }, [dateAD]);

  // Next voucher number estimation
  const currentVoucherNumber = useMemo(() => {
    const matchingCount = vouchers.filter((v) => v.voucherType === vType).length + 1;
    return matchingCount;
  }, [vouchers, vType]);

  // Computed Voucher Code String
  const voucherCodeDisplay = useMemo(() => {
    const prefix =
      vType === 'RECEIPT' ? 'RCT' : vType === 'PAYMENT' ? 'PMT' : vType === 'JOURNAL' ? 'JRN' : 'CNT';
    return `${prefix}-${dateBS.substring(0, 4)}-${String(currentVoucherNumber).padStart(4, '0')}`;
  }, [vType, dateBS, currentVoucherNumber]);

  // Reset or Switch Voucher Type
  const handleSwitchVType = (newType: VoucherType = 'RECEIPT') => {
    setVType(newType);
    setSearchQuery('');
    setActiveSearchRowId(null);
    setActiveHeaderSearch(false);

    if (newType === 'CONTRA') {
      const fromAcc = cashAndBankLedgers[0]?.id || defaultCashOrBankId;
      const toAcc = cashAndBankLedgers[1]?.id || defaultCashOrBankId;
      setHeaderAccountId(fromAcc);
      setParticularRows([
        {
          id: 'row-1',
          drCr: 'Dr',
          ledgerId: toAcc,
          amount: 50000,
          narration: 'Cash deposited into bank account',
        },
      ]);
      setNarration('Internal transfer between Cash Vault and Bank Account');
    } else if (newType === 'PAYMENT') {
      setHeaderAccountId(defaultCashOrBankId);
      const expLedger = ledgers.find((l) => l.majorGroup === 'EXPENSES') || ledgers[0];
      setParticularRows([
        {
          id: 'row-1',
          drCr: 'Dr',
          ledgerId: expLedger?.id || '',
          amount: 5000,
          narration: 'Monthly Office Expenses',
        },
      ]);
      setNarration('');
    } else if (newType === 'RECEIPT') {
      setHeaderAccountId(defaultCashOrBankId);
      const depLedger = ledgers.find((l) => l.tier2 === 'MEMBERS_DEPOSIT') || ledgers[0];
      setParticularRows([
        {
          id: 'row-1',
          drCr: 'Cr',
          ledgerId: depLedger?.id || '',
          amount: 25000,
          narration: 'Member 25-Day Monthly Saving Deposit',
        },
      ]);
      setNarration('');
    } else if (newType === 'JOURNAL') {
      setIsSingleEntryMode(false);
      const firstLed = ledgers[0];
      const secondLed = ledgers[1] || ledgers[0];
      setParticularRows([
        {
          id: 'row-1',
          drCr: 'Dr',
          ledgerId: firstLed?.id || '',
          amount: 25000,
          narration: '',
        },
        {
          id: 'row-2',
          drCr: 'Cr',
          ledgerId: secondLed?.id || '',
          amount: 25000,
          narration: '',
        },
      ]);
      setNarration('Adjustment journal entry');
    }
  };

  // Sync initial type
  useEffect(() => {
    if (isOpen) {
      const targetType: VoucherType = initialVoucherType || 'RECEIPT';
      handleSwitchVType(targetType);
    }
  }, [isOpen, initialVoucherType]);

  // Selected Header Ledger Object & Balance
  const headerLedger = useMemo(
    () => ledgers.find((l) => l.id === headerAccountId),
    [ledgers, headerAccountId]
  );

  // Particulars Total Amount
  const totalAmount = useMemo(() => {
    return particularRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [particularRows]);

  // Double entry calculation for Journal mode
  const journalDrTotal = useMemo(() => {
    return particularRows
      .filter((r) => r.drCr === 'Dr')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [particularRows]);

  const journalCrTotal = useMemo(() => {
    return particularRows
      .filter((r) => r.drCr === 'Cr')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [particularRows]);

  const isJournalBalanced = useMemo(() => {
    if (vType !== 'JOURNAL') return true;
    return journalDrTotal > 0 && Math.abs(journalDrTotal - journalCrTotal) < 0.01;
  }, [vType, journalDrTotal, journalCrTotal]);

  // Add new particular line row
  const handleAddRow = () => {
    const newId = `row-${Date.now()}`;
    const nextDrCr = vType === 'RECEIPT' ? 'Cr' : vType === 'PAYMENT' ? 'Dr' : 'Dr';
    setParticularRows([
      ...particularRows,
      {
        id: newId,
        drCr: nextDrCr,
        ledgerId: '',
        amount: '',
        narration: '',
      },
    ]);
    setActiveSearchRowId(newId);
    setSearchQuery('');
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    if (particularRows.length <= 1) return;
    setParticularRows(particularRows.filter((r) => r.id !== rowId));
  };

  // Update row field
  const handleUpdateRow = (rowId: string, field: keyof TallyLineRow, value: any) => {
    setParticularRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Format Nepali currency style
  const formatCurrency = (val: number | string | undefined) => {
    const n = Number(val) || 0;
    return n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper to compile final voucher object
  const compileVoucherObject = (): { voucher: Voucher | null; error?: string } => {
    const validRows = particularRows.filter((r) => r.ledgerId && Number(r.amount) > 0);

    if (validRows.length === 0) {
      return { voucher: null, error: 'Please enter at least one valid ledger line and amount.' };
    }

    let finalEntries: VoucherEntryItem[] = [];

    if (vType === 'PAYMENT') {
      if (!headerLedger) return { voucher: null, error: 'Please select a valid payment Cash/Bank account.' };
      const sumAmount = validRows.reduce((s, r) => s + Number(r.amount), 0);

      // Debit line items (Expenses/Payees)
      validRows.forEach((r, idx) => {
        const l = ledgers.find((item) => item.id === r.ledgerId);
        finalEntries.push({
          id: `p-${idx}`,
          ledgerId: r.ledgerId,
          ledgerName: l?.name || 'Account',
          drAmount: Number(r.amount),
          crAmount: 0,
          memberId: l?.memberId,
          narration: r.narration || narration || `Payment to ${l?.name}`,
        });
      });

      // Credit Header Account (Cash/Bank)
      finalEntries.push({
        id: `p-bank`,
        ledgerId: headerLedger.id,
        ledgerName: headerLedger.name,
        drAmount: 0,
        crAmount: sumAmount,
        narration: `Paid via ${headerLedger.name}`,
      });
    } else if (vType === 'RECEIPT') {
      if (!headerLedger) return { voucher: null, error: 'Please select a valid receipt Cash/Bank account.' };
      const sumAmount = validRows.reduce((s, r) => s + Number(r.amount), 0);

      // Debit Header Account (Cash/Bank)
      finalEntries.push({
        id: `r-bank`,
        ledgerId: headerLedger.id,
        ledgerName: headerLedger.name,
        drAmount: sumAmount,
        crAmount: 0,
        narration: `Received into ${headerLedger.name}`,
      });

      // Credit line items (Deposit / Income)
      validRows.forEach((r, idx) => {
        const l = ledgers.find((item) => item.id === r.ledgerId);
        finalEntries.push({
          id: `r-${idx}`,
          ledgerId: r.ledgerId,
          ledgerName: l?.name || 'Account',
          drAmount: 0,
          crAmount: Number(r.amount),
          memberId: l?.memberId,
          narration: r.narration || narration || `Received from ${l?.name}`,
        });
      });
    } else if (vType === 'CONTRA') {
      if (!headerLedger) return { voucher: null, error: 'Please select source Cash/Bank account.' };
      const targetRow = validRows[0];
      const targetLedger = ledgers.find((l) => l.id === targetRow.ledgerId);

      if (!targetLedger || targetLedger.id === headerLedger.id) {
        return { voucher: null, error: 'Source and Destination Cash/Bank accounts cannot be identical!' };
      }

      const amt = Number(targetRow.amount);
      finalEntries = [
        {
          id: '1',
          ledgerId: targetLedger.id,
          ledgerName: targetLedger.name,
          drAmount: amt,
          crAmount: 0,
          narration: `Fund transferred to ${targetLedger.name}`,
        },
        {
          id: '2',
          ledgerId: headerLedger.id,
          ledgerName: headerLedger.name,
          drAmount: 0,
          crAmount: amt,
          narration: `Fund transferred from ${headerLedger.name}`,
        },
      ];
    } else {
      // JOURNAL
      if (!isJournalBalanced) {
        return {
          voucher: null,
          error: `Debit (Rs ${formatCurrency(journalDrTotal)}) and Credit (Rs ${formatCurrency(journalCrTotal)}) must match exactly!`,
        };
      }

      finalEntries = validRows.map((r, idx) => {
        const l = ledgers.find((item) => item.id === r.ledgerId);
        const amt = Number(r.amount);
        return {
          id: `j-${idx}`,
          ledgerId: r.ledgerId,
          ledgerName: l?.name || 'Account',
          drAmount: r.drCr === 'Dr' ? amt : 0,
          crAmount: r.drCr === 'Cr' ? amt : 0,
          memberId: l?.memberId,
          narration: r.narration || narration || 'Journal adjustment',
        };
      });
    }

    const calculatedTotal =
      vType === 'JOURNAL' ? journalDrTotal : validRows.reduce((s, r) => s + Number(r.amount), 0);

    const newVoucher: Voucher = {
      id: `vch-${Date.now()}`,
      voucherNo: voucherCodeDisplay,
      voucherType: vType,
      dateBS,
      dateAD,
      narration: narration.trim() || `${vType} Voucher entry for ${finalEntries[0]?.ledgerName}`,
      totalAmount: calculatedTotal,
      createdBy: 'Bikram Adhikari',
      status: 'POSTED',
      createdAt: new Date().toISOString(),
      entries: finalEntries,
    };

    return { voucher: newVoucher };
  };

  // Save / Accept Voucher
  const handleAccept = () => {
    const { voucher, error } = compileVoucherObject();
    if (error || !voucher) {
      alert(error || 'Validation error');
      return;
    }

    onAddVoucher(voucher);
    onClose();
  };

  // Save & Print
  const handleSaveAndPrint = () => {
    const { voucher, error } = compileVoucherObject();
    if (error || !voucher) {
      alert(error || 'Validation error');
      return;
    }

    onAddVoucher(voucher);
    onClose();
    if (onPreviewSlip) {
      onPreviewSlip(voucher);
    }
  };

  // Preview Draft Slip
  const handlePreview = () => {
    const { voucher, error } = compileVoucherObject();
    if (error || !voucher) {
      alert(error || 'Validation error');
      return;
    }
    if (onPreviewSlip) {
      onPreviewSlip(voucher);
    }
  };

  // Keyboard Shortcuts listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting inside text inputs when typing standard letters unless with Ctrl/Alt
      const isInput =
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      // F2 -> Date
      if (e.key === 'F2') {
        e.preventDefault();
        setShowDatePicker((prev) => !prev);
        return;
      }

      // F4 -> Contra
      if (e.key === 'F4' || (e.altKey && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        handleSwitchVType('CONTRA');
        return;
      }

      // F5 -> Payment
      if (e.key === 'F5' || (e.altKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        handleSwitchVType('PAYMENT');
        return;
      }

      // F6 -> Receipt
      if (e.key === 'F6' || (e.altKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        handleSwitchVType('RECEIPT');
        return;
      }

      // F7 -> Journal
      if (e.key === 'F7' || (e.altKey && e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        handleSwitchVType('JOURNAL');
        return;
      }

      // F12 -> Configuration
      if (e.key === 'F12') {
        e.preventDefault();
        setShowConfigModal(true);
        return;
      }

      // Ctrl + A or Alt + A -> Accept / Save
      if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAccept();
        return;
      }

      // Alt + P -> Save & Print
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleSaveAndPrint();
        return;
      }

      // Alt + V -> Preview Slip
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePreview();
        return;
      }

      // Escape -> Close modal / Quit
      if (e.key === 'Escape') {
        if (activeSearchRowId || activeHeaderSearch) {
          setActiveSearchRowId(null);
          setActiveHeaderSearch(false);
        } else if (showDatePicker) {
          setShowDatePicker(false);
        } else if (showPresetMenu) {
          setShowPresetMenu(false);
        } else if (showConfigModal) {
          setShowConfigModal(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    vType,
    particularRows,
    headerAccountId,
    narration,
    activeSearchRowId,
    activeHeaderSearch,
    showDatePicker,
    showPresetMenu,
    showConfigModal,
  ]);

  if (!isOpen) return null;

  // Filtered ledgers for typeahead
  const filteredLedgers = ledgers.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.code.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.tier2.toLowerCase().includes(q) ||
      l.majorGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-1 sm:p-3 backdrop-blur-xs font-sans select-none animate-in fade-in duration-150">
      <div
        className={`w-full bg-white rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized ? 'h-[98vh] max-w-[98vw]' : 'h-[90vh] max-w-6xl'
        }`}
      >
        {/* ========================================================= */}
        {/* 1. TOP TITLE BAR (Accounting Voucher Creation) */}
        {/* ========================================================= */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 text-slate-100">
              <FileText className="w-4 h-4 text-emerald-400" />
              Accounting Voucher Creation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-300 hidden md:inline-block px-2 py-0.5 bg-slate-800 rounded border border-emerald-500/30">
              Ctrl + M
            </span>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMaximized ? 'Restore window' : 'Maximize window'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-rose-600 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: WORKSPACE CANVAS + RIGHT VERTICAL BUTTON BAR   */}
        {/* ========================================================= */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* LEFT: ACCOUNTING VOUCHER WORKSTATION CANVAS */}
          <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 overflow-y-auto">
            {/* ------------------------------------------------------- */}
            {/* VOUCHER HEADER SUB-BAR (Badge, No., Miti, Date, Day)    */}
            {/* ------------------------------------------------------- */}
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {/* Voucher Type Badge */}
                <div
                  className={`px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xs rounded-md flex items-center gap-1.5 ${
                    vType === 'PAYMENT'
                      ? 'bg-rose-600'
                      : vType === 'RECEIPT'
                      ? 'bg-emerald-600'
                      : vType === 'CONTRA'
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
                  }`}
                >
                  {vType === 'PAYMENT' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {vType === 'RECEIPT' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                  {vType === 'CONTRA' && <ArrowRightLeft className="w-3.5 h-3.5" />}
                  {vType === 'JOURNAL' && <Layers className="w-3.5 h-3.5" />}
                  {vType}
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                  <span className="text-slate-500">No.</span>
                  <span className="font-mono px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-900">
                    {currentVoucherNumber}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                    ({voucherCodeDisplay})
                  </span>
                </div>
              </div>

              {/* Miti & Date Box on the right */}
              <div
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 px-2 py-1 rounded border border-transparent hover:border-emerald-300 transition-colors"
                title="Click or press F2 to change Miti / Date"
              >
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1 font-mono">
                    <span className="text-slate-500 font-sans text-[11px]">Miti :</span>
                    <span className="bg-amber-100 text-amber-900 px-1 rounded font-bold border border-amber-300">
                      {dateBS}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 flex items-center justify-end gap-1.5">
                    <span>{dateAD}</span>
                    <span className="font-semibold text-slate-800 font-sans">{dayOfWeek}</span>
                  </div>
                </div>
                <Calendar className="w-4 h-4 text-emerald-800 hidden sm:block" />
              </div>
            </div>

            {/* Date Picker Modal Drawer if active */}
            {showDatePicker && (
              <div className="p-3 bg-white border-b-2 border-emerald-600 shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800">Select Voucher Date (Miti BS / AD):</span>
                </div>
                <div className="flex items-center gap-3">
                  <DualDatePicker
                    bsDate={dateBS}
                    adDate={dateAD}
                    onChange={(bs, ad) => {
                      setDateBS(bs);
                      setDateAD(ad);
                    }}
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded cursor-pointer"
                  >
                    Done [Enter]
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* 2. TOP ACCOUNT BAR (Single Account / Bank / Cash)       */}
            {/* ------------------------------------------------------- */}
            {vType !== 'JOURNAL' && (
              <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-100/70 flex flex-col gap-1">
                <div className="flex items-center gap-2 relative">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 w-20 shrink-0">
                    Account :
                  </span>

                  <div className="relative flex-1 max-w-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveHeaderSearch(!activeHeaderSearch);
                        setSearchQuery('');
                      }}
                      className="w-full text-left bg-white border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between shadow-2xs cursor-pointer focus:ring-2 focus:ring-emerald-500"
                    >
                      <span className="truncate">
                        [{headerLedger?.code}] {headerLedger?.name || 'Select Cash/Bank Account'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {/* Dropdown search for header account */}
                    {activeHeaderSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-slate-200 bg-slate-50 sticky top-0">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Type Cash/Bank account name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                          />
                        </div>
                        <ul className="py-1 divide-y divide-slate-100 text-xs">
                          {cashAndBankLedgers.map((l) => (
                            <li
                              key={l.id}
                              onClick={() => {
                                setHeaderAccountId(l.id);
                                setActiveHeaderSearch(false);
                              }}
                              className="px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center justify-between font-medium text-slate-800"
                            >
                              <div>
                                <span className="font-bold text-emerald-800">[{l.code}]</span> {l.name}
                              </div>
                              <span className="font-mono text-[11px] text-slate-600">
                                Bal: Rs {(l.currentBalance || 0).toLocaleString('en-IN')} {l.currentType}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Current Balance beneath Account field */}
                <div className="pl-20 text-[11px] font-mono text-slate-600 flex items-center gap-2">
                  <span className="italic font-sans text-slate-500 font-bold">Cur Bal :</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                    Rs {(headerLedger?.currentBalance || 0).toLocaleString('en-IN')} {headerLedger?.currentType || 'Dr'}
                  </span>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* 3. PARTICULARS TABLE (The Classic Tally Grid)           */}
            {/* ------------------------------------------------------- */}
            <div ref={tableContainerRef} className="flex-1 px-4 py-3 flex flex-col justify-between">
              <div>
                {/* Table Header */}
                <div className="border-y border-slate-300 py-2 px-2 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 tracking-wide bg-slate-100/90 rounded-t">
                  <div className="w-12 text-center">
                    {vType === 'JOURNAL' ? 'By / To' : '#'}
                  </div>
                  <div className="flex-1 px-3">Particulars</div>
                  <div className="w-44 text-right pr-2">Amount (NPR)</div>
                  <div className="w-10 text-center"></div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-200 py-1 bg-white border-x border-b border-slate-200 rounded-b shadow-2xs">
                  {particularRows.map((row, index) => {
                    const rowLedger = ledgers.find((l) => l.id === row.ledgerId);
                    const isDropdownActive = activeSearchRowId === row.id;

                    return (
                      <div key={row.id} className="py-2 px-1 hover:bg-amber-50/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {/* Row Indicator or Dr/Cr selector for Journal */}
                          <div className="w-12 text-center shrink-0">
                            {vType === 'JOURNAL' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateRow(row.id, 'drCr', row.drCr === 'Dr' ? 'Cr' : 'Dr')
                                }
                                className={`px-2 py-0.5 text-xs font-bold font-mono rounded border ${
                                  row.drCr === 'Dr'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {row.drCr}
                              </button>
                            ) : (
                              <span className="text-xs font-mono text-slate-400 font-semibold">
                                {index + 1}.
                              </span>
                            )}
                          </div>

                          {/* Particulars Ledger Selector with Typeahead */}
                          <div className="flex-1 relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSearchRowId(isDropdownActive ? null : row.id);
                                setSearchQuery('');
                              }}
                              className={`w-full text-left bg-white border px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs cursor-pointer ${
                                row.ledgerId
                                  ? 'border-slate-300 text-slate-900 hover:border-slate-400'
                                  : 'border-rose-400 bg-rose-50/30 text-rose-800'
                              } focus:ring-2 focus:ring-emerald-500`}
                            >
                              <span className="truncate">
                                {rowLedger
                                  ? `[${rowLedger.code}] ${rowLedger.name}`
                                  : 'Select / Type Ledger Account...'}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            {/* Typeahead Dropdown Menu */}
                            {isDropdownActive && (
                              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-300 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                                <div className="p-2 border-b border-slate-200 bg-slate-50 sticky top-0 flex items-center gap-2">
                                  <Search className="w-3.5 h-3.5 text-slate-500" />
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search ledger by name, code, or group..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                                  />
                                </div>
                                <ul className="py-1 divide-y divide-slate-100 text-xs">
                                  {filteredLedgers.map((l) => (
                                    <li
                                      key={l.id}
                                      onClick={() => {
                                        handleUpdateRow(row.id, 'ledgerId', l.id);
                                        setActiveSearchRowId(null);
                                      }}
                                      className="px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center justify-between font-medium text-slate-800"
                                    >
                                      <div>
                                        <span className="font-bold text-emerald-800">[{l.code}]</span> {l.name}
                                        <span className="text-[10px] text-slate-500 ml-1.5 px-1 bg-slate-100 rounded">
                                          {l.majorGroup}
                                        </span>
                                      </div>
                                      <span className="font-mono text-[11px] text-slate-600">
                                        Bal: Rs {(l.currentBalance || 0).toLocaleString('en-IN')}{' '}
                                        {l.currentType}
                                      </span>
                                    </li>
                                  ))}
                                  {filteredLedgers.length === 0 && (
                                    <li className="p-3 text-center text-slate-500 text-xs italic">
                                      No matching ledger accounts found.
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Sub-line for selected ledger current balance */}
                            {rowLedger && (
                              <div className="text-[11px] font-mono text-slate-600 pl-1 mt-0.5 flex items-center gap-2">
                                <span className="italic font-sans text-slate-500 font-semibold">Cur Bal:</span>
                                <span className="font-bold text-slate-800">
                                  Rs {(rowLedger.currentBalance || 0).toLocaleString('en-IN')}{' '}
                                  {rowLedger.currentType}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Line Amount Input */}
                          <div className="w-44 shrink-0">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">
                                Rs
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="99999999"
                                step="1"
                                placeholder="0.00"
                                value={row.amount}
                                onChange={(e) =>
                                  handleUpdateRow(row.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && index === particularRows.length - 1) {
                                    e.preventDefault();
                                    handleAddRow();
                                  }
                                }}
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-right bg-white border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Delete row button */}
                          <div className="w-10 text-center shrink-0">
                            {particularRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Row Button */}
                <div className="mt-2 pl-14">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Particulars Line [Enter]</span>
                  </button>
                </div>
              </div>

              {/* Bottom Total Line */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between px-2 text-xs sm:text-sm font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    {vType === 'JOURNAL' && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                          isJournalBalanced
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isJournalBalanced
                          ? '✓ Balanced'
                          : `Mismatch: Rs ${Math.abs(journalDrTotal - journalCrTotal).toLocaleString('en-IN')}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {vType === 'JOURNAL' ? (
                      <div className="flex items-center gap-4 font-mono">
                        <div>
                          <span className="text-slate-500 font-sans text-xs mr-1">Total Dr:</span>
                          <span className="font-bold text-blue-900 border-b-2 border-slate-900 pb-0.5">
                            Rs {formatCurrency(journalDrTotal)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-sans text-xs mr-1">Total Cr:</span>
                          <span className="font-bold text-rose-900 border-b-2 border-slate-900 pb-0.5">
                            Rs {formatCurrency(journalCrTotal)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm font-bold text-slate-600">Total Voucher:</span>
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg shadow-2xs">
                          Rs {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* 4. NARRATION FIELD                                      */}
            {/* ------------------------------------------------------- */}
            <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex items-start gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 w-20 shrink-0 pt-1">
                Narration :
              </span>
              <textarea
                ref={narrationRef}
                rows={2}
                placeholder="Type voucher remarks, check number, member note, or details..."
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="flex-1 p-2 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 shadow-2xs outline-hidden"
              />
            </div>

            {/* ------------------------------------------------------- */}
            {/* 5. BOTTOM ACTION STATUS BAR (Quit, Accept, Delete, etc.)*/}
            {/* ------------------------------------------------------- */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Quit [Esc]</span>
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Save Voucher [Ctrl+A]</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSwitchVType(vType);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Clear [Alt+D]</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Print [Alt+P]</span>
                </button>

                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-700 rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Preview Slip</span>
                </button>
              </div>

              {/* Quick Template Selector */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Quick 25-day 7 member collection preset
                    handleSwitchVType('RECEIPT');
                    setHeaderAccountId(defaultCashOrBankId);
                    setParticularRows(
                      members.map((m) => ({
                        id: `row-${m.id}`,
                        drCr: 'Cr',
                        ledgerId: m.depositLedgerId,
                        amount: m.monthlySavingTarget || 25000,
                        narration: `25-day saving collection for ${m.name}`,
                      }))
                    );
                    setNarration('Consolidated 25-Day saving deposit collection from all 7 members');
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>7-Member 25-Day Saving (Rs 1.75L)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: THE FUNCTION BUTTON BAR                            */}
          {/* ========================================================= */}
          <div className="w-36 sm:w-44 bg-slate-900 text-slate-200 p-2 flex flex-col gap-1.5 border-l border-slate-800 shrink-0 text-xs font-medium select-none overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-slate-800 mb-0.5 tracking-wider text-center">
              Voucher Type
            </div>

            {/* F4: Contra */}
            <button
              type="button"
              onClick={() => handleSwitchVType('CONTRA')}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                vType === 'CONTRA'
                  ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-700'
              }`}
            >
              <span>
                <strong className="text-blue-400 font-mono">F4:</strong> Contra
              </span>
              {vType === 'CONTRA' && <span className="text-[10px] text-blue-200">●</span>}
            </button>

            {/* F5: Payment */}
            <button
              type="button"
              onClick={() => handleSwitchVType('PAYMENT')}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                vType === 'PAYMENT'
                  ? 'bg-rose-600 text-white font-bold border-rose-400 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-700'
              }`}
            >
              <span>
                <strong className="text-rose-400 font-mono">F5:</strong> Payment
              </span>
              {vType === 'PAYMENT' && <span className="text-[10px] text-rose-200">●</span>}
            </button>

            {/* F6: Receipt */}
            <button
              type="button"
              onClick={() => handleSwitchVType('RECEIPT')}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                vType === 'RECEIPT'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-700'
              }`}
            >
              <span>
                <strong className="text-emerald-400 font-mono">F6:</strong> Receipt
              </span>
              {vType === 'RECEIPT' && <span className="text-[10px] text-emerald-200">●</span>}
            </button>

            {/* F7: Journal */}
            <button
              type="button"
              onClick={() => handleSwitchVType('JOURNAL')}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                vType === 'JOURNAL'
                  ? 'bg-amber-600 text-white font-bold border-amber-400 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-700'
              }`}
            >
              <span>
                <strong className="text-amber-400 font-mono">F7:</strong> Journal
              </span>
              {vType === 'JOURNAL' && <span className="text-[10px] text-amber-200">●</span>}
            </button>

            {/* Quick Accept CTA */}
            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={handleAccept}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Voucher</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONFIGURATION / F12 MODAL DIALOG                          */}
        {/* ========================================================= */}
        {showConfigModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-emerald-600" />
                  Voucher Entry Configuration (F12)
                </h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-md p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">Use Single Entry Mode for Payment/Receipt:</span>
                  <input
                    type="checkbox"
                    checked={isSingleEntryMode}
                    onChange={(e) => setIsSingleEntryMode(e.target.value === 'true' || e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">Show Current Balance on Ledger Selection:</span>
                  <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-emerald-600 rounded" />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">Warn on Mismatch in Journal Entries:</span>
                  <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-emerald-600 rounded" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  Save &amp; Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
