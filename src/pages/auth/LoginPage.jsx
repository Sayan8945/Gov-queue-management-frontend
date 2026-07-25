import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME_ROUTE } from '@/constants/roles';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import DemoModeModal from '@/components/auth/DemoModeModal';

const schema = z.object({
  identifier: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['citizen', 'staff']).default('citizen'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'citizen' } });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.identifier, data.password, data.role);
      toast.success(`Welcome back, ${user.name}!`);
      const redirectTo = location.state?.from?.pathname || ROLE_HOME_ROUTE[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error.isNetworkFailure) {
        toast.error(error.message);
        return;
      }
      if (error.message?.toLowerCase().includes('verify your email')) {
        toast.error('Please verify your email to continue');
        navigate('/verify-email', { replace: true });
        return;
      }
      toast.error(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-50">Sign in</h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Access your citizen, staff, or admin account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Select label="Sign in as" required error={errors.role?.message} {...register('role')}>
          <option value="citizen">Citizen</option>
          <option value="staff">Staff / Admin</option>
        </Select>
        <Input
          label="Email or mobile number"
          type="text"
          autoComplete="username"
          placeholder="you@example.com"
          required
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        New citizen?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Create an account
        </Link>
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          OR
        </span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        icon={Rocket}
        className="mt-4"
        onClick={() => setIsDemoModalOpen(true)}
      >
        Explore Demo
      </Button>

      <DemoModeModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}
