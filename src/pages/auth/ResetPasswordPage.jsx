import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number')
      .regex(/[^a-zA-Z0-9]/, 'Include a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const { pendingPasswordReset, completePasswordReset } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await completePasswordReset(data.password);
      toast.success('Password changed successfully. Please login using your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Must have a verified reset code before this page is usable.
  if (!pendingPasswordReset?.verifiedOtp) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950">
          <Lock className="h-7 w-7 text-primary-600" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Create New Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose a strong new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          required
          showStrength
          value={passwordValue}
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}
