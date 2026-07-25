import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected
          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-950/40'
          : 'border-gray-200 bg-white hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800'
      )}
    >
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.serviceName}</span>
      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="h-3.5 w-3.5" /> ~{service.averageServiceDuration} min
      </span>
    </button>
  );
}
