import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Download,
  Upload,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  Check,
  ChevronLeft,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { CompanyMaster, LedgerAccount, Member, Loan, Voucher, UserAccount } from '../types';
import { getDualToday } from '../utils/nepaliCalendar';

interface CompanyInfoSelectionViewProps {
  currentUser: UserAccount;
  companies: CompanyMaster[];
  activeCompanyId: string;
  onSelectAndEnterCompany: (companyId: string) => void;
  onCreateAndEnterCompany: (newCompany: CompanyMaster) => void;
  onDeleteCompany: (companyId: string) => void;
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
  onLogout: () => void;
  showNotification: (msg: string) => void;
}

type Mode = 'MENU' | 'SELECT' | 'CREATE' | 'BACKUP' | 'RESTORE';

export const CompanyInfoSelectionView: React.FC<CompanyInfoSelectionViewProps> = ({
  currentUser,
  companies,
  activeCompanyId,
  onSelectAndEnterCompany,
  onCreateAndEnterCompany,
  onDeleteCompany,
  ledgers,
  vouchers,
  members,
  loans,
  users,
  onRestoreAllData,
  onLogout,
  showNotification,
}) => {
  const today = getDualToday();
  const [currentMode, setCurrentMode] = useState<Mode>('MENU');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // New Company Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyPan, setNewCompanyPan] = useState('');
  const [newCompanyRegNo, setNewCompanyRegNo] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newCompanyCity, setNewCompanyCity] = useState('');
  const [newCompanyState, setNewCompanyState] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newCompanyCurrency, setNewCompanyCurrency] = useState('NPR (Nepalese Rupee)');
  const [newCompanyFyLabel, setNewCompanyFyLabel] = useState('2081/082');
  const [newCompanyFyStartBS, setNewCompanyFyStartBS] = useState('2081-04-01');
  const [newCompanyFyEndBS, setNewCompanyFyEndBS] = useState('2082-03-31');
  const [newCompanyFyStartAD, setNewCompanyFyStartAD] = useState('2024-07-16');
  const [newCompanyFyEndAD, setNewCompanyFyEndAD] = useState('2025-07-15');

  // Backup & Restore User-Defined Paths
  const [backupDestPath, setBackupDestPath] = useState('D:\\Sathi_Sajilo_Backups\\');
  const [backupFileName, setBackupFileName] = useState(`Sathi_Sajilo_Backup_${today.bsDate}.json`);
  const [restoreSourcePath, setRestoreSourcePath] = useState('D:\\Sathi_Sajilo_Backups\\');

  // Restore State
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Filtered companies list
  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.panVatNo && c.panVatNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.fiscalYearLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing inside an input or textarea, don't trigger global hotkeys
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          setCurrentMode('MENU');
        }
        return;
      }

      if (currentMode === 'MENU') {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          setCurrentMode('SELECT');
        } else if (key === 'c') {
          e.preventDefault();
          setCurrentMode('CREATE');
        } else if (key === 'b') {
          e.preventDefault();
          setCurrentMode('BACKUP');
        } else if (key === 'r') {
          e.preventDefault();
          setCurrentMode('RESTORE');
        } else if (key === 'q' || key === 'escape') {
          e.preventDefault();
          onLogout();
        }
      } else if (currentMode === 'SELECT') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setCurrentMode('MENU');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1 < filteredCompanies.length ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCompanies.length - 1));
        } else if (e.key === 'Enter' && filteredCompanies[selectedIndex]) {
          e.preventDefault();
          onSelectAndEnterCompany(filteredCompanies[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        setCurrentMode('MENU');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, filteredCompanies, selectedIndex]);

  // Handle Backup Download
  const handleDownloadBackup = () => {
    const activeComp = companies.find((c) => c.id === activeCompanyId) || companies[0];
    const backupPackage = {
      app: 'Sathi Sajilo Hisab ERP',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      destinationFolder: backupDestPath,
      fileName: backupFileName,
      activeCompanyId: activeComp ? activeComp.id : undefined,
      company: activeComp,
      companies: companies,
      ledgers,
      vouchers,
      members,
      loans,
      users: users.map((u) => ({ ...u, password: u.password })),
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPackage, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = backupFileName.trim() || `Sathi_Sajilo_Backup_${today.bsDate}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification(`Backup exported successfully to ${backupDestPath}${filename}`);
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
        companies[0];
      onRestoreAllData({
        company: restoredComp,
        companies: restorePreview.companies || [restoredComp],
        ledgers: restorePreview.ledgers || [],
        vouchers: restorePreview.vouchers || [],
        members: restorePreview.members || [],
        loans: restorePreview.loans || [],
        users: restorePreview.users || undefined,
      });
      showNotification('Company data successfully restored from backup.');
      setRestorePreview(null);
      onSelectAndEnterCompany(restoredComp.id);
    } catch (err: any) {
      setRestoreError(err.message || 'Error restoring data');
    }
  };

  // Submit New Company Form
  const handleCreateNewCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    // Automatically derive Fiscal Year Label from start and end dates
    const sYear = (newCompanyFyStartBS || '').split('-')[0] || '2081';
    const eYear = (newCompanyFyEndBS || '').split('-')[0] || '2082';
    const eSuffix = eYear.length === 4 ? `0${eYear.slice(2)}` : eYear.slice(-2);
    const computedFyLabel = `${sYear}/${eSuffix}`;

    const brandNewCompany: CompanyMaster = {
      id: `comp-${Date.now()}`,
      name: newCompanyName.trim(),
      address: newCompanyAddress.trim() || 'Nepal',
      city: '',
      stateOrProvince: '',
      country: 'Nepal',
      phone: newCompanyPhone.trim(),
      email: newCompanyEmail.trim(),
      panVatNo: newCompanyPan ? newCompanyPan.trim() : '',
      registrationNo: newCompanyRegNo ? newCompanyRegNo.trim() : undefined,
      currencySymbol: 'Rs',
      currencyFormalName: 'NPR (Nepalese Rupee)',
      fiscalYearStartBS: newCompanyFyStartBS,
      fiscalYearEndBS: newCompanyFyEndBS,
      fiscalYearStartAD: newCompanyFyStartAD,
      fiscalYearEndAD: newCompanyFyEndAD,
      fiscalYearLabel: computedFyLabel,
      booksBeginningFromBS: newCompanyFyStartBS,
      booksBeginningFromAD: newCompanyFyStartAD,
    };

    onCreateAndEnterCompany(brandNewCompany);
    showNotification(`Company "${brandNewCompany.name}" created and loaded into workspace!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-100 selection:bg-emerald-600 selection:text-white">
      {/* Top Banner with Software Identity & User Info */}
      <div className="w-full max-w-4xl flex items-center justify-between py-4 px-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-sm">Sathi Sajilo Hisab</span>
            <span className="text-emerald-400 font-mono ml-2 text-xs">v2.0 • Step 2 Gateway</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-[11px]">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-200">{today.bsDate} BS</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">{today.adDate} AD</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200 font-medium">{currentUser.name}</span>
            <span className="text-emerald-400 font-bold">({currentUser.role})</span>
          </div>

          <button
            onClick={onLogout}
            title="Quit / Log out (Q)"
            className="p-1.5 bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 text-slate-400 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER / DIALOG */}
      <div className="w-full max-w-xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Main Box Outer with classic Tally/ERP Company Info theme */}
        <div className="bg-[#d2e7d6] text-slate-900 rounded-2xl shadow-2xl border-2 border-[#134e35] overflow-hidden">
          {/* Header Bar - Classic Deep Green with White Text */}
          <div className="bg-[#0f4d34] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-emerald-300" />
              <h1 className="font-serif text-lg font-bold tracking-wide">
                Company Info.
              </h1>
            </div>

            {currentMode !== 'MENU' && (
              <button
                onClick={() => setCurrentMode('MENU')}
                className="flex items-center gap-1 text-xs text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Menu [Esc]</span>
              </button>
            )}
          </div>

          {/* VIEW 1: MAIN COMPANY INFO MENU (Inspired by Classic Tally Menu) */}
          {currentMode === 'MENU' && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Menu Options Box */}
              <div className="bg-[#c2ded0] border border-[#9ec4b0] rounded-xl p-3 sm:p-4 space-y-1.5 shadow-inner">
                {/* Select Company */}
                <button
                  onClick={() => setCurrentMode('SELECT')}
                  className="w-full group flex items-center justify-between px-4 py-3 bg-[#e4f2e9] hover:bg-[#0f4d34] text-slate-900 hover:text-white rounded-lg font-mono text-sm sm:text-base font-bold transition-all shadow-xs border border-[#b2d5c3] hover:border-[#0f4d34] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-emerald-800/10 group-hover:bg-white/20 rounded flex items-center justify-center text-xs">
                      📁
                    </span>
                    <span>
                      <span className="text-red-600 group-hover:text-amber-300 underline font-black">S</span>elect Company
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800 group-hover:text-emerald-200 font-sans font-semibold">
                    Open &rarr;
                  </span>
                </button>

                {/* Create Company */}
                <button
                  onClick={() => setCurrentMode('CREATE')}
                  className="w-full group flex items-center justify-between px-4 py-3 bg-[#e4f2e9] hover:bg-[#0f4d34] text-slate-900 hover:text-white rounded-lg font-mono text-sm sm:text-base font-bold transition-all shadow-xs border border-[#b2d5c3] hover:border-[#0f4d34] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-emerald-800/10 group-hover:bg-white/20 rounded flex items-center justify-center text-xs">
                      ✨
                    </span>
                    <span>
                      <span className="text-red-600 group-hover:text-amber-300 underline font-black">C</span>reate Company
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800 group-hover:text-emerald-200 font-sans font-semibold">
                    New Profile &rarr;
                  </span>
                </button>

                {/* Backup */}
                <button
                  onClick={() => setCurrentMode('BACKUP')}
                  className="w-full group flex items-center justify-between px-4 py-3 bg-[#e4f2e9] hover:bg-[#0f4d34] text-slate-900 hover:text-white rounded-lg font-mono text-sm sm:text-base font-bold transition-all shadow-xs border border-[#b2d5c3] hover:border-[#0f4d34] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-emerald-800/10 group-hover:bg-white/20 rounded flex items-center justify-center text-xs">
                      💾
                    </span>
                    <span>
                      <span className="text-red-600 group-hover:text-amber-300 underline font-black">B</span>ackup
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800 group-hover:text-emerald-200 font-sans font-semibold">
                    Export JSON &rarr;
                  </span>
                </button>

                {/* Restore */}
                <button
                  onClick={() => setCurrentMode('RESTORE')}
                  className="w-full group flex items-center justify-between px-4 py-3 bg-[#e4f2e9] hover:bg-[#0f4d34] text-slate-900 hover:text-white rounded-lg font-mono text-sm sm:text-base font-bold transition-all shadow-xs border border-[#b2d5c3] hover:border-[#0f4d34] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-emerald-800/10 group-hover:bg-white/20 rounded flex items-center justify-center text-xs">
                      📥
                    </span>
                    <span>
                      <span className="text-red-600 group-hover:text-amber-300 underline font-black">R</span>estore
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800 group-hover:text-emerald-200 font-sans font-semibold">
                    Import Backup &rarr;
                  </span>
                </button>

                {/* Quit */}
                <button
                  onClick={onLogout}
                  className="w-full group flex items-center justify-between px-4 py-3 bg-[#e4f2e9] hover:bg-rose-900 text-slate-900 hover:text-white rounded-lg font-mono text-sm sm:text-base font-bold transition-all shadow-xs border border-[#b2d5c3] hover:border-rose-900 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-rose-800/10 group-hover:bg-white/20 rounded flex items-center justify-center text-xs text-rose-800 group-hover:text-white">
                      🚪
                    </span>
                    <span>
                      <span className="text-red-600 group-hover:text-amber-300 underline font-black">Q</span>uit
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 group-hover:text-rose-200 font-sans font-semibold">
                    Log out
                  </span>
                </button>
              </div>

              {/* Quick Info Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-950 font-mono border-t border-[#b2d5c3]">
                <span>Hotkey Tip: Press <strong className="text-red-700">S</strong>, <strong className="text-red-700">C</strong>, <strong className="text-red-700">B</strong>, <strong className="text-red-700">R</strong>, or <strong className="text-red-700">Q</strong></span>
                <span>ESC = Back</span>
              </div>
            </div>
          )}

          {/* VIEW 2: SELECT COMPANY LIST */}
          {currentMode === 'SELECT' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>Select Existing Company</span>
                  </h2>
                  <p className="text-xs text-emerald-900/80">
                    Click any company or use &uarr;&darr; arrow keys and Enter to open the workspace.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentMode('CREATE')}
                  className="px-3 py-1.5 bg-[#0f4d34] hover:bg-[#166545] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-900/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder=""
                  className="w-full pl-9 pr-4 py-2 bg-white/90 border border-[#9ec4b0] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4d34]"
                  autoFocus
                />
              </div>

              {/* Companies List */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-8 bg-white/60 rounded-xl border border-[#b2d5c3] text-xs text-emerald-900/70">
                    No companies matched your search.
                  </div>
                ) : (
                  filteredCompanies.map((comp, idx) => {
                    const isSelected = idx === selectedIndex;
                    const isActiveCompany = comp.id === activeCompanyId;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => onSelectAndEnterCompany(comp.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#0f4d34] text-white border-[#0f4d34] shadow-md scale-[1.01]'
                            : 'bg-white/90 text-slate-900 border-[#b2d5c3] hover:bg-[#e4f2e9]'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {comp.name}
                              </h3>
                              {isActiveCompany && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    isSelected ? 'bg-emerald-400/30 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  Current
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-xs font-mono flex items-center gap-2 mt-0.5 ${
                                isSelected ? 'text-emerald-200' : 'text-slate-600'
                              }`}
                            >
                              <span>FY: {comp.fiscalYearLabel}</span>
                              {comp.panVatNo && (
                                <>
                                  <span>•</span>
                                  <span>PAN: {comp.panVatNo}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="truncate">{comp.city || 'Nepal'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAndEnterCompany(comp.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                                : 'bg-[#0f4d34] hover:bg-[#166545] text-white'
                            }`}
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-950 font-mono border-t border-[#b2d5c3]">
                <span>Press &uarr;&darr; to navigate, Enter to select</span>
                <button
                  onClick={() => setCurrentMode('MENU')}
                  className="hover:underline font-bold"
                >
                  &larr; Back to Company Info
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: CREATE COMPANY FORM */}
          {currentMode === 'CREATE' && (
            <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#b2d5c3]">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#0f4d34]" />
                    <span>Create New Company</span>
                  </h2>
                  <p className="text-xs text-emerald-900/80">
                    Enter organization details. On submit, this company will open immediately.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentMode('MENU')}
                  className="text-xs text-emerald-900 hover:underline font-mono"
                >
                  [Esc] Cancel
                </button>
              </div>

              <form onSubmit={handleCreateNewCompany} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Company/Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                    placeholder=""
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={newCompanyPan}
                      onChange={(e) => setNewCompanyPan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Regd. Number
                    </label>
                    <input
                      type="text"
                      value={newCompanyRegNo}
                      onChange={(e) => setNewCompanyRegNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newCompanyAddress}
                    onChange={(e) => setNewCompanyAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                    placeholder=""
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={newCompanyPhone}
                      onChange={(e) => setNewCompanyPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newCompanyEmail}
                      onChange={(e) => setNewCompanyEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Fiscal Year & Dates */}
                <div className="p-3 bg-[#c2ded0] border border-[#9ec4b0] rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0f4d34]" />
                      <span>Fiscal Year &amp; Financial Period</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-900">
                      FY: {newCompanyFyStartBS.split('-')[0] || '2081'}/0{(newCompanyFyEndBS.split('-')[0] || '2082').slice(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                        Fiscal Year Start Date (BS)
                      </label>
                      <input
                        type="text"
                        value={newCompanyFyStartBS}
                        onChange={(e) => setNewCompanyFyStartBS(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#9ec4b0] rounded-lg text-slate-900 font-mono text-xs"
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                        Fiscal Year End Date (BS)
                      </label>
                      <input
                        type="text"
                        value={newCompanyFyEndBS}
                        onChange={(e) => setNewCompanyFyEndBS(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#9ec4b0] rounded-lg text-slate-900 font-mono text-xs"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentMode('MENU')}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0f4d34] hover:bg-[#166545] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Create Company</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 4: BACKUP CONFIGURATION */}
          {currentMode === 'BACKUP' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#b2d5c3]">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#0f4d34]" />
                    <span>Backup Company Database</span>
                  </h2>
                  <p className="text-xs text-emerald-900/80">
                    Define destination directory and file name to export the accounting database.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentMode('MENU')}
                  className="text-xs text-emerald-900 hover:underline font-mono"
                >
                  [Esc] Back
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Destination Folder / Directory Path *
                  </label>
                  <input
                    type="text"
                    value={backupDestPath}
                    onChange={(e) => setBackupDestPath(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                    placeholder=""
                  />
                  <span className="text-[10px] text-emerald-900/70 mt-0.5 block">
                    Target destination folder on your storage drive (e.g. D:\Sathi_Sajilo_Backups\)
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Backup File Name *
                  </label>
                  <input
                    type="text"
                    value={backupFileName}
                    onChange={(e) => setBackupFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                    placeholder=""
                  />
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-[#b2d5c3] text-[11px] text-slate-700 space-y-1">
                  <div className="font-bold text-emerald-950">Package Content Summary:</div>
                  <div>• Company Profiles &amp; Statutory Setup</div>
                  <div>• All Ledgers ({ledgers.length}) &amp; Vouchers ({vouchers.length})</div>
                  <div>• Members ({members.length}) &amp; Loans ({loans.length})</div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentMode('MENU')}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-5 py-2 bg-[#0f4d34] hover:bg-[#166545] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Confirm &amp; Export Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: RESTORE BACKUP */}
          {currentMode === 'RESTORE' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#b2d5c3]">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#0f4d34]" />
                    <span>Restore Company Database</span>
                  </h2>
                  <p className="text-xs text-emerald-900/80">
                    Define source file path and upload the JSON backup package.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentMode('MENU')}
                  className="text-xs text-emerald-900 hover:underline font-mono"
                >
                  [Esc] Back
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Source File Path / Directory *
                  </label>
                  <input
                    type="text"
                    value={restoreSourcePath}
                    onChange={(e) => setRestoreSourcePath(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#9ec4b0] rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0f4d34] text-xs"
                    placeholder=""
                  />
                  <span className="text-[10px] text-emerald-900/70 mt-0.5 block">
                    Source path where your backup file is stored (e.g. D:\Sathi_Sajilo_Backups\)
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Select Backup JSON Archive *
                  </label>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setRestoreSourcePath(`D:\\Sathi_Sajilo_Backups\\${e.target.files[0].name}`);
                      }
                      handleFileUpload(e);
                    }}
                    className="w-full p-2 bg-white border border-[#9ec4b0] rounded-xl text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f4d34] file:text-white hover:file:bg-[#166545] cursor-pointer"
                  />
                </div>

                {restoreError && (
                  <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>{restoreError}</span>
                  </div>
                )}

                {restorePreview && (
                  <div className="p-4 bg-white/90 border border-[#9ec4b0] rounded-xl text-xs space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Valid Backup Archive</span>
                    </div>
                    <div className="space-y-1 text-slate-700 font-mono text-[11px]">
                      <div>Company: <strong>{restorePreview.company?.name || 'N/A'}</strong></div>
                      <div>Fiscal Year: <strong>{restorePreview.company?.fiscalYearLabel || 'N/A'}</strong></div>
                      <div>Ledgers: <strong>{restorePreview.ledgers?.length || 0}</strong> | Vouchers: <strong>{restorePreview.vouchers?.length || 0}</strong></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyRestore}
                      className="w-full mt-2 py-2.5 bg-[#0f4d34] hover:bg-[#166545] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Confirm &amp; Restore Database</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-950 font-mono border-t border-[#b2d5c3]">
                <button
                  onClick={() => setCurrentMode('MENU')}
                  className="hover:underline font-bold"
                >
                  &larr; Back to Company Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
