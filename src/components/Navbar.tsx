import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users2,
  Receipt,
  TrendingDown,
  FolderTree,
  FileText,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  ShieldCheck,
  Building2,
  UserCheck,
  UserCog,
  LogOut,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { getDualToday } from '../utils/nepaliCalendar';
import { UserAccount } from '../types';
import { ROLE_DEFINITIONS } from '../utils/authManager';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAiAssistant: () => void;
  onOpenNewVoucher: () => void;
  currentUser: UserAccount;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAiAssistant,
  onOpenNewVoucher,
  currentUser,
  onLogout,
}) => {
  const today = getDualToday();

  // Navigation Items in exact requested hierarchy:
  // 1. Company Master (at top), 2. Dashboard, 3. Members, 4. Chart of Accounts, 5. Voucher Entry, 6. Reports, 7. Loan Management, 8. User Management, 9. Google Sheets Sync
  const navItems = [
    {
      id: 'company',
      label: 'Company Master',
      icon: Building2,
      color: 'from-purple-500 to-violet-600',
      activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-900/30',
      iconColor: 'text-purple-400',
      tag: 'Entity',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-indigo-600',
      activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-900/30',
      iconColor: 'text-blue-400',
      tag: 'Overview',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users2,
      color: 'from-teal-500 to-emerald-600',
      activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-900/30',
      iconColor: 'text-teal-400',
      tag: 'Accounts',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
    {
      id: 'coa',
      label: 'Chart of Accounts',
      icon: FolderTree,
      color: 'from-emerald-500 to-green-600',
      activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30',
      iconColor: 'text-emerald-400',
      tag: '3-Tier',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'vouchers',
      label: 'Voucher Entry',
      icon: Receipt,
      color: 'from-amber-500 to-orange-600',
      activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-900/30',
      iconColor: 'text-amber-400',
      tag: 'F4-F7',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'statements',
      label: 'Reports',
      icon: FileText,
      color: 'from-rose-500 to-pink-600',
      activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-900/30',
      iconColor: 'text-rose-400',
      tag: 'NFRS',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'loans',
      label: 'Loan Management',
      icon: TrendingDown,
      color: 'from-sky-500 to-blue-600',
      activeBg: 'bg-sky-600 text-white shadow-md shadow-sky-900/30',
      iconColor: 'text-sky-400',
      tag: 'EMI',
      tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    ...(currentUser.role === 'SYSADMIN'
      ? [
          {
            id: 'users',
            label: 'User Management',
            icon: UserCog,
            color: 'from-indigo-500 to-purple-600',
            activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30',
            iconColor: 'text-indigo-400',
            tag: 'Admin',
            tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          },
        ]
      : []),
    {
      id: 'appscript',
      label: 'Google Sheets Sync',
      icon: FileSpreadsheet,
      color: 'from-emerald-500 to-teal-600',
      activeBg: 'bg-emerald-700 text-white shadow-md shadow-emerald-950/30',
      iconColor: 'text-emerald-400',
      tag: 'Sync',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md">
              S
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                Sathi Sajilo <span className="text-blue-400">Hisab</span>
              </h1>
              <p className="text-[11px] text-slate-400">Accounting &amp; ERP</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Colorful Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left group cursor-pointer ${
                  isActive
                    ? `${item.activeBg} font-bold scale-[1.02]`
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : `bg-slate-800 text-slate-400 group-hover:${item.iconColor} group-hover:bg-slate-700`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white border-white/40 font-bold'
                      : `${item.tagColor} opacity-70 group-hover:opacity-100`
                  }`}
                >
                  {item.tag}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800">
          {/* Sathi AI Button */}
          <button
            onClick={onOpenAiAssistant}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Sathi AI Assistant</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export interface HeaderProps {
  activeTab: string;
  currentUser: UserAccount;
  company?: any;
  onOpenCompanyGateway?: () => void;
  onOpenNewVoucher: () => void;
  onToggleMobileNav: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  company,
  onOpenCompanyGateway,
  onOpenNewVoucher,
  onToggleMobileNav,
  onNavigateTab,
  onOpenChangePassword,
  onLogout,
}) => {
  const today = getDualToday();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Financial KPIs, Liquidity, Loans & Profitability Metrics',
        };
      case 'company':
        return {
          title: 'Company Master',
          subtitle: 'Multi-Company Management, Organization Profile & Fiscal Periods',
        };
      case 'members':
        return {
          title: 'Members',
          subtitle: 'Member Accounts, Passbooks, Monthly Saving & Loan Portfolios',
        };
      case 'vouchers':
        return {
          title: 'Voucher Entry',
          subtitle: 'Double-Entry Accounting Ledger (Receipt, Payment, Journal, Contra)',
        };
      case 'loans':
        return {
          title: 'Loan Management',
          subtitle: 'Regular & Emergency Loan Amortization & Repayments',
        };
      case 'coa':
        return {
          title: 'Chart of Accounts',
          subtitle: '3-Tier Standard Account Classification (Assets, Liabilities, Equity, Income, Expenses)',
        };
      case 'statements':
        return {
          title: 'Reports',
          subtitle: 'Financial Statements, Trial Balance, Day Book Register & Account Books',
        };
      case 'users':
        return {
          title: 'User Management & Categories',
          subtitle: 'Roles, Credentials, Permissions & Audit Access Controls',
        };
      case 'appscript':
        return {
          title: 'Google Apps Script Engine',
          subtitle: 'Live Two-Way Google Sheets Automation & Real-Time Sync',
        };
      default:
        return {
          title: 'Dashboard Overview',
          subtitle: 'Accounting & Financial Management',
        };
    }
  };

  const pageInfo = getPageInfo();
  const roleMeta = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.DATA_ENTRY;

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight">
            {pageInfo.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Company Pill / Step 2 Switcher */}
        {company && (
          <button
            onClick={onOpenCompanyGateway || (() => onNavigateTab('company'))}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-950 font-bold transition-all shadow-xs cursor-pointer group"
            title="Active Company • Click to open Step 2 Company Info / Switch Company"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{company.name}</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-emerald-200/70 text-[10px] font-mono font-bold text-emerald-900">
              {company.fiscalYearLabel}
            </span>
          </button>
        )}

        {/* Dual BS/AD Date Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-bold text-slate-800">{today.bsDate} BS</span>
          <span className="text-slate-500 text-[11px]">({today.monthNameEn} {today.bsDay})</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-mono text-[11px]">{today.adDate} AD</span>
        </div>

        {/* User Account Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-500 leading-none">
                {roleMeta.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in-50">
                {/* User Info Header */}
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {currentUser.email}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeColor}`}
                    >
                      {roleMeta.title}
                    </span>
                    <span className="text-[10px] text-slate-400">({roleMeta.titleNp})</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  {currentUser.role === 'SYSADMIN' && (
                    <button
                      onClick={() => {
                        onNavigateTab('users');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <UserCog className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-slate-800">User Management (SysAdmin)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenChangePassword();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <span>Change Password</span>
                  </button>
                </div>

                {/* Log Out */}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

