import { cn } from '@/utils/cn';

export function Card({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...rest }) {
  return (
    <div className={cn('border-b border-gray-100 px-5 py-4 dark:border-gray-700', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...rest }) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-900 dark:text-gray-50', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className, ...rest }) {
  return (
    <div className={cn('px-5 py-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...rest }) {
  return (
    <div className={cn('border-t border-gray-100 px-5 py-4 dark:border-gray-700', className)} {...rest}>
      {children}
    </div>
  );
}
