import React, { useState, useEffect } from 'react';
import {
  FileText,
  Receipt,
  BookOpen,
  Users2,
  Scale,
  ArrowRightLeft,
  ListTree,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

export type DisplayMenuOption =
  | 'TRIAL'
  | 'DAYBOOK'
  | 'ACCOUNT_BOOKS'
  | 'STATEMENTS_OF_ACCOUNTS'
  | 'FINANCIAL_STATEMENTS'
  | 'CASH_FUNDS_FLOW'
  | 'LIST_OF_ACCOUNTS'
  | 'EXCEPTION_REPORTS'
  | 'QUIT';

interface TallyDisplayMenuProps {
  activeOption: DisplayMenuOption;
  onSelectOption: (option: DisplayMenuOption) => void;
  onQuit?: () => void;
  isCompact?: boolean;
}

export const MENU_ITEMS: {
  id: DisplayMenuOption;
  label: string;
  hotkey: string;
  hotkeyIndex: number;
  nepaliLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'TRIAL',
    label: 'Trial Balance',
    hotkey: 'T',
    hotkeyIndex: 0,
    nepaliLabel: 'Trial Balance Equilibrium',
    description: 'Ledger-wise & Group-wise opening, transactions & closing balances',
    icon: Scale,
  },
  {
    id: 'DAYBOOK',
    label: 'Day Book',
    hotkey: 'D',
    hotkeyIndex: 0,
    nepaliLabel: 'Daily Transaction Register',
    description: 'Chronological register of all Payment, Receipt, Contra & Journal entries',
    icon: Receipt,
  },
  {
    id: 'ACCOUNT_BOOKS',
    label: 'Account Books',
    hotkey: 'A',
    hotkeyIndex: 0,
    nepaliLabel: 'Ledger / Bank / Cash Books',
    description: 'Cash Book, Bank Books, Ledger Statements & Group Summaries',
    icon: BookOpen,
  },
  {
    id: 'STATEMENTS_OF_ACCOUNTS',
    label: 'Statements of Accounts',
    hotkey: 'S',
    hotkeyIndex: 0,
    nepaliLabel: 'Member Accounts & Passbooks',
    description: '25-Day Saving Schedules, Member Balances, Outstandings & Statistics',
    icon: Users2,
  },
  {
    id: 'FINANCIAL_STATEMENTS',
    label: 'Financial Statements (NFRS for SMEs)',
    hotkey: 'F',
    hotkeyIndex: 0,
    nepaliLabel: 'Financial Statements (NFRS for SMEs)',
    description: 'NFRS for SMEs: Balance Sheet, Profit/Loss, Cash Flow, Changes in Equity & Notes',
    icon: FileText,
  },
  {
    id: 'CASH_FUNDS_FLOW',
    label: 'Cash/Funds Flow',
    hotkey: 'C',
    hotkeyIndex: 0,
    nepaliLabel: 'Cash Flow & Fund Sources',
    description: 'Cash Flow Analysis, Sources & Applications of Funds, Working Capital',
    icon: ArrowRightLeft,
  },
  {
    id: 'LIST_OF_ACCOUNTS',
    label: 'List of Accounts',
    hotkey: 'L',
    hotkeyIndex: 0,
    nepaliLabel: 'Chart of Accounts Tree',
    description: 'Complete 3-Tier Chart of Accounts hierarchical classification',
    icon: ListTree,
  },
  {
    id: 'EXCEPTION_REPORTS',
    label: 'EXception Reports',
    hotkey: 'X',
    hotkeyIndex: 1,
    nepaliLabel: 'Audit & Arrears Monitoring',
    description: 'Negative ledgers, overdue loan arrears, unbalanced audits & dormant funds',
    icon: AlertTriangle,
  },
  {
    id: 'QUIT',
    label: 'Quit',
    hotkey: 'Q',
    hotkeyIndex: 0,
    nepaliLabel: 'Return to Dashboard',
    description: 'Return to Main Dashboard Screen',
    icon: LogOut,
  },
];

export const TallyDisplayMenu: React.FC<TallyDisplayMenuProps> = ({
  activeOption,
  onSelectOption,
  onQuit,
  isCompact = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const idx = MENU_ITEMS.findIndex((item) => item.id === activeOption);
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    const idx = MENU_ITEMS.findIndex((item) => item.id === activeOption);
    if (idx >= 0) setSelectedIndex(idx);
  }, [activeOption]);

  // Global Hotkey Listener for Display Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === 'T') {
        e.preventDefault();
        onSelectOption('TRIAL');
      } else if (key === 'D') {
        e.preventDefault();
        onSelectOption('DAYBOOK');
      } else if (key === 'A') {
        e.preventDefault();
        onSelectOption('ACCOUNT_BOOKS');
      } else if (key === 'S') {
        e.preventDefault();
        onSelectOption('STATEMENTS_OF_ACCOUNTS');
      } else if (key === 'F') {
        e.preventDefault();
        onSelectOption('FINANCIAL_STATEMENTS');
      } else if (key === 'C') {
        e.preventDefault();
        onSelectOption('CASH_FUNDS_FLOW');
      } else if (key === 'L') {
        e.preventDefault();
        onSelectOption('LIST_OF_ACCOUNTS');
      } else if (key === 'X') {
        e.preventDefault();
        onSelectOption('EXCEPTION_REPORTS');
      } else if (key === 'Q' || key === 'ESCAPE') {
        e.preventDefault();
        if (onQuit) onQuit();
        else onSelectOption('QUIT');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
          onSelectOption(MENU_ITEMS[next].id);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev + 1) % MENU_ITEMS.length;
          onSelectOption(MENU_ITEMS[next].id);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectOption, onQuit]);

  const renderLabelWithHotkey = (label: string, hotkey: string, hotkeyIndex: number) => {
    const before = label.substring(0, hotkeyIndex);
    const letter = label.charAt(hotkeyIndex);
    const after = label.substring(hotkeyIndex + 1);

    return (
      <span>
        {before}
        <span className="text-red-700 font-extrabold underline decoration-2 decoration-red-600">
          {letter}
        </span>
        {after}
      </span>
    );
  };

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-sm font-sans bg-white">
      {/* Menu Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div>
          <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold">
            Accounting Reports
          </div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 mt-0.5">
            Reports Menu
          </h2>
        </div>
        <span className="text-[10px] bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-md font-mono border border-emerald-500/30">
          NFRS SME
        </span>
      </div>

      {/* Menu List matching Daybook / Voucher sleek styling */}
      <div className="p-2 space-y-1 bg-slate-50/50">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = item.id === activeOption;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedIndex(index);
                if (item.id === 'QUIT' && onQuit) {
                  onQuit();
                } else {
                  onSelectOption(item.id);
                }
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              } ${item.id === 'QUIT' ? 'mt-2 pt-2 border-t border-slate-200' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <div>
                  <div className={`text-xs sm:text-sm font-semibold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {renderLabelWithHotkey(item.label, item.hotkey, item.hotkeyIndex)}
                  </div>
                  {!isCompact && (
                    <div className={`text-[10px] font-medium leading-none mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {item.nepaliLabel}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected
                      ? 'bg-emerald-700 text-white border border-emerald-500/50'
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  [{item.hotkey}]
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-white translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                  } transition-all`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Navigation Tip */}
      <div className="bg-slate-100 px-3.5 py-2 text-[10px] text-slate-500 border-t border-slate-200 flex items-center justify-between font-mono">
        <span>Use [↑][↓] or press Hotkey</span>
        <span>Esc = Back</span>
      </div>
    </div>
  );
};
