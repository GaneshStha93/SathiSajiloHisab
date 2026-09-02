import { UserAccount, UserRole, UserPermissions } from '../types';

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    title: string;
    titleNp?: string;
    badgeColor: string;
    description: string;
    defaultPermissions: UserPermissions;
  }
> = {
  SYSADMIN: {
    title: 'SysAdmin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Full system administration: User management, system configuration, voucher approvals, full audit logs.',
    defaultPermissions: {
      canCreateVouchers: true,
      canApproveVouchers: true,
      canDisburseLoans: true,
      canManageUsers: true,
      canEditChartOfAccounts: true,
      canExportReports: true,
      canViewAuditLogs: true,
    },
  },
  DATA_ENTRY: {
    title: 'Data Entry',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Daily transaction processing: Post receipts, payments, journals, loan schedules, member savings & books.',
    defaultPermissions: {
      canCreateVouchers: true,
      canApproveVouchers: false,
      canDisburseLoans: true,
      canManageUsers: false,
      canEditChartOfAccounts: true,
      canExportReports: true,
      canViewAuditLogs: true,
    },
  },
  MEMBER: {
    title: 'Member',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Member self-service: View linked member passbook, savings status, active loans & statements (Must be linked to a member).',
    defaultPermissions: {
      canCreateVouchers: false,
      canApproveVouchers: false,
      canDisburseLoans: false,
      canManageUsers: false,
      canEditChartOfAccounts: false,
      canExportReports: false,
      canViewAuditLogs: false,
    },
  },
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-sysadmin',
    name: 'Bikram Adhikari (SysAdmin)',
    username: 'sysadmin',
    email: 'sysadmin@sathi.np',
    phone: '9841234561',
    role: 'SYSADMIN',
    roleNepali: 'SysAdmin',
    password: 'sysadmin123',
    status: 'ACTIVE',
    createdAt: '2024-04-13',
    lastLogin: '2026-08-28 10:15 AM',
    permissions: ROLE_DEFINITIONS.SYSADMIN.defaultPermissions,
  },
  {
    id: 'usr-2',
    name: 'Sita Sharma (Data Entry)',
    username: 'dataentry',
    email: 'dataentry@sathi.np',
    phone: '9841234562',
    role: 'DATA_ENTRY',
    roleNepali: 'Data Entry',
    password: 'data123',
    status: 'ACTIVE',
    createdAt: '2024-04-14',
    lastLogin: '2026-08-28 09:30 AM',
    permissions: ROLE_DEFINITIONS.DATA_ENTRY.defaultPermissions,
  },
  {
    id: 'usr-3',
    name: 'Shreedhar Regmi',
    username: 'shreedhar',
    email: 'shreedhar@sathi.np',
    phone: '9841234561',
    role: 'MEMBER',
    roleNepali: 'Member',
    password: 'member123',
    status: 'ACTIVE',
    createdAt: '2024-04-13',
    lastLogin: '2026-08-27 04:10 PM',
    permissions: ROLE_DEFINITIONS.MEMBER.defaultPermissions,
    memberId: 'mem-1',
  },
  {
    id: 'usr-4',
    name: 'Jeshan Regmi',
    username: 'jeshan',
    email: 'jeshan@sathi.np',
    phone: '9841234562',
    role: 'MEMBER',
    roleNepali: 'Member',
    password: 'member123',
    status: 'ACTIVE',
    createdAt: '2024-04-14',
    lastLogin: '2026-08-26 02:20 PM',
    permissions: ROLE_DEFINITIONS.MEMBER.defaultPermissions,
    memberId: 'mem-2',
  },
  {
    id: 'usr-5',
    name: 'Bhupendra Bhattarai',
    username: 'bhupendra',
    email: 'bhupendra@sathi.np',
    phone: '9841234563',
    role: 'MEMBER',
    roleNepali: 'Member',
    password: 'member123',
    status: 'ACTIVE',
    createdAt: '2024-04-14',
    lastLogin: '2026-08-26 02:20 PM',
    permissions: ROLE_DEFINITIONS.MEMBER.defaultPermissions,
    memberId: 'mem-3',
  },
];

const USERS_STORAGE_KEY = 'sathi_hisab_users_v5';
const SESSION_STORAGE_KEY = 'sathi_hisab_session_v5';

function normalizeUserRole(user: any): UserAccount {
  let role: UserRole = 'DATA_ENTRY';
  if (user.role === 'SYSADMIN' || user.role === 'ADMIN') {
    role = 'SYSADMIN';
  } else if (user.role === 'MEMBER' || user.role === 'MEMBER_VIEWER') {
    role = 'MEMBER';
  } else {
    role = 'DATA_ENTRY';
  }

  const roleDef = ROLE_DEFINITIONS[role];

  return {
    ...user,
    role,
    roleNepali: roleDef.title,
    permissions: roleDef.defaultPermissions,
    // Crucial rule: Only MEMBER role has a linked member. SysAdmin and Data Entry do NOT link to members.
    memberId: role === 'MEMBER' ? user.memberId : undefined,
  };
}

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Check previous storage keys if migrating
      const rawOld = localStorage.getItem('sathi_hisab_users_v3') || localStorage.getItem('sathi_hisab_users_v2');
      if (rawOld) {
        try {
          const parsed = JSON.parse(rawOld);
          let normalized = parsed.map(normalizeUserRole);
          // Ensure sysadmin exists
          if (!normalized.some((u: UserAccount) => u.username === 'sysadmin')) {
            normalized = [INITIAL_USERS[0], ...normalized.filter((u: UserAccount) => u.username !== 'admin')];
          }
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        } catch {
          // ignore
        }
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    let normalized = parsed.map(normalizeUserRole);
    if (!normalized.some((u: UserAccount) => u.username === 'sysadmin' || u.role === 'SYSADMIN')) {
      normalized = [INITIAL_USERS[0], ...normalized];
    }
    return normalized;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: UserAccount[]): void {
  try {
    const sanitized = users.map(normalizeUserRole);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export function getStoredSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      const rawV2 = localStorage.getItem('sathi_hisab_session_v2');
      if (rawV2) {
        try {
          const parsed = JSON.parse(rawV2);
          const normalized = normalizeUserRole(parsed);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        } catch {
          // ignore
        }
      }
      return null;
    }
    return normalizeUserRole(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStoredSession(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalizeUserRole(user)));
    }
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
  }
}
