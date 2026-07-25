import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import OtpInput from '@/components/ui/OtpInput';
import Button from '@/components/ui/Button';
import { notifyEmailSent } from '@/utils/emailToast';

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyResetOtpPage() {
  const { pendingPasswordReset, verifyPasswordResetOtp, resendPasswordResetOtp } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (code) => {
    const value = code ?? otp;
    if (value.length !== 6) {
      setError('Enter the full 6-digit code');
      return;
    }
    setError('');
    setIsVerifying(true);
    try {
      await verifyPasswordResetOtp(value);
      navigate('/reset-password', { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect verification code');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      await resendPasswordResetOtp();
      notifyEmailSent('A new code has been sent to your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!pendingPasswordReset?.email) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950">
          <ShieldCheck className="h-7 w-7 text-primary-600" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Enter Verification Code</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{pendingPasswordReset.email}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
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
        Verify Code
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
          {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}
