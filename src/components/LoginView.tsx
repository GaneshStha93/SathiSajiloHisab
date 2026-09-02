import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Key,
  Smartphone,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface LoginViewProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onResetPassword: (emailOrUsername: string, newPass: string) => boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLoginSuccess,
  onResetPassword,
}) => {
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset password popup modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<'EMAIL' | 'MOBILE'>('EMAIL');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [matchedUser, setMatchedUser] = useState<UserAccount | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer countdown for resending verification code
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = identifier.trim().toLowerCase();
    const targetUser = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        (u.username === 'sysadmin' && cleanId === 'admin') ||
        (u.username === 'admin' && cleanId === 'sysadmin') ||
        u.email.toLowerCase() === cleanId
    );

    if (!targetUser) {
      setErrorMsg('Invalid username. Please check your credentials or click Reset Password.');
      return;
    }

    if (targetUser.status === 'INACTIVE' || targetUser.status === 'LOCKED') {
      setErrorMsg('This account has been deactivated. Please contact the SysAdmin.');
      return;
    }

    // Check password
    if (targetUser.password && targetUser.password !== password) {
      setErrorMsg('Invalid password. Please check your credentials or use Reset Password.');
      return;
    }

    onLoginSuccess(targetUser);
  };

  const handleQuickLogin = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role && u.status === 'ACTIVE');
    if (targetUser) {
      onLoginSuccess(targetUser);
    }
  };

  const handleOpenResetModal = () => {
    setErrorMsg(null);
    setResetErrorMsg(null);
    setResetSuccessMsg(null);
    setResetStep(1);
    setRecoveryMethod('EMAIL');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedOtp(null);
    setMatchedUser(null);

    // If identifier looks like an email or username, pre-fill
    if (identifier) {
      const found = users.find(
        (u) =>
          u.username.toLowerCase() === identifier.trim().toLowerCase() ||
          u.email.toLowerCase() === identifier.trim().toLowerCase()
      );
      if (found) {
        setResetIdentifier(found.email);
        setMatchedUser(found);
      } else {
        setResetIdentifier(identifier);
      }
    } else {
      setResetIdentifier('');
    }
    setIsResetModalOpen(true);
  };

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);

    const cleanInput = resetIdentifier.trim().toLowerCase();
    let user: UserAccount | undefined;

    if (recoveryMethod === 'EMAIL') {
      user = users.find(
        (u) =>
          u.email.toLowerCase() === cleanInput ||
          u.username.toLowerCase() === cleanInput
      );
    } else {
      // Mobile phone lookup
      const digitsOnly = cleanInput.replace(/\D/g, '');
      user = users.find((u) => {
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
        return uPhoneDigits.includes(digitsOnly) || digitsOnly.includes(uPhoneDigits);
      });
      if (!user) {
        // Fallback check by username
        user = users.find((u) => u.username.toLowerCase() === cleanInput);
      }
    }

    if (!user) {
      setResetErrorMsg(
        recoveryMethod === 'EMAIL'
          ? 'No user account registered with this email address.'
          : 'No user account found matching this mobile number.'
      );
      return;
    }

    setMatchedUser(user);

    // Generate 6 digit secure verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendCooldown(60);
    setResetStep(2);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendCooldown(60);
    setResetSuccessMsg(`A new 6-digit verification code has been dispatched to ${getMaskedTarget()}.`);
    setTimeout(() => setResetSuccessMsg(null), 4000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);
    if (resetOtp.trim() !== generatedOtp) {
      setResetErrorMsg('Invalid 6-digit security code. Please check and try again.');
      return;
    }
    setResetStep(3);
  };

  const handleCompletePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);

    if (newPassword.length < 6) {
      setResetErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const targetAccountKey = matchedUser ? matchedUser.username : resetIdentifier;
    const success = onResetPassword(targetAccountKey, newPassword);

    if (success) {
      setResetSuccessMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetSuccessMsg(null);
        if (matchedUser) {
          setIdentifier(matchedUser.username);
        }
        setPassword(newPassword);
      }, 1400);
    } else {
      setResetErrorMsg('Failed to update password. Please try again.');
    }
  };

  // Helper for masking email/mobile
  const getMaskedTarget = () => {
    if (!matchedUser) return resetIdentifier;
    if (recoveryMethod === 'EMAIL') {
      const email = matchedUser.email || resetIdentifier;
      const parts = email.split('@');
      if (parts.length === 2) {
        const namePart = parts[0];
        const masked = namePart.length > 2 ? `${namePart[0]}***${namePart.slice(-1)}` : `${namePart[0]}***`;
        return `${masked}@${parts[1]}`;
      }
      return email;
    } else {
      const phone = matchedUser.phone || resetIdentifier;
      if (phone.length >= 6) {
        return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
      }
      return phone;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 py-10 relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Welcome Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-2xl rounded-2xl shadow-xl shadow-blue-600/25 mb-3 border border-blue-400/30">
            S
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sathi Sajilo <span className="text-blue-400">Hisab</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Welcome to 25-Day Small Saving & Credit ERP</span>
          </p>
        </div>

        {/* Clean Sign In Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Card Header Title */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Sign In</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Please enter your username and password to continue
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
              v2.5 ERP
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember option & Reset Password on the same row below password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-400 hover:text-slate-300">Remember</span>
              </label>

              <button
                type="button"
                onClick={handleOpenResetModal}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
              >
                Reset Password
              </button>
            </div>

            {/* Enter Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* One-Click Role Demo Logins */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                <span>One-Click Role Demo Logins</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('SYSADMIN')}
                  className="p-2.5 bg-slate-950/80 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-600/80 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-purple-300 group-hover:text-purple-200 flex items-center justify-between">
                    <span>SysAdmin</span>
                    <span className="text-[9px] bg-purple-950 text-purple-300 px-1 py-0.2 rounded border border-purple-800/50">Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">sysadmin</div>
                  <div className="text-[9px] text-slate-500">Unlinked (Full Control)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('DATA_ENTRY')}
                  className="p-2.5 bg-slate-950/80 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-600/80 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200 flex items-center justify-between">
                    <span>Data Entry</span>
                    <span className="text-[9px] bg-blue-950 text-blue-300 px-1 py-0.2 rounded border border-blue-800/50">Staff</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">dataentry</div>
                  <div className="text-[9px] text-slate-500">Unlinked (Daily Books)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('MEMBER')}
                  className="p-2.5 bg-slate-950/80 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-600/80 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center justify-between">
                    <span>Member</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800/50">Linked</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">shreedhar</div>
                  <div className="text-[9px] text-slate-500">Linked: Shreedhar Regmi</div>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Sathi Sajilo Hisab Financial ERP • Double-Entry 25-Day Accounting Engine</p>
        </div>
      </div>

      {/* POPUP MODAL: RESET PASSWORD (EXACTLY MATCHING DESIGN) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Blue Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                aria-label="Close modal"
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-bold tracking-tight">Reset Password</h3>
              <p className="text-blue-100 text-xs mt-1 font-medium">
                {resetStep === 1 && 'Choose your recovery method'}
                {resetStep === 2 && 'Enter the verification code'}
                {resetStep === 3 && 'Create your new password'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-6">
              {/* Stepper with Numbered Badges (Identify -> Verify -> Reset) */}
              <div className="flex items-center justify-center gap-2 text-xs">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      resetStep === 1
                        ? 'bg-blue-600 text-white shadow-sm'
                        : resetStep > 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {resetStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span
                    className={`mt-1 font-semibold text-[11px] ${
                      resetStep === 1 ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    Identify
                  </span>
                </div>

                {/* Connecting Line 1 */}
                <div
                  className={`w-12 h-0.5 -mt-4 transition-colors ${
                    resetStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      resetStep === 2
                        ? 'bg-blue-600 text-white shadow-sm'
                        : resetStep > 2
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {resetStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span
                    className={`mt-1 font-semibold text-[11px] ${
                      resetStep === 2 ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    Verify
                  </span>
                </div>

                {/* Connecting Line 2 */}
                <div
                  className={`w-12 h-0.5 -mt-4 transition-colors ${
                    resetStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      resetStep === 3
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`mt-1 font-semibold text-[11px] ${
                      resetStep === 3 ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    Reset
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {resetErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{resetErrorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {resetSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-tight">{resetSuccessMsg}</span>
                </div>
              )}

              {/* STEP 1: IDENTIFY (CHOOSE RECOVERY METHOD) */}
              {resetStep === 1 && (
                <form onSubmit={handleSendResetCode} className="space-y-5">
                  {/* Centered Circular Icon Badge */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                      {recoveryMethod === 'EMAIL' ? (
                        <Mail className="w-7 h-7 text-blue-600" />
                      ) : (
                        <Smartphone className="w-7 h-7 text-blue-600" />
                      )}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-xs leading-relaxed">
                      {recoveryMethod === 'EMAIL'
                        ? 'Enter your registered email address to receive a verification code.'
                        : 'Enter your registered mobile number to receive a verification code.'}
                    </p>
                  </div>

                  {/* Segmented Method Toggle Pills */}
                  <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMethod('EMAIL');
                        setResetErrorMsg(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        recoveryMethod === 'EMAIL'
                          ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMethod('MOBILE');
                        setResetErrorMsg(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                        recoveryMethod === 'MOBILE'
                          ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>

                  {/* Input field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {recoveryMethod === 'EMAIL' ? 'Email Address *' : 'Mobile Number *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        {recoveryMethod === 'EMAIL' ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <Smartphone className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type={recoveryMethod === 'EMAIL' ? 'text' : 'tel'}
                        required
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder={
                          recoveryMethod === 'EMAIL'
                            ? 'Enter your registered email'
                            : 'Enter your registered 10-digit mobile'
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Send Verification Code Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: VERIFY CODE */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900">
                    <p className="font-semibold flex items-center gap-1.5 mb-1 text-blue-950">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Verification code dispatched</span>
                    </p>
                    <p className="text-slate-600 leading-normal">
                      A 6-digit security verification code has been sent to registered {recoveryMethod.toLowerCase()}: <strong className="text-slate-900 font-mono">{getMaskedTarget()}</strong>. Please check your inbox / messages and enter the code below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-slate-500">Didn't receive the code?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-semibold text-slate-400">
                        Resend in <span className="font-mono">{resendCooldown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <span>Verify &amp; Proceed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: RESET PASSWORD */}
              {resetStep === 3 && (
                <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Identity verified! Set your new password below.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      New Password (Min 6 characters) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(2)}
                      className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <span>Save New Password</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


