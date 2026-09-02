import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Sidebar, Header } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { VoucherEntryView } from './components/VoucherEntryView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { LoanAmortizationView } from './components/LoanAmortizationView';
import { MembersView } from './components/MembersView';
import { FinancialStatementsView } from './components/FinancialStatementsView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { GoogleAppsScriptView } from './components/GoogleAppsScriptView';
import { LoginView } from './components/LoginView';
import { UserManagementView } from './components/UserManagementView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { CompanyMasterView } from './components/CompanyMasterView';
import { CompanyInfoSelectionView } from './components/CompanyInfoSelectionView';
import {
  INITIAL_LEDGERS,
  INITIAL_MEMBERS,
  INITIAL_LOANS,
  INITIAL_VOUCHERS,
  DEFAULT_COMPANY_MASTER,
} from './utils/accountingEngine';
import {
  loadCompanyDataset,
  saveCompanyDataset,
  createCleanChartOfAccounts,
} from './utils/companyStorage';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredSession,
  saveStoredSession,
  INITIAL_USERS,
} from './utils/authManager';
import {
  LedgerAccount,
  Member,
  Loan,
  Voucher,
  UserAccount,
  CompanyMaster,
} from './types';
import { getDualToday } from './utils/nepaliCalendar';

export function App() {
  const today = getDualToday();

  // Authentication & Users State
  const [users, setUsers] = useState<UserAccount[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = getStoredSession();
    if (saved) {
      // Refresh with latest permissions from users state
      const existing = getStoredUsers().find((u) => u.id === saved.id);
      return existing || saved;
    }
    // Default to admin user for smooth initial experience, but user can log out anytime
    return getStoredUsers()[0] || INITIAL_USERS[0];
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Core ERP State - Multi-Company Support
  const [companies, setCompanies] = useState<CompanyMaster[]>(() => {
    try {
      const savedList = localStorage.getItem('sathi_companies_list');
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const singleSaved = localStorage.getItem('sathi_company_master');
      if (singleSaved) {
        const parsed = JSON.parse(singleSaved);
        if (parsed && parsed.name) return [parsed];
      }
    } catch (e) {
      console.error(e);
    }
    return [DEFAULT_COMPANY_MASTER];
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('sathi_active_company_id');
      if (savedId) return savedId;
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COMPANY_MASTER.id;
  });

  // Current active company object
  const company = companies.find((c) => c.id === activeCompanyId) || companies[0] || DEFAULT_COMPANY_MASTER;

  // Step 2 Company Gateway state: whether user has entered/selected an active company
  const [hasSelectedCompany, setHasSelectedCompany] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sathi_has_selected_company');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  // Load active company's isolated dataset on startup
  const initialCompanyData = loadCompanyDataset(activeCompanyId);

  const [ledgers, setLedgers] = useState<LedgerAccount[]>(initialCompanyData.ledgers);
  const [members, setMembers] = useState<Member[]>(initialCompanyData.members);
  const [loans, setLoans] = useState<Loan[]>(initialCompanyData.loans);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialCompanyData.vouchers);

  // Sync companies state and active company
  useEffect(() => {
    try {
      localStorage.setItem('sathi_companies_list', JSON.stringify(companies));
      localStorage.setItem('sathi_active_company_id', company.id);
      localStorage.setItem('sathi_company_master', JSON.stringify(company));
    } catch (e) {
      console.error(e);
    }
  }, [companies, company]);

  // Persist current company's isolated data whenever state updates
  useEffect(() => {
    if (activeCompanyId) {
      saveCompanyDataset(activeCompanyId, {
        ledgers,
        members,
        loans,
        vouchers,
        users,
      });
    }
  }, [activeCompanyId, ledgers, members, loans, vouchers, users]);

  const handleSelectCompany = (companyId: string) => {
    // Save current active before switching
    saveCompanyDataset(activeCompanyId, { ledgers, members, loans, vouchers, users });

    // Load selected company dataset
    const loadedData = loadCompanyDataset(companyId);
    setActiveCompanyId(companyId);
    setLedgers(loadedData.ledgers);
    setMembers(loadedData.members);
    setLoans(loadedData.loans);
    setVouchers(loadedData.vouchers);
    if (loadedData.users) setUsers(loadedData.users);

    try {
      localStorage.setItem('sathi_active_company_id', companyId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAndEnterCompany = (companyId: string) => {
    // Save current active before switching
    saveCompanyDataset(activeCompanyId, { ledgers, members, loans, vouchers, users });

    // Load selected company dataset
    const loadedData = loadCompanyDataset(companyId);
    setActiveCompanyId(companyId);
    setLedgers(loadedData.ledgers);
    setMembers(loadedData.members);
    setLoans(loadedData.loans);
    setVouchers(loadedData.vouchers);
    if (loadedData.users) setUsers(loadedData.users);
    setHasSelectedCompany(true);

    try {
      localStorage.setItem('sathi_active_company_id', companyId);
      localStorage.setItem('sathi_has_selected_company', 'true');
    } catch (e) {
      console.error(e);
    }
    const targetComp = companies.find((c) => c.id === companyId);
    showNotification(`Workspace loaded for "${targetComp?.name || 'Company'}".`);
  };

  const handleCreateAndEnterCompany = (newCompany: CompanyMaster) => {
    // Save current active
    saveCompanyDataset(activeCompanyId, { ledgers, members, loans, vouchers, users });

    // Initialize fresh dataset for the new company
    const cleanCoa = createCleanChartOfAccounts(newCompany.name);
    const initialUsersList = getStoredUsers();

    saveCompanyDataset(newCompany.id, {
      ledgers: cleanCoa,
      members: [],
      loans: [],
      vouchers: [],
      users: initialUsersList,
    });

    const updatedList = [...companies, newCompany];
    setCompanies(updatedList);
    setActiveCompanyId(newCompany.id);
    setLedgers(cleanCoa);
    setMembers([]);
    setLoans([]);
    setVouchers([]);
    setHasSelectedCompany(true);

    try {
      localStorage.setItem('sathi_companies_list', JSON.stringify(updatedList));
      localStorage.setItem('sathi_active_company_id', newCompany.id);
      localStorage.setItem('sathi_has_selected_company', 'true');
    } catch (e) {
      console.error(e);
    }
    showNotification(`New company "${newCompany.name}" created with fresh Chart of Accounts.`);
  };

  const handleOpenCompanyGateway = () => {
    setHasSelectedCompany(false);
    try {
      localStorage.setItem('sathi_has_selected_company', 'false');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCompany = (newCompany: CompanyMaster) => {
    const cleanCoa = createCleanChartOfAccounts(newCompany.name);
    saveCompanyDataset(newCompany.id, {
      ledgers: cleanCoa,
      members: [],
      loans: [],
      vouchers: [],
      users: getStoredUsers(),
    });

    const updatedList = [...companies, newCompany];
    setCompanies(updatedList);
    setActiveCompanyId(newCompany.id);
  };

  const handleUpdateCompany = (updatedCompany: CompanyMaster) => {
    const updatedList = companies.map((c) =>
      c.id === updatedCompany.id ? updatedCompany : c
    );
    // If not found in list, append it
    if (!companies.some((c) => c.id === updatedCompany.id)) {
      updatedList.push(updatedCompany);
    }
    setCompanies(updatedList);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (companies.length <= 1) return;
    const remaining = companies.filter((c) => c.id !== companyId);
    setCompanies(remaining);
    if (activeCompanyId === companyId) {
      handleSelectCompany(remaining[0].id);
    }
  };

  // Modals
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync users state with localStorage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    const timestamp = new Date().toLocaleString();
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, lastLogin: timestamp } : u
    );
    const loggedInUser = { ...user, lastLogin: timestamp };

    setUsers(updatedUsers);
    setCurrentUser(loggedInUser);
    saveStoredSession(loggedInUser);
    setHasSelectedCompany(false);
    try {
      localStorage.setItem('sathi_has_selected_company', 'false');
    } catch (e) {
      console.error(e);
    }
    showNotification(`Welcome, ${user.name}! Please select or create a company to continue.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredSession(null);
    setHasSelectedCompany(false);
    try {
      localStorage.setItem('sathi_has_selected_company', 'false');
    } catch (e) {
      console.error(e);
    }
    showNotification('Logged out successfully.');
  };

  const handleSelfServiceResetPassword = (identifier: string, newPass: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const userIndex = users.findIndex(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (userIndex === -1) return false;

    const updated = [...users];
    updated[userIndex] = {
      ...updated[userIndex],
      password: newPass,
    };
    setUsers(updated);
    saveStoredUsers(updated);
    return true;
  };

  const handleChangePassword = (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    if (currentUser.password && currentUser.password !== currentPass) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    const updated = users.map((u) =>
      u.id === currentUser.id ? { ...u, password: newPass } : u
    );
    const updatedCurrent = { ...currentUser, password: newPass };

    setUsers(updated);
    setCurrentUser(updatedCurrent);
    saveStoredSession(updatedCurrent);
    return { success: true, message: 'Password updated' };
  };

  // User Management Handlers (Admin)
  const handleAddUser = (newUser: UserAccount) => {
    const next = [...users, newUser];
    setUsers(next);
    saveStoredUsers(next);
  };

  const handleUpdateUser = (userId: string, partial: Partial<UserAccount>) => {
    const next = users.map((u) => (u.id === userId ? { ...u, ...partial } : u));
    setUsers(next);
    saveStoredUsers(next);

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, ...partial };
      setCurrentUser(updatedCurrent);
      saveStoredSession(updatedCurrent);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const next = users.filter((u) => u.id !== userId);
    setUsers(next);
    saveStoredUsers(next);
  };

  const handleAdminResetPassword = (userId: string, newPass: string) => {
    const next = users.map((u) =>
      u.id === userId ? { ...u, password: newPass } : u
    );
    setUsers(next);
    saveStoredUsers(next);
  };

  // Handler: Add New Voucher & Update Ledger Balances
  const handleAddVoucher = (newVoucher: Voucher) => {
    setVouchers([newVoucher, ...vouchers]);

    // Recalculate Ledger Balances based on Double-Entry Posting
    const updatedLedgers = ledgers.map((ledger) => {
      let debitSum = 0;
      let creditSum = 0;

      newVoucher.entries.forEach((e) => {
        if (e.ledgerId === ledger.id) {
          debitSum += Number(e.drAmount) || 0;
          creditSum += Number(e.crAmount) || 0;
        }
      });

      if (debitSum === 0 && creditSum === 0) return ledger;

      let newBal = ledger.currentBalance;
      if (ledger.majorGroup === 'ASSETS' || ledger.majorGroup === 'EXPENSES') {
        newBal = newBal + (debitSum - creditSum);
      } else {
        newBal = newBal + (creditSum - debitSum);
      }

      return {
        ...ledger,
        currentBalance: newBal,
      };
    });

    setLedgers(updatedLedgers);
    showNotification(`Voucher ${newVoucher.voucherNo} posted successfully!`);
  };

  // Handler: Disburse New Loan
  const handleDisburseLoan = (newLoan: Loan, disburseVoucher: Voucher) => {
    setLoans([...loans, newLoan]);
    handleAddVoucher(disburseVoucher);
    showNotification(`Loan ${newLoan.loanNumber} disbursed to ${newLoan.memberName}!`);
  };

  // Handler: Auto-Post Monthly Loan Interest
  const handlePostLoanInterest = (loanId: string, monthNo: number) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const row = targetLoan.amortizationSchedule.find((r) => r.monthNo === monthNo);
    if (!row || row.status === 'POSTED') return;

    const interestAmount = row.interestDue;
    const interestVoucherNo = `JRN-${today.bsDate.substring(0, 4)}-${String(Date.now()).slice(-3)}`;

    const newVoucher: Voucher = {
      id: `vch-int-${Date.now()}`,
      voucherNo: interestVoucherNo,
      voucherType: 'JOURNAL',
      dateBS: row.dueDateBS,
      dateAD: row.dueDateAD,
      narration: `Monthly 25-Day Loan Interest accrual on ${targetLoan.loanNumber} for ${row.periodLabel} (${targetLoan.memberName})`,
      totalAmount: interestAmount,
      createdBy: currentUser ? currentUser.name : 'Auto-Trigger System',
      status: 'POSTED',
      autoTag: '25-Day Interest Posting',
      createdAt: new Date().toISOString(),
      entries: [
        {
          id: '1',
          ledgerId: targetLoan.loanLedgerId,
          ledgerName: `Interest Receivable / Loan - ${targetLoan.memberName}`,
          drAmount: interestAmount,
          crAmount: 0,
          memberId: targetLoan.memberId,
        },
        {
          id: '2',
          ledgerId: targetLoan.interestIncomeLedgerId,
          ledgerName:
            targetLoan.loanType === 'REGULAR'
              ? 'Interest Income on Regular Loans (12%)'
              : 'Interest Income on Emergency Loans (15%)',
          drAmount: 0,
          crAmount: interestAmount,
        },
      ],
    };

    // Update Loan Row Status
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          amortizationSchedule: l.amortizationSchedule.map((r) =>
            r.monthNo === monthNo ? { ...r, status: 'POSTED' as const } : r
          ),
        };
      }
      return l;
    });

    setLoans(updatedLoans);
    handleAddVoucher(newVoucher);
  };

  // Handler: Bulk Auto-Post All Due Monthly Interest
  const handleAutoPostAllDueInterest = () => {
    let count = 0;
    loans.forEach((loan) => {
      const pendingRow = loan.amortizationSchedule.find((r) => r.status === 'DUE');
      if (pendingRow) {
        handlePostLoanInterest(loan.id, pendingRow.monthNo);
        count++;
      }
    });

    if (count > 0) {
      showNotification(`Auto-posted interest journals for ${count} active loans as per 25-day cycle!`);
    } else {
      showNotification('All monthly interest entries are currently up-to-date.');
    }
  };

  // Handler: Add / Update Ledgers
  const handleAddLedger = (newLedger: LedgerAccount) => {
    setLedgers([...ledgers, newLedger]);
    showNotification(`Ledger [${newLedger.code}] ${newLedger.name} created.`);
  };

  const handleUpdateLedger = (updatedLedger: LedgerAccount) => {
    setLedgers(ledgers.map((l) => (l.id === updatedLedger.id ? updatedLedger : l)));
    showNotification(`Ledger ${updatedLedger.name} updated.`);
  };

  // Handler: Add Member
  const handleAddMember = (newMem: Member) => {
    setMembers([...members, newMem]);

    // Also create corresponding Member Saving Deposit Ledger in CoA
    const newDepLedger: LedgerAccount = {
      id: newMem.depositLedgerId,
      code: String(2200 + members.length + 1),
      name: `Member Saving Deposit - ${newMem.name}`,
      majorGroup: 'LIABILITIES',
      tier1: 'CURRENT_LIABILITIES',
      tier2: 'MEMBERS_DEPOSIT',
      openingBalance: 0,
      openingType: 'CR',
      currentBalance: 0,
      currentType: 'CR',
      memberId: newMem.id,
      isActive: true,
    };

    setLedgers([...ledgers, newDepLedger]);
    showNotification(`Enrolled member ${newMem.name} and initialized saving ledger.`);
  };

  // Handler: Update Member / Friend Details
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)));

    // Also sync the name with their saving deposit ledger if name changed
    setLedgers(
      ledgers.map((l) => {
        if (l.id === updatedMember.depositLedgerId || l.memberId === updatedMember.id) {
          if (l.tier2 === 'MEMBERS_DEPOSIT') {
            return { ...l, name: `Member Saving Deposit - ${updatedMember.name}` };
          }
        }
        return l;
      })
    );

    // Sync member name in loan records
    setLoans(
      loans.map((loan) =>
        loan.memberId === updatedMember.id
          ? { ...loan, memberName: updatedMember.name }
          : loan
      )
    );

    showNotification(`Member profile for ${updatedMember.name} updated successfully!`);
  };

  // Handler: Delete / Deactivate Member
  const handleDeleteMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    // Check if member has active loans
    const hasActiveLoans = loans.some((l) => l.memberId === memberId && l.status === 'ACTIVE');
    if (hasActiveLoans) {
      showNotification(`Cannot remove ${target.name} because they have active loans.`);
      return;
    }

    setMembers(members.filter((m) => m.id !== memberId));
    showNotification(`Member ${target.name} removed from active roster.`);
  };

  // Handler: Quick 25-Day Saving Deposit from Member View
  const handleRecordQuickSaving = (memberId: string) => {
    const mem = members.find((m) => m.id === memberId);
    if (!mem) return;

    const vchNo = `RCT-${today.bsDate.substring(0, 4)}-${String(Date.now()).slice(-3)}`;
    const newVoucher: Voucher = {
      id: `vch-sav-${Date.now()}`,
      voucherNo: vchNo,
      voucherType: 'RECEIPT',
      dateBS: today.bsDate,
      dateAD: today.adDate,
      narration: `Received 25-day regular monthly saving deposit (Rs 25,000) from ${mem.name} in cash`,
      totalAmount: 25000,
      createdBy: currentUser ? currentUser.name : 'Staff Accountant',
      status: 'POSTED',
      autoTag: '25-Day Regular Saving',
      createdAt: new Date().toISOString(),
      entries: [
        {
          id: '1',
          ledgerId: 'led-cash-1',
          ledgerName: 'Cash in Hand',
          drAmount: 25000,
          crAmount: 0,
        },
        {
          id: '2',
          ledgerId: mem.depositLedgerId,
          ledgerName: `Member Saving Deposit - ${mem.name}`,
          drAmount: 0,
          crAmount: 25000,
          memberId: mem.id,
        },
      ],
    };

    handleAddVoucher(newVoucher);
  };

  // Handler: Full Backup Restore
  const handleRestoreAllData = (data: {
    company: CompanyMaster;
    companies?: CompanyMaster[];
    ledgers: LedgerAccount[];
    vouchers: Voucher[];
    members: Member[];
    loans: Loan[];
    users?: UserAccount[];
  }) => {
    if (data.companies && data.companies.length > 0) {
      setCompanies(data.companies);
      setActiveCompanyId(data.company ? data.company.id : data.companies[0].id);
    } else if (data.company) {
      setCompanies([data.company]);
      setActiveCompanyId(data.company.id);
    }
    if (data.ledgers) setLedgers(data.ledgers);
    if (data.vouchers) setVouchers(data.vouchers);
    if (data.members) setMembers(data.members);
    if (data.loans) setLoans(data.loans);
    if (data.users && data.users.length > 0) setUsers(data.users);
    showNotification('System database and accounting records restored successfully!');
  };

  // Handler: Year-End Split Company into New Fiscal Year
  const handleSplitFiscalYear = (newCompany: CompanyMaster, newLedgers: LedgerAccount[]) => {
    handleUpdateCompany(newCompany);
    setLedgers(newLedgers);
    // Reset active vouchers for new fiscal period
    setVouchers([]);
    showNotification(`New fiscal year ${newCompany.fiscalYearLabel} initialized with carryforward closing balances!`);
  };

  // If user is not logged in, show Step 1: LoginView screen
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onLoginSuccess={handleLogin}
        onResetPassword={handleSelfServiceResetPassword}
      />
    );
  }

  // Step 2: Company Selection / Creation Gateway
  // If user has not chosen or confirmed an active company workspace, require selection/creation
  if (!hasSelectedCompany) {
    return (
      <>
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{notification}</span>
          </div>
        )}
        <CompanyInfoSelectionView
          currentUser={currentUser}
          companies={companies}
          activeCompanyId={activeCompanyId}
          onSelectAndEnterCompany={handleSelectAndEnterCompany}
          onCreateAndEnterCompany={handleCreateAndEnterCompany}
          onDeleteCompany={handleDeleteCompany}
          ledgers={ledgers}
          vouchers={vouchers}
          members={members}
          loans={loans}
          users={users}
          onRestoreAllData={handleRestoreAllData}
          onLogout={handleLogout}
          showNotification={showNotification}
        />
      </>
    );
  }

  // Step 3: Main Accounting Workspace & Dashboard
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Geometric Balance Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileNavOpen}
        setIsOpenMobile={setIsMobileNavOpen}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenNewVoucher={() => setIsNewVoucherModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Column (with offset for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          company={company}
          onOpenCompanyGateway={handleOpenCompanyGateway}
          onOpenNewVoucher={() => setIsNewVoucherModalOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onNavigateTab={setActiveTab}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main View Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              members={members}
              loans={loans}
              ledgers={ledgers}
              vouchers={vouchers}
              onNavigate={setActiveTab}
              onOpenNewVoucher={() => setIsNewVoucherModalOpen(true)}
              onAutoPostInterest={handleAutoPostAllDueInterest}
            />
          )}

          {activeTab === 'company' && (
            <CompanyMasterView
              companies={companies}
              activeCompanyId={activeCompanyId}
              onSelectCompany={handleSelectCompany}
              onOpenCompanyGateway={handleOpenCompanyGateway}
              onDeleteCompany={handleDeleteCompany}
              company={company}
              onUpdateCompany={(updated) => {
                handleUpdateCompany(updated);
                showNotification('Company Master profile updated successfully!');
              }}
              ledgers={ledgers}
              vouchers={vouchers}
              members={members}
              loans={loans}
              users={users}
              onRestoreAllData={handleRestoreAllData}
              onSplitFiscalYear={handleSplitFiscalYear}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'vouchers' && (
            <VoucherEntryView
              vouchers={vouchers}
              ledgers={ledgers}
              members={members}
              company={company}
              onAddVoucher={handleAddVoucher}
              isOpenNewModal={isNewVoucherModalOpen}
              setIsOpenNewModal={setIsNewVoucherModalOpen}
            />
          )}

          {activeTab === 'coa' && (
            <ChartOfAccountsView
              ledgers={ledgers}
              onAddLedger={handleAddLedger}
              onUpdateLedger={handleUpdateLedger}
            />
          )}

          {activeTab === 'loans' && (
            <LoanAmortizationView
              loans={loans}
              members={members}
              ledgers={ledgers}
              onDisburseLoan={handleDisburseLoan}
              onPostLoanInterest={handlePostLoanInterest}
              onAutoPostAllDueInterest={handleAutoPostAllDueInterest}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              members={members}
              loans={loans}
              ledgers={ledgers}
              vouchers={vouchers}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onRecordQuickSaving={handleRecordQuickSaving}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'statements' && (
            <FinancialStatementsView
              ledgers={ledgers}
              vouchers={vouchers}
              members={members}
              loans={loans}
              company={company}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'users' && (
            currentUser.role === 'SYSADMIN' ? (
              <UserManagementView
                currentUser={currentUser}
                users={users}
                members={members}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onAdminResetPassword={handleAdminResetPassword}
                showNotification={showNotification}
              />
            ) : (
              <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-xs my-12">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Restricted Access</h3>
                <p className="text-xs text-slate-500 mt-1">
                  User Management is strictly restricted to the <strong>SysAdmin</strong> role. Please contact your system administrator.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}

          {activeTab === 'appscript' && <GoogleAppsScriptView />}
        </main>
      </div>

      {/* Change Password Modal for Current User */}
      <ChangePasswordModal
        currentUser={currentUser}
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onChangePassword={handleChangePassword}
        showNotification={showNotification}
      />

      {/* Sathi AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        ledgers={ledgers}
        members={members}
        loans={loans}
        vouchers={vouchers}
        onApplyAiVoucher={() => {
          setIsAiModalOpen(false);
          setIsNewVoucherModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;

