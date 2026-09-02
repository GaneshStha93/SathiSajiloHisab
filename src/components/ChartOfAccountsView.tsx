import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Building,
  DollarSign,
  FileSpreadsheet,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  LedgerAccount,
  MajorGroup,
  SubGroupTier1,
  SubGroupTier2,
} from '../types';

interface ChartOfAccountsViewProps {
  ledgers: LedgerAccount[];
  onAddLedger: (ledger: LedgerAccount) => void;
  onUpdateLedger: (ledger: LedgerAccount) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  ledgers,
  onAddLedger,
  onUpdateLedger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajorGroup, setSelectedMajorGroup] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'TREE'>('TABLE');

  // Modal State for Add / Edit Ledger
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [majorGroup, setMajorGroup] = useState<MajorGroup>('ASSETS');
  const [tier1, setTier1] = useState<SubGroupTier1>('CURRENT_ASSETS');
  const [tier2, setTier2] = useState<SubGroupTier2>('RECEIVABLES');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingType, setOpeningType] = useState<'DR' | 'CR'>('DR');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingLedgerId(null);
    setCode(String(1000 + ledgers.length + 1));
    setName('');
    setMajorGroup('ASSETS');
    setTier1('CURRENT_ASSETS');
    setTier2('RECEIVABLES');
    setOpeningBalance(0);
    setOpeningType('DR');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (l: LedgerAccount) => {
    setEditingLedgerId(l.id);
    setCode(l.code);
    setName(l.name);
    setMajorGroup(l.majorGroup);
    setTier1(l.tier1);
    setTier2(l.tier2);
    setOpeningBalance(l.openingBalance);
    setOpeningType(l.openingType);
    setDescription(l.description || '');
    setIsModalOpen(true);
  };

  const handleSaveLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingLedgerId) {
      const existing = ledgers.find((l) => l.id === editingLedgerId);
      if (existing) {
        onUpdateLedger({
          ...existing,
          code,
          name,
          majorGroup,
          tier1,
          tier2,
          openingBalance,
          openingType,
          description,
        });
      }
    } else {
      const newLedger: LedgerAccount = {
        id: `led-${Date.now()}`,
        code: code || String(1000 + ledgers.length + 1),
        name,
        majorGroup,
        tier1,
        tier2,
        openingBalance,
        openingType,
        currentBalance: openingBalance,
        currentType: openingType,
        description,
        isActive: true,
      };
      onAddLedger(newLedger);
    }

    setIsModalOpen(false);
  };

  // Group Hierarchy Mapping Helper
  const majorGroupsList: MajorGroup[] = ['ASSETS', 'LIABILITIES', 'EQUITY', 'INCOME', 'EXPENSES'];

  const filteredLedgers = ledgers.filter((l) => {
    if (selectedMajorGroup !== 'ALL' && l.majorGroup !== selectedMajorGroup) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.code.includes(q) && !l.tier2.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            Chart of Accounts Master (CoA)
          </h1>
          <p className="text-xs text-slate-500">
            3-Tier multi-group hierarchical master setup with opening balances (Assets, Liabilities, Equity, Income, Expenses)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                viewMode === 'TABLE' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('TREE')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                viewMode === 'TREE' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hierarchy Tree
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Add New Ledger
          </button>
        </div>
      </div>

      {/* Filter Tabs by Major Group */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setSelectedMajorGroup('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            selectedMajorGroup === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Major Groups ({ledgers.length})
        </button>
        {majorGroupsList.map((grp) => {
          const count = ledgers.filter((l) => l.majorGroup === grp).length;
          return (
            <button
              key={grp}
              onClick={() => setSelectedMajorGroup(grp)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedMajorGroup === grp
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {grp} ({count})
            </button>
          );
        })}

        {/* Search */}
        <div className="ml-auto w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ledgers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'TABLE' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-4">Account Ledger Name</th>
                  <th className="py-2.5 px-3">Major Group</th>
                  <th className="py-2.5 px-3">Tier 1 Subgroup</th>
                  <th className="py-2.5 px-3">Tier 2 Subgroup</th>
                  <th className="py-2.5 px-3 text-right">Opening Balance</th>
                  <th className="py-2.5 px-3 text-right">Current Net Balance</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLedgers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                      {l.code}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                      <div>{l.name}</div>
                      {l.description && (
                        <div className="text-[10px] text-slate-400 font-normal">{l.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          l.majorGroup === 'ASSETS'
                            ? 'bg-blue-100 text-blue-800'
                            : l.majorGroup === 'LIABILITIES'
                            ? 'bg-purple-100 text-purple-800'
                            : l.majorGroup === 'EQUITY'
                            ? 'bg-indigo-100 text-indigo-800'
                            : l.majorGroup === 'INCOME'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.majorGroup}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                      {l.tier1.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                      {l.tier2.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      Rs {l.openingBalance.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] font-bold text-slate-400">{l.openingType}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rs {l.currentBalance.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] font-bold text-blue-600">{l.currentType}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <button
                        onClick={() => openEditModal(l)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 rounded flex items-center gap-1 mx-auto transition-colors"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Hierarchical Tree View */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 mb-2">
            3-Tier Chart of Accounts Hierarchy Tree
          </h2>
          {majorGroupsList.map((grp) => {
            const grpLedgers = ledgers.filter((l) => l.majorGroup === grp);
            if (grpLedgers.length === 0) return null;

            // Unique Tier 1
            const t1List = Array.from(new Set(grpLedgers.map((l) => l.tier1))) as SubGroupTier1[];

            return (
              <div key={grp} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="font-bold text-xs uppercase tracking-wider text-blue-700 flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {grp} ({grpLedgers.length} Ledgers)
                </div>

                <div className="pl-4 space-y-3">
                  {t1List.map((t1) => {
                    const t1Ledgers = grpLedgers.filter((l) => l.tier1 === t1);
                    const t2List = Array.from(new Set(t1Ledgers.map((l) => l.tier2))) as SubGroupTier2[];

                    return (
                      <div key={t1} className="border-l-2 border-slate-200 pl-3 space-y-2">
                        <div className="font-bold text-xs text-slate-800">
                          📁 {String(t1).replace(/_/g, ' ')}
                        </div>

                        <div className="pl-3 space-y-2">
                          {t2List.map((t2) => {
                            const t2Ledgers = t1Ledgers.filter((l) => l.tier2 === t2);
                            return (
                              <div key={t2} className="border-l border-slate-200 pl-2.5 space-y-1.5">
                                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                  📂 {String(t2).replace(/_/g, ' ')}
                                </div>
                                <div className="pl-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {t2Ledgers.map((l) => (
                                    <div
                                      key={l.id}
                                      onClick={() => openEditModal(l)}
                                      className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-2xs"
                                    >
                                      <div className="truncate pr-2">
                                        <span className="font-mono text-blue-600 font-bold mr-1.5">[{l.code}]</span>
                                        <span className="font-medium text-slate-900">{l.name}</span>
                                      </div>
                                      <span className="font-mono text-[11px] text-slate-600 font-bold shrink-0">
                                        Rs {l.currentBalance.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Ledger Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                {editingLedgerId ? 'Modify Ledger & Opening Balance' : 'Create New Account Ledger'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLedger} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Ledger Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Regular Loan - Member Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Major Group */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Major Group</label>
                <select
                  value={majorGroup}
                  onChange={(e) => {
                    const mg = e.target.value as MajorGroup;
                    setMajorGroup(mg);
                    if (mg === 'ASSETS') {
                      setTier1('CURRENT_ASSETS');
                      setTier2('RECEIVABLES');
                      setOpeningType('DR');
                    } else if (mg === 'LIABILITIES') {
                      setTier1('CURRENT_LIABILITIES');
                      setTier2('PAYABLES');
                      setOpeningType('CR');
                    } else if (mg === 'EQUITY') {
                      setTier1('EQUITY_CAPITAL');
                      setTier2('RETAINED_EARNINGS_EQUITY');
                      setOpeningType('CR');
                    } else if (mg === 'INCOME') {
                      setTier1('DIRECT_INCOME');
                      setTier2('DIRECT_INCOME_OPERATING');
                      setOpeningType('CR');
                    } else {
                      setTier1('DIRECT_EXPENSES');
                      setTier2('DIRECT_EXPENSES_OPERATING');
                      setOpeningType('DR');
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white font-semibold"
                >
                  <option value="ASSETS">ASSETS</option>
                  <option value="LIABILITIES">LIABILITIES</option>
                  <option value="EQUITY">EQUITY</option>
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSES">EXPENSES</option>
                </select>
              </div>

              {/* Subgroups Tier 1 & 2 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Tier 1 Sub-Group</label>
                  <select
                    value={tier1}
                    onChange={(e) => setTier1(e.target.value as SubGroupTier1)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono text-[11px] focus:bg-white"
                  >
                    <option value="CURRENT_ASSETS">CURRENT_ASSETS</option>
                    <option value="NON_CURRENT_ASSETS">NON_CURRENT_ASSETS</option>
                    <option value="CURRENT_LIABILITIES">CURRENT_LIABILITIES</option>
                    <option value="NON_CURRENT_LIABILITIES">NON_CURRENT_LIABILITIES</option>
                    <option value="EQUITY_CAPITAL">EQUITY_CAPITAL</option>
                    <option value="DIRECT_INCOME">DIRECT_INCOME</option>
                    <option value="INDIRECT_INCOME">INDIRECT_INCOME</option>
                    <option value="DIRECT_EXPENSES">DIRECT_EXPENSES</option>
                    <option value="INDIRECT_EXPENSES">INDIRECT_EXPENSES</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Tier 2 Sub-Group</label>
                  <select
                    value={tier2}
                    onChange={(e) => setTier2(e.target.value as SubGroupTier2)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono text-[11px] focus:bg-white"
                  >
                    <option value="FIXED_ASSETS">FIXED_ASSETS</option>
                    <option value="RECEIVABLES">RECEIVABLES</option>
                    <option value="LOAN_AND_ADVANCES">LOAN_AND_ADVANCES (Regular Loans)</option>
                    <option value="CASH_AND_BANK">CASH_AND_BANK</option>
                    <option value="OTHER_CURRENT_ASSETS">OTHER_CURRENT_ASSETS (Emergency Loans)</option>
                    <option value="INVESTMENT">INVESTMENT (Cafes, Real Estate)</option>
                    <option value="TERM_LOAN_BFIS">TERM_LOAN_BFIS</option>
                    <option value="PAYABLES">PAYABLES</option>
                    <option value="MEMBERS_DEPOSIT">MEMBERS_DEPOSIT (25k/mo)</option>
                    <option value="OTHER_CURRENT_LIABILITIES">OTHER_CURRENT_LIABILITIES</option>
                    <option value="RETAINED_EARNINGS_EQUITY">RETAINED_EARNINGS_EQUITY</option>
                    <option value="DIRECT_INCOME_OPERATING">DIRECT_INCOME_OPERATING</option>
                    <option value="INDIRECT_INCOME_OTHER">INDIRECT_INCOME_OTHER</option>
                    <option value="DIRECT_EXPENSES_OPERATING">DIRECT_EXPENSES_OPERATING</option>
                    <option value="INDIRECT_EXPENSES_OTHER">INDIRECT_EXPENSES_OTHER</option>
                  </select>
                </div>
              </div>

              {/* Opening Balance Entry */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                <label className="font-bold text-blue-900 block text-xs">
                  Opening Balance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-blue-200 rounded-md text-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <select
                      value={openingType}
                      onChange={(e) => setOpeningType(e.target.value as 'DR' | 'CR')}
                      className="w-full p-2 bg-white border border-blue-200 rounded-md text-blue-700 font-bold"
                    >
                      <option value="DR">DR (Debit)</option>
                      <option value="CR">CR (Credit)</option>
                    </select>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 block">
                  Enter starting balance for Assets, Liabilities & Equity ledgers as per your opening books.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">Description / Notes</label>
                <input
                  type="text"
                  placeholder="Optional remarks or purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs cursor-pointer transition-colors"
                >
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
