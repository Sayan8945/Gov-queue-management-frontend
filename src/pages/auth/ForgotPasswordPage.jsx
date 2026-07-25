import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { notifyEmailSent } from '@/utils/emailToast';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(data.email);
      notifyEmailSent('If an account exists, a verification code has been sent to your email.');
      navigate('/verify-reset-otp', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950">
          <KeyRound className="h-7 w-7 text-primary-600" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Forgot Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your registered email and we&apos;ll send you a verification code to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Send Verification Code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
