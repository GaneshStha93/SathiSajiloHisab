import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Building2,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { LedgerAccount, Voucher } from '../types';
import { getDualToday } from '../utils/nepaliCalendar';

interface AccountBooksViewProps {
  ledgers: LedgerAccount[];
  vouchers: Voucher[];
}

type SubBookType = 'CASH_BOOK' | 'BANK_BOOK' | 'LEDGER_VOUCHER' | 'GROUP_SUMMARY';

export const AccountBooksView: React.FC<AccountBooksViewProps> = ({
  ledgers,
  vouchers,
}) => {
  const today = getDualToday();
  const [activeBook, setActiveBook] = useState<SubBookType>('CASH_BOOK');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>(() => {
    const defaultLedger = ledgers.find((l) => l.name.toLowerCase().includes('cash')) || ledgers[0];
    return defaultLedger ? defaultLedger.id : '';
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Cash in Hand ledgers
  const cashLedgers = ledgers.filter((l) => l.name.toLowerCase().includes('cash'));
  // Bank ledgers
  const bankLedgers = ledgers.filter((l) => l.name.toLowerCase().includes('bank'));

  const selectedLedger = ledgers.find((l) => l.id === selectedLedgerId) || ledgers[0];

  // Compute ledger entries with running balance
  const ledgerTransactions = React.useMemo(() => {
    if (!selectedLedger) return [];

    let runningBal = selectedLedger.openingBalance;
    const isDrNormal = selectedLedger.majorGroup === 'ASSETS' || selectedLedger.majorGroup === 'EXPENSES';

    const list: {
      voucherId: string;
      voucherNo: string;
      voucherType: string;
      dateBs: string;
      dateAd: string;
      narration: string;
      oppositeLedger: string;
      drAmount: number;
      crAmount: number;
      runningBalance: number;
      runningType: 'DR' | 'CR';
    }[] = [];

    vouchers.forEach((v) => {
      const matchEntries = v.entries.filter(
        (e) => e.ledgerId === selectedLedger.id || e.ledgerName === selectedLedger.name
      );
      if (matchEntries.length > 0) {
        matchEntries.forEach((entry) => {
          const opposite = v.entries
            .filter((o) => o !== entry)
            .map((o) => o.ledgerName)
            .join(', ') || 'Various Accounts';

          if (isDrNormal) {
            runningBal += (entry.drAmount - entry.crAmount);
          } else {
            runningBal += (entry.crAmount - entry.drAmount);
          }

          list.push({
            voucherId: v.id,
            voucherNo: v.voucherNo,
            voucherType: v.voucherType,
            dateBs: v.dateBS || (v as any).dateBs || '',
            dateAd: v.dateAD || (v as any).dateAd || '',
            narration: v.narration || 'General Transaction',
            oppositeLedger: opposite,
            drAmount: entry.drAmount,
            crAmount: entry.crAmount,
            runningBalance: Math.abs(runningBal),
            runningType: isDrNormal ? (runningBal >= 0 ? 'DR' : 'CR') : (runningBal >= 0 ? 'CR' : 'DR'),
          });
        });
      }
    });

    return list;
  }, [selectedLedger, vouchers]);

  const filteredLedgers = ledgers.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub navigation for Account Books */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'CASH_BOOK', label: 'Cash Book', icon: Wallet },
            { id: 'BANK_BOOK', label: 'Bank Book', icon: Landmark },
            { id: 'LEDGER_VOUCHER', label: 'Ledger Statement', icon: BookOpen },
            { id: 'GROUP_SUMMARY', label: 'Group Summary', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBook === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveBook(tab.id as SubBookType);
                  if (tab.id === 'CASH_BOOK' && cashLedgers.length > 0) {
                    setSelectedLedgerId(cashLedgers[0].id);
                  } else if (tab.id === 'BANK_BOOK' && bankLedgers.length > 0) {
                    setSelectedLedgerId(bankLedgers[0].id);
                  }
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0b4f3a] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Book
          </button>
        </div>
      </div>

      {/* Selector Bar for Ledger Statement */}
      {activeBook === 'LEDGER_VOUCHER' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Ledger Name or Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Select Account:</span>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {filteredLedgers.map((l) => (
                <option key={l.id} value={l.id}>
                  [{l.code}] {l.name} ({l.majorGroup})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Selected Account Overview Header */}
      {selectedLedger && (
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                {selectedLedger.code}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedLedger.majorGroup} &gt; {selectedLedger.tier1}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{selectedLedger.name}</h2>
            <p className="text-xs text-slate-300 font-mono">
              Opening Balance: Rs {selectedLedger.openingBalance.toLocaleString()} {selectedLedger.openingType}
            </p>
          </div>

          <div className="text-right bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700 font-mono">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Current Running Balance</div>
            <div className="text-xl font-bold text-emerald-400">
              Rs {selectedLedger.currentBalance.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-300">{selectedLedger.currentType}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
            Transaction Entries ({ledgerTransactions.length} records)
          </div>
          <span className="text-xs text-slate-500 font-mono">Period: Current Fiscal Year</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-600 border-b border-slate-200">
                <th className="p-3">Date (BS/AD)</th>
                <th className="p-3">Vch No.</th>
                <th className="p-3">Type</th>
                <th className="p-3">Particulars (Opposite Ledger / Narration)</th>
                <th className="p-3 text-right">Debit (DR)</th>
                <th className="p-3 text-right">Credit (CR)</th>
                <th className="p-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {/* Opening Row */}
              <tr className="bg-slate-50/60 font-semibold text-slate-700">
                <td className="p-2.5 font-sans">01/04/2081 BS</td>
                <td className="p-2.5 text-slate-400">-</td>
                <td className="p-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">OPENING</span>
                </td>
                <td className="p-2.5 font-sans">Opening Balance B/F</td>
                <td className="p-2.5 text-right">
                  {selectedLedger.openingType === 'DR' ? `Rs ${selectedLedger.openingBalance.toLocaleString()}` : '-'}
                </td>
                <td className="p-2.5 text-right">
                  {selectedLedger.openingType === 'CR' ? `Rs ${selectedLedger.openingBalance.toLocaleString()}` : '-'}
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">
                  Rs {selectedLedger.openingBalance.toLocaleString()} {selectedLedger.openingType}
                </td>
              </tr>

              {ledgerTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                    No transaction entries recorded for this ledger in the selected period.
                  </td>
                </tr>
              ) : (
                ledgerTransactions.map((tx, idx) => (
                  <tr key={`${tx.voucherId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">{tx.dateBs}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{tx.dateAd}</div>
                    </td>
                    <td className="p-2.5 font-bold text-blue-600">{tx.voucherNo}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        {tx.voucherType}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans">
                      <div className="font-semibold text-slate-900">{tx.oppositeLedger}</div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">{tx.narration}</div>
                    </td>
                    <td className="p-2.5 text-right text-slate-900 font-semibold">
                      {tx.drAmount > 0 ? (
                        <span className="text-emerald-700 font-bold">Rs {tx.drAmount.toLocaleString()}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2.5 text-right text-slate-900 font-semibold">
                      {tx.crAmount > 0 ? (
                        <span className="text-rose-700 font-bold">Rs {tx.crAmount.toLocaleString()}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      Rs {tx.runningBalance.toLocaleString()} <span className="text-[10px] text-slate-500">{tx.runningType}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
              <tr>
                <td colSpan={4} className="p-3 font-sans uppercase text-[11px] text-slate-700">
                  Closing Balance as of {today.bsDate} BS:
                </td>
                <td className="p-3 text-right font-mono text-emerald-800">
                  Rs {ledgerTransactions.reduce((s, t) => s + t.drAmount, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right font-mono text-rose-800">
                  Rs {ledgerTransactions.reduce((s, t) => s + t.crAmount, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right font-mono text-base text-emerald-950 font-extrabold">
                  Rs {selectedLedger.currentBalance.toLocaleString()} {selectedLedger.currentType}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
