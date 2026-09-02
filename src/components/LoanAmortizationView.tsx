import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Zap,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  Loan,
  LoanType,
  Member,
  LedgerAccount,
  AmortizationRow,
  Voucher,
} from '../types';
import { generateAmortizationSchedule } from '../utils/accountingEngine';
import { DualDatePicker } from './DualDatePicker';
import { getDualToday } from '../utils/nepaliCalendar';

interface LoanAmortizationViewProps {
  loans: Loan[];
  members: Member[];
  ledgers: LedgerAccount[];
  onDisburseLoan: (loan: Loan, disbursementVoucher: Voucher) => void;
  onPostLoanInterest: (loanId: string, monthNo: number) => void;
  onAutoPostAllDueInterest: () => void;
}

export const LoanAmortizationView: React.FC<LoanAmortizationViewProps> = ({
  loans,
  members,
  ledgers,
  onDisburseLoan,
  onPostLoanInterest,
  onAutoPostAllDueInterest,
}) => {
  const today = getDualToday();

  // Selected Loan for Detail View
  const [selectedLoanId, setSelectedLoanId] = useState<string>(loans[0]?.id || '');
  const selectedLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  // Interactive Calculator State (Strict Parameters)
  const [calcAmount, setCalcAmount] = useState<number>(100000);
  const [calcRate, setCalcRate] = useState<number>(12);
  const [calcMonths, setCalcMonths] = useState<number>(12);
  const [calcCustomEmi, setCalcCustomEmi] = useState<number>(0);
  const [calcCycle, setCalcCycle] = useState<'25_DAYS' | '30_DAYS'>('25_DAYS');
  const [calcStartDateBS, setCalcStartDateBS] = useState<string>(today.bsDate);

  // New Loan Disbursement Modal State
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [disburseMemberId, setDisburseMemberId] = useState<string>(members[0]?.id || '');
  const [disburseLoanType, setDisburseLoanType] = useState<LoanType>('REGULAR');
  const [disburseAmount, setDisburseAmount] = useState<number>(100000);
  const [disburseRate, setDisburseRate] = useState<number>(12);
  const [disburseMonths, setDisburseMonths] = useState<number>(12);
  const [disburseCustomEmi, setDisburseCustomEmi] = useState<number>(0);
  const [disburseDateBS, setDisburseDateBS] = useState<string>(today.bsDate);
  const [disburseDateAD, setDisburseDateAD] = useState<string>(today.adDate);
  const [disburseLedgerId, setDisburseLedgerId] = useState<string>('led-cash-1');
  const [disburseNotes, setDisburseNotes] = useState<string>('');

  // Generate Calculation Result for Interactive Tool
  const calcResult = generateAmortizationSchedule({
    loanAmount: calcAmount,
    interestRateAnnual: calcRate,
    loanPeriodMonths: calcMonths,
    customEmiAmount: calcCustomEmi > 0 ? calcCustomEmi : undefined,
    calculationCycle: calcCycle,
    startDateBS: calcStartDateBS,
  });

  // Handle Disbursing New Loan
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m) => m.id === disburseMemberId);
    if (!member) return;

    const loanNumber = `${disburseLoanType === 'REGULAR' ? 'REG' : 'EMG'}-${disburseDateBS.substring(0, 4)}-${String(
      loans.length + 1
    ).padStart(3, '0')}`;

    const loanSchedule = generateAmortizationSchedule({
      loanAmount: disburseAmount,
      interestRateAnnual: disburseRate,
      loanPeriodMonths: disburseMonths,
      customEmiAmount: disburseCustomEmi > 0 ? disburseCustomEmi : undefined,
      calculationCycle: '25_DAYS',
      startDateBS: disburseDateBS,
    });

    const targetLoanLedgerId =
      disburseLoanType === 'REGULAR'
        ? member.regularLoanLedgerId || `led-reg-loan-${member.id}`
        : member.emergencyLoanLedgerId || `led-emg-loan-${member.id}`;

    const targetIncomeLedgerId = disburseLoanType === 'REGULAR' ? 'led-inc-dir-1' : 'led-inc-dir-2';

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      loanNumber,
      memberId: member.id,
      memberName: member.name,
      loanType: disburseLoanType,
      principalAmount: disburseAmount,
      interestRateAnnual: disburseRate,
      durationMonths: disburseMonths,
      emiAmount: loanSchedule.monthlyEmi,
      calculationCycle: '25_DAYS',
      disbursedDateBS: disburseDateBS,
      disbursedDateAD: disburseDateAD,
      maturityDateBS: loanSchedule.schedule[loanSchedule.schedule.length - 1]?.dueDateBS || disburseDateBS,
      status: 'ACTIVE',
      disbursementLedgerId: disburseLedgerId,
      loanLedgerId: targetLoanLedgerId,
      interestIncomeLedgerId: targetIncomeLedgerId,
      amortizationSchedule: loanSchedule.schedule,
      autoPostJournals: true,
      notes: disburseNotes,
    };

    const disburseVoucher: Voucher = {
      id: `vch-${Date.now()}`,
      voucherNo: `PMT-${disburseDateBS.substring(0, 4)}-${String(Date.now()).slice(-4)}`,
      voucherType: 'PAYMENT',
      dateBS: disburseDateBS,
      dateAD: disburseDateAD,
      narration: `Disbursement of ${disburseLoanType} loan to ${member.name} (${loanNumber}). ${disburseNotes}`,
      totalAmount: disburseAmount,
      createdBy: 'Bikram Adhikari',
      status: 'POSTED',
      createdAt: new Date().toISOString(),
      entries: [
        {
          id: '1',
          ledgerId: targetLoanLedgerId,
          ledgerName: `${disburseLoanType === 'REGULAR' ? 'Regular Loan' : 'Emergency Loan'} - ${member.name}`,
          drAmount: disburseAmount,
          crAmount: 0,
          memberId: member.id,
        },
        {
          id: '2',
          ledgerId: disburseLedgerId,
          ledgerName: ledgers.find((l) => l.id === disburseLedgerId)?.name || 'Cash in Hand',
          drAmount: 0,
          crAmount: disburseAmount,
        },
      ],
    };

    onDisburseLoan(newLoan, disburseVoucher);
    setIsDisburseModalOpen(false);
    setSelectedLoanId(newLoan.id);
  };

  // Export Amortization Table CSV
  const handleExportSchedule = () => {
    if (!selectedLoan) return;
    const rows = [
      ['Month #', 'Period', 'Due Date (BS)', 'Opening Bal', 'Principal Due', '25-Day Interest', 'Total EMI', 'Closing Bal', 'Status'],
    ];

    selectedLoan.amortizationSchedule.forEach((r) => {
      rows.push([
        String(r.monthNo),
        r.periodLabel,
        r.dueDateBS,
        String(r.openingBalance),
        String(r.principalDue),
        String(r.interestDue),
        String(r.totalEmi),
        String(r.closingBalance),
        r.status,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amortization_${selectedLoan.loanNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Parameter-Based Loan Amortization & 25-Day Interest Engine
          </h1>
          <p className="text-xs text-slate-500">
            Strict parameters: Loan Amount, Interest Rate % p.a., EMI Amount, Duration (Months) with automated monthly journal posting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDisburseModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Disburse New Loan
          </button>
        </div>
      </div>

      {/* Main Grid: Active Loans List + Interactive Parameter Calculator & Selected Amortization Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Group Loans */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Member Loans ({loans.length})
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                25-Day Cycle
              </span>
            </div>

            <div className="space-y-2">
              {loans.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setSelectedLoanId(l.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedLoan?.id === l.id
                      ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600">
                      {l.loanNumber}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        l.loanType === 'REGULAR'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {l.loanType}
                    </span>
                  </div>

                  <div className="mt-1 font-bold text-slate-900">{l.memberName}</div>

                  <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div>Principal: <strong className="text-slate-900 font-mono">Rs {l.principalAmount.toLocaleString()}</strong></div>
                    <div>Rate: <strong className="text-slate-900">{l.interestRateAnnual}% p.a.</strong></div>
                    <div>EMI: <strong className="text-emerald-600 font-bold font-mono">Rs {l.emiAmount.toLocaleString()}</strong></div>
                    <div>Months: <strong className="text-slate-900">{l.durationMonths} mo</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Calculator Box */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Live Loan Simulator
              </h3>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Strict 4-Param
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1 uppercase tracking-wider text-[10px]">1. Loan Amount (NPR)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1 uppercase tracking-wider text-[10px]">2. Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1 uppercase tracking-wider text-[10px]">3. Period (Months)</label>
                  <input
                    type="number"
                    value={calcMonths}
                    onChange={(e) => setCalcMonths(Number(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1 uppercase tracking-wider text-[10px]">
                  4. Custom EMI (0 = auto PMT)
                </label>
                <input
                  type="number"
                  value={calcCustomEmi}
                  onChange={(e) => setCalcCustomEmi(Number(e.target.value) || 0)}
                  placeholder="0 (auto calculated)"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-lg space-y-1.5 text-xs border border-slate-700 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Computed EMI:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  Rs {calcResult.monthlyEmi.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Interest (25-Day rule):</span>
                <span className="font-bold text-amber-300 font-mono">
                  Rs {calcResult.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1.5 border-t border-slate-700">
                <span>Total Repayment:</span>
                <span className="font-mono text-blue-400">
                  Rs {calcResult.totalPayment.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Full Amortization Table for Selected Loan */}
        <div className="lg:col-span-2 space-y-4">
          {selectedLoan ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Amortization Schedule: {selectedLoan.loanNumber}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedLoan.loanType} LOAN
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Borrower: <strong>{selectedLoan.memberName}</strong> | Disbursed: {selectedLoan.disbursedDateBS} BS ({selectedLoan.disbursedDateAD} AD)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSchedule}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    Print Table
                  </button>
                </div>
              </div>

              {/* Strict Parameter KPI Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Principal Amount</span>
                  <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                    Rs {selectedLoan.principalAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Annual Rate</span>
                  <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                    {selectedLoan.interestRateAnnual}% p.a.
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Monthly EMI</span>
                  <div className="font-bold text-emerald-600 font-mono text-sm mt-0.5">
                    Rs {selectedLoan.emiAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Duration</span>
                  <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                    {selectedLoan.durationMonths} Months
                  </div>
                </div>
              </div>

              {/* Amortization Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Due Date (BS)</th>
                      <th className="py-2.5 px-3 text-right">Opening Bal</th>
                      <th className="py-2.5 px-3 text-right">Principal</th>
                      <th className="py-2.5 px-3 text-right">25-Day Interest</th>
                      <th className="py-2.5 px-3 text-right">Total EMI</th>
                      <th className="py-2.5 px-3 text-right">Closing Bal</th>
                      <th className="py-2.5 px-3 text-center">Auto-Post Journal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedLoan.amortizationSchedule.map((row) => (
                      <tr
                        key={row.monthNo}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          row.status === 'POSTED' ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-blue-600">{row.monthNo}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-700">{row.periodLabel}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {row.dueDateBS}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          Rs {row.openingBalance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-700 font-semibold">
                          Rs {row.principalDue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-600 font-semibold">
                          Rs {row.interestDue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                          Rs {row.totalEmi.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          Rs {row.closingBalance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          {row.status === 'POSTED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Posted
                            </span>
                          ) : (
                            <button
                              onClick={() => onPostLoanInterest(selectedLoan.id, row.monthNo)}
                              className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-2xs active:scale-95 transition-all"
                            >
                              ⚡ Post Interest
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              Select or disburse a loan to view amortization schedule.
            </div>
          )}
        </div>
      </div>

      {/* Disburse Loan Modal */}
      {isDisburseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Disburse Member Loan
              </h2>
              <button
                onClick={() => setIsDisburseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Borrower Member</label>
                <select
                  value={disburseMemberId}
                  onChange={(e) => setDisburseMemberId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-semibold focus:bg-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.memberNo}] {m.name} ({m.nepaliName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Loan Type</label>
                  <select
                    value={disburseLoanType}
                    onChange={(e) => {
                      const lt = e.target.value as LoanType;
                      setDisburseLoanType(lt);
                      setDisburseRate(lt === 'REGULAR' ? 12 : 15);
                      setDisburseMonths(lt === 'REGULAR' ? 12 : 3);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-bold focus:bg-white"
                  >
                    <option value="REGULAR">Regular Loan (12% p.a.)</option>
                    <option value="EMERGENCY">Emergency Loan (15% p.a.)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Disbursement Source</label>
                  <select
                    value={disburseLedgerId}
                    onChange={(e) => setDisburseLedgerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
                  >
                    <option value="led-cash-1">Cash in Hand</option>
                    <option value="led-bank-1">Nabil Bank Ltd</option>
                    <option value="led-bank-2">Global IME Bank</option>
                  </select>
                </div>
              </div>

              {/* Strict Parameter Inputs */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                <div className="font-bold text-blue-900">Strict Standard Parameters</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Principal (NPR)</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={disburseAmount}
                      onChange={(e) => setDisburseAmount(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-blue-200 rounded-md text-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Rate (% p.a.)</label>
                    <input
                      type="number"
                      required
                      step="0.5"
                      value={disburseRate}
                      onChange={(e) => setDisburseRate(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-blue-200 rounded-md text-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Months</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={disburseMonths}
                      onChange={(e) => setDisburseMonths(Number(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-blue-200 rounded-md text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Dual Date Picker */}
              <DualDatePicker
                dateBS={disburseDateBS}
                dateAD={disburseDateAD}
                onChange={(bs, ad) => {
                  setDisburseDateBS(bs);
                  setDisburseDateAD(ad);
                }}
                label="Disbursement Date"
              />

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Purpose / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Business investment, medical emergency, grocery store"
                  value={disburseNotes}
                  onChange={(e) => setDisburseNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDisburseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs cursor-pointer transition-colors"
                >
                  Confirm & Disburse Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
