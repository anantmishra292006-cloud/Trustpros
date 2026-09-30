import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  formatAuthError,
} from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { checkRateLimit, recordAttempt } from '../../utils/rateLimiter';
import { sanitizeText, isValidEmail } from '../../utils/sanitize';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  preferredRole?: UserRole;
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
  preferredRole = 'customer',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>(preferredRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const { refreshProfile } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Forgot password flow
    if (mode === 'forgot_password') {
      const rate = checkRateLimit(`reset_${cleanEmail}`, 3, 300);
      if (!rate.allowed) {
        setError(`Too many reset attempts. Please wait ${rate.remainingSeconds}s before trying again.`);
        return;
      }

      setLoading(true);
      try {
        recordAttempt(`reset_${cleanEmail}`, 300);
        await sendPasswordReset(cleanEmail);
        setResetSent(true);
        showToast('Password reset email sent! Check your inbox.', 'info');
      } catch (err: any) {
        setError(formatAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Rate limit check
    const actionKey = mode === 'signin' ? `login_${cleanEmail}` : 'signup_global';
    const rateCheck = checkRateLimit(actionKey, mode === 'signin' ? 5 : 4, 300);
    if (!rateCheck.allowed) {
      setError(
        `Too many unsuccessful attempts. Access temporarily restricted. Try again in ${rateCheck.remainingSeconds}s.`
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const cleanName = sanitizeText(displayName);
        if (!cleanName || cleanName.length < 2) {
          throw new Error('Please enter your full name or company contact name.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long for account security.');
        }

        recordAttempt('signup_global', 300);
        await signUpWithEmail(cleanEmail, password, cleanName, role);
        showToast('Account registered successfully! Verification email dispatched.', 'success');
      } else {
        recordAttempt(`login_${cleanEmail}`, 300);
        await signInWithEmail(cleanEmail, password);
        showToast('Signed in successfully!', 'success');
      }

      await refreshProfile();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
  const isMatchAdminEmail = Boolean(adminEmail && email.toLowerCase().trim() === adminEmail);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top banner */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              LocalVerity Authentication
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {mode === 'signin'
              ? 'Sign In to Your Account'
              : mode === 'signup'
              ? 'Create Your Free Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'signin'
              ? 'Access your customer bookings, provider queue, or operator tools.'
              : mode === 'signup'
              ? 'Join the directory as a customer or apply as a trade professional.'
              : 'Enter your account email to receive secure recovery instructions.'}
          </p>

          {/* Toggle tabs */}
          {mode !== 'forgot_password' && (
            <div className="mt-4 flex bg-slate-800/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                Recovery link sent to <strong>{email}</strong>. Check your inbox and spam folder.
              </span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              {/* Account role selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      role === 'customer'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Book Specialists</div>
                      <div className="text-[10px] text-slate-500">I need local service</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      role === 'provider'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Join as Specialist</div>
                      <div className="text-[10px] text-slate-500">List my trade business</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Contact Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isMatchAdminEmail && (
              <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                ★ Designated operator admin email recognized.
              </p>
            )}
          </div>

          {/* Password field */}
          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={mode === 'signup' ? 8 : 6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter password'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {mode === 'signup' && (
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span
                    className={
                      password.length >= 8
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-400'
                    }
                  >
                    ✓ Minimum 8 characters
                  </span>
                  <span className="text-slate-400">
                    {password.length > 0 && `${password.length} chars`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'forgot_password' ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Recovery Email</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {mode === 'forgot_password' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setResetSent(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
