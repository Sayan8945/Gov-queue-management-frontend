import { Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function DepartmentCard({ department, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(department)}
      aria-pressed={selected}
      className={cn(
        'flex w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected
          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-950/40'
          : 'border-gray-200 bg-white hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        )}
      >
        <Building2 className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{department.departmentName}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{department.description}</p>
      </div>
    </button>
  );
}
