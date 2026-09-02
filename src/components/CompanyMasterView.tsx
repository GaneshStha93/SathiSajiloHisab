import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Save,
  Download,
  Upload,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  ShieldCheck,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  Users,
  Coins,
  BookOpen,
  Layers,
  Edit3,
  Eye,
  Check,
} from 'lucide-react';
import {
  CompanyMaster,
  LedgerAccount,
  Member,
  Loan,
  Voucher,
  UserAccount,
} from '../types';
import { getDualToday } from '../utils/nepaliCalendar';

interface CompanyMasterViewProps {
  companies?: CompanyMaster[];
  activeCompanyId?: string;
  onSelectCompany?: (id: string) => void;
  onDeleteCompany?: (id: string) => void;
  onOpenCompanyGateway?: () => void;
  company: CompanyMaster;
  onUpdateCompany: (updated: CompanyMaster) => void;
  ledgers: LedgerAccount[];
  vouchers: Voucher[];
  members: Member[];
  loans: Loan[];
  users: UserAccount[];
  onRestoreAllData: (data: {
    company: CompanyMaster;
    companies?: CompanyMaster[];
    ledgers: LedgerAccount[];
    vouchers: Voucher[];
    members: Member[];
    loans: Loan[];
    users?: UserAccount[];
  }) => void;
  onSplitFiscalYear: (newCompany: CompanyMaster, newLedgers: LedgerAccount[]) => void;
  showNotification: (msg: string) => void;
}

