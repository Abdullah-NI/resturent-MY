import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Resend Timer Countdown
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

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setStep(2);
        setResendTimer(60); // 60s cooldown for resending
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
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        showToast('A new OTP has been sent to your email.', 'success');
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
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success && res.data.resetToken) {
        setResetToken(res.data.resetToken);
        showToast(res.data.message, 'success');
        setStep(3);
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
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword,
      });

      if (res.data.success) {
        showToast('Password reset successfully. Please login with your new password.', 'success');
        navigate('/login');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Calculator
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-zinc-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { score, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { score, label: 'Good', color: 'bg-yellow-400', width: 'w-3/4' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-red-500', width: 'w-1/12' };
    }
  };

  const strength = calculatePasswordStrength(newPassword);

  return (
    <div className="pt-28 pb-20 max-w-md mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Create New Password'}
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {step === 1 && 'Enter your registered email to receive a 6-digit verification OTP'}
          {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
          {step === 3 && 'Choose a strong new password for your Sky Lounge account'}
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1
                ? 'bg-gold-400 text-zinc-950 shadow-gold'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
            Email
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-gold-400' : 'bg-zinc-200 dark:bg-zinc-800'}`} />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2
                ? 'bg-gold-400 text-zinc-950 shadow-gold'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
            OTP
          </span>
        </div>

        <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-gold-400' : 'bg-zinc-200 dark:bg-zinc-800'}`} />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 3
                ? 'bg-gold-400 text-zinc-950 shadow-gold'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-semibold ${step >= 3 ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
            Password
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-gold-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl">
        {/* STEP 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="truncate max-w-[200px] font-medium text-zinc-800 dark:text-zinc-200">{email}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-burgundy-800 dark:text-gold-400 font-semibold hover:underline text-[11px]"
              >
                Change Email
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                6-Digit Verification Code
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
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-base tracking-[0.5em] font-mono text-center font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-gold-500"
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
                <span>Verifying OTP...</span>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Section */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Didn't receive code?</span>
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

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
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
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
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
                <span>Resetting Password...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-burgundy-800 dark:text-gold-400 font-bold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
