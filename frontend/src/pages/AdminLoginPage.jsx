import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot' | 'otp' | 'reset'
  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recovery flow state
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Login submit handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  // Step 1: Send OTP to Admin Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      if (res.data.success) {
        showToast(res.data.message || 'OTP sent successfully to your email.', 'success');
        setMode('otp');
        setResendTimer(60);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      if (res.data.success) {
        showToast('A new OTP has been sent to your admin email.', 'success');
        setResendTimer(60);
        setOtp('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: resetEmail, otp });
      if (res.data.success && res.data.resetToken) {
        setResetToken(res.data.resetToken);
        showToast(res.data.message || 'OTP verified successfully.', 'success');
        setMode('reset');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        resetToken,
        newPassword,
      });

      // Clear sensitive state variables immediately
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setResetToken('');

      if (res.data.success) {
        showToast(res.data.message || 'Password reset successfully. Please log in with your new password.', 'success');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      // Clear password state on error for security
      setNewPassword('');
      setConfirmPassword('');
      showToast(err.response?.data?.message || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Calculator
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', color: 'bg-zinc-700', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/4' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { label: 'Too short', color: 'bg-red-500', width: 'w-1/12' };
    }
  };

  const strength = calculatePasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-zinc-950 font-bold mx-auto shadow-gold">
            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">
            {mode === 'login' && 'Admin Management Portal'}
            {mode === 'forgot' && 'Admin Password Recovery'}
            {mode === 'otp' && 'Verify 6-Digit OTP'}
            {mode === 'reset' && 'Create New Password'}
          </h1>
          <p className="text-xs text-burgundy-800 dark:text-gold-400 font-semibold tracking-wider uppercase">
            {mode === 'login'
              ? 'Sky Lounge Control Systems'
              : mode === 'forgot'
              ? 'Enter registered admin email to receive Brevo OTP'
              : mode === 'otp'
              ? `Verification OTP sent to ${resetEmail}`
              : 'Set a new secure password for admin access'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl">
          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maansaridbd555@gmail.com"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Admin Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email || '');
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bold text-burgundy-800 dark:text-gold-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD (STEP 1) */}
          {mode === 'forgot' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@skylounge.com"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP via Brevo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Admin Login</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE: VERIFY OTP (STEP 2) */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="truncate max-w-[200px] font-medium text-zinc-800 dark:text-zinc-200">{resetEmail}</span>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-burgundy-800 dark:text-gold-400 font-semibold hover:underline text-[11px]"
                >
                  Change Email
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  6-Digit Verification OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-base tracking-[0.5em] font-mono text-center font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                  <span>OTP expires in 10 minutes. Max 5 verification attempts allowed.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resendLoading}
                  className="text-xs font-bold text-burgundy-800 dark:text-gold-400 hover:underline disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: CREATE NEW PASSWORD (STEP 3) */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  New Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 dark:text-zinc-400">Password Strength:</span>
                      <span className={`font-bold ${strength.color.replace('bg-', 'text-')}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password & Finish</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

