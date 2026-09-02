import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Calendar,
  PiggyBank,
  CreditCard,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Sparkles,
  Edit,
  Trash2,
  Search,
  MapPin,
  ShieldAlert,
  UserCheck,
  Percent,
} from 'lucide-react';
import {
  Member,
  Loan,
  LedgerAccount,
  Voucher,
  UserAccount,
} from '../types';
import { getDualToday } from '../utils/nepaliCalendar';

interface MembersViewProps {
  members: Member[];
  loans: Loan[];
  ledgers: LedgerAccount[];
  vouchers: Voucher[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember?: (memberId: string) => void;
  onRecordQuickSaving: (memberId: string) => void;
  currentUser?: UserAccount;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  loans,
  ledgers,
  vouchers,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onRecordQuickSaving,
  currentUser,
}) => {
  const today = getDualToday();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newNepaliName, setNewNepaliName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newMonthlySaving, setNewMonthlySaving] = useState<number>(25000);
  const [newShareUnits, setNewShareUnits] = useState<number>(1);

  // Edit Member Form State
  const [editName, setEditName] = useState('');
  const [editNepaliName, setEditNepaliName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editMonthlySaving, setEditMonthlySaving] = useState<number>(25000);
  const [editDailyRate, setEditDailyRate] = useState<number>(1000);
  const [editCollectionDays, setEditCollectionDays] = useState<number>(25);
  const [editShareUnits, setEditShareUnits] = useState<number>(1);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editMemberNo, setEditMemberNo] = useState('');

  const filteredMembers = members.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.nepaliName && m.nepaliName.includes(q)) ||
      m.memberNo.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      (m.address && m.address.toLowerCase().includes(q))
    );
  });

  const selectedMember = members.find((m) => m.id === selectedMemberId) || filteredMembers[0] || members[0];
  const memberDepositLedger = ledgers.find((l) => l.id === selectedMember?.depositLedgerId || l.memberId === selectedMember?.id && l.tier2 === 'MEMBERS_DEPOSIT');
  const memberRegularLoanLedger = ledgers.find((l) => l.id === selectedMember?.regularLoanLedgerId);
  const memberEmergencyLoanLedger = ledgers.find((l) => l.id === selectedMember?.emergencyLoanLedgerId);

  const memberLoans = loans.filter((l) => l.memberId === selectedMember?.id);
  const memberVouchers = vouchers.filter((v) =>
    v.entries.some((e) => e.memberId === selectedMember?.id || e.ledgerId === selectedMember?.depositLedgerId)
  );

  const handleOpenEdit = (m: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMemberToEdit(m);
    setEditName(m.name);
    setEditNepaliName(m.nepaliName || '');
    setEditPhone(m.phone);
    setEditAddress(m.address || '');
    setEditMonthlySaving(m.monthlySavingTarget || 25000);
    setEditDailyRate(m.dailySavingRate || 1000);
    setEditCollectionDays(m.collectionDaysPerMonth || 25);
    setEditShareUnits(m.shareUnits || 1);
    setEditStatus(m.status || 'ACTIVE');
    setEditMemberNo(m.memberNo || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit || !editName.trim()) return;

    const updated: Member = {
      ...memberToEdit,
      name: editName.trim(),
      nepaliName: editNepaliName.trim() || editName.trim(),
      phone: editPhone.trim() || memberToEdit.phone,
      address: editAddress.trim(),
      monthlySavingTarget: Number(editMonthlySaving) || 25000,
      dailySavingRate: Number(editDailyRate) || 1000,
      collectionDaysPerMonth: Number(editCollectionDays) || 25,
      shareUnits: Number(editShareUnits) || 1,
      status: editStatus,
      memberNo: editMemberNo.trim() || memberToEdit.memberNo,
    };

    onUpdateMember(updated);
    setIsEditModalOpen(false);
    setMemberToEdit(null);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const nextId = `mem-${members.length + 1}`;
    const newMem: Member = {
      id: nextId,
      memberNo: `SSH-${String(members.length + 1).padStart(3, '0')}`,
      name: newName.trim(),
      nepaliName: newNepaliName.trim() || newName.trim(),
      phone: newPhone.trim() || '9841000000',
      address: newAddress.trim() || 'Kathmandu, Nepal',
      joinDateBS: today.bsDate,
      joinDateAD: today.adDate,
      status: 'ACTIVE',
      monthlySavingTarget: Number(newMonthlySaving) || 25000,
      dailySavingRate: Math.round((Number(newMonthlySaving) || 25000) / 25),
      collectionDaysPerMonth: 25,
      shareUnits: Number(newShareUnits) || 1,
      depositLedgerId: `led-dep-${nextId}`,
      regularLoanLedgerId: `led-reg-loan-${nextId}`,
      emergencyLoanLedgerId: `led-emg-loan-${nextId}`,
    };

    onAddMember(newMem);
    setIsAddModalOpen(false);
    setSelectedMemberId(newMem.id);

    // Reset Form
    setNewName('');
    setNewNepaliName('');
    setNewPhone('');
    setNewAddress('');
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmMember || !onDeleteMember) return;
    onDeleteMember(deleteConfirmMember.id);
    if (selectedMemberId === deleteConfirmMember.id) {
      const remaining = members.filter((m) => m.id !== deleteConfirmMember.id);
      setSelectedMemberId(remaining[0]?.id || '');
    }
    setDeleteConfirmMember(null);
  };

  const handlePrintMemberPassbook = () => {
    window.print();
  };

  const canEdit = currentUser?.permissions.canManageUsers ?? true;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Members &amp; Passbook Statements
          </h1>
          <p className="text-xs text-slate-500">
            Manage member information, update saving targets, and review individual saving and loan ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMember && (
            <button
              onClick={() => handleOpenEdit(selectedMember)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Friend / Member</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Members Cards List & Selected Member Passbook Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Members List with Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Group Members ({members.length})
            </h2>
            <span className="text-[11px] text-blue-600 font-medium font-mono">25-Day Model</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member by name, phone, or #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-0.5">
            {filteredMembers.map((m, idx) => {
              const isSelected = selectedMember?.id === m.id;
              const depLedger = ledgers.find((l) => l.id === m.depositLedgerId || (l.memberId === m.id && l.tier2 === 'MEMBERS_DEPOSIT'));
              const activeLoansCount = loans.filter((l) => l.memberId === m.id && l.status === 'ACTIVE').length;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all relative group ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {m.name}
                          <span className="text-[10px] text-slate-400 font-normal">({m.nepaliName})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{m.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {m.status}
                      </span>
                      <button
                        onClick={(e) => handleOpenEdit(m, e)}
                        title="Edit Member Information"
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-2.5 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Savings</span>
                      <div className="font-bold text-emerald-600 font-mono text-xs">
                        Rs {(depLedger?.currentBalance || 75000).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Loans</span>
                      <div className="font-bold text-blue-600 font-mono text-xs">
                        {activeLoansCount > 0 ? `${activeLoansCount} Active` : 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Member Passbook & Loan Ledger Statement */}
        <div className="lg:col-span-2 space-y-5">
          {selectedMember ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              {/* Member Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedMember.name}
                      </h2>
                      <span className="text-sm font-normal text-slate-500">
                        ({selectedMember.nepaliName})
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          selectedMember.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {selectedMember.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-blue-600" /> {selectedMember.phone}
                      </span>
                      {selectedMember.address && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedMember.address}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Joined: {selectedMember.joinDateBS || today.bsDate} BS</span>
                      <span>•</span>
                      <span className="font-mono text-blue-600 font-bold">
                        {selectedMember.memberNo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedMember)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Info</span>
                  </button>

                  <button
                    onClick={() => onRecordQuickSaving(selectedMember.id)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    + Post 25-Day Saving (25k)
                  </button>

                  <button
                    onClick={handlePrintMemberPassbook}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    Print Passbook
                  </button>

                  {onDeleteMember && members.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirmMember(selectedMember)}
                      title="Remove Member"
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account Balances Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Cumulative Savings Balance
                  </span>
                  <div className="text-xl font-bold text-emerald-900 font-mono mt-1">
                    Rs {(memberDepositLedger?.currentBalance || 75000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1 flex items-center justify-between">
                    <span>Target: Rs {(selectedMember.monthlySavingTarget || 25000).toLocaleString()} / mo</span>
                    <span className="font-mono">({selectedMember.collectionDaysPerMonth || 25}d cycle)</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                    Regular Loan (12% p.a.)
                  </span>
                  <div className="text-xl font-bold text-blue-900 font-mono mt-1">
                    Rs {(memberRegularLoanLedger?.currentBalance || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-1">
                    25-Day interest cycle
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Emergency Loan (15% p.a.)
                  </span>
                  <div className="text-xl font-bold text-amber-900 font-mono mt-1">
                    Rs {(memberEmergencyLoanLedger?.currentBalance || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1">
                    Instant emergency relief
                  </div>
                </div>
              </div>

              {/* Member's Active Loans */}
              {memberLoans.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Member Loan Accounts ({memberLoans.length})
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2.5">Loan #</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Disbursed Date</th>
                          <th className="p-2.5 text-right">Principal</th>
                          <th className="p-2.5 text-right">Rate</th>
                          <th className="p-2.5 text-right">Monthly EMI</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {memberLoans.map((l) => (
                          <tr key={l.id}>
                            <td className="p-2.5 font-bold text-blue-600">{l.loanNumber}</td>
                            <td className="p-2.5 font-sans font-medium text-slate-900">{l.loanType}</td>
                            <td className="p-2.5 text-slate-600">{l.disbursedDateBS} BS</td>
                            <td className="p-2.5 text-right font-semibold">Rs {l.principalAmount.toLocaleString()}</td>
                            <td className="p-2.5 text-right">{l.interestRateAnnual}%</td>
                            <td className="p-2.5 text-right text-emerald-600 font-bold">Rs {l.emiAmount.toLocaleString()}</td>
                            <td className="p-2.5 text-center font-sans">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Member Transaction History / Passbook */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  Passbook Activity & Vouchers
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Date (BS/AD)</th>
                        <th className="p-2.5">Voucher #</th>
                        <th className="p-2.5">Transaction Particulars</th>
                        <th className="p-2.5 text-right">Debit (NPR)</th>
                        <th className="p-2.5 text-right">Credit (NPR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {memberVouchers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            No transactions recorded for this member yet.
                          </td>
                        </tr>
                      ) : (
                        memberVouchers.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-2.5 text-slate-600 font-mono">
                              <div className="font-semibold">{v.dateBS} BS</div>
                              <div className="text-[10px] text-slate-400">{v.dateAD} AD</div>
                            </td>
                            <td className="p-2.5 font-mono font-bold text-blue-600">
                              {v.voucherNo}
                            </td>
                            <td className="p-2.5 text-slate-900">
                              <div className="font-medium">{v.narration}</div>
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              {v.voucherType === 'PAYMENT' ? `Rs ${v.totalAmount.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                              {v.voucherType === 'RECEIPT' ? `Rs ${v.totalAmount.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              Select a member to view their passbook.
            </div>
          )}
        </div>
      </div>

      {/* Edit Member Modal */}
      {isEditModalOpen && memberToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  Edit Friend / Member Details
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update personal information, contact numbers, address, and monthly saving rules.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Alternative Name / Notes
                  </label>
                  <input
                    type="text"
                    value={editNepaliName}
                    onChange={(e) => setEditNepaliName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Member Code / No.
                  </label>
                  <input
                    type="text"
                    value={editMemberNo}
                    onChange={(e) => setEditMemberNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-bold focus:bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Baluwatar, Kathmandu"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Saving Rules & Shares */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  25-Day Model Saving Configuration
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Monthly Target (Rs)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={editMonthlySaving}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditMonthlySaving(val);
                        setEditDailyRate(Math.round(val / (editCollectionDays || 25)));
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Daily Rate (Rs/day)
                    </label>
                    <input
                      type="number"
                      value={editDailyRate}
                      onChange={(e) => setEditDailyRate(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Days / Cycle
                    </label>
                    <input
                      type="number"
                      value={editCollectionDays}
                      onChange={(e) => setEditCollectionDays(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Add New Group Member / Friend
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Full Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shyam Sundar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Local / Alternate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shyam S."
                  value={newNepaliName}
                  onChange={(e) => setNewNepaliName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="98XXXXXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu, Nepal"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 block">
                  Automatic Saving Rule Assignment:
                </span>
                <p className="text-[11px] text-blue-800">
                  Member will be enrolled in the <strong>25-day cycle</strong> (Rs 1,000/day = Rs 25,000/month) with auto-created deposit and loan ledgers in Chart of Accounts.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs cursor-pointer transition-colors active:scale-95"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-full border border-red-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove Member / Friend</h3>
                <p className="text-xs text-slate-500">Confirm member deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong>{deleteConfirmMember.name}</strong> ({deleteConfirmMember.memberNo}) from the active circle roster?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmMember(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

