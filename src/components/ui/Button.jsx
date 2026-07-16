import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
  secondary:
    'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus-visible:ring-primary-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500',
  success: 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-primary-500 dark:text-gray-200 dark:hover:bg-gray-800',
  outline:
    'bg-transparent border border-primary-600 text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500 dark:text-primary-300 dark:hover:bg-primary-950',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      type = 'button',
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANTS[variant],
          SIZES[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {!isLoading && Icon && iconPosition === 'left' && <Icon className="h-4 w-4" aria-hidden="true" />}
        {children}
        {!isLoading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" aria-hidden="true" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
