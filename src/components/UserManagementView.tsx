import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Building2,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { UserAccount, UserRole, UserPermissions, Member } from '../types';
import { ROLE_DEFINITIONS } from '../utils/authManager';

interface UserManagementViewProps {
  currentUser: UserAccount;
  users: UserAccount[];
  members: Member[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (userId: string, updated: Partial<UserAccount>) => void;
  onDeleteUser: (userId: string) => void;
  onAdminResetPassword: (userId: string, newPass: string) => void;
  showNotification: (msg: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  members,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAdminResetPassword,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showMatrix, setShowMatrix] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Add User Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('DATA_ENTRY');
  const [formPassword, setFormPassword] = useState('sathi123');
  const [formMemberId, setFormMemberId] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Reset Password Modal State
  const [newAdminPass, setNewAdminPass] = useState('');

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('DATA_ENTRY');
    setFormPassword('sathi123');
    setFormMemberId('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setSelectedUser(u);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormEmail(u.email);
    setFormPhone(u.phone || '');
    setFormRole(u.role);
    setFormMemberId(u.role === 'MEMBER' ? (u.memberId || '') : '');
    setIsEditModalOpen(true);
  };

  const handleRoleSelectionChange = (newRole: UserRole) => {
    setFormRole(newRole);
    if (newRole !== 'MEMBER') {
      setFormMemberId('');
    }
  };

  const handleOpenReset = (u: UserAccount) => {
    setSelectedUser(u);
    setNewAdminPass('');
    setIsResetModalOpen(true);
  };

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = formUsername.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      alert('Username already exists. Please choose another.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === formEmail.trim().toLowerCase())) {
      alert('Email already registered for another user.');
      return;
    }

    // Role-specific validation
    if (formRole === 'MEMBER' && !formMemberId) {
      alert('Please select a Linked Member. The Member role must be linked to a member in the 7-Member directory.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: formName.trim(),
      username: cleanUsername,
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      role: formRole,
      roleNepali: ROLE_DEFINITIONS[formRole].titleNp,
      password: formPassword || 'sathi123',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      permissions: ROLE_DEFINITIONS[formRole].defaultPermissions,
      memberId: formRole === 'MEMBER' ? formMemberId : undefined,
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    showNotification(`New user ${newUser.name} (${newUser.role}) created successfully!`);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Role-specific validation
    if (formRole === 'MEMBER' && !formMemberId) {
      alert('Please select a Linked Member. The Member role must be linked to a member in the 7-Member directory.');
      return;
    }

    onUpdateUser(selectedUser.id, {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      role: formRole,
      roleNepali: ROLE_DEFINITIONS[formRole].titleNp,
      permissions: ROLE_DEFINITIONS[formRole].defaultPermissions,
      memberId: formRole === 'MEMBER' ? formMemberId : undefined,
    });

    setIsEditModalOpen(false);
    showNotification(`User ${formName} updated successfully!`);
  };

  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newAdminPass.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    onAdminResetPassword(selectedUser.id, newAdminPass);
    setIsResetModalOpen(false);
    showNotification(`Password reset for ${selectedUser.name}!`);
  };

  const handleToggleUserStatus = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert('You cannot deactivate your own active session account.');
      return;
    }
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onUpdateUser(u.id, { status: newStatus });
    showNotification(`User ${u.name} marked as ${newStatus}`);
  };

  const handleDelete = (u: UserAccount) => {
    if (u.id === currentUser.id) {
      alert('You cannot delete your own logged in account.');
      return;
    }
    if (u.username === 'sysadmin' || u.username === 'admin') {
      alert('The primary system administrator cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete user account "${u.name}" (${u.username})?`)) {
      onDeleteUser(u.id);
      showNotification(`User account ${u.name} deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  User Management & Categories
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure role-based access control, manage credentials, and assign accounting duties
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>{showMatrix ? 'Hide' : 'View'} Role Permissions Matrix</span>
            </button>

            {currentUser.permissions.canManageUsers && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add New User</span>
              </button>
            )}
          </div>
        </div>

        {/* User Category Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-100">
          {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => {
            const def = ROLE_DEFINITIONS[r];
            const count = users.filter((u) => u.role === r).length;
            return (
              <div
                key={r}
                onClick={() => setRoleFilter(roleFilter === r ? 'ALL' : r)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  roleFilter === r
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{def.title}</span>
                  <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                    {count}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{def.description.split(':')[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role & Permissions Matrix Card */}
      {showMatrix && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-in fade-in-50">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Category Access & Permissions Matrix
              </h2>
            </div>
            <button
              onClick={() => setShowMatrix(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Role / Category</th>
                  <th className="py-2.5 px-3">Nepali Designation</th>
                  <th className="py-2.5 px-3 text-center">Voucher Entries</th>
                  <th className="py-2.5 px-3 text-center">Approvals</th>
                  <th className="py-2.5 px-3 text-center">Loan Disburse</th>
                  <th className="py-2.5 px-3 text-center">User Admin</th>
                  <th className="py-2.5 px-3 text-center">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => {
                  const def = ROLE_DEFINITIONS[r];
                  const p = def.defaultPermissions;
                  return (
                    <tr key={r} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {def.title}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{def.titleNp}</td>
                      <td className="py-2.5 px-3 text-center">
                        {p.canCreateVouchers ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.canApproveVouchers ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.canDisburseLoans ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.canManageUsers ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.canViewAuditLogs ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, username, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Roles (3 Categories)</option>
            <option value="SYSADMIN">SysAdmin</option>
            <option value="DATA_ENTRY">Data Entry</option>
            <option value="MEMBER">Member</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role & Category</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleMeta = ROLE_DEFINITIONS[u.role];
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {u.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Category */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleMeta.badgeColor}`}
                          >
                            {roleMeta.title}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {roleMeta.titleNp}
                          </div>
                          {u.role === 'MEMBER' && (
                            <div className="mt-1">
                              {u.memberId ? (
                                (() => {
                                  const linkedMem = members.find((m) => m.id === u.memberId);
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                                      Linked: {linkedMem ? `${linkedMem.memberNo} (${linkedMem.name})` : u.memberId}
                                    </span>
                                  );
                                })()
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold">
                                  ⚠️ Missing Linked Member
                                </span>
                              )}
                            </div>
                          )}
                          {u.role !== 'MEMBER' && (
                            <div className="text-[10px] text-slate-400 mt-0.5 italic">
                              Staff / Admin (No member link)
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u.lastLogin || 'Never'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReset(u)}
                            title="Reset Password"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {currentUser.permissions.canManageUsers && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(u)}
                                title="Edit User"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                className={`p-1.5 rounded-md transition-colors ${
                                  u.status === 'ACTIVE'
                                    ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>

                              {!isCurrent && u.username !== 'sysadmin' && u.username !== 'admin' && (
                                <button
                                  onClick={() => handleDelete(u)}
                                  title="Delete User"
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add New User Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create credentials and assign ERP permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewUser} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Karki"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username (for login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. ramesh.accountant"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ramesh@sathi.np"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Role / Category Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role / User Category *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => handleRoleSelectionChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="SYSADMIN">SysAdmin (System Administrator)</option>
                  <option value="DATA_ENTRY">Data Entry (Daily Transactions &amp; Books)</option>
                  <option value="MEMBER">Member (Personal Passbook &amp; Portal)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {ROLE_DEFINITIONS[formRole].description}
                </p>
              </div>

              {/* Linked Member (Required only for Member role; Not required for SysAdmin / Data Entry) */}
              {formRole === 'MEMBER' ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-emerald-900">
                      Linked Member *
                    </label>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                      Required for Member Role
                    </span>
                  </div>
                  <select
                    required
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Member from 7-Member Directory * --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.memberNo} — {m.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-700">
                    Member user accounts must be linked to a member profile to view their specific savings passbook and loan schedules.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">Linked Member:</span>
                    <span className="text-slate-400 italic">Not required for {ROLE_DEFINITIONS[formRole].title}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded">
                    Unlinked (Admin / Staff)
                  </span>
                </div>
              )}

              {/* Initial Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 pr-10 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Save & Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit User: {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update user details, category role, and member linkage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role / Category *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => handleRoleSelectionChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="SYSADMIN">SysAdmin (System Administrator)</option>
                  <option value="DATA_ENTRY">Data Entry (Daily Transactions &amp; Books)</option>
                  <option value="MEMBER">Member (Personal Passbook &amp; Portal)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {ROLE_DEFINITIONS[formRole].description}
                </p>
              </div>

              {/* Linked Member */}
              {formRole === 'MEMBER' ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-emerald-900">
                      Linked Member *
                    </label>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                      Required for Member Role
                    </span>
                  </div>
                  <select
                    required
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Member from 7-Member Directory * --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.memberNo} — {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">Linked Member:</span>
                    <span className="text-slate-400 italic">Not required for {ROLE_DEFINITIONS[formRole].title}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded">
                    Unlinked (Admin / Staff)
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMIN RESET PASSWORD */}
      {isResetModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Reset User Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    For user: <span className="font-semibold text-slate-800">{selectedUser.name}</span> (@{selectedUser.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                <p className="font-semibold mb-0.5">Admin Credential Override</p>
                <p>
                  Setting a new password will take effect immediately. The user will be required to use this new password on their next sign-in.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password (Min 6 characters) *
                </label>
                <input
                  type="text"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="e.g. Pass@2081!"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Confirm Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
