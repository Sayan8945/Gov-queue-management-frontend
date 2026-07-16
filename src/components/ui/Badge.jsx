import { cn } from '@/utils/cn';

const VARIANTS = {
  default: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
  primary: 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900 dark:text-primary-200',
  success: 'bg-success-100 text-success-700 border-success-200 dark:bg-success-900 dark:text-success-200',
  warning: 'bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-900 dark:text-warning-200',
  danger: 'bg-danger-100 text-danger-700 border-danger-200 dark:bg-danger-900 dark:text-danger-200',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
