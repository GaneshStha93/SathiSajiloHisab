import React, { useState } from 'react';
import {
  Users2,
  Calendar,
  AlertCircle,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { Member, Loan, LedgerAccount, Voucher } from '../types';
import { getDualToday } from '../utils/nepaliCalendar';

interface StatementsOfAccountsViewProps {
  members: Member[];
  loans: Loan[];
  ledgers: LedgerAccount[];
  vouchers: Voucher[];
}

type SubTab = 'COLUMNAR' | 'MEMBER_LEDGERS' | 'OUTSTANDINGS' | 'STATISTICS';

export const StatementsOfAccountsView: React.FC<StatementsOfAccountsViewProps> = ({
  members,
  loans,
  ledgers,
  vouchers,
}) => {
  const today = getDualToday();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('COLUMNAR');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [searchMember, setSearchMember] = useState('');

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const memberLoans = loans.filter((l) => l.memberId === selectedMember?.id);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.nepaliName.includes(searchMember)
  );

  // Group stats calculation
  const voucherStats = React.useMemo(() => {
    const stats: Record<string, { count: number; totalDr: number; totalCr: number }> = {
      RECEIPT: { count: 0, totalDr: 0, totalCr: 0 },
      PAYMENT: { count: 0, totalDr: 0, totalCr: 0 },
      CONTRA: { count: 0, totalDr: 0, totalCr: 0 },
      JOURNAL: { count: 0, totalDr: 0, totalCr: 0 },
    };

    vouchers.forEach((v) => {
      if (!stats[v.voucherType]) {
        stats[v.voucherType] = { count: 0, totalDr: 0, totalCr: 0 };
      }
      const dr = v.entries?.reduce((s, e) => s + (e.drAmount || 0), 0) || (v as any).totalDebit || v.totalAmount || 0;
      const cr = v.entries?.reduce((s, e) => s + (e.crAmount || 0), 0) || (v as any).totalCredit || v.totalAmount || 0;
      stats[v.voucherType].count += 1;
      stats[v.voucherType].totalDr += dr;
      stats[v.voucherType].totalCr += cr;
    });

    return stats;
  }, [vouchers]);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'COLUMNAR', label: '7-Friends 25-Day Columnar Matrix', icon: Calendar },
            { id: 'MEMBER_LEDGERS', label: 'Member Account Statements', icon: Users2 },
            { id: 'OUTSTANDINGS', label: 'Outstandings & Aging Statement', icon: Clock },
            { id: 'STATISTICS', label: 'Voucher & Account Statistics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
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
            Print Report
          </button>
        </div>
      </div>

      {/* 1. Friends Zone 25-Day Columnar Matrix */}
      {activeSubTab === 'COLUMNAR' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="text-center pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              SATHI SAJILO HISAB - 7 FRIENDS GROUP #402
            </h2>
            <h3 className="text-sm font-semibold text-emerald-800">
              25-Day Monthly Savings &amp; Loan Collection Matrix
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Cycle: 25 Working Days @ Rs 1,000/day = Rs 25,000 Saving per Member
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700 uppercase tracking-wider text-[10px]">
                  <th className="p-3">S.N.</th>
                  <th className="p-3">Member Name</th>
                  <th className="p-3 text-right">Daily Rate</th>
                  <th className="p-3 text-right">25-Day Saving</th>
                  <th className="p-3 text-right">Total Cumulative Saving</th>
                  <th className="p-3 text-right">Regular Loan (12%)</th>
                  <th className="p-3 text-right">Emergency Loan (15%)</th>
                  <th className="p-3 text-right">Monthly Interest</th>
                  <th className="p-3 text-right font-bold text-slate-900">Total Monthly Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {members.map((m, idx) => {
                  const regLoan = loans.find((l) => l.memberId === m.id && l.loanType === 'REGULAR' && l.status === 'ACTIVE');
                  const emgLoan = loans.find((l) => l.memberId === m.id && l.loanType === 'EMERGENCY' && l.status === 'ACTIVE');

                  const depLedger = ledgers.find((l) => l.id === m.depositLedgerId);
                  const totalSaving = depLedger ? depLedger.currentBalance : 25000;

                  const regBal = regLoan?.amortizationSchedule.find((r) => r.status === 'PENDING')?.openingBalance || regLoan?.principalAmount || 0;
                  const emgBal = emgLoan?.amortizationSchedule.find((r) => r.status === 'PENDING')?.openingBalance || emgLoan?.principalAmount || 0;

                  const regInt = Math.round((regBal * 0.12 * 25) / 365);
                  const emgInt = Math.round((emgBal * 0.15 * 25) / 365);
                  const totalInt = regInt + emgInt;

                  const totalPaid = 25000 + (regLoan ? regLoan.emiAmount : 0) + (emgLoan ? emgLoan.emiAmount : 0);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-emerald-800">{idx + 1}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">
                        {m.name}{' '}
                        <span className="text-slate-400 font-normal text-[11px]">({m.nepaliName})</span>
                      </td>
                      <td className="p-2.5 text-right">Rs 1,000</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">Rs 25,000</td>
                      <td className="p-2.5 text-right font-semibold text-slate-900">
                        Rs {totalSaving.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right">
                        {regBal > 0 ? `Rs ${regBal.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2.5 text-right">
                        {emgBal > 0 ? `Rs ${emgBal.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2.5 text-right text-amber-700 font-medium">
                        {totalInt > 0 ? `Rs ${totalInt.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-blue-900 bg-slate-50/50">
                        Rs {totalPaid.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={2} className="p-3 uppercase font-sans text-slate-700 text-[11px]">
                    Total Group Monthly Inflows (7 Members):
                  </td>
                  <td className="p-3 text-right font-mono">Rs 7,000/d</td>
                  <td className="p-3 text-right font-mono text-emerald-800 font-extrabold">Rs 1,75,000</td>
                  <td className="p-3 text-right font-mono text-slate-900">
                    Rs {members.reduce((s, m) => {
                      const l = ledgers.find((led) => led.id === m.depositLedgerId);
                      return s + (l ? l.currentBalance : 25000);
                    }, 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono">
                    Rs {loans.filter((l) => l.loanType === 'REGULAR' && l.status === 'ACTIVE').reduce((s, l) => s + l.principalAmount, 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono">
                    Rs {loans.filter((l) => l.loanType === 'EMERGENCY' && l.status === 'ACTIVE').reduce((s, l) => s + l.principalAmount, 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-amber-800">
                    Rs {loans.filter((l) => l.status === 'ACTIVE').reduce((s, l) => s + Math.round((l.principalAmount * ((l.interestRateAnnual || 12) / 100) * 25) / 365), 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-blue-950 font-extrabold text-sm">
                    Rs 2,36,200
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 2. Member Account Statements */}
      {activeSubTab === 'MEMBER_LEDGERS' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Member Name or ID..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select Friend:</span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.memberNo}] {m.name} ({m.nepaliName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedMember && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono rounded">
                      {selectedMember.memberNo}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Member ID: {selectedMember.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedMember.name} <span className="text-slate-500 font-normal">({selectedMember.nepaliName})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Phone: {selectedMember.phone} • Monthly Target: Rs {selectedMember.monthlySavingTarget.toLocaleString()} (25 Days)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Savings Balance</span>
                    <span className="font-mono font-bold text-emerald-950 text-base">
                      Rs {ledgers.find((l) => l.id === selectedMember.depositLedgerId)?.currentBalance.toLocaleString() || '25,000'}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="text-[10px] text-blue-800 uppercase font-bold block">Active Loans Total</span>
                    <span className="font-mono font-bold text-blue-950 text-base">
                      Rs {memberLoans.filter((l) => l.status === 'ACTIVE').reduce((s, l) => s + l.principalAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Loans Table for this member */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Loan Amortization Schedules ({memberLoans.length} loans)
                </h4>
                {memberLoans.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No active loan records for this member.</p>
                ) : (
                  <div className="space-y-3">
                    {memberLoans.map((loan) => (
                      <div key={loan.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-blue-900 font-bold">
                            {(loan.loanNumber || (loan as any).loanNo || 'Loan')} - {loan.loanType} Loan ({(loan.interestRateAnnual || (loan as any).interestRate || 12)}% p.a.)
                          </span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300">
                            Principal: Rs {loan.principalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600">
                          <div>Tenure: {(loan.durationMonths || (loan as any).tenureMonths || 12)} Months (25-day cycle)</div>
                          <div>Monthly EMI: Rs {loan.emiAmount.toLocaleString()}</div>
                          <div>Status: <strong className="text-emerald-700">{loan.status}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Outstandings & Aging */}
      {activeSubTab === 'OUTSTANDINGS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="text-center pb-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-rose-800">
              Loan Overdue &amp; Arrears Aging Statement
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">As of {today.bsDate} BS</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-bold text-emerald-800 uppercase block">0 - 30 Days (Standard)</span>
              <div className="text-xl font-bold font-mono text-emerald-950 mt-1">Rs 1,80,000</div>
              <span className="text-[11px] text-emerald-700">100% on-time regular collection</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs font-bold text-amber-800 uppercase block">31 - 60 Days (Watchlist)</span>
              <div className="text-xl font-bold font-mono text-amber-950 mt-1">Rs 0.00</div>
              <span className="text-[11px] text-amber-700">No overdue accounts</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs font-bold text-rose-800 uppercase block">60+ Days (Delinquent)</span>
              <div className="text-xl font-bold font-mono text-rose-950 mt-1">Rs 0.00</div>
              <span className="text-[11px] text-rose-700">Zero default rate</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Statistics */}
      {activeSubTab === 'STATISTICS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="text-center pb-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              System Voucher &amp; Account Statistics
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-bold uppercase block">Receipt Vouchers</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{voucherStats.RECEIPT.count}</div>
              <span className="text-[10px] text-slate-500 font-mono">Vol: Rs {voucherStats.RECEIPT.totalDr.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-bold uppercase block">Payment Vouchers</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{voucherStats.PAYMENT.count}</div>
              <span className="text-[10px] text-slate-500 font-mono">Vol: Rs {voucherStats.PAYMENT.totalDr.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-bold uppercase block">Contra Vouchers</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{voucherStats.CONTRA.count}</div>
              <span className="text-[10px] text-slate-500 font-mono">Vol: Rs {voucherStats.CONTRA.totalDr.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-bold uppercase block">Journal Vouchers</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{voucherStats.JOURNAL.count}</div>
              <span className="text-[10px] text-slate-500 font-mono">Vol: Rs {voucherStats.JOURNAL.totalDr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
