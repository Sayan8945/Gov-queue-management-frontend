import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { notifyEmailSent } from '@/utils/emailToast';

const schema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(120),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    mobileNumber: z
      .string()
      .min(10, 'Enter a valid phone number')
      .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const { registerCitizen } = useAuth();
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
      await registerCitizen(data);
      notifyEmailSent('Registration successful. A verification code has been sent to your email.');
      navigate('/verify-email', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
        Create citizen account
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Register to book tokens and track your queue online.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Jane Doe"
          required
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          required
          error={errors.mobileNumber?.message}
          {...register('mobileNumber')}
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          required
          showStrength
          value={passwordValue}
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
