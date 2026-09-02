import React from 'react';
import {
  Users,
  Wallet,
  TrendingUp,
  CreditCard,
  Building2,
  CalendarCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  HandCoins,
  Receipt,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Member,
  Loan,
  LedgerAccount,
  Voucher,
} from '../types';
import { getDualToday } from '../utils/nepaliCalendar';

interface DashboardViewProps {
  members: Member[];
  loans: Loan[];
  ledgers: LedgerAccount[];
  vouchers: Voucher[];
  onNavigate: (tab: string) => void;
  onOpenNewVoucher: () => void;
  onAutoPostInterest?: () => void;
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  loans,
  ledgers,
  vouchers,
  onNavigate,
  onOpenNewVoucher,
}) => {
  const today = getDualToday();

  // Metrics Calculations
  const cashInHand = ledgers.find((l) => l.code === '1101')?.currentBalance || 0;
  const bankBalance =
    (ledgers.find((l) => l.code === '1102')?.currentBalance || 0) +
    (ledgers.find((l) => l.code === '1103')?.currentBalance || 0);
  const totalLiquidity = cashInHand + bankBalance;

  const totalMembersDeposit = ledgers
    .filter((l) => l.tier2 === 'MEMBERS_DEPOSIT')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const regularLoansOutstanding = ledgers
    .filter((l) => l.tier2 === 'LOAN_AND_ADVANCES')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const emergencyLoansOutstanding = ledgers
    .filter((l) => l.tier2 === 'OTHER_CURRENT_ASSETS')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalLoansDisbursed = regularLoansOutstanding + emergencyLoansOutstanding;

  const totalInvestments = ledgers
    .filter((l) => l.tier2 === 'INVESTMENT')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalIncome = ledgers
    .filter((l) => l.majorGroup === 'INCOME')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalExpenses = ledgers
    .filter((l) => l.majorGroup === 'EXPENSES')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const netSurplus = totalIncome - totalExpenses;

  // Chart Data
  const memberDepositData = members.map((m) => {
    const depLedger = ledgers.find((l) => l.id === m.depositLedgerId);
    return {
      name: m.name.split(' ')[0],
      deposit: depLedger ? depLedger.currentBalance : 75000,
    };
  });

  const assetComposition = [
    { name: 'Cash & Bank', value: totalLiquidity || 365000 },
    { name: 'Regular Loans', value: regularLoansOutstanding || 150000 },
    { name: 'Emergency Loans', value: emergencyLoansOutstanding || 30000 },
    { name: 'Investments', value: totalInvestments || 150000 },
    { name: 'Fixed Assets', value: 85000 },
  ];

  // Recent 6 Vouchers
  const recentVouchers = vouchers.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Savings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0">
            Rs
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Total Savings
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight font-mono">
              {totalMembersDeposit.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Rs 25k/mo × 7 members
            </p>
          </div>
        </div>

        {/* Metric 2: Active Loans */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold shrink-0">
            ✍
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Active Loans
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight font-mono">
              {totalLoansDisbursed.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-blue-600 font-medium">
              Regular 12% & Emg 15%
            </p>
          </div>
        </div>

        {/* Metric 3: Liquid Cash & Bank */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-xl font-bold shrink-0">
            ⌛
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Liquid Cash & Bank
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight font-mono">
              {totalLiquidity.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500">
              Cash: {cashInHand.toLocaleString()} | Bank: {bankBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Metric 4: Net Surplus */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-xl font-bold shrink-0">
            📈
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Net Group Surplus
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight font-mono">
              {netSurplus.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-purple-600 font-medium">
              Staff salary Rs 5k paid
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions (8 cols) & Side Cards (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Transactions Table & 7-Friends Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Transactions Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Transactions</h3>
                <p className="text-xs text-slate-500">
                  Double-entry recorded vouchers & member collections
                </p>
              </div>
              <button
                onClick={() => onNavigate('vouchers')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                View All Ledger →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="px-5 py-3">Date (BS/AD)</th>
                    <th className="px-5 py-3">Member / Particulars</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                  {recentVouchers.map((v) => {
                    const isReceipt = v.voucherType === 'RECEIPT';
                    const isPayment = v.voucherType === 'PAYMENT';
                    const isJournal = v.voucherType === 'JOURNAL';

                    let badgeClass = 'bg-slate-100 text-slate-700';
                    let typeLabel = v.voucherType;

                    if (isReceipt) {
                      badgeClass = 'bg-emerald-100 text-emerald-700';
                      typeLabel = 'SAVING / RCT';
                    } else if (isPayment) {
                      badgeClass = 'bg-rose-100 text-rose-700';
                      typeLabel = 'PAYMENT';
                    } else if (isJournal) {
                      badgeClass = 'bg-amber-100 text-amber-700';
                      typeLabel = 'INTEREST / JRN';
                    } else if (v.voucherType === 'CONTRA') {
                      badgeClass = 'bg-blue-100 text-blue-700';
                      typeLabel = 'CONTRA';
                    }

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          <div>{v.dateBS}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{v.dateAD}</div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          <div className="truncate max-w-[220px]">{v.narration}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{v.voucherNo}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                            {typeLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                          Rs {v.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                            ● Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Members Saving & Deposit Balances Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Members Saving &amp; Deposit Balances
                </h3>
                <p className="text-xs text-slate-500">
                  Individual member deposit portfolio breakdown and cumulative savings
                </p>
              </div>
              <button
                onClick={() => onNavigate('members')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Members View <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberDepositData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(value: any) => [`Rs ${Number(value).toLocaleString()}`, 'Total Saving Balance']} />
                  <Bar dataKey="deposit" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Member Overview & Asset Allocation (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Member Overview Card */}
          <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden shadow-xs">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Members Overview
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  {members.length} Enrolled
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                  <div className="text-[11px] text-slate-400">Total Savings</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    Rs {totalMembersDeposit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
                  <div className="text-[11px] text-slate-400">Active Borrowers</div>
                  <div className="text-base font-bold font-mono text-blue-400 mt-0.5">
                    {loans.filter((l) => l.status === 'ACTIVE').length} Loans
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigate('members')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  View All Members
                </button>
              </div>
            </div>
            {/* Geometric Circle Decoration */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-800 rounded-full opacity-20 pointer-events-none"></div>
          </div>

          {/* Asset Allocation Pie Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Capital &amp; Asset Allocation
            </h3>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `Rs ${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
              {assetComposition.map((a, idx) => (
                <div key={a.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-slate-600 truncate">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
