import { TOKEN_STATUS_LABELS, TOKEN_STATUS_COLORS } from '@/constants/tokenStatus';
import { cn } from '@/utils/cn';

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TOKEN_STATUS_COLORS[status],
        className
      )}
    >
      {TOKEN_STATUS_LABELS[status] || status}
    </span>
  );
}