export const CompanyMasterView: React.FC<CompanyMasterViewProps> = ({
  companies = [],
  activeCompanyId,
  onSelectCompany,
  onDeleteCompany,
  onOpenCompanyGateway,
  company,
  onUpdateCompany,
  ledgers,
  vouchers,
  members,
  loans,
  users,
  onRestoreAllData,
  onSplitFiscalYear,
  showNotification,
}) => {
  const today = getDualToday();

  // Active view on the left: 'DETAILS' | 'ALTER' | 'BACKUP_RESTORE' | 'YEAR_END_SPLIT'
  const [activeAction, setActiveAction] = useState<'DETAILS' | 'ALTER' | 'BACKUP_RESTORE' | 'YEAR_END_SPLIT'>('DETAILS');

  // Form State for Altering Company Info
  const [formCompany, setFormCompany] = useState<CompanyMaster>({ ...company });
  const [isSaving, setIsSaving] = useState(false);

  // Keep form in sync when active company changes
  useEffect(() => {
    setFormCompany({ ...company });
  }, [company]);

  // Restore State
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Year-End Split Form
  const [nextFyLabel, setNextFyLabel] = useState('2082/083');
  const [nextFyStartBS, setNextFyStartBS] = useState('2082-04-01');
  const [nextFyEndBS, setNextFyEndBS] = useState('2083-03-31');
  const [nextFyStartAD, setNextFyStartAD] = useState('2025-07-16');
  const [nextFyEndAD, setNextFyEndAD] = useState('2026-07-15');
  const [confirmSplit, setConfirmSplit] = useState(false);

  // Save Altered Company Info
  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const sYear = (formCompany.fiscalYearStartBS || '').split('-')[0] || '2081';
    const eYear = (formCompany.fiscalYearEndBS || '').split('-')[0] || '2082';
    const eSuffix = eYear.length === 4 ? `0${eYear.slice(2)}` : eYear.slice(-2);
    const computedFyLabel = `${sYear}/${eSuffix}`;

    const updatedCompany: CompanyMaster = {
      ...formCompany,
      name: formCompany.name.trim(),
      address: formCompany.address.trim(),
      city: '',
      stateOrProvince: '',
      fiscalYearLabel: computedFyLabel,
      currencyFormalName: 'NPR (Nepalese Rupee)',
      currencySymbol: 'Rs',
    };

    setTimeout(() => {
      onUpdateCompany(updatedCompany);
      setFormCompany(updatedCompany);
      setIsSaving(false);
      setActiveAction('DETAILS');
      showNotification('Company organization details updated successfully.');
    }, 300);
  };

  // Download Backup JSON
  const handleDownloadBackup = () => {
    const backupPackage = {
      app: 'Sathi Sajilo Hisab ERP',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      activeCompanyId: formCompany.id,
      company: formCompany,
      companies: companies.length > 0 ? companies : [formCompany],
      ledgers,
      vouchers,
      members,
      loans,
      users: users.map((u) => ({ ...u, password: u.password })),
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPackage, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `${formCompany.name.replace(/\s+/g, '_')}_Backup_${today.bsDate}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification(`Backup exported successfully as ${filename}`);
  };

  // File Upload for Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.company && !parsed.companies) {
          throw new Error('Invalid backup file structure: missing company data');
        }
        setRestorePreview(parsed);
        setRestoreJsonText(JSON.stringify(parsed, null, 2));
        setRestoreError(null);
      } catch (err: any) {
        setRestoreError(err.message || 'Failed to parse JSON file');
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = () => {
    if (!restorePreview) return;
    try {
      const restoredComp =
        restorePreview.company ||
        (restorePreview.companies && restorePreview.companies[0]) ||
        formCompany;
      onRestoreAllData({
        company: restoredComp,
        companies: restorePreview.companies || [restoredComp],
        ledgers: restorePreview.ledgers || [],
        vouchers: restorePreview.vouchers || [],
        members: restorePreview.members || [],
        loans: restorePreview.loans || [],
        users: restorePreview.users || undefined,
      });
      setFormCompany(restoredComp);
      showNotification('Company data successfully restored from backup.');
      setRestorePreview(null);
      setRestoreJsonText('');
      setActiveAction('DETAILS');
    } catch (err: any) {
      setRestoreError(err.message || 'Error restoring data');
    }
  };

  // Execute Year-End Split
  const handleExecuteSplit = () => {
    let totalIncome = 0;
    let totalExpenses = 0;

    ledgers.forEach((l) => {
      if (l.majorGroup === 'INCOME') totalIncome += l.currentBalance;
      if (l.majorGroup === 'EXPENSES') totalExpenses += l.currentBalance;
    });

    const netProfit = totalIncome - totalExpenses;

    // Safety backup
    handleDownloadBackup();

    const newLedgers: LedgerAccount[] = ledgers.map((l) => {
      if (l.majorGroup === 'ASSETS' || l.majorGroup === 'LIABILITIES') {
        return {
          ...l,
          openingBalance: l.currentBalance,
          openingType: l.currentType,
          currentBalance: l.currentBalance,
          currentType: l.currentType,
        };
      } else if (l.majorGroup === 'EQUITY') {
        if (l.tier2 === 'RETAINED_EARNINGS_EQUITY' || l.isSystem) {
          const updatedBalance = Math.max(0, l.currentBalance + netProfit);
          return {
            ...l,
            openingBalance: updatedBalance,
            openingType: 'CR',
            currentBalance: updatedBalance,
            currentType: 'CR',
          };
        }
        return {
          ...l,
          openingBalance: l.currentBalance,
          openingType: l.currentType,
          currentBalance: l.currentBalance,
          currentType: l.currentType,
        };
      } else {
        return {
          ...l,
          openingBalance: 0,
          openingType: l.majorGroup === 'INCOME' ? 'CR' : 'DR',
          currentBalance: 0,
          currentType: l.majorGroup === 'INCOME' ? 'CR' : 'DR',
        };
      }
    });

    const newCompany: CompanyMaster = {
      ...formCompany,
      fiscalYearLabel: nextFyLabel,
      fiscalYearStartBS: nextFyStartBS,
      fiscalYearEndBS: nextFyEndBS,
      fiscalYearStartAD: nextFyStartAD,
      fiscalYearEndAD: nextFyEndAD,
      booksBeginningFromBS: nextFyStartBS,
      booksBeginningFromAD: nextFyStartAD,
    };

    onSplitFiscalYear(newCompany, newLedgers);
    setFormCompany(newCompany);
    setConfirmSplit(false);
    setActiveAction('DETAILS');
    showNotification(`Fiscal Year successfully split for ${nextFyLabel}. Previous year balances carried forward.`);
  };

  return (
    <div className="space-y-6">
      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Area (Details, Alter, Backup & Restore, or Split) */}
        <div className="lg:col-span-8 space-y-6">
          {/* OPTION 1: COMPANY DETAILS VIEW */}
          {activeAction === 'DETAILS' && (
            <div className="space-y-6">
              {/* Primary Identity Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{formCompany.name}</h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Internal ID: {formCompany.id} • Currency: {formCompany.currencyFormalName || 'NPR (Nepalese Rupee)'}
                    </p>
                  </div>
                </div>

                {/* Statutory & Legal Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>PAN Number</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {formCompany.panVatNo || <span className="text-slate-400 font-normal italic">Not Specified</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Registration Number</span>
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {formCompany.registrationNo || <span className="text-slate-400 font-normal italic">Not Specified</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 sm:col-span-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registered Address</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formCompany.address || <span className="text-slate-400 font-normal italic">Nepal</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>Contact Number</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formCompany.phone || <span className="text-slate-400 font-normal italic">Not Specified</span>}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>Email Address</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formCompany.email || <span className="text-slate-400 font-normal italic">Not Specified</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiscal Period & Books Definition Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Fiscal Period &amp; Calendar Parameters</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-mono text-xs font-bold">
                    FY: {formCompany.fiscalYearLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-slate-500 font-medium mb-1">Fiscal Year Start Date (BS)</div>
                    <div className="text-slate-900 font-mono font-bold text-sm">{formCompany.fiscalYearStartBS} BS</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">({formCompany.fiscalYearStartAD} AD)</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-slate-500 font-medium mb-1">Fiscal Year End Date (BS)</div>
                    <div className="text-slate-900 font-mono font-bold text-sm">{formCompany.fiscalYearEndBS} BS</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">({formCompany.fiscalYearEndAD} AD)</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-slate-500 font-medium mb-1">Books Beginning From</div>
                    <div className="text-slate-900 font-mono font-bold text-sm">{formCompany.booksBeginningFromBS} BS</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-slate-500 font-medium mb-1">Base Currency</div>
                    <div className="text-slate-900 font-bold text-sm">NPR (Nepalese Rupee - Rs)</div>
                  </div>
                </div>
              </div>

              {/* Workspace Entity Statistics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Company Workspace Records</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{members.length}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Members</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{ledgers.length}</div>
                    <div className="text-[11px] text-slate-500 font-medium">CoA Ledgers</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{vouchers.length}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Vouchers</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{loans.length}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Loans</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 2: ALTER COMPANY INFO FORM */}
          {activeAction === 'ALTER' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-600" />
                    <span>Alter Company Info</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modify organization legal name, statutory numbers, address, contacts, and fiscal period.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAction('DETAILS')}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
                >
                  Cancel / Back
                </button>
              </div>

              <form onSubmit={handleSaveParameters} className="space-y-5 pt-5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Company/Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany.name}
                    onChange={(e) => setFormCompany({ ...formCompany, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                    placeholder=""
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1.5">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={formCompany.panVatNo || ''}
                      onChange={(e) => setFormCompany({ ...formCompany, panVatNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1.5">
                      Regd. Number
                    </label>
                    <input
                      type="text"
                      value={formCompany.registrationNo || ''}
                      onChange={(e) => setFormCompany({ ...formCompany, registrationNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formCompany.address}
                    onChange={(e) => setFormCompany({ ...formCompany, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                    placeholder=""
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1.5">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formCompany.phone}
                      onChange={(e) => setFormCompany({ ...formCompany, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formCompany.email}
                      onChange={(e) => setFormCompany({ ...formCompany, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Fiscal Year Parameters */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Fiscal Year Definition &amp; Books Period</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded border border-purple-200">
                      FY: {(formCompany.fiscalYearStartBS || '').split('-')[0] || '2081'}/0{((formCompany.fiscalYearEndBS || '').split('-')[0] || '2082').slice(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Fiscal Year Start Date (BS)
                      </label>
                      <input
                        type="text"
                        value={formCompany.fiscalYearStartBS}
                        onChange={(e) => setFormCompany({ ...formCompany, fiscalYearStartBS: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Fiscal Year End Date (BS)
                      </label>
                      <input
                        type="text"
                        value={formCompany.fiscalYearEndBS}
                        onChange={(e) => setFormCompany({ ...formCompany, fiscalYearEndBS: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveAction('DETAILS')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#0f4d34] hover:bg-[#166545] text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Alter'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OPTION 3: BACKUP & RESTORE VIEW */}
          {activeAction === 'BACKUP_RESTORE' && (
            <div className="space-y-6">
              {/* Backup Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Backup Company Database</h2>
                    <p className="text-xs text-slate-500">Download complete accounting books and registers as a JSON file.</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800 mb-1">Included in Backup Archive:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Company Master Parameters &amp; Active Entity Profile</li>
                    <li>Complete Chart of Accounts ({ledgers.length} ledgers)</li>
                    <li>All Voucher Transactions &amp; Journals ({vouchers.length} records)</li>
                    <li>Member Profiles &amp; Passbooks ({members.length} members)</li>
                    <li>Active &amp; Historical Loan Schedules ({loans.length} loans)</li>
                    <li>User Accounts &amp; Access Roles ({users.length} users)</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-3 bg-[#0f4d34] hover:bg-[#166545] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Company Backup (.json)</span>
                </button>
              </div>

              {/* Restore Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Restore Company Database</h2>
                    <p className="text-xs text-slate-500">Upload and restore accounting records from a previously generated backup.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Select Backup JSON File:
                  </label>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                {restoreError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{restoreError}</span>
                  </div>
                )}

                {restorePreview && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Valid Backup Package Detected</span>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div>Company: <strong>{restorePreview.company?.name || 'N/A'}</strong></div>
                      <div>Fiscal Year: <strong>{restorePreview.company?.fiscalYearLabel || 'N/A'}</strong></div>
                      <div>Ledgers: <strong>{restorePreview.ledgers?.length || 0}</strong> | Vouchers: <strong>{restorePreview.vouchers?.length || 0}</strong></div>
                      <div>Exported At: <span className="font-mono text-slate-500">{restorePreview.exportedAt || 'N/A'}</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyRestore}
                      className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Confirm &amp; Restore Database</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OPTION 4: YEAR-END SPLIT VIEW */}
          {activeAction === 'YEAR_END_SPLIT' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Year-End Company Data Splitting Wizard</h2>
                  <p className="text-xs text-slate-500">
                    Close out the current fiscal year ({formCompany.fiscalYearLabel}), transfer net profit/loss to Retained Earnings, carry forward closing balances, and initialize fresh transaction registers.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Automated Year-End Procedure Summary:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                  <li>Calculates final net profit/surplus for current fiscal year <strong>{formCompany.fiscalYearLabel}</strong>.</li>
                  <li>Transfers net profit into <strong>Retained Earnings / P&amp;L Equity</strong> ledger.</li>
                  <li>Sets new Opening Balances for all Assets, Liabilities, and Equity ledgers equal to their current Closing Balances.</li>
                  <li>Resets all Income and Expense ledgers to <strong>0</strong> opening balance.</li>
                  <li>Archives transaction vouchers and resets the voucher register for the fresh fiscal year.</li>
                  <li>An automatic safety backup download is initiated before the split occurs.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    New Fiscal Year Label *
                  </label>
                  <input
                    type="text"
                    value={nextFyLabel}
                    onChange={(e) => setNextFyLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                    placeholder="2082/083"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    New Fiscal Year Start Date (BS) *
                  </label>
                  <input
                    type="text"
                    value={nextFyStartBS}
                    onChange={(e) => setNextFyStartBS(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                    placeholder="2082-04-01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    New Fiscal Year End Date (BS) *
                  </label>
                  <input
                    type="text"
                    value={nextFyEndBS}
                    onChange={(e) => setNextFyEndBS(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                    placeholder="2083-03-31"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    New Fiscal Year Start Date (AD)
                  </label>
                  <input
                    type="text"
                    value={nextFyStartAD}
                    onChange={(e) => setNextFyStartAD(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm"
                    placeholder="2025-07-16"
                  />
                </div>
              </div>

              <div className="pt-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmSplit}
                    onChange={(e) => setConfirmSplit(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>I understand that this will finalize {formCompany.fiscalYearLabel} and begin new books for {nextFyLabel}.</span>
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveAction('DETAILS')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!confirmSplit}
                  onClick={handleExecuteSplit}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Execute Year-End Split &amp; Start Fiscal Year {nextFyLabel}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Outside Border Box with Heading "Company Info" */}
        <div className="lg:col-span-4 space-y-5">
          {/* Main Requested Box */}
          <div className="bg-white border-2 border-[#0f4d34] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0f4d34]" />
                <h3 className="text-base font-bold text-slate-900">Company Info</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Menu
              </span>
            </div>

            {/* The 3 Required Options */}
            <div className="space-y-2">
              {/* Option 1: Alter */}
              <button
                type="button"
                onClick={() => setActiveAction('ALTER')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                  activeAction === 'ALTER'
                    ? 'bg-[#0f4d34] text-white border-[#0f4d34] shadow-xs'
                    : 'bg-slate-50/80 hover:bg-[#e4f2e9] text-slate-800 border-slate-200 hover:border-[#9ec4b0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeAction === 'ALTER' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Alter</div>
                    <div
                      className={`text-[11px] ${
                        activeAction === 'ALTER' ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      Edit company details &amp; FY
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                    activeAction === 'ALTER' ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Option 2: Backup & Restore */}
              <button
                type="button"
                onClick={() => setActiveAction('BACKUP_RESTORE')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                  activeAction === 'BACKUP_RESTORE'
                    ? 'bg-[#0f4d34] text-white border-[#0f4d34] shadow-xs'
                    : 'bg-slate-50/80 hover:bg-[#e4f2e9] text-slate-800 border-slate-200 hover:border-[#9ec4b0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeAction === 'BACKUP_RESTORE' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Backup &amp; Restore</div>
                    <div
                      className={`text-[11px] ${
                        activeAction === 'BACKUP_RESTORE' ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      Export or import JSON backup
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                    activeAction === 'BACKUP_RESTORE' ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Option 3: Year End Split */}
              <button
                type="button"
                onClick={() => setActiveAction('YEAR_END_SPLIT')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                  activeAction === 'YEAR_END_SPLIT'
                    ? 'bg-[#0f4d34] text-white border-[#0f4d34] shadow-xs'
                    : 'bg-slate-50/80 hover:bg-[#e4f2e9] text-slate-800 border-slate-200 hover:border-[#9ec4b0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeAction === 'YEAR_END_SPLIT' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Year End Split</div>
                    <div
                      className={`text-[11px] ${
                        activeAction === 'YEAR_END_SPLIT' ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      Carry forward balances to next FY
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                    activeAction === 'YEAR_END_SPLIT' ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* Quick View Details Button */}
            {activeAction !== 'DETAILS' && (
              <button
                type="button"
                onClick={() => setActiveAction('DETAILS')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>Show Company Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
