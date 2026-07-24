import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MailCheck, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME_ROUTE } from '@/constants/roles';
import OtpInput from '@/components/ui/OtpInput';
import Button from '@/components/ui/Button';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const { isAuthenticated, user, pendingVerification, verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (code) => {
      const value = code ?? otp;
      if (value.length !== 6) {
        setError('Enter the full 6-digit code');
        return;
      }
      setError('');
      setIsVerifying(true);
      try {
        const verifiedUser = await verifyEmail(value);
        setIsSuccess(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          navigate(ROLE_HOME_ROUTE[verifiedUser.role] || '/citizen/home', { replace: true });
        }, 1200);
      } catch (err) {
        setError(err.message || 'Verification failed');
        setOtp('');
      } finally {
        setIsVerifying(false);
      }
    },
    [otp, verifyEmail, navigate]
  );

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      const result = await resendOtp();
      toast.success(result.message || 'A new code has been sent to your email');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // Already logged in and verified — nothing to do here.
  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] || '/'} replace />;
  }

  // No pending verification context (e.g. direct navigation/refresh after
  // the flow already completed or was never started) — send back to register.
  if (!pendingVerification?.citizenId) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30"
            >
              <CheckCircle2 className="h-9 w-9 text-success-600" aria-hidden="true" />
            </motion.div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Email verified!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting you now…</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 backdrop-blur-sm dark:bg-primary-950">
                <MailCheck className="h-7 w-7 text-primary-600" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Verify Your Email
              </h2>
              <p className="text-m text-gray-500 dark:text-gray-400">
                Enter the 6-digit OTP sent to{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {pendingVerification.email}
                </span>
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Can&apos;t find it? Check your spam or junk folder.
              </p>
            </div>

            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) setError('');
              }}
              onComplete={handleVerify}
              error={error}
              disabled={isVerifying}
            />

            <Button
              type="button"
              fullWidth
              className="mt-6"
              isLoading={isVerifying}
              disabled={otp.length !== 6}
              onClick={() => handleVerify()}
            >
              Verify
            </Button>

            <div className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:text-gray-400 dark:disabled:text-gray-500"
              >
                {isResending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
